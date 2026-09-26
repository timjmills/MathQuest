# MathQuest Worksheet Design Standard

This is the visual design contract for every MathQuest worksheet page and for the question card shown in online practice.
It fixes paper, type, ink, line meaning, answer-slot shapes, cells, labels, header, bands, arithmetic anatomy, drawings, density, scaffolds, answer keys and screen parity.
It outranks every design skill, palette, font pairing and component kit: skills may supply reasoning, this file supplies the values.
Every rule has an id, and section 17 maps each id to an automated lint or a named manual check.
A page that breaks a rule here is a defect, even if it "looks fine".

## Related documents

| Document | What it owns |
|---|---|
| `WORKSHEET_DESIGN_STANDARD.md` (this file) | How a page and a cell look. Tokens, geometry, drawings, lints. |
| `PEDAGOGY_STANDARD.md` | Why a page teaches the way it does: lesson cycle, fade ladder, review cadence, wording library, options policy. |
| `design/PAGE_TYPES.md` | One anatomy drawing, geometry table and option list per page type. |
| `design/PROBLEM_TYPES.md` | Problem catalogue by domain, response modes (print and screen twins), representation choices per problem. |
| `design/EXTENSION_PLAYBOOK.md` | How to carry this look into domains the reference workbooks barely cover. |
| `design/SKILL_CELL_CONTRACT.md` | The data contract (`q.cell = { template, payload }`) that lets any skill render on any page type. |

Where two documents disagree on a visual value, this file wins. Where they disagree on teaching sequence, `PEDAGOGY_STANDARD.md` wins.

Terms used throughout: **S / M / L** = the size preset. **Hw** = writing height (6 / 8 / 10 mm). **em** = the working digit size in mm (section 3). **Track** = one fixed-width digit column. **T** = number of tracks in a stacked problem, operator track included. **gridH** = height available to the cell grid on one page. Three numbers separated by slashes always mean S / M / L.

---

## 1. Scope and the two looks

### 1.1 Scope

- **SC-1** This standard applies to every printed pupil page, every answer key, the print preview, and the black-and-white question region (`.ws-cell`) of every on-screen host: game card, online worksheet, quiz builder preview, quiz taking, skills navigator preview, classroom export preview and map engine.
- **SC-2** It does not style game chrome: XP, levels, boss and race scenes, buttons, toasts, progress bars, and correct / incorrect feedback keep their color. Chrome never enters a cell (section 15).
- **SC-3** Governing rule: any skill can appear on any page type (opener, scripted model, guided, independent, more practice, sub-skill / decision, error analysis, review, test A/B, pre-skill check, daily spiral panel, mixed practice, Daily 4, True or False?, Reason It, Stretch, word problem). Fact and operations skills additionally get the high-column fact layouts (fact rows at 5-10 columns, fact probe, fact-family intro / warm-up / probe, practice strips) and must still work on every other page type. No rule in this file may be satisfied by excluding a skill from a page type.
- **SC-4** Conventions are US / Common Core: "regroup" (never "carry" or "borrow" in pupil text), customary and metric units, the US long-division bracket, comma thousands separator, decimal point. Pupil-facing strings use US spelling.
- **SC-5** Pupil pages say "Level N" (K, 1, 2, 3, 4, 5, 6) and never "Grade N". Grade and CCSS code appear only in the teacher footer (HD-30) and never inside a cell, band, title or tab.
- **SC-6** No tracking artefacts are specified or may be added: no goal pages, pupil trackers, class records, mastery logs, progress graphs or mastery gates. A per-page Score line and an optional per-page Goal / Time line (section 8) are the only record fields.
- **SC-7** Every page is black, white and one grey (section 4). No color, gradient, shadow, emoji, clip-art, mascot or decorative lettering appears anywhere on a sheet.

### 1.2 The two looks

A look is a named bundle of cell border, digit track, label style and section-title style. Each page type has a default look. The print dialog can override the look (Auto / I Can / Daily; sections that share a page share one look, SC-10) and, separately, the label style (CL-20).

| Attribute | "I Can" look | "Daily" look |
|---|---|---|
| Default for | Lesson opener, scripted model, guided, independent, more practice, review, test, pre-skill check, sub-skill / decision, error analysis, True or False?, Reason It, Stretch, word problems | Computation grids, fact rows, daily spiral, mixed practice, Daily 4, Today's Number |
| Outer frame | 1.5 pt | 1.5 pt |
| Interior cell borders | 0.75 pt, shared | 1.5 pt, shared. Fact grids: 0.75 pt interiors with 1.5 pt frame and band edges |
| Digit track (stacked arithmetic) | 0.72 em | 0.95 em |
| Digit track (vertical facts) | 0.72 em | 0.72 em |
| Gap between operand rows | 0 | 2 mm |
| Sum rule | 1.5 pt | 1.5 pt |
| Item label | Quiet lowercase letter `a.` `b.` `c.` top-left | Black number tab, white numeral, flush top-left |
| Label sequence | Runs on across all pages of one lesson | 1 to N across sections and pages; restarts inside each Day band |
| Model and Guided cells | Unlabelled; identified by their band label | Optional worked cell carries an outlined "Model" tab |
| Section headings | Band labels from the fixed vocabulary, bold, ending in a colon | Plain bold sentence-case section titles |
| Auto columns, stacked arithmetic | 2 | 3 |
| Character | Thin ruled table, quiet, lots of white | Heavier grid, widely tracked digits, strong numeric anchors |

- **SC-10** A page uses exactly one look. A packet may mix looks between pages, never inside one page.
- **SC-11** Both looks share every token in sections 2-6 and 8-16. Only the rows of the table above differ.

---

## 2. Page

### 2.1 Paper parameters

The layout engine takes `paper` as a parameter. Nothing in the kit may hard-code a page size; the `@page` rule is injected per print job.

| Token | A4 (default) | US Letter |
|---|---|---|
| Sheet | 210 x 297 mm | 215.9 x 279.4 mm |
| Margin top | 12 mm | 12 mm |
| Margin left / right | 12 / 12 mm | 14.95 / 14.95 mm |
| Margin bottom | 14 mm | 14 mm |
| Live area | 186 x 271 mm | 186 x 253.4 mm |
| Header band (max) | 26 mm | 26 mm |
| Footer | 6 mm | 6 mm |
| Body-to-footer gap | 3 mm | 3 mm |
| Body height | 236 mm | 218 mm |
| Instruction block | 8 / 8 / 9 mm | 8 / 8 / 9 mm |
| gridH, one section, full header | 228 / 228 / 227 mm | 210 / 210 / 209 mm |

- **PG-1** Live width is 186 mm on every paper. Letter keeps 186 mm by widening its side margins, so every width formula is paper-independent.
- **PG-2** Body height = live height - header height - 6 mm footer - 3 mm gap. With the full 26 mm header this is 236 mm (A4) or 218 mm (Letter). Every row count is computed from body height; no row count is a constant.
- **PG-3** The footer never grows. The header never exceeds 26 mm on page 1 and is exactly 12 mm on continuation pages (HD-20).
- **PG-4** When header fields are switched off, the freed height is added to the body and rows are recomputed with the same formula (HD-12). Word-problem pages add the freed height to the work area only.
- **PG-5** Orientation is portrait. Landscape is allowed only for hands-on measurement pages (RP-170) and for 2-up half-page sheets (two halves side by side with a dashed cut line between them); it swaps the live area to 271 x 186 mm (A4). A half-page is laid out natively at its own available width (PG-13); it is never a scaled-down full page (PG-20).
- **PG-6** Print output must be produced at 100% scale. The print dialog shows the note "Print at 100% (no fit-to-page)" whenever a page contains a ruler, generic coins (their diameters are fixed in mm, RP-111) or a cut-out unit strip.

### 2.2 Page anatomy

```
<------------------------- 210 (A4) ------------------------->
+------------------------------------------------------------+  margin top 12
|  Name ____________  Date ________  Score ___/6  +--------+ |  \
|                                                 | Level 2| |   | header <= 26
|                                                 |Addition| |   |  row A 14
|                                                 |Lesson 5| |   |  gap 1
|        I Can add two-digit numbers with         +--------+ |   |  row B 8
|                     regrouping                             |   |  rule block 3
|============================================================|  /   2.25 pt rule
| Write the sum.                                             |  instruction block 8/8/9
|+----------------------------+-----------------------------+|  \
|| a.                         | b.                          ||   |
||                            |                             ||   | cell grid = gridH
|+----------------------------+-----------------------------+|   | (fixed-height box,
|| c.                         | d.                          ||   |  equal rows)
|+----------------------------+-----------------------------+|  /
|                                                            |  gap 3
| add-2d-regroup · Grade 2 · 2.NBT.B.5      1/3      Form A  |  footer 6, 7 pt
+------------------------------------------------------------+  margin bottom 14
   12 |<-------------------- 186 live ------------------->| 12
```

### 2.3 Grid sizing

- **PG-10** The cell grid is a fixed-height box with `repeat(rows, 1fr)` rows and `repeat(cols, 1fr)` columns. It is never content-sized. Columns always total exactly 186 mm (or the reduced width in PG-13); rows always total exactly gridH.
- **PG-11** Rows per page: `rows = min(targetRows, floor((gridH - 1) / hMin))`, and `cellH = min(gridH / rows, hMin x k)`. `hMin` is the section's minimum cell height (from its cell template), `k` is the stretch cap (1.3 for fact rows, probes and K counting rows; 2.0 for horizontal equation rows; stacked-arithmetic, visual, word-problem, mixed and spiral cells fill the grid). Computed once per section and used on every page of that section, so cells are identical from page to page.
- **PG-12** Safety: fixed heights on a page total no more than gridH - 1 mm. Content widths fit their cell width minus 0.6 mm. Banded lesson pages, which are content-sized, keep a budget of body - 4 mm.
- **PG-13** A page-side strip (skip-count strip, multiples strip, number track) reduces the grid width to 186 - (strip width + 4 mm gap). `resolveSectionLayout` takes the available width as an input; no formula assumes 186.
- **PG-14** All spare height in a cell goes to the answer zone (below the sum rule, below the visual, or into the work area). It never goes above the problem.
- **PG-15** Trailing empty positions: the generator rounds item counts to full rows. Any remainder is drawn as one unruled blank area inside the closed outer frame, with no interior borders and no labels, so a pupil cannot mistake it for unanswered work.

### 2.4 Pagination

- **PG-20** Content never shrinks to fit. When content does not fit, in this order: (1) the item count on the page drops and the rest flows to the next page, (2) the column count clamps (DN-10), (3) the page type switches to its two-sided form. Type sizes, writing height, blank widths and minimum visual sizes are never reduced.
- **PG-21** A cell is never split across pages. A band is never split from its first row of cells. A Day band, a word problem, a story box with its diagram, and a Model with its Steps are keep-together units.
- **PG-22** The instruction line repeats at the top of every page on which its section continues, with identical wording.
- **PG-23** If the last page of a row-based section would hold fewer than one third of a full page's rows, rows are rebalanced evenly across the section's pages.
- **PG-24** Continuation pages use the 12 mm continuation header (HD-20) and continue the label sequence.
- **PG-25** On screen, pagination is replaced by vertical scroll; PG-21 still holds for the print preview, which is the real print DOM scaled down.

---

## 3. Type

### 3.1 Family

- **TY-1** Every character of question content is set in **Andika**: digits, operators, instructions, titles, labels, stories, tab numerals, axis labels and SVG text. Reasons: flagged 1, open 4, single-storey a and g, distinct I / l / 1, distinct 0 / O.
- **TY-2** Only weights 400 and 700 exist. `font-synthesis: none` is set on the sheet root so a browser cannot fake 500 / 600 or italics. No italic is used anywhere.
- **TY-3** The font is **self-hosted** from SIL's 6.200 release (OFL): `css/fonts/Andika-Regular.woff2` and `css/fonts/Andika-Bold.woff2`, declared by `css/fonts/andika.css` (weights 400 and 700 only). It must **not** be loaded from Google Fonts, not even as a secondary source, because Google's subset strips the character variants TY-4 needs. Printing and PDF export wait on `document.fonts.ready` and abort with a dialog message if `document.fonts.check('700 28px Andika')` is false. The fallback stack `Andika, sans-serif` exists only so a failed load is visible, never as an acceptable result.
- **TY-4** Worksheet digits set `font-feature-settings: "cv04" 1` (the open-top 4). This is the only character variant set. `"cv01"` (1 without the base stroke) and `"cv06"` (the alternate-stem 6 and 9) were shown in the mock-up pack and rejected (owner ruling 2026-09-19): the flagged 1 and the default 6 and 9 stand, and setting either feature is a defect. Figures are tabular lining figures: Andika's digits are naturally tabular (every digit has the same advance width, measured), so `font-variant-numeric: lining-nums tabular-nums` is belt-and-braces only. Digit alignment in stacked work is produced by grid tracks (TY-20), never by letter-spacing, spaces or a monospace font.
- **TY-5** Emphasis is bold or underline only. No all-caps words, no italics, no color, no size change inside a sentence. Underline marks the relational phrase in a story; bold marks a vocabulary term or the target place in a rounding scaffold.
- **TY-6** Operators use true glyphs: `+`, U+2212 minus, U+00D7 multiplication, U+00F7 division, `=`, `<`, `>`. Never a letter x, a hyphen or an asterisk. Operators in stacked work are weight 700; digits are weight 400.
- **TY-7** Fractions are always stacked over a bar, including inside story text. A slash fraction is a defect.

### 3.2 Size table (pt)

| Role | S | M | L | Weight | Notes |
|---|---|---|---|---|---|
| Working digits (operands, equations, printed targets) | 16 | 22 | 28 | 400 | Largest element on the page (TY-10) |
| Fact ladder steps | 24 / 20 / 18 / 16 | - | - | 400 | Set by column count, not by size (TY-30) |
| Fraction digits (numerator, denominator) | 12 | 16 | 20 | 400 | Whole part of a mixed number stays at working digit size |
| Digital-clock digits | 24 | 33 | 42 | 700 | 1.5 x working digits |
| "I Can" title | 14 | 16 | 18 | 700 | One line; never more than 1.3 x instruction size |
| Instruction line; band label | 11 | 13 | 15 | 400; label 700 | Line-height 1.3 |
| Cell text the pupil must read to act (story, steps, sentence frames, choices, vocabulary) | 11 | 13 | 15 | 400 | Line-height 1.3 |
| Zone labels (H T O, unit captions, axis labels, coin captions, shape names) | 9 | 10 | 12 | 700 for heads, 400 otherwise | Names a zone; never an instruction |
| Skip-count / multiples strip numerals | 11 | 13 | 15 | 700 | Pitch 8 / 9 / 10.5 mm |
| Quiet letter label | 8 | 9 | 10 | 400 | Lowercase letter + period |
| Black tab numeral | 8 / 10 / 11 | | | 700 | By effective digit size (CL-31), not by preset |
| Strand tab text | 9 | 10 | 10 | line 1-2: 700, line 3: 400 | |
| Numeral-formation trace rows | 44-80 | | | 400 | By column count: 10 cols 44, 8: 52, 6: 64, 5: 80 |
| Teacher footer | 7 | 7 | 7 | 400 | Only text below 8 pt on a pupil page |

- **TY-10** Size order on any page: working digits > title > instruction = band label = cell text > zone labels > quiet letter > footer. Working digits are at least 1.4 x the instruction size.
- **TY-11** Minimum pupil-facing type is 8 pt (the quiet letter at S). Everything a pupil must read to act is at least 11 pt.
- **TY-12** A long word in cell text never shrinks below the table size; it wraps, then hyphenates (`hyphens: manual; overflow-wrap: anywhere`), and the cell grows by whole rows.
- **TY-13** Digit line-height is 1.15. Text line-height is 1.3. Stacked-arithmetic rows use `line-height: 1` and are positioned by baseline so row heights are exact mm values.

### 3.3 em and track tables (mm)

| Digit size | 16 pt | 18 pt | 20 pt | 22 pt | 24 pt | 28 pt |
|---|---|---|---|---|---|---|
| 1 em | 5.64 | 6.35 | 7.06 | 7.76 | 8.47 | 9.88 |
| Track 0.72 em | 4.06 (floor 4.2) | 4.57 | 5.08 | 5.59 | 6.10 | 7.11 |
| Track 0.95 em | 5.36 | 6.03 | 6.70 | 7.37 | 8.05 | 9.38 |
| Digit line height 1.15 em | 6.49 | 7.30 | 8.12 | 8.93 | 9.74 | 11.36 |

- **TY-20** Stacked arithmetic is a CSS grid with one fixed track per digit plus one operator track. Track width is **0.72 em in the I Can look** and **0.95 em in the Daily look**. Digits are right-aligned to the ones track.
- **TY-21** Any regroup scaffold (carry boxes, Tens / Ones boxes, subtraction headroom) forces **0.95 em** tracks in both looks, because a pupil cannot write in a box narrower than about 4.4 mm.
- **TY-22** Vertical facts (single-digit and to-12 facts in fact layouts) always use 0.72 em tracks and T = 3 in both looks. The look changes border weight only.
- **TY-23** Track floor for multi-digit stacked arithmetic: a track is never narrower than 0.7 x Hw, i.e. 4.2 / 5.6 / 7.0 mm. In practice only the I Can look is affected (S: 4.06 becomes 4.2; M: 5.59 becomes 5.6). The floor does not apply to fact sections, whose answer row is open and whose digit size follows the column ladder (TY-30).
- **TY-24** A decimal point or a thousands comma takes its own 0.3 em separator track, aligned down every row of the problem. In horizontal equations a separator takes 0.5 ch. A unit sign in a stacked problem takes one full track.
- **TY-25** Horizontal equations keep natural digit spacing with 1 em slots for each operator and for `=`. The 0.95 em Daily track applies to stacked work only.
- **TY-26** Every cell in a section uses the T of the section's widest problem, so ones digits align down the page and a wider answer never reveals itself.

### 3.4 Fact column ladder

For fact sections the chosen column count drives the digit size. S / M / L still fixes writing height, blank width, tab size and text sizes.

| Columns | 1-5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|
| Digit size (pt) | 28 | 24 | 20 | 18 | 16 | 16 |
| Cell width (mm, W = 186) | >= 37.2 | 31.0 | 26.57 | 23.25 | 20.67 | 18.6 |
| Fact width 2.16 em (mm) | 21.34 | 18.29 | 15.24 | 13.72 | 12.19 | 12.19 |
| Fill of column | 57% | 59% | 57% | 59% | 59% | 66% |
| Gap between neighbouring facts (mm) | 15.9 | 12.7 | 11.3 | 9.5 | 8.5 | 6.4 |

- **TY-30** The ladder is independent of S / M / L ("columns win"). Auto columns are chosen so digits never fall below the preset: Auto = 10 / 6 / 5 columns at S / M / L for fact rows; the fact probe's Auto is always 5.
- **TY-31** Fill of column stays between 55% and 75%. The gap between neighbouring sum rules is never below 6 mm, so rules never read as one line across the page.
- **TY-32** A three-digit fact answer (tables of 10-12) is written with its hundreds digit under the operator; T stays 3. Addition and subtraction facts never reach three digits, because their band caps the sum or the minuend at 30 or less (`PEDAGOGY_STANDARD.md` P-FL-20).
- **TY-33** Optional probe XL: 32 pt at 5 columns, fact families to 10 only.

### 3.5 Specimen test

- **TY-40** The mock-up pack and the test gallery include a specimen block, checked on every font or CSS change:

```
Line 1 (28 pt 400):  0 1 2 3 4 5 6 7 8 9
Line 2 (28 pt 400):  1 I l |   0 O   4 9   6 b   a g q
Line 3 (28 pt 700):  + − × ÷ = < >
Line 4 (stacked):    1 1 1 over 8 8 8 in 0.72 em tracks, then in 0.95 em tracks
Line 5 (15 pt 400):  I Can add two-digit numbers.   Level K 1 2 3 4 5 6
```

  Pass conditions: (a) all ten digits measure the same advance width within 0.01 em; (b) the 1 has a flag and a visible difference from I and l; (c) the 4 is open; (d) a and g are single-storey; (e) line 4 shows ones, tens and hundreds digits in a perfect vertical line; (f) computed `font-family` of every text node resolves to Andika and the face is loaded; (g) no synthetic bold.

---

## 4. Ink and line weights

### 4.1 Ink

| Token | Value | Use |
|---|---|---|
| `--ws-ink` | `#000000` | All text, all lines, solid counters, tabs |
| `--ws-paper` | `#FFFFFF` | Page and cell background, always, including dark theme |
| `--ws-grey` | `#949494` (nominal "40% grey"; 42% black) | The only grey: shaded parts, trace / model digits, faded scaffolds |

- **INK-1** Exactly three paint values exist inside a sheet: ink, paper, grey. Any other computed `color`, `fill`, `stroke`, `background` or `border-color` inside a sheet root is a defect. Feedback elements on screen are excluded (SP-30).
- **INK-2** No gradients, shadows, opacity below 1, blend modes, filters or background images.
- **INK-3** Grey is used for exactly three things: (a) the fill of shaded parts (fraction parts, decimal grid cells, the second data series, a shaded half clock face); (b) trace and model digits and model marks; (c) faded scaffolds in Guided cells (boxes, ticks, captions, placeholder zeros, think box). Nothing else is grey. Text a pupil must read to act is never grey.
- **INK-4** Grey strokes are 1 pt, never thinner, so they survive copying.
- **INK-5** Solid black fill is allowed only where the smaller dimension of the filled shape is 7 mm or less: number tabs, Day tabs, counters, clock pivot, arrow tips, colon dots, anchor dots, plotted points, bars up to 7 mm wide.
- **INK-6** No cue depends on color or on grey alone. Two sets are told apart by solid against hollow (LS-5), hands by length and weight, series by fill against outline.
- **INK-7** No emoji or pictographic Unicode code point appears in sheet DOM or SVG text. Pictures are in-house line art (RP-20).
- **INK-30** *Lesson pages only* (owner ruling 2026-09-25): one accent colour beside black, the purple token `LESSON_ACCENT` `#5B2A86` (CSS `--mq-lesson-accent`; 9.9 : 1 on white, greyscale 67 of 255, so a black-and-white copy keeps it dark and apart from the trace grey). It colours only what teaches a step: the step numerals, their outlined circles and the step icons of a lesson's anchor chart, Guided steps and practice-page step strip. Every accent element carries a second cue (the circle and numeral, the icon's shape), so nothing depends on colour (INK-6). Worksheet cells, answers and every other page stay black, white and one grey; `ws-print-lint` allows the colour only inside a `[data-mq-accent]` element on a lesson page (`.mq-lesson` or the `[data-mq-lesson-strip]` strip).

### 4.2 Line weights

Two weight classes only. The allowed stroke widths are a closed set.

| Class | Width | Use |
|---|---|---|
| Heavy | **2.25 pt** | Header rule under the title; top rule of a band or section strip |
| Heavy | **1.5 pt** | Outer frame; Daily cell borders; band and section dividers; sum rule and second rule; division vinculum and bracket; fraction bars; equals bars; strand tab outline; story-box outline; ten-frame border; outline of any object being judged or counted (shape, clock rim, coin rim, bar-model bar, number-line axis) |
| Hairline | **0.75 pt** | I Can cell borders; every line that bounds a writing place (answer line, digit box, regroup box, checkbox, table cell, chart cell); fact-grid interiors; ten-frame interiors; partitions of shapes; hollow counters; icon line art interiors |
| Hairline | **0.5 pt** | Only inside a visual, never bounding a writing place: minute ticks, base-10 segment lines, decimal-grid interior lines, graph grid lines, hidden edges of solids |
| Special | **1 pt** | Grey strokes (INK-4) and dotted lines (LS-1) only |

- **INK-10** Allowed stroke widths: {0.5, 0.75, 1, 1.5, 2.25} pt. Any other width is a defect.
- **INK-11** Any line that bounds a writing place or a cell is at least 0.75 pt.
- **INK-12** The sum rule (1.5 pt) is always at least as heavy as the border of the cell it sits in, so it is never mistaken for a border. In fact grids (0.75 pt interiors) it is clearly heavier.
- **INK-13** Shared borders collapse: two neighbouring cells share one line; a line is never doubled.

### 4.3 Photocopy-safe switch

Flat grey `#949494` is the default shading. One print-dialog switch, "Photocopy-safe", **off by default** and remembered with the dialog state, removes grey entirely: hatching replaces grey fills and dotted-outline digits replace grey trace digits (owner ruling 2026-09-19).

| Standard | Photocopy-safe replacement |
|---|---|
| Grey fill (shaded parts, series 2) | Hatch: **45 degrees, 0.75 pt black lines, 1.6 mm pitch**, clipped to the part. A second hatched set in the same drawing uses 135 degrees |
| Grey trace / model digits | **Dotted-outline digits**: glyph outline only, 1 pt dotted stroke (LS-1), white fill |
| Grey scaffold strokes (Guided boxes, track marks, think box, placeholder zero) | Black 1 pt dotted stroke; grey text becomes dotted-outline text |

- **INK-20** Hatching appears only when the switch is on, and only on areas whose smaller dimension is at least 6 mm. RP rules keep every pupil-shaded or pre-shaded part at 6 mm or more for this reason.
- **INK-21** With the switch on, no `--ws-grey` paint may remain anywhere on the page.
- **INK-22** Hatch is one shared SVG pattern definition per page (`ws-hatch-45`, `ws-hatch-135`); visuals reference it and never define their own.
- **INK-23** The mock-up pack prints every grey-bearing page in both modes; the pack was approved on 2026-09-19 with flat grey as the default. The copier check remains a release check, a copy of a copy on the school copier: 0.5 pt lines, the grey, the hatch and dotted-outline digits must all remain legible (manual check M-COPY).

---

## 5. Line-style and corner semantics

Line style and corner shape carry meaning. They are never decorative, and a style is never borrowed for another meaning.

| Style | Spec | Meaning | Examples |
|---|---|---|---|
| **Solid** | Widths per 4.2 | Structure and given information | Frames, cells, rules, given shapes |
| **Dotted** | 1 pt round dots, 1.2 mm pitch | "This is a model - trace it or copy what it shows" | Trace digits (photocopy-safe form), the dotted ring that models "circle this", dotted first tally, dotted counters to trace, alignment guides in a division work grid, measure / altitude guides |
| **Dashed** (long dash) | 0.75 pt, 3 mm on / 2 mm off | **Cut here** | Cut lines, tile outlines and card outlines on hands-on pages, practice strips and 2-up sheets |
| **Dashed box** (short dash) | 0.75 pt, 1.5 mm on / 1 mm off, on a digit-box outline only | **The unknown digit** inside a stacked problem | The missing-digit box (section 6, VA-7) |
| **Solid shape vs hollow shape** | Solid black vs 0.75 pt outline | Two sets | Counters for addend 1 vs addend 2; series 1 vs series 2 |
| **Square corners** (radius 0) | | Structure: the page's own frame | Cell frames, grid dividers, band strips, tables, tabs, the header score / strand box |
| **Slightly rounded** (slot radius 1 / 1.25 / 1.5 mm at S / M / L, SL-11) | | A place to WRITE | Answer boxes, digit boxes and digit strips, regroup / carry strips, the missing-digit box, checkboxes, time boxes, stand-alone write-in boxes |
| **Rounded corners** (radius 3 mm; 1 mm on objects under 8 mm) | | Something to read or think with, or a number object | Story box, Steps box, vocabulary box, think box, skip-count strip, number-track boxes, flashcard cells, fact-family trio box, dot tile, generic notes |

- **LS-1** Dotted lines are always 1 pt round dots at 1.2 mm pitch, black or grey.
- **LS-2** Dashed is never used for hidden edges, guides, unknown quantities in diagrams, decoration or "optional". It has exactly two uses: the cut line (LS-3) and the missing-digit box (LS-8). Hidden edges of solids are 0.5 pt solid; guides are dotted.
- **LS-3** A dashed line, and the dashed outline of a tile or card, always means **cut**: a line across the page or the closed outline of a tile or card. The first cut line on a page carries a scissors glyph (in-house line art). The unknown quantity in a diagram is a solid square-cornered box or bar with a zone-label `?` in its top-left corner, never a dashed shape.
- **LS-4** These two meanings hold on every page type, on paper and on screen. A lint finds any dashed stroke that is neither tagged as a cut line (`data-ws-cut`) nor the outline of a missing-digit slot (`data-ws-shape="box-unknown"`).
- **LS-5** Two sets in one drawing are solid vs hollow. A third set, when unavoidable, is a hollow shape with a centre dot. Sets are never told apart by grey level.
- **LS-6** A **3 mm** rounded container is never a place for a final answer. A writing box (slot radius, at most 1.5 mm), a line or a circle is. The think box (SF-40) carries the 3 mm radius for this reason. The two radii never meet: a container is at least 3 mm, a writing box at most 1.5 mm (owner ruling 2026-09-25, SL-11).
- **LS-7** Arrows: 1.5 pt shaft, solid triangular head 2.5 x 2 mm. A dotted arrow models a move the pupil will make; a solid arrow is given information.
- **LS-8** **Dashed box = the unknown digit** (owner ruling 2026-09-19). In a missing-digit item, where one digit inside a stacked problem is unknown, that digit's place is a digit box (slot radius, SL-11) with a short-dash outline (0.75 pt, 1.5 mm on / 1 mm off). The dash tells it apart from the solid regroup and carry boxes, which share its shape and sit in the same stack (VA-10, VA-21). It is the only dashed shape that is not a cut line: it is always a closed box of digit-box size inside a stack, it never carries the scissors glyph, and the short dash is never used for anything else. An unknown quantity in a diagram stays a solid box marked `?` (LS-3).

---

## 6. Answer-slot shapes

The shape of the slot tells the pupil what kind of answer goes in it. One answer type has one shape on every page type, in both looks, on paper and on screen.

| Slot | Shape | Size (S / M / L) | Means | `data-ws-shape` |
|---|---|---|---|---|
| Line | Baseline rule, 0.75 pt | Width B(n); clear height Hw above it | A number | `line` |
| Digit box | Box, 0.75 pt, slot radius (SL-11) | Stand-alone missing-number box B(n) x (Hw + 2). A ROW of digit boxes is always a digit strip (next row) | One digit, or a missing number inside an expression | `box` |
| Digit strip | ONE box, 0.75 pt, slot radius at its two ends, a 0.75 pt divider on every track boundary (SL-12) | One segment per track, each exactly one track wide; answer strip 7.2 / 9.6 / 12 mm tall, regroup strip 6 / 7 / 8 mm | A row of digits: the answer row of a Model / Guided stack, the regroup row, a quotient row, a place-value write-in row | `box` per segment, `data-ws-seg` = `first` / `mid` / `last` / `only` |
| Answer square | Square box, 0.75 pt, slot radius | 16 / 20 / 24 mm | A count beside a picture (K counting) | `box` |
| Circle | Circle, 0.75 pt | Diameter Hw + 2 mm | A sign: `+ − × ÷` or `< = >` | `circle` |
| Fraction bar | 1.5 pt bar with open writing zone above and below | Bar width B(2); each zone Hw tall; total 2 Hw + 2 mm | A fraction | `fraction` |
| Mixed-number box | Tall square box (whole) beside a fraction bar | Whole box B(1) x (2 Hw + 2); gap 2 mm; then fraction bar | A mixed number | `mixed` |
| Time | Two boxes (slot radius) with a printed colon between | Each 16 / 18 / 20 mm x (Hw + 2); colon in a 5 mm gap | A time `__:__` | `time` |
| Money | Two boxes (slot radius) with a printed decimal point between (P10, 2026-09-25) | Whole units B(n) x (Hw + 2), hundredths 14 / 14 / 17 mm; point in a 3 mm gap; a sign before it only per RP-116 | An amount `__.__` | `unit` |
| Number + unit word | Line followed by the pre-printed unit word at cell-text size | Line B(n); 2 mm gap; word | A quantity with its label | `unit` |
| Number + label (faded) | Short line then long line | B(n) then 40 / 46 / 52 mm | Word-problem v2: pupil writes number and label | `unit-open` |
| Missing-digit box | Box, slot radius, **dashed** 0.75 pt (short dash: 1.5 mm on / 1 mm off, LS-8) | Track - 1 mm wide (min 4.4) x Hw tall | The one unknown digit inside a stacked problem | `box-unknown` |
| Checkbox | Hollow square, 0.75 pt, slot radius | 5 / 6 / 7 mm | A decision: check one box | `check` |
| Words to circle | Printed options in a spaced row or stacked | Gap between options >= 8 mm; each option's ring area >= Hw + 4 tall | A choice among printed words, numerals or pictures | `choice` |
| Equation frame | Lines for numbers, circles for signs: `__ O __ = __` | Lines B(n), circles as above | A number sentence | each part is its own slot: `line` and `circle` |

### 6.1 Blank width function

```
B(n, size) = max(14, ceil(n x 0.75 x Hw + 2 + s))   mm
   n = digits in the longest expected answer in the section
   s = 1 mm for each separator (comma or decimal point) in that answer
```

| n | 1 | 2 | 3 | 4 (with comma) | 5 (with comma) |
|---|---|---|---|---|---|
| S (Hw 6) | 14 | 14 | 16 | 21 | 26 |
| M (Hw 8) | 14 | 14 | 20 | 27 | 33 |
| L (Hw 10) | 14 | 17 | 25 | 33 | 41 |

- **SL-1** No answer line or stand-alone box is narrower than 14 mm. Tracks in stacked arithmetic, regroup boxes and chart / puzzle / pattern grid cells are exempt; chart cells are at least 12 mm wide.
- **SL-2** One width per section: every blank in a section uses B for the section's longest answer, so blank width never hints at the size of an individual answer. In a banded section the longest answer is the band, because the band bounds the answer and not the operands (`PEDAGOGY_STANDARD.md` P-35): "Add within 20" gives n = 2, not the n = 3 that today's 93 + 84 would force.
- **SL-3** An answer after `=` is a **line**. A blank inside an expression (missing addend, missing factor) is a **box**. If any blank in a section is mid-expression, every blank in that section is a box.
- **SL-4** Slot height: the clear writing height inside or above a slot is exactly Hw (6 / 8 / 10 mm), measured inside the stroke. Size fixes this; nothing reduces it.
- **SL-5** A word-problem answer blank always has the unit word pre-printed after it (correctly pluralised). Pupils never have to compose the label except on the faded v2 form.
- **SL-6** Blanks are drawn as ruled lines or boxes, never as underscore characters.
- **SL-7** Exactly one slot type per cell answer, and the slot type matches the question's answer type (the mapping lives in `design/SKILL_CELL_CONTRACT.md`). A production item is never converted into "words to circle" unless the item is a choice on paper too.
- **SL-8** A 3 mm rounded container, a grey shape or a dotted shape is never an answer slot (LS-6). The black line, box or circle is the only place a scored answer goes.
- **SL-9** Generic-coin totals are plain numbers on a line: no currency sign, no unit word. A currency sign may be pre-printed beside a blank only inside a word problem whose story text uses that currency, or where RP-116 allows it for a money skill whose currency is not Plain numbers.
- **SL-10** A missing-digit box is dashed and every regroup, carry and headroom box is solid, so the two are never confused in one stack (LS-8, VA-7). The dashed box is a scored answer slot; the solid boxes above the stack are scratch space (VA-13).
- **SL-11** **Slot radius** (owner ruling 2026-09-25: "the square boxes should be slightly rounded"). Every writing box - digit box, digit strip, answer box, regroup / carry strip, missing-digit box, checkbox, time box, stand-alone write-in box - has a corner radius of **1 / 1.25 / 1.5 mm at S / M / L** (`SLOT.slotRadiusMm`, CSS `--ws-slot-r`). The cell frame, the grid dividers, band strips, tables, tabs and the header score / strand box stay square (radius 0): they are the page, not a place to write. On screen the same boxes round at 0.15 x the digit size (min 4 px, `--mq-slot-r`).
- **SL-12** **Digit strip** (owner ruling 2026-09-25: "they could be one box actually with dividers between them"). A row of digit boxes is ONE rounded outline with a 0.75 pt divider on every track boundary, never a row of separate boxes with gaps. Each segment is exactly one track wide (the column pitch of the digits above it), so every divider sits between two place-value columns and place value still lines up. Only the two ends are rounded; only the last segment draws a right edge, so no divider doubles. A run of boxes interrupted by a non-box track (the operator track, a decimal point) is two strips. Heights: the **answer strip is 7.2 / 9.6 / 12 mm** (1.2 x Hw, was a Hw-tall box; it fits the 8 / 10 / 12 mm answer row, VA-4), the **regroup strip is 6 / 7 / 8 mm** (was a 5 / 6 / 7 mm carry box; it fills the 6 / 7 / 8 mm regroup row). Widths grow from track - 1 mm to the full track (4.4 / 6.4 / 8.4 mm to 5.4 / 7.4 / 9.4 mm at the 0.95 em regroup track). No row height changes, so no page capacity changes (section 13). The answer key writes each digit inside its own segment (AK-2).
- **SL-13** On screen the strip is still one input per digit, each input a full-track target of at least 44 px (SP-10): the strip's outline and dividers are drawn on the inputs, keyed on `data-ws-seg`, so markup saved before the ruling (no `data-ws-seg`) keeps its separate boxes.

---

## 7. Cells and labels

### 7.1 Cell construction

- **CL-1** A page body is one outer frame (1.5 pt) containing cells that share borders like a table. No gutters, no floating cards, no per-cell shadows or rounded cells.
- **CL-2** Permitted grids: 2 x 3 (default independent page), 2 x 2 (heavy items, long procedures), 2 x 4 / 2 x 5 / 2 x 8 (one-symbol answers), 3 x 3 (Daily computation), 3-7 full-width rows (wide visuals), open 4 x 4 or 4 x 5 (tests), fact grids at 5-10 columns. Tests and probes may drop interior borders (open array) but keep the outer frame.
- **CL-3** All cells in a section are the same size. Cell size is identical on every page of the section (PG-11).
- **CL-4** Problem in the top half: the printed problem (or the visual plus its prompt) starts at the top pad and its printed content ends within the top half of the cell, except cells whose visual is the workspace (draw the hands, shade the model, plot the point).
- **CL-4a** A scaffold the pupil writes in is writing space, not printed content, so CL-4 is measured below it (owner ruling 2026-09-19, applied to the think box SF-40). In a think-box cell the box occupies the top of the cell and the fact must end within the top half of what is left under it; the cell keeps one row fewer than the same section without the box. The same reading applies to any other write-in scaffold placed above the problem.
- **CL-5** At least **40% of every cell's area is free** of printed ink bounding boxes (label and answer slots count as printed; open answer zones count as free; a draw / shade visual counts as workspace, i.e. free). Arrays that are more than 70% white by true outline are measured by true outline.
- **CL-6** The response slot sits in the same position in every cell of a section: under the sum rule for stacked work, right of `=` for equations, bottom-centred answer zone for visuals (answer zone height Hw + 4 = 10 / 12 / 14 mm), inside the story box for word problems. A pupil never has to hunt for where to write.
- **CL-7** One idea per cell: one problem, one visual, one answer type. Nothing else is in the cell: no skill name, no level, no CCSS code, no hint text outside declared scaffolds, no decoration.
- **CL-8** Cell padding: 3 mm on all sides for visual and text cells. Stacked-arithmetic cells use side pad 4 / 6 / 6 mm, top pad = label + 2 mm (6 / 7 / 8), bottom pad 4 mm. Fact cells use side pad 3 mm (2 mm at 7 or more columns) and top pad 3 mm at 6-7 columns, 2 mm at 5 and at 8-10 columns.
- **CL-9** In a 1-column stacked-arithmetic layout the stack is centred in the leftmost 62 mm of the cell, close to its label; the remaining width is open working space.

```
I Can cell (2 x 3 grid, 93 x 76 mm)            Daily cell (3 x 3 grid, 62 x 76 mm)
+-------------------------------------+        +###+--------------------------+
| a.                                  |        |#4#|                          |
|         H   T   O                   |        +###+      2   5   2           |
|            [ ] [ ]                  |        |      +   2   4   7           |
|         6   8   5                   |        |      ===============         |
|     +   3   0   2                   |        |                              |
|     =================               |        |                              |
|                                     |        |   (open answer zone:         |
|   (open answer zone, >= 40% free)   |        |    all spare height here)    |
|                                     |        |                              |
+-------------------------------------+        +------------------------------+
  0.75 pt shared borders, 0.72 em tracks         1.5 pt shared borders, 0.95 em tracks
  (0.95 em here because regroup boxes are on)
```

### 7.2 Quiet letter label (I Can look)

- **CL-10** Lowercase Andika 400 letter followed by a period: `a.` `b.` `c.` Size 8 / 9 / 10 pt. Black. Placed with its cap-height box inset 1.5 mm from the top and left inner edges of the cell. No box, no circle, no bold.
- **CL-11** The letter's reserved box is the same square a tab would take in that section (side 4 / 5 / 6 mm by effective digit size, CL-31) at the top-left corner, and it obeys the same keep-out (CL-40). Because both label styles reserve one box, switching label style never reflows a page. With label style "none" the box stays reserved.
- **CL-12** Letters run on across all pages of one lesson (opener's independent items, then each independent page). Each More Practice page, Review, Test, pre-skill check, sub-skill page, Error analysis, True or False?, Reason It and Stretch page starts again at `a.` (each is handed out alone).
- **CL-13** A run never passes `z.` If a lesson would need a 27th letter the run restarts at `a.` at the next page boundary and the dialog shows a note. Letters are never doubled (`aa.`).
- **CL-14** Model cells and Guided cells are unlabelled. They are identified by their band label (section 9). A cell whose complete answer is printed is never labelled and never counted in the Score denominator.

### 7.3 Black number tab (Daily look)

- **CL-30** A solid black square flush with the top-left inner corner of the cell (it touches both borders). White Andika 700 numeral, centred. No period.
- **CL-31** Tab size follows the **effective digit size** of the section (after the ladder), not the preset:

| Effective digit size | Tab side | Numeral |
|---|---|---|
| 26 pt and over | 6 mm | 11 pt |
| 20-25 pt | 5 mm | 10 pt |
| under 20 pt | 4 mm | 8 pt |

- **CL-32** Tab width is 1 x side for a 1-digit label, 1.4 x side for 2 digits, 1.5 x side for 3 digits. Height is always the side. One width per section (the widest label's).
- **CL-33** Numbering runs 1 to N, row-major, across sections and pages. The last number equals the Score denominator. It restarts only inside Day bands, each of which has its own Score. Shuffled mixed practice numbers by strip, then block, then inside the block.
- **CL-34** The optional worked cell in a Daily grid carries an **outlined "Model" tab**: white fill, 0.75 pt black border, black Andika 700 text at strand-tab size, height = tab side, width 13 / 15 / 17 mm. Solid black always means "a problem to answer"; outlined means "already answered".
- **CL-35** Tabs are never used for band labels, section titles or decoration. Black is reserved for identifiers: number tabs and Day tabs.
- **CL-36** Total tab ink stays under 5% of cell area at every column count.

### 7.4 Keep-out and label options

- **CL-40** Keep-out: nothing enters the square of (label side + 1 mm) on either axis from the top-left corner. Left-aligned text, cues and pictures placed beside or below the label start at label side + 2 mm. Round visuals are tested against their true outline: clear if the distance from the visual's centre to the keep-out corner point is at least its radius. A rectangular visual is clear if (cellW - visualW) / 2 >= label side + 1; otherwise its top inset becomes label side + 1 instead of 3 mm.
- **CL-41** In stacked arithmetic the operator track of the top operand row is always empty; the label sits above it. A visual is never scaled below its minimum to clear a label: drop a row instead.
- **CL-20** Print-dialog override "Item labels": **letters / black tabs / none**, per section, remembered. The override changes the label only; borders, tracks and titles stay with the page type's look. "None" is the default for Day-band fact rows, trace rows and chart cells.
- **CL-21** Dense fact rows (8-10 columns) offer three labelling modes: **Day bands** (black "Day N" tab and a per-band Score, no cell labels; default when several days are chosen), **row letters** (one quiet letter at the left of each row, outside the first cell's fact, in a 6 mm gutter taken from the grid width), **every fact numbered** (standard black tab at 4 mm; fits the free top-left corner, which is at least 7.3 mm wide at 10 columns).
- **CL-22** A bare black numeral or letter in the digit face, without a tab or the quiet-letter spec, is never used as an item label: it reads as part of the sum.

---

## 8. Header, strand tab, title, footer

### 8.1 Full header (page 1)

```
|<------------------------------ 186 -------------------------------->|
+---------------------------------------------------------+-----------+  y = 0
| Name _______________________  Date __________  Score __/20| Level 3   |
|      (rule at y = 11, clear height >= 10 mm)            | Addition  |  row A: 14 mm
|                                                         | Lesson 5  |
+---------------------------------------------------------+-----------+  y = 14
                                                                          gap 1
            I Can add three-digit numbers with regrouping                row B: 8 mm
                                                                          gap 1.2
=======================================================================  2.25 pt rule (0.8)
                                                                          gap 1      total 26.0
```

| Part | Spec |
|---|---|
| Row A height | 14 mm when the tab is on; 11 mm when only fields are on |
| Field labels | "Name", "Date", "Score" at zone-label size 9 / 10 / 12 pt, weight 700, baseline on the field rule |
| Field rules | 0.75 pt at y = 11 mm, so each field has at least 10 mm clear height |
| Name line | Takes the remaining width; min 55 mm, max 90 mm |
| Date line | 26 mm |
| Score | 14 mm line, then "/N" printed at cell-text size. N = number of scored items on the whole sheet |
| Field order | Always Name, Date, Score, left to right. Score is the right-most field; Date sits directly left of Score; 5 mm between fields |
| Strand tab | 30 x 14 mm rectangle, top-right, square corners, 1.5 pt outline, white fill, black text, 3 centred lines (2 on a sheet with no single strand, HD-5); 4 mm clear to its left |
| Title | Centred on the 186 mm live width, one line, weight 700, 14 / 16 / 18 pt |
| Header rule | 2.25 pt, full 186 mm |

- **HD-1** The header always offers five parts: **Name, Date, Score, strand tab, "I Can" title**. Each is a teacher check box in the print dialog, remembered in the persisted dialog state. Default: all five on.
- **HD-2** Score always prints with its denominator: a ruled line followed by "/N". "Score" without "/N" is a defect. Score prints only on sheets with at least one scored item; on a sheet with none (opener with only Model and Guided cells, scripted model, fact-family intro) the Score field is suppressed even when checked.
- **HD-3** When Day bands are on, the header Score is suppressed automatically and each band strip carries its own "Score ___/n".
- **HD-4** Optional timing fields (dialog check boxes, off by default; options, not policy): a "(1 minute)" tag appended to the title in weight 400; a "Time ____" field and a "Goal ____" field placed left of Score with 14 mm lines. When Time or Goal is on, the Name line may fall to its 55 mm minimum; if it cannot, Date moves to row B's left edge.
- **HD-5** The strand tab is outlined, never solid (INK-5; the outlined tab was approved by the owner on 2026-09-19). Its three lines are: line 1 "Level N" (K, 1-6); line 2 the strand in at most 12 characters (for example Addition, Subtraction, Multiplying, Division, Fractions, Decimals, Place Value, Time, Money, Measurement, Geometry, Data, Algebra); line 3 the page id (for example "Lesson 5", "Practice E", "Review", "Test A", "Probe ×3 A", "Week 2 - Day 4", "Answer Key"; the full list is `design/PAGE_TYPES.md` PT-FRM-9). A sheet with no single strand (daily spiral, mixed practice, Daily 4) omits line 2 and prints a two-line tab of the same size. Text 9 / 10 / 10 pt; lines 1-2 weight 700, line 3 weight 400.
- **HD-6** The tab never carries a grade, a CCSS code, a skill id or a product name.

### 8.2 Title grammar

- **HD-10** Lesson titles follow `I Can <verb> <object> (<constraint>)`, with the constraint optional and in parentheses (P-3), for example "I Can subtract two-digit numbers (no regrouping)". "I Can" is capitalised; the rest is sentence case; no closing period; at most 60 characters.
- **HD-11** The title is **identical on every page of one lesson packet** (opener, model, guided, independent, more practice). The lesson phase is a band label or tab line 3, never part of the title.
- **HD-13** Fixed exceptions: `Review: <topic>`, `Test A: <topic>` / `Test B: <topic>`, `Pre-skill check: <topic>`, `Mixed practice`, `Daily review`, `Daily 4`, `True or False?`, `Reason It`, `Stretch`, `Today's Number`, and fact pages, which use the short fact stub ("Add 7", "Multiply by 3", "Fact family 3, 4, 7").
- **HD-14** A title that does not fit one line at the preset size wraps to two lines and takes 6 mm from the body. It never shrinks and is never truncated.
- **HD-15** The title is plain bold Andika. No display lettering, no banner shape, no icon.

### 8.3 Reflow for every check box combination

Header height `H = hA + gapAB + hB + ruleBlock`.

| Term | Value |
|---|---|
| hA | 14 if tab on; 11 if tab off and any of Name / Date / Score (or Time / Goal) on; 0 otherwise |
| hB | 8 if title on and it is not lifted into row A; 0 otherwise |
| gapAB | 1 if hA > 0 and hB > 0; else 0 |
| ruleBlock | 3 (1.2 gap + 0.8 rule + 1 gap) if hA + hB > 0; else 0. With everything off, the body frame's top edge is the page's first line |
| Title lift | If no field is on, the tab is on, and the title is at most 118 mm wide, the title is centred in row A on the live width and hB = 0 |

All 32 combinations (N = Name, D = Date, S = Score; 1 = on):

| N D S | Tab on, title on | Tab on, title off | Tab off, title on | Tab off, title off |
|---|---|---|---|---|
| 1 1 1 | 26 | 17 | 23 | 14 |
| 1 1 0 | 26 | 17 | 23 | 14 |
| 1 0 1 | 26 | 17 | 23 | 14 |
| 1 0 0 | 26 | 17 | 23 | 14 |
| 0 1 1 | 26 | 17 | 23 | 14 |
| 0 1 0 | 26 | 17 | 23 | 14 |
| 0 0 1 | 26 | 17 | 23 | 14 |
| 0 0 0 | 17 (title lifted; 26 if title wider than 118 mm) | 17 | 11 | 0 |

Horizontal reflow of row A (available width W_A = 186, or 152 when the tab is on):

| Fields on | Layout |
|---|---|
| Name, Date, Score | Name line = W_A - 97 mm (55 with tab, 89 without); Date; Score right-most |
| Name, Date | Name line up to 90 mm; Date right-aligned to the row's right end |
| Name, Score | Name line up to 90 mm; Score right-aligned |
| Name | Name line 90 mm, left-aligned |
| Date, Score | Date left-aligned at x = 0; Score right-aligned |
| Date | Left-aligned at x = 0 |
| Score | Right-aligned |
| none | Row A holds only the tab (and the lifted title) |

- **HD-12** Freed header height goes to the body (PG-4): body = live height - H - 9, i.e. 236 + (26 - H) on A4. Example: A4, size L, Name / Date / Score off, tab and title on with the title lifted (H = 17): body = 245 mm, gridH = 245 - 9 = 236 mm. With all five parts off (H = 0): body = 262 mm.
- **HD-16** Field positions never depend on which page type is printed: a pupil finds Name at the top-left and Score at the top-right of the field row on every sheet.

### 8.4 Continuation header

- **HD-20** Pages 2 and later of a sheet use a 12 mm header: Name line (if Name is on; min 55 mm) at the left, a one-line compact tab at the right (outlined, 8 mm tall, text "Level 3 · Addition · Lesson 5" at 9 pt), then the 2.25 pt rule. No Date, no Score, no title. The instruction line repeats below it (PG-22).

### 8.5 Footer

```
| add-3d-regroup · Grade 2 · 2.NBT.B.7                 2/3                 Form A · seed 4F2K |
```

- **HD-30** The footer sits outside the body frame, 6 mm tall, 7 pt, weight 400 (page number 700). Left: skill id(s), grade, CCSS code(s), at most 9 codes then "+n". Centre: page n/N. Right: form letter, seed or week/day code. This is the only place grade and CCSS appear.
- **HD-31** The footer carries no clamp notes, no warnings and no dialog messages (DN-14).
- **HD-32** The footer is teacher-facing and is the single exemption from TY-11.

---

## 9. Bands and the instruction line

### 9.1 Bands

A band is a full-width horizontal slice of the body frame with a label. Bands stack; cells live inside bands.

```
|======================================================================|  2.25 pt band top rule
| Guided Practice:  Write the sum.                                     |  band strip 6/6/8 mm
|----------------------------------+-----------------------------------|
|  (unlabelled guided cell)        |  (unlabelled guided cell)         |
```

- **BD-1** Fixed band vocabulary (I Can look). No other band label may be printed:

| Band label | Holds |
|---|---|
| `What's New:` | One sentence naming the single change in this step |
| `Vocabulary:` | At most 3 terms, each with a labelled mini-diagram |
| `Rule:` | One rule sentence, optionally with one example and one non-example |
| `Remember:` | One reminder of an earlier rule |
| `Warm-up:` | Oral or quick rehearsal of the pre-skill |
| `Steps:` | 3-6 numbered imperative steps (teacher script; hideable) |
| `Model:` | Worked cell(s): one traced, one blank to work live |
| `Say:` | The step's oral sentence frame, read aloud with the numbers in (P-17). A print-dialog option, on by default (BD-8) |
| `Guided Practice:` | 2-4 unlabelled cells worked together |
| `Independent Practice:` | Lettered cells |
| `More Practice:` | Lettered cells, pages lettered A-J in the tab |
| `Mixed Review:` | Earlier item types, lettered |
| `Workspace:` | Open or gridded working area |
| `Day N` | Day band in fact rows and Daily 4 (black tab, BD-5) |

- **BD-2** Band label: Andika 700 at instruction size, capitalised exactly as listed, ending in a colon, top-left inside the band strip, 3 mm from the left edge. Never reversed out, never in a tab, never rotated, never all caps.
- **BD-3** Band strip height: 6 / 6 / 8 mm. A strip that contains a write-in (a Day band's Score) is 7 / 8 / 10 mm. A band's top edge is a 2.25 pt rule drawn inside the strip; bands are otherwise divided by the shared 1.5 pt frame weight.
- **BD-4** The Steps band sits to the right of the Model cell (Steps width 40-45% of the band), not above it, so each step reads beside the mark it produces. Step numerals are outlined circles (0.75 pt, diameter = cell-text cap height + 3 mm), never solid.
- **BD-5** Day tab: solid black, height 5 / 6 / 7 mm, white Andika 700 "Day 1" at strand-tab size, flush left in the strip. The strip's right end holds "Score ___/n". Day bands are separated by a 3 mm gap and are never split across pages.
- **BD-6** Daily-look section titles (daily spiral, mixed practice, Today's Number) are **plain bold sentence-case titles** at instruction size, followed by the instruction on the same baseline, under a 2.25 pt top rule. No decorative lettering, no clip-art, no black title tabs. A half-width section title is at most 9 characters and its instruction at most 20 characters.
- **BD-7** Model content prints black. In Guided cells the same scaffolds print grey (SF-10). Independent cells show structural scaffolds only.
- **BD-8** **The `Say:` band** is an official band of the lesson opener: a full-width strip directly under the Model and Steps zones, closing the Model band. It is a print-dialog option, **on by default**; switched off, its height returns to the body (PG-4). Geometry: height Hw + 3 = 9 / 11 / 13 mm; its top edge is the shared 1.5 pt divider (not a 2.25 pt band rule, because it does not open a new section); the bold label `Say:` at cell-text size sits 3 mm from the left edge, followed on the same baseline by the frame at cell-text size, weight 400, inside curly double quotes; the baseline is 2.5 mm above the band's bottom edge. Blanks are ruled lines of width B(n), never under 14 mm (SL-1, SL-6); they are said, not written, so the band is unlabelled, unscored and has no instruction line. One frame per band, from the oral-frame library (`PEDAGOGY_STANDARD.md` section 10.5). The Scripted Model page closes with the same band, its frame filled in.

### 9.2 Instruction line

- **BD-10** One instruction per section: **at most 12 words in one to three short imperative sentences** (P-LG-1), each ending in a period, in the instruction block (8 / 8 / 9 mm) directly above the cells it governs, left-aligned, weight 400. It is never inside a cell.
- **BD-11** Each sentence starts with a verb from the print verb list in `PEDAGOGY_STANDARD.md` section 10.2, which also owns the print-to-screen swap map. The swaps, restated:

| Print wording | Screen twin (same sentence otherwise) |
|---|---|
| Write | Type |
| Circle | Tap (a ring is drawn) |
| Box | Tap (a box is drawn) |
| Cross out | Tap (a strike is drawn) |
| Underline | Tap |
| Check (a box: "Check one box.") | Tap |
| Check (the work: "Check the work.", "Multiply to check.") | unchanged |
| Trace | Tap |
| Shade | Tap the parts |
| Color | Tap |
| Mark | Tap the line |
| Draw a line to match | Tap the two that match |
| Draw the hands | Drag the hands |
| Measure | Drag the ruler |
| Cut, Sort, Glue | Drag (hands-on pages only) |
| Every other print verb (Read, Say, Count, Add, Divide, Solve ...) | unchanged |

- **BD-12** Words that may never start or appear in a printed instruction: tap, click, type, drag, select, enter, press, swipe, scroll, hover. Words that ask for composed language never appear either: explain, describe, justify, discuss, prove (P-LG-4).
- **BD-13** Computation sections use the library strings `add` "Add.", `subtract` "Subtract.", `multiply` "Multiply." and `divide` "Divide." A mixed-operation section uses `mixed-sign` or `mixed-ops`. The words sum, difference, product and quotient are vocabulary taught from Level 3 (P-LG-9) and are not used in computation instructions.
- **BD-14** Identical wording on reuse: every time a task recurs (next page, next lesson, review, test, spiral panel, screen card) its instruction string is byte-identical. Strings come from the controlled library in `PEDAGOGY_STANDARD.md`; page code never composes instruction text.
- **BD-15** Multi-mark instructions give each category its own mark in one sentence, for example "Circle the even numbers. Cross out the odd numbers." counts as one instruction of two short sentences, inside the 12-word cap of BD-10.
- **BD-16** The instruction is the same in every fade band of a lesson; fading changes scaffolds, never wording.
- **BD-17** `Check` replaces `Tick` everywhere a pupil reads (US conventions; owner ruling 2026-09-19). The verb has two senses and its object tells them apart (P-LG-14): marking a box always names the box ("Check one box."); verifying always names the work or follows "to" ("Check the work.", "Multiply to check."). `Check` with an option word as its object ("Check True or False.") is a defect. The printed square is a "check box" and the mark a pupil or the app makes in it is a "check mark"; "tick" is kept only for the marks on a scale, a ruler, a clock or a number line.

---

## 10. Vertical arithmetic anatomy

### 10.1 The stack

```
 pad | op  | Th  |  H  |  T  |  O  | pad         T = digits of widest number + 1
-----+-----+-----+-----+-----+-----+-----
     |     |     |  H  |  T  |  O  |       place-value heads row   4 / 5 / 6 mm   (option)
     |     |     | [ ] | [ ] |     |       regroup row             6 / 7 / 8 mm   (option)
     |     |     |  6  |  8  |  5  |       operand 1               1.15 em
     |  +  |     |  3  |  0  |  2  |       operand 2, operator in the leftmost track
     |=============================|       sum rule 1.5 pt, op track -> ones track
     | ( ) |     |     |     |     |       answer row 8 / 10 / 12 mm, open
     |     |     |     |     |     |       spare height (PG-14), then bottom pad 4
```

- **VA-1** Track count: add / subtract d-digit operands T = d + 1; multiply m-digit by 1-digit T = m + 1; multiply m by n (n >= 2) T = m + n + 1; a unit sign adds 1; each separator adds a 0.3 em track.
- **VA-2** **Operator track**: the leftmost track. The operator (700) sits on the bottom operand's row only, and never moves right to sit beside a shorter operand. The top operand's operator track is empty (the label sits above it).
- **VA-3** **Rule line**: 1.5 pt, from the left edge of the operator track to the right edge of the ones track, with 1 mm clear above and below. One rule for add / subtract / 1-digit multiply; a second identical rule under the partial products.
- **VA-4** **Answer row**: 8 / 10 / 12 mm tall (design value; never below Hw), open space with no lines or boxes on paper. An answer track exists under **every** track including the operator track, so a carry-out digit is written under the operator and the layout never reveals whether one occurs. In Guided cells the answer row shows grey 1 pt ticks, 2 mm long, at each track boundary.
- **VA-5** The stack is anchored to the top of the cell at label + 2 mm and centred horizontally (CL-9 for 1 column). Spare height goes under the rule.
- **VA-6** Minimum cell width = `T x track + separators x 0.3 em + 2 x sidePad` + shared borders; minimum cell height = top pad + [heads 4/5/6] + [regroup 6/7/8, or subtraction headroom 8/10/12] + 2 x digit line + [Daily gap 2] + rule 2 + [n partial rows at 6/8/10 + second rule 2] + answer row + bottom pad 4.

- **VA-7** **Missing-digit items**: when a digit of an operand or of the printed answer is unknown, its track holds a missing-digit box (section 6: dashed, track - 1 mm x Hw) in place of the glyph, on the digit's own row. One unknown digit per item at first, then two. Every other digit of the stack prints as usual, the answer row prints its given digits at working size, and regroup or carry boxes, when on, stay solid (LS-8).

Minimum cell height (mm), I Can / Daily:

| Case | S | M | L |
|---|---|---|---|
| Plain add or subtract | 33 / 35 | 41 / 43 | 49 / 51 |
| + place-value heads | 37 / 39 | 46 / 48 | 55 / 57 |
| + addition regroup row | 39 / 41 | 48 / 50 | 57 / 59 |
| + heads and regroup row | 43 / 45 | 53 / 55 | 63 / 65 |
| + subtraction headroom | 41 / 43 | 51 / 53 | 61 / 63 |
| Multiply by 2-digit | 47 / 49 | 59 / 61 | 71 / 73 |
| Multiply by 3-digit | 53 / 55 | 67 / 69 | 81 / 83 |

### 10.2 Addition: carry box and ones box

```
        [ ]  [ ]            <- carry boxes above every column except the ones
     4   6   7
 +   2   8   5
 ================
 ( ) [ ] [ ] [ ]            <- answer digit boxes ("ones box" first), Model and Guided only
```

- **VA-10** **Carry box**: one segment of the regroup strip (SL-12): solid 0.75 pt, slot radius at the strip's ends, width = one track, height 6 / 7 / 8 mm, in a regroup row of 6 / 7 / 8 mm. One above **every column except the ones**, whether or not that column regroups, so the boxes reveal nothing. Black in Model, grey 1 pt in Guided, and present as black structural boxes in Independent when "regroup boxes" is on.
- **VA-11** **Ones box**: in Model and Guided cells the answer row is one answer strip with a segment per track (SL-12: 0.75 pt, one track x 1.2 Hw). The first Model cell links the ones answer box and the carry box above the tens with a dotted arrow pair (hint) to show "write the ones here, regroup the ten there". Independent cells have an open answer row.
- **VA-12** Any regroup row forces 0.95 em tracks (TY-21). Strip segments are therefore one 0.95 em track wide: 5.4 / 7.4 / 9.4 mm (the old separate boxes were track - 1 mm, 4.4 / 6.4 / 8.4 mm).
- **VA-13** Regroup boxes are scratch space: never scored, never marked on screen, never auto-focused (SP-23). **On an answer key AK-2 wins** (owner ruling 2026-09-25): the key FILLS the regroup and carry boxes with the full working - the new value of every regrouped top digit (the 5 over a crossed 6, the 17 over a crossed 7) with the old digit crossed out (VA-23), and every carry over the column that receives it. The boxes stay unscored; only the key writes in them.
- **VA-13a** A subtraction's ONES regroup box holds a two-digit number after a regroup (12, 17), so it is two digits wide (1.5 tracks), overhanging the ones column to the right; the other regroup boxes keep one track (lessons r1, H9).

### 10.3 Subtraction: Tens / Ones boxes, including across zeros

```
  ordinary                       across zeros (400 - 157)
     [ ] [ ] [ ]                   [   39   ] [10]      <- wide box spans the zero run
      6   3   2                      4    0    0           plus the digit to its left
  -   2   4   7                  -   1    5    7
  ===============                ==================
```

- **VA-20** When the subtraction regroup scaffold is on, a **headroom row of 8 / 10 / 12 mm** is always present above the top operand (structural). It is open space at S and M.
- **VA-21** At L, in Model and Guided cells, the headroom row holds boxes above **every** digit of the top number (width track - 1, height Hw - 2), regardless of whether the problem regroups. The first Model cell labels them with the place words at zone-label size ("Tens", "Ones").
- **VA-22** **Across zeros**: where the top number contains a run of zeros, one wide box spans the run together with the non-zero digit to its left (the pupil renames 40 tens as 39 tens), and a single box stands over the ones. Box layout is derived from the top number's digits only, never from the answer.
- **VA-23** The pupil crosses out given digits by hand; the sheet never pre-prints a strike in Independent cells. Model cells show the strike as a 0.75 pt solid diagonal and the new value in grey.

### 10.4 Place-value heads

- **VA-30** Default: **bold letters H T O (Th, TTh)** at zone-label size in a heads row of 4 / 5 / 6 mm, each centred over its track, closed below by a 0.75 pt cap rule spanning the digit tracks, so the letter O cannot be read as a zero. Decimal places use lowercase `t` `h` with the point printed in its separator track.
- **VA-31** The full words (Hundreds, Tens, Ones) are printed **once**: in the first Model cell beside the stack as a legend ("H Hundreds · T Tens · O Ones") and in the Vocabulary box. Words are never set over tracks narrower than 14 mm.
- **VA-32** Dialog option per section: **words / letters / none**. "Words" is honoured only where every track column is at least 14 mm wide (place-value charts, 2-column layouts at L); otherwise it clamps to letters with a dialog note. Heads are a structural scaffold (`PEDAGOGY_STANDARD.md` section 4.1): they stay on tests while "Keep structural supports on tests" is checked (SF-3) and leave a ladder only through a dedicated fade step.

### 10.5 Decimals and separators

- **VA-40** The decimal point has its own 0.3 em track, aligned on every row and in the answer row. Operand points are always printed. The answer-row point is black in Model, grey in Guided, and absent in Independent.
- **VA-41** Ragged decimals in Guided cells show grey trailing zeros. Independent cells do not.
- **VA-42** Commas are printed for numbers of 5 or more digits and optional (dialog) for 4 digits; each takes a 0.3 em track.

### 10.6 Multiplication with partial products

```
           3   4
   x       2   6
   ================
   [ partial product row 1 ]      6 / 8 / 10 mm, all T tracks
 + [ partial product row 2 ]      "+" pre-printed in the operator track
   ================               second rule 1.5 pt
   [ final answer row        ]    8 / 10 / 12 mm
```

- **VA-50** Each partial product gets a full row across all T tracks at 6 / 8 / 10 mm. The `+` is pre-printed in the operator track of the last partial row (structural). Guided cells show a grey placeholder zero (or zeros) in the second and third partial rows (hint).
- **VA-51** Model and Guided cells rule the partial rows with 0.75 pt track boxes; Independent cells keep the same height as open space.
- **VA-52** A carry row above the top factor (6 / 7 / 8 mm) follows VA-10 and VA-12.

### 10.7 US long-division bracket and work grid

```
                 Q   Q   Q     R [  ]     <- quotient row 8/10/12 mm above the vinculum; R box
            +------------------              vinculum 1.5 pt spans ALL dividend tracks
        4   )   6   5   8                 <- divisor | bracket arc | dividend, one digit per track
          -     :   :   :                 <- work rows: 2 per quotient digit (subtract, bring down)
              -----------                    "−" pre-printed on each subtract row
                :   :   :                    dotted verticals = alignment guides (LS-1), optional
          -     :   :   :
              -----------
```

- **VA-60** Bracket: one SVG path, 1.5 pt: a right-bowing arc the height of the dividend row joined to a horizontal vinculum spanning every dividend track. Tracks: divisor digits + 0.6 (bracket gutter) + dividend digits + R block (2 tracks) when remainders are in play.
- **VA-61** The quotient row sits above the vinculum at 8 / 10 / 12 mm. With the digit grid off, the vinculum itself is the answer line: no boxes, nothing reveals the quotient's length. With the grid on (Model and Guided only), there is a 0.75 pt box over **every** dividend track.
- **VA-62** On a remainders section the "R" label and its box print in **every** cell, including items whose remainder is 0. The box is sized from the divisor's digit count.
- **VA-63** Work grid: two work rows per quotient digit at 6 / 8 / 10 mm; the subtract rule under each pair is 0.75 pt; the `−` is pre-printed in the gutter of each subtract row (structural). The alignment guides are 1 pt grey dotted verticals at track pitch, sized to the dividend and extended one row above the bracket; they appear in Model and Guided only.
- **VA-64** Optional helpers (the multiples strip is a hint; the estimation box and check frame are structural): a multiples strip (page-side rounded strip for single-divisor sections, 9 / 10 / 12 mm wide with a 4 mm gap; per-cell strip only in Model and Guided of mixed-divisor sections), an estimation box for 2-digit divisors (rounded, SF-40 styling), a two-row check frame `[q] x [d]` / `+ [R] = [D]` on the track grid.
- **VA-65** Bracket division is always its own section with its own instruction line; it is never mixed with `+ − ×` stacks, because its answer sits above the problem instead of below it. Vertical division facts clamp to 8 columns (basic) or 6 (2-digit divisor or 3-digit dividend).
- **VA-66** Long-division cells: minimum cell width 30 mm, maximum 6 columns, default 2 x 2 at L. In the Daily look the track may compress from 0.95 to 0.80 em only when that lifts the maximum from 1 column to 2.

### 10.8 Vertical facts

```
<-------- w = W / N -------->
+###+-----------------------+      fact width = 3 tracks x 0.72 em = 2.16 em
|#7#|             1    2    |      h = padTop + 2.30 em + 1 + answer row + 2   (round up to mm)
+###+     x            3    |      answer row = max(0.936 em, Hw)
|        ================   |
|                           |
+---------------------------+
```

- **VA-70** Fact cell height by columns (S / M / L, mm): 5: 37 / 37 / 38; 6: 34 / 34 / 36; 7: 29 / 31 / 33; 8: 26 / 28 / 30; 9 and 10: 24 / 26 / 28. At 1-4 columns: 28 pt digits, 37 / 37 / 38.
- **VA-71** Every fact page can show both orientations as separate sections: vertical rows first, then a horizontal block. Horizontal facts follow the equation fit function (DN-22), which in practice clamps them to 4 columns (3 for 2-digit by 2-digit).

---

## 11. Representation drawing rules

### 11.1 Rules for every drawing

- **RP-1** **Never draw the answer.** A visual shows the given information and the workspace, nothing that states or implies the response. Specifically: no count label on a set to be counted; no hands on a draw-the-hands clock; no pre-marked point on a plot item; slot counts, box counts and track counts that are constant across a section (TY-26, VA-4, VA-10, VA-62); partition lines absent when partitioning is the task; number-line labels omitted at the answer's tick; bars absent when drawing bars is the task. A Model cell is the only place a completed response may be drawn, and there it is grey or dotted.
- **RP-2** One SVG builder per representation serves print and screen (`opts.mono` on; viewBox in mm; strokes from section 4; text in Andika). Screen scales by CSS width; minimum rendered stroke is 1 CSS px.
- **RP-3** Minimum size is fixed by S / M / L. A visual may grow to fill its zone up to 1.25 x its minimum; it is never drawn below the minimum and never distorted. If it does not fit, drop a column or a row (PG-20).
- **RP-4** One kind of visual per cell. A section may mix visuals only when they share one answer-slot type.
- **RP-5** Any part a pupil shades, colors, counts by touching, or writes in is at least 6 mm in its smaller dimension (also guarantees INK-20).
- **RP-6** Labels inside a visual use zone-label size; printed targets and prompts (for example the time to draw) use working digit size.
- **RP-7** Art is functional only. No scenery, faces, characters or decoration. At most one illustration on a Model word problem; none on independent items.
- **RP-8** Every visual exposes its required width and height and a `fits(zoneW, zoneH)` test to the layout engine. If `fits` fails, the generator regenerates the problem with smaller quantities; it never overlaps or shrinks.

### 11.2 Minimum sizes

| Representation | S | M | L | Max columns S/M/L |
|---|---|---|---|---|
| Ten frame, single (cell 8 / 9 / 10 mm) | 40 x 16 | 45 x 18 | 50 x 20 | 4 / 3 / 3 |
| Ten frame, pupil draws counters (cell 10 / 10 / 11) | 50 x 20 | 50 x 20 | 55 x 22 | 3 / 3 / 3 |
| Counters / pictures to count (item size) | 9 | 10 | 12 | by fit |
| Base-10, up to 99 (unit u = 2.5 / 3 / 3.5) | 39.5 x 25 | 45 x 30 | 50.5 x 35 | 4 / 3 / 3 |
| Base-10, 100-299 (u = 2.5 / 3 / 3.4) | 66.5 x 52 | 77 x 62 | 85.4 x 70 | 2 / 2 / 2 |
| Base-10, 300 and over (u = 2.5, flats 5 per row) | 174.5 x 52 | same | same | 1 |
| Place-value chart (column width x row height) | 14 x 8 | 14 x 10 | 17 x 12 | by columns |
| Number line (tick pitch; line length) | 6; >= 120 | 7; >= 140 | 8; >= 160 | 1 (2 at S for 0-10) |
| Number bond / part-whole (box side) | 14 | 16 | 20 | 3 / 3 / 2 |
| Schema diagram / bar model (bar height; min bar length) | 10; 30 | 12; 36 | 14; 42 | 1 (2 in v2) |
| Array up to 5 x 5 (pitch 7 / 8 / 9) | 35 | 40 | 45 | 4 / 4 / 3 |
| Array up to 10 x 10 (pitch 7 / 8 / 8, 1.5 mm gap after 5) | 70 | 80 | 81.5 | 2 |
| Equal groups (group oval min) | 22 x 16 | 26 x 18 | 30 x 22 | by fit |
| Area model (cell min) | 14 x 10 | 17 x 12 | 25 x 14 | 2 / 2 / 1 |
| Fraction circle (diameter) | 36 | 42 | 50 | 3 / 2 / 2 with side stack |
| Fraction bar | 48 x 14 | 52 x 16 | 56 x 18 | 2 |
| Decimal grid 10 x 10 (side) | 40 | 40 | 45 | 3 / 3 / 2 |
| Tenths strip | 60 x 12 | 60 x 14 | 70 x 16 | 2 |
| Analog clock: hour, half hour | 36 (floor 26 in half-width panels) | 42 (38 in half-width panels, RP-102) | 50 (38 in half-width panels, RP-102) | 4 / 3 / 3 |
| Analog clock: 5-minute | 36 (floor 30) | 42 (38 in half-width panels, RP-102) | 50 (38 in half-width panels, RP-102) | 4 / 3 / 3 |
| Analog clock: 1-minute | 46 (floor 42) | 50 | 52 | 3 |
| Analog clock: draw the hands | 46 | 50 | 52 | 3 |
| Clock with outer minute ring (Model) | 47 | 55 | 65 | 3 / 3 / 2 |
| Digital clock | 31 x 14 | 40 x 17 | 48 x 19 | 4 / 4 / 3 |
| Generic coins (scale of the RP-111 diameters) | 0.85 | 1.0 | 1.0 | 2 (3 if <= 4 coins at S / M) |
| Ruler | true scale only (RP-160) | | | 1 |
| 2D shape / solid (bounding box) | 30 | 36 | 42 | 5 / 4 / 3 |
| Angle (arm length) | 25 | 30 | 35 | 3 |
| Coordinate grid (cell) | 6 | 7 | 8 | 1-2 |
| Graph (plot area) | 80 x 60 | 90 x 70 | 100 x 80 | 1 (2 at S) |
| Tally box | 24 x 8 | 28 x 10 | 32 x 12 | - |

Required cell height for a visual cell = visual height + optional name label + top inset (3, or label + 1 per CL-40) + 2 + answer zone (Hw + 4) + 3. Maximum columns = `floor(W / (max(visualMinW, answerW) + 6))`, capped at 5.

### 11.3 Ten frame

- **RP-10** 2 x 5 grid, border 1.5 pt, interior 0.75 pt. Horizontal (5 wide) by default and whenever it sits over an equation; vertical (2 wide) when two frames stand side by side.
- **RP-11** Counters are circles at 0.65 of the cell, filled left to right, top row first. Set A solid black, set B hollow 0.75 pt. Counters the pupil must draw are absent in Independent, dotted in the first Guided cell. A moved counter in a Model is shown with a small X on the origin and a dotted arrow (first items only).

### 11.4 Counters and counting pictures

- **RP-20** Two object sets; the teacher picks one per section in the dialog ("Objects: counters / pictures"):
  - **Plain counters** (age-neutral; the default at every Level, P-31): dots, squares, ten-frame counters.
  - **Eight in-house line-art pictures**: star, apple, fish, car, ball, flower, turtle, block. Drawn in-house on one 24 x 24 unit grid, 1.5 pt outline, 0.75 pt interior detail, no fill, no faces, no text.
- **RP-21** One kind of object per cell, in tidy rows of at most 5, left-aligned, equal pitch (item + 3 mm), subitising gap of 1.5 mm extra after the 5th item in a row of 10.
- **RP-22** A dot mat is a rounded rectangle with a vertical 0.75 pt divider. Tally marks are 0.75 pt strokes 6 / 8 / 10 mm tall at 2.5 mm pitch with a diagonal fifth; the tally box is a square-cornered box (it is a writing place).

### 11.5 Base-10 blocks

- **RP-30** **Gridded** (default in Model and charts): unit = u x u square, 0.75 pt outline; rod = u x 10u, vertical, 0.75 pt outline with 0.5 pt segment lines, pitch u + 1; flat = 10u x 10u with 0.5 pt grid; thousand = oblique cube, front face gridded. Loose units are arranged 2 wide x 5 high.
- **RP-31** **Quick-draw** (default where the pupil draws): open square = hundred, vertical stick = ten, open dot = one, all 1.5 pt. A printed key shows the three symbols once per page in the Model or Vocabulary band.
- **RP-32** Blocks inside a labelled place-value chart sit in their own columns; an empty column is left empty to show zero (never a drawn "0 blocks" mark). Order is always largest place at the left.

### 11.6 Place-value chart

- **RP-40** Heavy 1.5 pt outline, 0.75 pt interior, 2-9 columns. Heads row in words when columns are 14 mm or wider, otherwise letters (VA-30). The thousands comma is pre-printed on the column boundary. A decimal chart prints the point on its boundary at working digit size.
- **RP-41** A rounding scaffold prints the target place's head letter in bold with a 1.5 pt divider to its right; nothing marks which way to round.

### 11.7 Number line and hops

- **RP-50** Axis 1.5 pt with solid arrowheads at both ends (one end only when the line starts at 0 and the context is whole numbers). Whole / labelled ticks 5 mm tall at 1.5 pt; part ticks 3 mm tall at 0.75 pt. Labels below the line at zone-label size (working digit size when the number line is itself the problem).
- **RP-51** Tick pitch at least 6 / 7 / 8 mm wherever the pupil marks a tick or draws a hop. Plotted given points are solid dots 2.5 mm across with an item letter above.
- **RP-52** Hops are arcs above the line, 0.75 pt solid when given, dotted when modelled; the hop size sits above the arc. Hops the pupil must draw are absent.
- **RP-53** Vertical number lines and vertical number strips (rounded box, RP-54) are allowed; zero is at the bottom.
- **RP-54** Skip-count strip / number track: rounded box (radius 3 mm, 1.5 pt outline, 0.75 pt dividers between entries), one entry per cell at 8 / 9 / 10.5 mm pitch, numerals 700 at 11 / 13 / 15 pt. Side form: right edge of the page, top-aligned with the grid, width = widest entry + 4 mm (10 / 10 / 12 mm for 2-digit entries, 14 / 14 / 16 for 3-digit), 4 mm gap. Top form: 10 mm tall under the instruction line, fact rows at 7 or more columns only. Fade states: filled, grey, empty (pupil fills), off. A + or − number track holds at most 20 entries: a 0-to-30 track does not fit the grid at any pitch, so above band 20 the track starts at the largest value on the page and stops 19 below it (`design/PAGE_TYPES.md` PT-FPR-3).

### 11.8 Number bond and part-whole

- **RP-60** Whole box above, part boxes below, joined by 0.75 pt lines. Boxes are square-cornered (writing places), side 14 / 16 / 20 mm. The whole box has a 1.5 pt border, parts 0.75 pt. The unknown box is the empty one; it is never dashed (LS-3). Orientation is fixed per section.

### 11.9 Schema diagrams (word problems)

MathQuest's own schema set. The same shapes are used from Level K to Level 6; only number size changes.

| Schema | Drawing |
|---|---|
| Part-whole (combine) | One long "whole" bar over two (or three) part bars of the same total length; each bar holds a box-style slot; label words under each bar at zone-label size |
| Change (join / separate) | Three boxes in a row: start, change, end, joined by solid arrows; the change box has a sign circle on its left edge |
| Compare | Two left-aligned bars, the shorter extended to the longer's length by a **solid difference box** with a hairline (0.75 pt) outline |
| Equal groups | A row of rounded group outlines (max 6 drawn; more are shown as "n groups" with a frame) over the frame `groups x in each = total` |
| Multiplicative compare | A unit bar, and below it a bar made of repeated unit segments |
| Area / perimeter / volume | The labelled rectangle or prism, dimensions on the edges |
| Elapsed time | A timeline: start box, end box, one hop arc with a slot |
| Two-step | The page splits into two columns by a vertical 1.5 pt rule; each column has its own sub-goal label, schema and "Total" slot |

- **RP-70** Bars 10 / 12 / 14 mm tall, 1.5 pt outline; slots inside bars are writing places sized by B(n). The unknown is a solid box or bar with a zone-label `?` in its top-left corner (LS-3); exactly one per diagram. Nothing in a diagram is dashed.
- **RP-71** Diagram part labels are printed (the pupil fills numbers, not words) on v1. On v2 the diagram is absent.
- **RP-72** Diagram proportions are schematic and fixed per schema; bar lengths never encode the actual numbers (that would draw the answer).

### 11.10 Bar model, array, equal groups, area model

- **RP-80** Bar model: as RP-70; a bracket (0.75 pt) spans a total; pupil-drawn bar models get an empty rounded "Draw" box of at least 60 x 30 mm instead.
- **RP-81** Array: open circles 0.6 of pitch, 0.75 pt (solid black option for "count the array"); rows and columns straight, 1.5 mm subitising gap after the 5th row and column in arrays over 5. No row / column numerals unless the task is to read them.
- **RP-82** Equal groups: rounded group outlines, one kind of object, same arrangement in every group.
- **RP-83** Area model: a table with a 1.5 pt outline, a heavy header row and column, `x` in the corner, cells sized as writing places (min B(n) x (Hw + 4)). Proportions are schematic (RP-72).

### 11.11 Fractions and decimals

- **RP-90** Fraction circle: outline 1.5 pt, partitions 0.75 pt, sectors start at 12 o'clock and run clockwise. Fraction bar: outline 1.5 pt, dividers 0.75 pt, shading contiguous from the left. Shaded parts are flat grey (hatch in photocopy-safe mode).
- **RP-91** Fraction cells lay out **side by side**: the printed fraction or the fraction answer stack (12 / 14 / 16 mm wide), a 6 mm gap, then the model. No bottom answer zone.
- **RP-92** Values above 1 are normal, not special: improper fractions and mixed numbers are drawn as a row of whole models with a 3 mm gap, and fraction number lines run **past 1** (0 to 2 or 0 to 3 by default from the step where improper fractions are introduced). Whole ticks are heavy, part ticks hairline (RP-50).
- **RP-93** Shade-it and partition-it items: parts are empty; each part is at least 6 mm at mid-radius or across. Denominator caps: circle 8 / 10 / 12 at S / M / L; bar 8 in 3 columns, 12 in 2 columns. Partition items show guide dots on the circumference (dotted semantics), never the partition lines.
- **RP-94** Decimal grid: 10 x 10, outline 1.5 pt, interior 0.5 pt with 0.75 pt lines every 5; cell at least 4 mm. Tenths strip: 10 parts, each at least 6 mm wide. Decimal number lines label both forms only in the Model.

### 11.12 Clocks

- **RP-100** Analog face: rim circle 1.5 pt at R; inner ring 0.5 pt at 0.90 R; minute ticks 0.90 R to 0.85 R at 0.5 pt; five-minute ticks 0.90 R to 0.80 R at 0.75 pt; numerals 1-12 Andika 700 at 0.12 D (never below zone-label minimum) centred on radius 0.66 R; pivot solid dot radius 1 mm.
- **RP-101** Hands: hour hand 0.46 R, 2.25 pt; minute hand 0.78 R, 1.5 pt; both with round caps and a solid arrow tip. Told apart by length and weight only. Hour-hand angle = 30h + 0.5m degrees (at 12:30 it sits midway between 12 and 1). At 12:00 the minute hand is drawn on top. Hours are written 12, never 0.
- **RP-102** Precision depends on diameter: hour and half hour need D >= 26 mm; 5-minute D >= 30; 1-minute D >= 42; draw-the-hands D >= 46. A panel that cannot give the diameter offers only the coarser items. **Half-width panels** (Daily Spiral sections, Daily 4 cells): a 38 mm clock is allowed at S, M and L, only for read-the-time items to the hour, half hour or 5 minutes. 1-minute reading and draw-the-hands items always take the full table 11.2 minimum (46 / 50 / 52) and therefore a full-width panel.
- **RP-103** Variants: (a) plain face; (b) face ringed by 12 rounded write-in boxes for the minute counts (Model / Guided); (c) outer minute ring 5-55 at 1.14 R, black in Model, grey in Guided, off in Independent; (d) half-shaded face (grey right half) for "half past" models; (e) draw-the-hands face: bold rim, numerals, five-minute ticks, **no hands** (hour hand may be pre-drawn grey in Guided); (f) digital: rounded rectangle 1.5 pt, solid Andika 700 digits, two colon dots, no leading zero, no seven-segment styling.
- **RP-104** The time answer slot is the two-box `__:__` slot (section 6); AM / PM is a words-to-circle choice beside it.

### 11.13 Generic coins and notes

- **RP-110** Coins are **generic**: circles that show only a value. Values 1, 5, 10 and 25 only — and, at the Qatari riyal currency only, 50 (owner ruling Q2, 2026-09-25), drawn the same way at the next RP-111 step, 26.51 mm. No national portraits, buildings, mottoes, edge reeding, dates, or dollar / cent art.
- **RP-111** Coins are sized **by value**, never by a national coinage: diameters 17.5 (1), 19.75 (5), 22.0 (10), 24.26 (25) mm at scale 1.0. The 1 is the smallest and the 25 the largest, each step is 2.25 mm, and a bigger coin is always worth more (owner ruling 2026-09-19; this replaces the US relative sizes, in which the 10 was the smallest coin). Scale is 1.0 at M and L, 0.85 at S, 0.8 in half-width spiral and mixed panels. Coins never go smaller, never overlap, never fan.
- **RP-112** Drawing: outer rim 1.5 pt, inner ring 0.5 pt at 0.88 r (the double ring distinguishes a coin from a counter), value numeral Andika 700 centred, height 0.40 D. White fill.
- **RP-113** Layout: rows, highest value first, 2 mm gaps, each row centred. Independent cells: at most 6 coins per 93 mm cell in up to 2 rows. Model and Guided coin cells are full-width single rows of at most **5** coins, because they carry count-on boxes (a writing box under each coin, Hw + 2 tall) and a running-total zone: five 25s plus gaps is 129.3 mm, leaving 56.7 mm of the 186 mm body, while six would need 155.6 mm and overflow. Six is still allowed in an Independent cell, which has no count-on boxes.
- **RP-114** Optional count-by-fives dots (hint scaffold): solid 1.5 mm dots under the numeral, one per five (5: one dot, 10: two, 25: five); the 1 coin carries a short stroke. Off in Independent by default.
- **RP-115** Generic notes: upright-format rounded rectangles 60 x 26 mm, 1.5 pt outline, 0.5 pt inset border, value in the centre and in two opposite corners. Not true scale relative to coins. Values 1, 5, 10, 20 at Plain numbers; a currency brings its own notes (Qatari riyal 1, 5, 10, 50, 100, 200, 500; US dollar 1, 5, 10, 20, 50, 100), drawn the same generic way (ruling Q1, 2026-09-25).
- **RP-116** A currency sign or currency word appears only in word-problem story text, and then also beside that problem's blank (SL-9). When a money skill's `currency` is not Plain numbers (owner ruling Q3, 2026-09-25) it may also appear as the unit word after an answer blank ("__ dirhams", "__ cents"), before the money slot on the write-the-amount step (`QR [ ].[ ]`, `$[ ].[ ]`), and left of the top number in money columns. Qatari amounts are written QR; paper money is called "notes" in both currencies. It never appears on a coin, a note, a header, a title or an instruction.

### 11.14 Ruler and measurement

- **RP-160** Rulers print at true scale only (PG-6). Inch ruler: numerals under the ticks, tick heights by fraction (1 in 6 mm, 1/2 4.5, 1/4 3.5, 1/8 2.5). Centimetre ruler: cm ticks 5 mm, half 4, mm 2.5. Body 0.75 pt outline, 14 mm tall, zero tick inset 3 mm from the body's end.
- **RP-161** Objects to measure are line art or dotted segments with solid end dots, aligned to the zero tick in Model cells and offset from it only from the step that teaches offset measuring.
- **RP-170** Hands-on measurement pages (unit strips, ruler hunts) may be landscape (PG-5).

### 11.15 Shapes and solids

- **RP-120** A shape to judge or name has a 1.5 pt outline; a shape to shade or partition has a 0.75 pt outline. No fill. Equal-side ticks 0.5 pt; right-angle mark a 3 mm square, 0.5 pt; angle arcs 0.75 pt at radius 8 mm.
- **RP-121** Orientation varies across a section (not every triangle sits on its base) and every "identify" section includes non-examples.
- **RP-122** Solids use oblique projection (depth 0.4 at 30 degrees). Visible edges 1.5 pt; hidden edges 0.5 pt solid (LS-2). Cylinder and cone ellipses use ry = 0.3 rx. Unit-cube stacks show every visible cube edge at 0.75 pt.
- **RP-123** Names are words-to-circle (two choices, stacked on two lines) or label-from-bank. Pupils are not asked to hand-write names longer than 8 letters.

### 11.16 Graphs and data

- **RP-130** Axes 1.5 pt; grid 0.5 pt; tick labels and category labels at zone-label size; axis titles in words at zone-label size 700. Scale labels are printed (pupils never invent a scale except on a construct-a-graph item with pre-labelled axes).
- **RP-131** Bar graph: bars at least 8 mm wide with gaps of at least half a bar. Series 1 grey fill with 1.5 pt outline; series 2 white with 1.5 pt outline; series 3 solid black only if bars are 7 mm wide or less, otherwise hatch 135 is not available in standard mode and the graph is limited to two series. Draw-the-bars items show axes and grid only.
- **RP-132** Pictograph: in-house icons from RP-20, a printed key ("1 picture = 2"), half icons clipped vertically. Line plot: X marks at 0.75 pt, 5 mm, stacked on a number line. Tally table: RP-22. Circle graph: at most 12 sectors, labels outside with leader lines, sectors differentiated by grey / white / labels, never by more than one grey.
- **RP-133** A graph and its questions share one keep-together unit; the graph is never redrawn smaller to make room for more questions.

### 11.17 Hands-on page conventions (later family, specified now)

- **RP-140** **Dashed always means cut.** Cut tiles have a dashed 0.75 pt outline, are at least 25 x 20 mm, carry content at cell-text or working digit size, and sit in one block at the foot of the page under a full-width dashed line with a scissors glyph. Nothing else on the page is dashed (LS-4).
- **RP-141** Paste boxes are square-cornered, 0.75 pt, tile size + 2 mm. Two-bin sorts have two labelled bins with equal numbers of paste boxes. Cut-and-order pages have a numbered row of paste boxes.
- **RP-142** Match with a line: two columns of items with solid 2.5 mm anchor dots facing each other across a clear channel of at least 40 mm; at most 6 pairs per page at L.
- **RP-143** Find-and-color: a rounded count badge near the instruction states how many to find ("Find 8"); targets are at least 12 mm; the pupil uses one crayon color, so nothing depends on which color.
- **RP-144** Layered place-value strips: strips of graded length (ones shortest), right-aligned when stacked, each with a grey left tab for stapling. **Exception to the working-digit-size rule (section 3.2, TY-10, RP-140):** poster-size digits are allowed on cut-and-layer strips, and nowhere else: 63 pt, one digit per 40 mm unit track (geometry in `design/PAGE_TYPES.md` 8.6).
- **RP-145** Flashcards: 3 x 3 rounded cards per page (9), dashed cut lines between cards, fact centred at 28 pt, optional cue version (SF-30) as a separate page; backs are blank (single-sided).
- **RP-146** Cut lines never cross a cell's content, and a hands-on page is always printed single-sided (dialog note).

---

## 12. Density and capacity

### 12.1 Ceilings by page role

Items per page. "By table" means the computed capacity in 12.3. A ceiling is never exceeded; a smaller count is always allowed.

| Page role | S | M | L | Notes |
|---|---|---|---|---|
| Lesson opener | 2 Model + 4 Guided | 1-2 + 3 | 1-2 + 2-3 | Plus bands; K one-pager: 2 Model / 2 Guided / 2 alone |
| Scripted model | 1 problem, 3-6 frames | same | same | Second example only with identical wording |
| Guided page | 8 | 6 | 3-6 | Steps strip stays visible |
| Independent / More Practice | 6 (up to 16 for one-symbol answers, using the 2 x 5 and 2 x 8 grids) | 6 (one-symbol answers: as S) | 6 (one-symbol answers: as S); 4 for long procedures | 2 x 3 default |
| Wide-visual rows | 5 | 4 | 3 | Number lines, base-10 over 100, coin rows |
| Sub-skill / decision | 12 | 8 | 6-8 | No answer computed |
| Error analysis | 6 | 4 | 2-4 | About half the given answers wrong |
| Review | 16 | 12 | 8-12 | 2-3 instruction-led sections |
| Test A / B | 20 | 16 | 12; procedures 4 | Open array |
| Pre-skill check | 4 boxed mini-sections, up to 24 | up to 20 | up to 16 | |
| Computation grid (Daily) | 9-16 | 9 | 9 (6 with regroup scaffolds) | By table |
| Long division | by table | by table | 4 | |
| Equation drill | 36 | 30 | 14-21 | By fit function; with the think box on, one row fewer (SF-40) |
| Fact rows | by ladder table | | | 25-90 |
| Fact probe | 20 (15 vertical + 5 horizontal) | 20 | 20 | A division probe with the think box on drops one row: 18 (SF-40). 8-10 columns fill the page: 56 / 72 / 80 facts at L (same rows as fact rows, 12.3) |
| Fact-family probe | 40 | 40 | 40 (2 pages) | |
| Practice strips, 2-up | 2 x 10 | 2 x 10 | 2 x 10 | Dashed cut line between strips |
| Daily spiral | spread 28 responses; compact 20 | same | spread only | Compact one-page form at S and M only |
| Mixed practice | 9 rows | 7 rows | 5 rows | Unit-packed |
| Daily 4 | 5 days x 4 | 5 days x 4, or 3 + 2 | 3 + 2 days over two sides | DN-30 |
| True or False? | 8 | 6 | 4 | Check box + sentence frame each |
| Reason It | 4 | 3 | 2 | One reasoning type per page |
| Stretch | 2 | 1-2 | 1 | Results table is the entry scaffold |
| Word problem v1 (scaffolded) | 1 | 1 | 1 | |
| Word problem v2 (faded) | 2 | 2 | 2 | |
| K picture word problem | 2 | 2 | 1-2 | Frame `__ O __ = __` |
| Word problems, plain rows | 4 | 3 | 3 (2 if 4-5 lines) | |
| Today's Number | 5-6 tasks per side | same | same | Two-sided |
| Flashcards | 9 | 9 | 9 | |

- **DN-1** Reference densities above about 40 responses per page were judged too dense for these pupils; outside fact layouts no page exceeds 20 scored responses at L.
- **DN-2** Every cell passes CL-5 (40% free) at every capacity in this section.

### 12.2 The column x size rule

**One rule: Size fixes the writing space and the top digit size. Columns may move digits only along the section type's ladder. Past the ladder floor, the column count clamps. Content never shrinks.**

- **DN-10** S / M / L always sets writing height Hw, blank width B, label size, text sizes, minimum visual sizes and the top digit size (16 / 22 / 28). None of these ever changes with column count.
- **DN-11** Ladders:

| Section type | Ladder |
|---|---|
| Vertical facts; numeral trace rows | Column-keyed ladder (TY-30), independent of size. Columns win |
| Horizontal equations | L: 28, 24, 22 pt. M: 22, 20, 18, 16 pt. S: 16 pt |
| Everything else | The preset size only. Size wins; columns clamp |

- **DN-12** The dialog keeps **Auto, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10**. The teacher's stored choice is never overwritten; the effective value is derived on every render.
- **DN-13** Explicit N is honoured if the section's widest problem fits at some ladder step (fit tests: VA-6 for stacked work, DN-22 for equations, `max(visual, answer) + 6 mm` for visuals). Otherwise N clamps to the largest count that fits at the ladder floor.
- **DN-14** Clamp and step-down notes appear **in the dialog and the preview only**, as persistent text beside the Columns control. Nothing about a clamp is ever printed on a pupil sheet, a footer or an answer key. Three templates:
  - Clamp: "3-digit problems, size M: max 4 columns. Showing 4. Size S fits 6."
  - Step-down: "10 columns: digits 16 pt (size L is 28 pt). Writing space stays 10 mm."
  - Forced: "Word problems print in 1 column." / "Charts use the full page." / "Mixed sheets use even columns. Using 4." / "Max 4 columns for horizontal facts. Use fact rows for 5-10."
- **DN-15** Auto = the largest N, up to the page type's auto cap, that keeps the top ladder step with column fill of 92% or less and at least 6 mm slack on stacked work. Auto never returns 1 when 2 or more fit.

| Page type | Auto columns | Hard cap |
|---|---|---|
| Fact rows | 10 / 6 / 5 | 10; 8 when answers exceed 99; 8 for basic bracket division; 6 for wide division |
| Fact probe | 5 | 5-10 (a choice of 1-4 becomes 5); division probes 2-3 |
| Computation grid | 3 Daily, 2 I Can | 6 |
| Long division | by table | 6, min cell width 30 mm |
| Equation drill | 3 (2 for L basic and missing-number; 1 for L 3-digit) | 5 by fit |
| Lesson cells | 4 / 3 / 3 | stacked 6; visuals 4 |
| Visual grid | table maximum; clocks 4 x 4, 3 x 3, 2 x 3 | 5 |
| Mixed practice | I Can 10 / 8 / 6 units; Daily 8 / 6 / 4 | N in {1, 2, 3, 4, 6, 8, 10}; odd N only when every skill is 1 x 1 |
| Word problems | 1 | 1 (2 per page in v2 means rows, not columns) |
| Daily spiral | fixed panels | fixed |

- **DN-16** Fact sections must look good at every count from 5 to 10: TY-31 (fill 55-75%, rule gap >= 6 mm) is checked at each N in the mock-up pack and the lint suite.

### 12.3 Capacity tables (A4, full header, one section)

Letter and header-off capacities are produced by the same formulas with the paper's gridH; the layout unit tests hold the generated tables. Figures are S / M / L.

**Fact rows (vertical)**

| Columns | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|
| Rows | 6 / 6 / 5 | 6 / 6 / 6 | 7 / 7 / 6 | 8 / 8 / 7 | 9 / 8 / 8 | 9 / 8 / 8 |
| Facts per page | 30 / 30 / 25 | 36 / 36 / 36 | 49 / 49 / 42 | 64 / 64 / 56 | 81 / 72 / 72 | 90 / 80 / 80 |
| Day bands per page (3 rows each) at M | 1 | 2 | 2 | 2 | 2 | 2 |

Day-band height = strip (7 / 8 / 10) + 3 x cell height, 3 mm between bands. At L and 6 columns use 1 band per page or 2 rows per band. Horizontal facts at 4 columns: 60 / 56 / 44.

**Stacked arithmetic: maximum columns** = largest c <= 6 with `c x (T x track + separators x 0.3 em + 2 x sidePad) + (c + 1) x border <= W`.

| T | I Can S | I Can M | I Can L | Daily S | Daily M | Daily L |
|---|---|---|---|---|---|---|
| 3 (2-digit) | 6 | 6 | 5 | 6 | 5 | 4 |
| 4 (3-digit) | 6 | 5 | 4 | 6 | 4 | 3 |
| 5 (4-digit; 2 x 2-digit) | 6 | 4 | 3 | 5 | 3 | 3 |
| 6 (5-digit; 3 x 2) | 5 | 4 | 3 | 4 | 3 | 2 |
| 7 (6-digit; 4 x 2; 3 x 3) | 5 | 3 | 2 | 4 | 2 | 2 |
| 8 | 4 | 3 | 2 | 3 | 2 | 2 |

With any regroup scaffold, use the Daily columns of this table for both looks (TY-21).

**Stacked arithmetic: rows and items** (plain add / subtract; target rows by columns {1: 4, 2: 3, 3: 3, 4: 4, 5: 5, 6: 6})

| Columns | Cell w (mm) | Rows S / M / L | Cell h (mm) | Items |
|---|---|---|---|---|
| 1 | 186 (stack in left 62) | 4 / 4 / 4 | 57 | 4 |
| 2 | 93 | 3 / 3 / 3 | 76 | 6 |
| 3 | 62 | 3 / 3 / 3 | 76 | 9 |
| 4 | 46.5 | 4 / 4 / 4 | 57 | 16 |
| 5 | 37.2 | 5 / 5 / 4 | 45.6 / 45.6 / 57 | 25 / 25 / 20 |
| 6 | 31 | 6 / 5 / - | 38 / 45.6 / - | 36 / 30 / - |

Multiply by 2-digit at 3 columns: 12 / 9 / 9. Regroup scaffolds on at 3 columns: 15 / 12 / 9.

**Long division (maximum / Auto)**

| Problem | S | M | L |
|---|---|---|---|
| 2-digit by 1-digit | 20 / 16 | 12 / 9 | 9 / 9 |
| 3 by 1 | 12 / 12 | 9 / 9 | 6 / 4 |
| 4 by 1 | 12 / 9 | 6 / 6 | 4 / 4 |
| 3 by 2 | 12 / 12 | 9 / 6 | 6 / 6 |
| 4 by 2 | 9 / 9 | 6 / 6 | 4 / 4 |

**Visual grid (items per page)**

| Visual | S | M | L |
|---|---|---|---|
| Clock, read | 16 | 9 | 9 (Auto 6) |
| Clock, draw hands | 9 | 9 | 9 |
| Fraction circle, side stack | 12 | 8 | 6 |
| Fraction bar | 8 | 8 | 8 |
| Coins, Independent / Model-Guided | 6 / 3 | 6 / 3 | 6 / 3 |
| Shapes with name choice | 20 | 12 | 9 |
| Ten frame, single / double | 16 / 16 | 12 / 9 | 12 / 9 |
| Array up to 5 x 5 | 16 | 12 | 9 |
| Base-10 to 99 / 100-299 / 300+ | 16 / 6 / 3 | 12 / 4 / 3 | 9 / 4 / 2 |
| K count (side layout) / count 11-20 | 14 / 7 | 12 / 6 | 10 / 5 |
| Number bonds | 12 | 9 | 9 |
| Numeral trace rows at 5-10 columns | 6 / 7 / 8 / 9 / 10 / 12 rows | | |
| Hundred chart | 1 chart + a 40 mm band | | |

- **DN-20** `resolveSectionLayout(section, problems, paper, availableWidth)` is the single pure function that returns `{cols, clamped, reason, digitPt, trackMm, cellW, cellH, rows, perPage, pages}`. The dialog note, the preview thumbnail and the printer all call it, so they cannot disagree. Its unit tests assert every figure in 12.3.
- **DN-21** The dialog's "Fits:" line reports columns, digit size, items per page and page count from that function.
- **DN-22** Horizontal equation fit: `eqW x em + B + leftInset + 3 <= cellW`, where eqW is 3.16 em (basic fact `7 x 3 =`), 3.74 em (2-digit by 1-digit), 4.32 em (missing number; 2-digit operands), 5.48 em (3-digit); leftInset = label side + 2. Row pitch: answer beside 12 / 14 / 18 mm; answer stacked below 14 / 17 / 20; think box above 20 / 24 / 30. With the think box on, the section prints one row fewer than that pitch allows and shares the freed height among its rows (SF-40).

### 12.4 Page types with their own packing

- **DN-30** Daily 4: a page is a stack of Day bands, each with four equal boxes across (46.5 mm). Days per page = `min(5, floor((gridH + 3) / (strip + hMin + 3)))` where hMin is the tallest item footprint of the week. If fewer than 5 fit, the week prints 3 + 2 over two sides. The four retrieval sources are always named in the teacher footer (P-RV-21). A dialog option "Source captions" (default off) also prints them once per page as column heads at zone-label size above the first band, never inside the boxes.
- **DN-31** Mixed practice packs by units: each skill declares a footprint in grid units per look and size (`design/SKILL_CELL_CONTRACT.md`); grouped is the default, shuffled is an option; a Daily L 3-digit stack spans 2 units at 4 columns.
- **DN-32** Daily spiral: fixed panel positions every day; two-page spread by default; compact one-page form only at S and M; never offered at L. Panel titles per BD-6.
- **DN-33** Today's Number: its own two-sided daily sheet; number ranges to 20 / 120 / 1,000 / 10,000 and over; versions A-D per range; identical layout every day, only the number changes; side 2 holds the chart task for ranges to 120.
- **DN-34** Problem mix per section is teacher-selectable: **one problem type + one notation**, or **deliberately mixed** (ratio chips). A single-type section never silently mixes notations, orientations or unknown positions.

---

## 13. Scaffold visuals and the hint-versus-structural fade

### 13.1 Two classes

| Class | Definition | Fades? | `data-ws-scaffold` |
|---|---|---|---|
| **Hint** | Tells the pupil what to do or what the answer looks like | Yes: Model (black) -> Guided (grey) -> first cell only -> gone | `hint` |
| **Structural** | Gives the pupil a place to work; removes alignment and organisation load | No: persists through Independent, Review and (by option) Test | `structural` |

| Hint scaffolds | Structural scaffolds |
|---|---|
| Trace / model digits; traced first cell | Digit tracks and the fixed T per section |
| Dot tile, dots on the numeral, dotted "circle the bigger number" ring (+ and − facts); array tile (× and ÷ facts) | Carry boxes; subtraction headroom row; partial-product rows with pre-printed `+` |
| Steps band; step numerals; self-talk | Division work rows with pre-printed `−`; R box |
| Full place-value words beside the first Model stack (VA-31) | Place-value heads H T O (removed only by a dedicated fade step); tally box |
| Caption arrows; dotted move arrows; legend | Equation frames; sentence frames |
| Grey placeholder zeros; grey answer-row decimal point; grey trailing zeros | Unit word after a blank |
| Filled skip-count / multiples strip; number line "if needed" | Work grid; Workspace band |
| Outer minute ring; pre-drawn hour hand; count-by-fives dots; count-on boxes | Answer-slot shapes (section 6) |
| Schema diagram part labels; decision check box wording; keyword panel | Schema diagram outline on v1 |
| Word bank (Guided only); think box (when checked on, it prints in every cell of its section) | Estimation box; chart and table rulings |
| Pictures beside symbols (bridging step) | |

- **SF-1** Four scaffold levels, matching `scaffoldLevel` in the cell contract:

| Level | Name | What prints |
|---|---|---|
| 3 | Model | All hints in black + structural; traced worked answer in grey |
| 2 | Guided | Hints in grey + structural; answers blank |
| 1 | Independent | Structural only; a cue may remain on the **first cell only** |
| 0 | Test | No hints. Structural scaffolds stay while "Keep structural supports on tests" is checked (default on); unchecked, the cell is bare: problem and answer slot only |

- **SF-2** Fade is monotone within a lesson packet: a later page never shows more hint than an earlier one. A hint that has been dropped returns only in the screen hint ladder (SP-40) or on a new lesson's opener.
- **SF-3** Hints and timing are **options, not policy**. Print-dialog check boxes (all remembered): "Hints on tests" (default off), "Keep structural supports on tests" (default on), "(1 minute)" tag, "Time line", "Goal". These mirror the timed activities the app already has. No page type forbids or forces them.
- **SF-4** Hint text never sits inside a cell's answer zone; a cue occupies the problem zone or a side strip.

### 13.2 Trace and model marks

- **SF-10** Trace digits use the working digit face and size in flat grey (dotted-outline in photocopy-safe mode). The same style serves a modelled carried digit, an appended zero and a modelled check mark or ring.
- **SF-11** A Model band holds one traced item and one blank item to work live. A traced item is unlabelled and unscored (CL-14).
- **SF-12** First-cell cues (a caption arrow, a dotted ring) appear on the first cell or first band only, then drop.

### 13.3 Fact strategy cue and its four-part fade

```
  Part 1              Part 2            Part 3           Part 4
   (.8.)  +---+        (.8.)               8             mixed and cumulative,
  + 3     |. .|       + 3               + 3              no cue
  -----   | . |       -----             -----
          +---+
  dotted ring on the bigger number (first cell only; pupil circles the rest)
  dot tile beside the smaller numeral
```

- **SF-30** **Addition and subtraction facts only.** Two cue styles, both available; dialog option "Fact cue: dot tile / dots on numeral / off". Neither is ever offered for multiplication or division (SF-33):
  - **Dot tile (default)**: a rounded square beside the **smaller** numeral, side max(6 mm, 0.62 em), 0.75 pt outline, solid dots in dice patterns for 1-6 and two-row ten-frame patterns for 7-9, dot diameter 0.16 of the side. Placed to the right of the smaller operand, inside the column gap. Available at 7 columns or fewer (the tile needs 6 mm plus 2 mm clearance).
  - **Dots on the numeral (toggle)**: MathQuest's own dot positions drawn on the strokes of the smaller numeral, solid, diameter 0.09 em, one per unit for 1-5 and ringed double-count dots for 6-9. Available at 24 pt and over (6 columns or fewer).
- **SF-31** Four-part fade for + and − facts, with identical item order across parts: **Part 1** tile (or dots) + circle the bigger number; **Part 2** circle only; **Part 3** no cue; **Part 4** mixed and cumulative facts, no cue. The set is one constant (0 to 13) chosen in the dialog and named in the title, and the band caps the sum or the minuend independently of it (P-FL-20); the tile is drawn for the other operand, whose size the band controls. The part is chosen in the dialog and named in the teacher footer only (P-FL-14); tab line 3 carries the probe id and form ("Probe ×3 A").
- **SF-32** The cue marks the smaller number only. The ring is drawn by the pupil; only the first cell of Part 1 and Part 2 shows a dotted model ring.
- **SF-33** **Multiplication and division facts**: the teacher chooses the cue per print; dialog option "× ÷ fact cue: skip-count strip / array tile / none", default **skip-count strip** (owner ruling 2026-09-19).
  - **Skip-count side strip (default)**: the rounded support strip at the side of the grid listing k, 2k ... 12k (to 10k when the fact range is limited to 10), anchored to the grid top; the grid narrows to 186 - (strip width + 4 mm gap) (section 2.3).
  - **Array tile**: a rounded tile (a number object, section 5) with a 0.75 pt outline in the dot tile's slot beside the fact, showing the fact as an array of solid dots: the set's constant in each row, one row per count, with the 1.5 mm subitising gap after the 5th row and column (RP-81). Dot pitch is never under 1.5 mm and dot diameter is 0.6 of the pitch. Offered only at **5 columns or fewer**; when any fact of the set cannot be drawn at the minimum pitch inside its slot, the dialog disables the tile with its reason and the strip stands.
  - **None**: no cue.
- **SF-34** × ÷ fade ladder, identical item order across parts: **Part 1** strip (black); **Part 2** grey strip (grey 1 pt outline, grey numerals; dotted outline and dotted-outline numerals when photocopy-safe); **Part 3** none; **Part 4** mixed and cumulative facts, no cue. With the array tile chosen, Part 1 prints the tile black and Part 2 prints it grey. The grid keeps its narrowed width in Parts 2 and 3 of a strip ladder, and the tile slot stays reserved, so no digit moves between parts.

### 13.4 Think box and other helper boxes

```
   +-------------------------+
   |     __  x  __  =  __    |   think box: rounded, grey 1 pt, grey "x"; optional, default off
   +-------------------------+
     12 ÷ 3 = ________          the black line is the only place an answer goes
```

- **SF-40** Think box above division facts: optional helper, **off by default**. Rounded corners, grey 1 pt outline, at least 24 mm wide x (Hw + 4) tall, grey `x` at its centre (full related-fact frame in the Model, where it is shown filled in grey). It is never scored and never holds the answer (LS-6, SL-8). The black answer line after `=` is the only answer place. **When the option is on, the page drops one row**: rows = floor(gridH / think-box pitch) - 1, and the freed height is shared equally among the remaining rows, below the answer line (PG-14), so the fact stays in the top half of its cell and CL-4 is never broken (owner ruling 2026-09-19). Row counts this implies: an equation drill with the think box prints 10 / 8 / 6 rows, not 11 / 9 / 7; a horizontal division probe prints 3 x 6 = 18 facts with Score /18, not 3 x 7.
- **SF-41** Estimation box, "Draw" box, and "Work here" boxes follow the same styling: rounded, labelled at zone-label size in the top-left, never an answer place.
- **SF-42** Vocabulary box: rounded, 1.5 pt, at most 3 terms; each term bold at cell-text size with a labelled mini-diagram at least 20 mm wide. The full place-value words live here (VA-31).

### 13.5 Word-problem scaffolds

```
v1: one per page, fully scaffolded
+======================================================================+
| (  Sam has 12 stickers.                                            ) |  rounded story box,
| (  Sam gives 5 stickers to Ana.                                    ) |  one sentence per line,
| (  How many stickers does Sam have now?      ________ stickers     ) |  unit word pre-printed
|----------------------------------------------------------------------|
|  [ start ] --( )--> [ change ] ------> [ ? end ]                     |  schema diagram to fill
|----------------------------------------------------------------------|
|  [ ] The start and the change are given, so I ...                    |  first-person decision
|  [ ] The end and the change are given, so I ...                      |  check boxes (structure)
|----------------------------------------------------------------------|
|  __ ( ) __ = __          or          work grid (0.95 em tracks)      |  equation frame / grid
+======================================================================+
```

- **SF-50** Schema-based (default). **v1**: one problem per page; rounded story box (1.5 pt, radius 3 mm), one sentence per line, at most 4 lines with the question last, relational phrase underlined, answer blank with its pre-printed unit word inside the story box; schema diagram to fill (RP-70); first-person decision check boxes whose wording ties structure to operation (strings from `PEDAGOGY_STANDARD.md`); then an equation frame (Levels K-2) or a work grid of 0.95 em tracks, 5 x 5 at minimum.
- **SF-51** **v2**: two per page, faded: story box and blanks only (number blank + label blank, `unit-open` slot); no diagram, no check boxes; numbered continuously.
- **SF-52** **K picture version**: in-house pictures (RP-20), the frame `__ O __ = __`, a sign circle, at most 2 per page; the bottom line is an oral prompt at cell-text size.
- **SF-53** **Keyword-checklist panel (option)**: a right-hand panel one third of the body width holding the six fixed check box steps of `PEDAGOGY_STANDARD.md` section 8.5 (P-WP-14); the story box and work area take the remaining two thirds. Same story box, same slots. It replaces the v1 schema block and is never shown together with it, so a keyword-panel page holds **one problem per page**; the two-per-page form (v2) never carries the panel.
- **SF-54** All stories are original, in neutral contexts, with a controlled vocabulary, line length at most 60 characters. No brand names, no national currency unless the teacher's chosen story set uses one (RP-116).

### 13.6 Thinking pages (visual rules only)

- **SF-60** True or False?: statement at working digit size in the problem zone; two labelled checkboxes ("True", "False") in the fixed response position; below, a sentence frame with one or two number slots. No free-writing lines.
- **SF-61** Reason It: one reasoning type per page (spot the mistake, odd one out, always / sometimes / never, which is correct). A worked item shown for judging is set in black at working size inside a square-cornered "work sample" frame, 0.75 pt; responses are checkboxes, words to circle and one-slot sentence frames.
- **SF-62** Stretch: the problem statement in a rounded box; a results table (square-cornered, first row traced in grey) as the entry scaffold; at least three empty rows, because several answers are expected.
- **SF-63** Error analysis: given answers print in black in the answer position inside the work sample frame; the pupil's decision is a checkbox pair; the "fix it" area is an open answer zone of at least Hw + 4 beneath.

---

## 14. Answer key = facsimile

- **AK-1** Every generated page has an answer key, and the key is a **facsimile**: the same page, same paper, same cells, same labels, same geometry, with answers overlaid in the pupil's answer slots. A teacher marks by position.
- **AK-2** Answers are Andika **700**, black, at the slot's working size, placed exactly where a pupil would write. Working is shown where the page teaches it: regroup digits in carry boxes (on EVERY key - practice, mixed, independent - over VA-13's scratch rule, owner ruling 2026-09-25), partial products, division work rows, quotient and remainder, hands drawn on clocks, shaded parts shaded, plotted points plotted, rings and check marks drawn at 1.5 pt.
- **AK-3** The key is marked in three places: tab line 3 reads "Answer Key"; the Name field is replaced by the bold words "Answer Key"; the footer right reads "Key · Form A · seed". No color is used (there is none).
- **AK-4** The key is generated from the same seed and the same layout result as the pupil page. Slot count on the key equals slot count on the pupil page; label sequence and Score denominator are identical.
- **AK-5** Dialog option "Key size": full size (default) or reduced 2-up (two keys per landscape sheet, rendered from the size-S layout of the same items, same cell order; never produced by scaling the page down, PG-20). No other reduction is offered. Reduced keys are teacher-facing and exempt from TY-11 but not from the ink and line rules; minimum text 7 pt.
- **AK-6** Open-response pages (Stretch, draw-a-model, explain) print "Answers vary" plus one sample response in the facsimile position.
- **AK-7** An answer key never appears on the same sheet side as pupil work unless "own page" is unchecked, in which case it starts on a new page after the last pupil page.

---

## 15. Screen parity

### 15.1 What must match

- **SP-1** The on-screen question region is the same cell: same template, same SVG builders, same Andika, same ink rules, same line-style semantics, same slot shapes, same label style, problem in the top half, response pinned in the same place.
- **SP-2** Inside `.ws-cell` everything is `--ws-ink` on `--ws-paper` with square corners, **in light and dark theme alike**. The `.mq-mono` scope applies to every visual host listed in SC-1.
- **SP-3** Parity of task: the screen never converts a production item into multiple choice unless the paper item is a choice. Each print response mode has one screen twin (`design/PROBLEM_TYPES.md`).
- **SP-4** The instruction string is the print string with only its action wording swapped per the fixed map (BD-11).

### 15.2 What may differ

| Aspect | Print | Screen |
|---|---|---|
| Blanks | Ruled line / box | `<input data-slot>` with a bottom border (line) or full border (box); `inputmode="numeric"` for numbers |
| Track width | 0.72 / 0.95 em | `max(0.95 em, 44 px)` in both looks |
| Stroke mapping | pt | 0.5 and 0.75 pt -> 1 px; 1 pt -> 1.5 px; 1.5 pt -> 2 px; 2.25 pt -> 3 px |
| Cell border | 0.75 / 1.5 pt | 1 px I Can, 2 px Daily; sum rule 2 px |
| Digit size | 16 / 22 / 28 pt | Single-question card: 40 / 48 / 56 px at 375 / 768 / 1440; online worksheet grid: 29 px |
| Paging | Pages | Scroll; Day bands become "Day 1 ... Day 5" tabs, one open at a time |
| Chrome | None | Progress, XP, streak, skill pill, Hint (left) and Check (right) below the cell or in a sticky bar; all in color, all outside the cell |
| Pad | 3 mm | 12 px |

- **SP-10** Minimum touch target 44 x 44 px for every input, option, check box, part-to-shade and box-to-tap; digit inputs are at least 48 px tall. The only exception is a 10-column chart on a phone: 34.5 x 44 px.
- **SP-11** Phones (under 400 px): one **focus cell** at a time. A cell with T of 7 or more runs edge to edge (353 px inner width) to hold 44 px tracks. T of 9 or more is not offered on phones. A sheet whose tracks would fall under 44 px renders as a read-only overview, and a tap opens the focus cell. There is never horizontal scrolling.
- **SP-12** Layout widths: card paper width 327 / 640 / 720 px (capped) at 375 / 768 / 1440. Online worksheet columns: facts 2 / 4 / min(print columns, 7); 3-digit stacks 1 / 2 / 4; equations 1 / 3 / 5.
- **SP-13** Shade-the-part targets: a bar is at least 56 px tall on phones and the denominator is capped at 7 at 375 px, otherwise the bar renders in two rows.

### 15.3 Entry and keyboard

- **SP-20** Entry order follows the algorithm: add / subtract / multiply fill right to left (initial focus on the ones box; typing moves focus one track left; Backspace in an empty box moves right); partial-product rows fill right to left, top to bottom; quotients fill left to right.
- **SP-21** A stacked problem is one tab stop with a roving tabindex: arrow keys move within the grid, Tab leaves to Check, Enter runs Check.
- **SP-22** Inputs take one character per digit box (`maxlength=1`, `font: inherit`). The caret may be hidden only because the focus ring (AX-6) is always visible.
- **SP-23** Regroup boxes are reachable by tap or the Up arrow, are never auto-focused, never block submission, and are **never marked** right or wrong.

### 15.4 Feedback

- **SP-30** Feedback is chrome and keeps its color. It is drawn outside the ink: a 16 px check mark or cross badge on the outside bottom-right corner of each digit box or slot, plus a colored 2 px outline. The badge shape (check mark / cross) carries the meaning; color only reinforces it. Feedback elements carry `data-ws-feedback` and are excluded from INK-1.
- **SP-31** **Live** check mark / cross per digit in Model and Guided items. **On Check** in independent, probe, review and test items. Day-band fact runs check per band, so a fluency run is not interrupted.
- **SP-32** Wrong digits **stay visible**. On retry, focus moves to the right-most wrong box and selects its content; nothing is cleared automatically. After a wrong Check outside test mode the pupil may try again, ask for a hint or open the facsimile answer (P-ON-14); in test mode answers appear only after the whole set is checked (P-ON-15).
- **SP-33** Correct / incorrect tints apply to the chrome frame as a ring and to the banner, never to the cell background: the paper stays white.
- **SP-34** Layout never leaks the answer on screen either: the number of digit inputs equals the section's T, the R box shows for every item in a remainders set, and a zero remainder is typed like any other.

### 15.5 Hint ladder

- **SP-40** The Hint button follows the on-screen hint ladder of `PEDAGOGY_STANDARD.md` section 11.2 (P-ON-7): the first press shows and speaks the next step's sentence; the second press also draws that step's working marks in grey in the cell. A hint never fills an answer slot (P-ON-8). After two wrong Checks on one item "Show me" is offered. Hint is disabled in test mode unless "Hints on tests" is checked.

---

## 16. Accessibility

- **AX-1** Contrast: all text and lines a pupil needs are `#000` on `#FFF` (21:1). The grey (`#949494`, 3.0:1) is used only for large-scale trace digits, fills and faded scaffolds, never for text needed to act (INK-3).
- **AX-2** No information by color or by grey level alone (INK-6). Every distinction has a shape, weight, fill-versus-outline or position cue.
- **AX-3** Type: Andika only; minimum sizes per TY-11; left-aligned ragged-right text; no justification; no italics; no all-caps; line length at most 60 characters; one sentence per line in stories; line-height 1.3.
- **AX-4** Predictable routine: Name top-left, Score top-right of the field row, label top-left of the cell, problem in the top half, response in the same place in every cell of a section, identical instruction wording on reuse. A pupil who has learned one page can use the next.
- **AX-5** Motor: writing height 6 / 8 / 10 mm, default L; no answer line under 14 mm; regroup boxes at least 4.4 mm wide and only where they can be written in; parts to shade at least 6 mm; cut tiles at least 25 x 20 mm; touch targets at least 44 px.
- **AX-6** Focus: a 3 px focus ring at 2 px offset, drawn outside the ink in a chrome color with at least 3:1 contrast against the page background, always visible.
- **AX-7** Screen readers: each input has an `aria-label` naming its place, not its value ("answer, tens digit"; "numerator"); each SVG visual has `role="img"` and an `aria-label` that describes the given information without stating the answer ("clock face" not "clock showing 7:30" when reading the time is the task); decorative strokes are `aria-hidden`.
- **AX-8** Read-aloud: instruction, story and steps strings are plain text nodes available to text-to-speech; numbers in stacked work are exposed as whole numbers, not digit by digit.
- **AX-9** Reduced motion: feedback badges and hints appear without animation when `prefers-reduced-motion` is set. Cells themselves never animate.
- **AX-10** Zoom and reflow: the card remains usable at 200% zoom with no horizontal scroll at 375 px; print preview is exempt (it is a scaled facsimile).
- **AX-11** Language load: pupils never compose sentences; responses are numbers, signs, check marks, rings, labels from a bank or sentence-frame slots. At most 3 vocabulary terms per step. Age-neutral art (RP-20) so an older pupil working at a low Level is not given infant imagery.
- **AX-12** Pupil pages never show a grade (SC-5), so a pupil cannot read their placement from the sheet.

---

## 17. Appendix: rule id to lint or manual check

### 17.1 DOM hooks the lints rely on

| Attribute | On | Values |
|---|---|---|
| `data-ws-page` | page root (`.sheet-page`) | page index |
| `data-ws-paper` | page root | `a4`, `letter` |
| `data-ws-look` | page root | `ican`, `daily` |
| `data-ws-size` | page root | `S`, `M`, `L` |
| `data-ws-role` | page root | page-type key |
| `data-ws-mode` | sheet root | `print`, `screen`, `key` |
| `data-ws-cell` | each cell | cell template key |
| `data-ws-state` | each cell | `blank`, `traced`, `answered`, `wrong` |
| `data-ws-label` | label element | `letter`, `tab`, `model`, `none` |
| `data-ws-slot` | each answer slot | the slot id from the cell contract (`ans-0`, `regroup-1`, `sign`) |
| `data-ws-shape` | each answer slot | section 6 shape keys (`design/SKILL_CELL_CONTRACT.md` section 2.6 owns the list) |
| `data-ws-answer-type` | each cell | question answer type |
| `data-ws-band` | each band | band vocabulary key |
| `data-ws-scaffold` | each scaffold element | `hint`, `structural` |
| `data-ws-level` | each cell | `3`, `2`, `1`, `0` |
| `data-ws-instruction` | instruction line | library string id |
| `data-ws-teacher` | footer | - |
| `data-ws-feedback` | screen feedback elements | - |
| `data-ws-cut` | every dashed cut line, tile outline and card outline | - |

### 17.2 Automated lints

| Lint | What it checks | Rules covered |
|---|---|---|
| **L-INK** | Every computed color / fill / stroke / background inside a sheet root is ink, paper or grey (none grey when photocopy-safe); no gradient, shadow, opacity, filter; stroke widths in the closed set; grey strokes 1 pt; solid fills over 7 mm flagged; dashed strokes only on `data-ws-cut` elements (long dash) and on `data-ws-shape="box-unknown"` slots (short dash); `data-ws-feedback` excluded | SC-7, INK-1, INK-2, INK-3, INK-4, INK-5, INK-10, INK-11, INK-12, INK-20, INK-21, INK-22, LS-1, LS-3, LS-4, LS-8, SP-2, SP-33 |
| **L-EMOJI** | No emoji or pictographic code points in text nodes or SVG text; operators are the true glyphs | INK-7, TY-6, RP-7 |
| **L-FONT** | Computed family resolves to Andika and the face is loaded from the self-hosted `css/fonts/` files (no Google Fonts request); `font-feature-settings: "cv04" 1` on digit nodes and no other `cvNN` feature (TY-4); weights only 400 / 700; no italic; `font-synthesis: none`; tabular lining figures on digit nodes; no letter-spacing on digits; specimen digit widths equal | TY-1, TY-2, TY-3, TY-4, TY-5, TY-7 (no slash between digits in text nodes), TY-13, TY-20, TY-40 (a, f, g) |
| **L-SIZE** | Type size per role matches the table for the page's size; fact digit size matches the ladder for the column count; size order holds; no pupil text under the floor; Hw measured on slots equals 6 / 8 / 10 mm; tab size matches effective digit size | TY-10, TY-11, TY-12, TY-21 to TY-25 (measured track widths), TY-30, TY-32, TY-33, SL-4, CL-31, VA-70, HD-32, DN-10, DN-11 |
| **L-CELL** | One frame; shared collapsed borders at the look's weight; equal cell sizes across a section and its pages; grid totals equal live width and gridH; problem ends in top half; free area >= 40%; one slot position per section; padding values; trailing area unruled | CL-1 to CL-9, PG-1, PG-10, PG-11, PG-12, PG-15, SC-10, INK-13, BD-3 (strip heights), BD-5 (Day strip and gap) |
| **L-LABEL** | Label style matches the look or the dialog override; quiet letter spec; tab spec, width rule, numbering sequence and restart rules; last number equals Score denominator; Model / Guided / fully answered cells unlabelled; keep-out empty; no bare numeral labels; Model tab outlined | CL-10 to CL-14, CL-20 to CL-22, CL-30 to CL-36, CL-40, CL-41, HD-2 |
| **L-SLOT** | Slot shape matches answer type; blank width equals B for the section; min 14 mm; one style per section (line vs box rule); unit word present after word-problem blanks; no underscore characters; no rounded or grey or dotted element tagged as a slot; time and fraction slot geometry; a `box-unknown` slot is dashed and sits inside a stack, and no other slot is dashed | SL-1 to SL-10, LS-6, LS-8, VA-7, RP-104, SF-40 |
| **L-OVERFLOW** | No element's box exceeds its cell, band, page body or live area; safety margins 1 mm / 0.6 mm; no horizontal scroll on screen at 375 px; long words wrap, never clip | PG-12, PG-13, PG-20, TY-12, HD-14, SP-11 |
| **L-SPLIT** | No cell, band-with-first-row, Day band, story-with-diagram or Model-with-Steps is split across pages; instruction repeats on continuation; continuation header is 12 mm; short last page rebalanced | PG-21, PG-22, PG-23, PG-24, HD-20, BD-5, RP-133 |
| **L-ANSAREA** | Answer row / answer zone heights meet 8 / 10 / 12 and Hw + 4; spare height is below the problem; regroup and headroom rows at spec; writing-place strokes >= 0.75 pt; minimum visual sizes; parts to shade >= 6 mm; clock diameter against precision | PG-14, VA-4, VA-6, VA-10, VA-12, VA-20, VA-50, VA-61, VA-63, RP-3, RP-5, RP-93, RP-102, INK-11 |
| **L-VERBS** | Instruction string id exists in the library; first word in the print verb list; <= 12 words; forbidden screen words absent in print mode; identical string for the same task across a packet; band labels from the fixed vocabulary with colon; title identical across a packet and matches the grammar | BD-1, BD-2, BD-10 to BD-17 (the word "tick" absent from every instruction string; `Check` always followed by its object), HD-10, HD-11, HD-13, SP-4 |
| **L-LEAK** | Constant T, answer-track count, carry-box count and R box across a section; no answer text inside visuals or `aria-label`s; draw / plot / shade visuals empty in blank state; schema bars not proportional to values; no strike marks in Independent; blank width constant | RP-1, RP-72, TY-26, VA-4, VA-10, VA-22, VA-23, VA-61, VA-62, SL-2, SP-34, AX-7 |
| **L-INPUT** | Print and key modes contain no `<input>`, `<button>` or `contenteditable`; screen mode has one input per slot with `data-slot`, correct `inputmode`, targets >= 44 px, roving tabindex, regroup inputs unscored and skipped by auto-advance | SP-10, SP-20 to SP-23, SL-7, AX-5, AX-6 |
| **L-KEY** | Key page geometry equals pupil page geometry (cell boxes within 0.1 mm); slot count equal; every slot answered; answers weight 700; "Answer Key" in tab, Name position and footer; same seed | AK-1 to AK-5, AK-7 |
| **L-CCSS** | No CCSS code pattern, the word "Grade", a skill id or a level-revealing string inside any cell, band, title or tab; "Level N" present in tab line 1; grade and codes present only under `data-ws-teacher`; no clamp notes in page DOM | SC-5, HD-5, HD-6, HD-30, HD-31, DN-14, AX-12, CL-7 |
| **L-DENSITY** | Items per page within the ceiling for role and size; computed capacity equals the section 12 tables; column count equals `resolveSectionLayout` output; fact fill 55-75% and rule gap >= 6 mm at each N; Auto values; solid-ink share of tabs < 5% | DN-1, DN-2, DN-12, DN-13, DN-15, DN-16, DN-20, DN-21, DN-22, DN-30, TY-31, CL-36 |

### 17.3 Manual checks

| Check | Method | Rules covered |
|---|---|---|
| **M-RULER** | Export a PDF on the chosen paper, print at 100%, measure: 186 mm live width, header <= 26 mm, footer 6 mm, Hw on three slots, one coin diameter, the ruler | PG-1 to PG-6, SL-4, RP-111, RP-160 |
| **M-COPY** | Photocopy a copy on the school copier in standard and photocopy-safe modes: grey, 0.5 pt lines, hatch, dotted-outline digits, tabs all legible; tabs do not checkerboard | INK-20, INK-23, CL-36 |
| **M-GLYPH** | Read the specimen block: flagged 1, open 4, single-storey a and g, O vs 0, track alignment | TY-40 (b-e), VA-30 |
| **M-SEMANTICS** | Review each new cell template against the line-style and corner table: dotted, dashed, solid / hollow, square / rounded used only for their meanings; dashed only on cut lines (long dash) and on the missing-digit box (short dash); no distinction carried by grey level; band labels and section titles plain; the `Say:` band's rule weight and height | LS-2 to LS-8, INK-6, BD-4, BD-6, BD-8, RP-140 to RP-146 |
| **M-ARITH** | Review stacked-arithmetic, fact and division mock-ups against section 10 at S / M / L in both looks: operator track, rule span, anchoring, separators, partial rows, bracket path, helper strips, own-section rule for bracket division, both fact orientations | VA-1, VA-2, VA-3, VA-5, VA-13, VA-42, VA-51, VA-52, VA-60, VA-64, VA-65, VA-66, VA-71, TY-26 |
| **M-DRAW** | Review each representation builder against its RP rules at S / M / L in both looks, in the gallery page | RP-10 to RP-133, RP-161, RP-170, RP-2, RP-4, RP-6, RP-8 |
| **M-HEADER** | Toggle the five header check boxes (plus Time / Goal) through the combinations in 8.3 in the dialog; confirm heights, field positions, persistence after reopening | HD-1, HD-3, HD-4, HD-12, HD-15, HD-16 |
| **M-FADE** | Print a lesson packet: hints only ever decrease page to page; structural scaffolds persist; first-cell cues drop; options for tests behave as checked | SF-1 to SF-4, SF-10 to SF-12, SF-30 to SF-34, SF-41, SF-42, BD-7, VA-11, VA-21, VA-31, VA-32, VA-40, VA-41 |
| **M-WORDPROB** | Review word-problem, True or False?, Reason It, Stretch and error-analysis mock-ups against 13.5-13.6; stories original and neutral | SF-50 to SF-54, SF-60 to SF-63, RP-70, RP-71, RP-116 |
| **M-SCREEN** | Live browser QA at 375 / 768 / 1440 with console check: focus cell on phones, entry order, live vs on-Check feedback, wrong digits stay, regroup boxes unmarked, dark theme keeps the paper white, hint ladder order, 200% zoom | SP-1, SP-3, SP-12, SP-13, SP-30 to SP-32, SP-40, PG-25, AX-6, AX-9, AX-10 |
| **M-A11Y** | Screen-reader pass on one cell per template; TTS reads instruction and story; routine consistency across a packet | AX-1 to AX-4, AX-7, AX-8, AX-11 |
| **M-SCOPE** | Review any new page type or option against SC-3 (no skill excluded), SC-6 (no tracking artefacts), DN-34 (no silent mixing), and the owner's two-look table | SC-1 to SC-4, SC-6, SC-11, DN-31 to DN-34, AK-6 |

A rule with no row in 17.2 or 17.3 is a defect in this document; add the mapping when adding the rule.
