# The graphic library

`js/modules/sheet/graphics/` — one drawing per representation, used by every cell template that
shows it, on paper and in the screen twin (design/audit/VISUAL_QUALITY.md §4.3, VQ-4). Started by the
visual-quality lane, 2026-10-31.

**Rules every entry keeps** (WORKSHEET_DESIGN_STANDARD.md governs; this file only catalogues):
- Pure ES module (SCC-01): no `window`, DOM, state or `Math.random`. Imported through
  `sheet/index.js` (`graphics`) or by a cell from the entry's own file.
- One drawing, two scales: written in paper mm / pt; in the twin (`ctx.options.twin`) the same numbers
  become `--mq-k2` px through `graphics/units.js` (`L`, `P`, `B`). Touch targets ≥ 44 px on screen.
- Sizes from the preset (S / M / L, `ctx.metrics`), never fixed. Ink `#000`, paper `#fff` and the one
  grey `#949494` from `tokens.js` (INK-1/INK-3); strokes from `STROKE_WIDTHS` (structure 1.5 pt, parts
  0.75–1 pt, never a hairline).
- Andika, numbers in proportional digits (`NUM_FEATURES`), never letter-spaced (VQ-5). Column work
  keeps tabular digits (its digits sit in tracks).
- A drawing never shows the answer in a blank state; a slot's width comes from the widest answer of
  the band, never this item's (L-LEAK).
- A template that shows a representation the library has DRAWS IT FROM HERE; it never redraws it.
  An approved drawing that lives in its template is RE-EXPORTED here, not copied.

## Entries built for the library

| id | What it shows | Vocabulary (pupil words) | Function | Sizes approved | Where used | Critic evidence |
|---|---|---|---|---|---|---|
| `numberBond` | Part-whole (RP-60): the whole above, two parts below, 1 pt spokes; boxes (default) or circles; whole 1.5 pt, parts 0.75 pt; the unknown is the empty place and the item's one answer slot | whole, part, number bond, makes | `numberBond(ctx, {whole, a, b, unknown, shown, ink, orientation, shape, slotId})` | side 14 / 16 / 20 mm (S/M/L); twin `--mq-bond` | `bond` template (`composing:number_bonds`, `part_whole_model`, `bonds_in_order`, …) — moved from `cells/bond.js`, output unchanged | (blank until the critic passes) |
| `factTriangle` | A fact family's three numbers at the corners of a triangle, the WHOLE (largest) at the top, the parts at the base; one 1.5 pt outline; optional `+ −` in the centre | fact family, big number, small numbers, top | `factTriangle(ctx, {top, left, right, signs, label})`, `factTriangleSize(ctx)` | equilateral, side 34 / 42 / 50 mm; numbers at the working digit size | `family-check` (`addition:fact_family_sort`) | (blank until the critic passes) |
| `answerArea` | The ONE scored place (VQ-2): a heavy 1.5 pt box and the unit word PRINTED beside it — no bank, no line to copy onto | answer, unit word | `answerArea(ctx, {id, shown, expect, digits, unit, ink, twinHook: 'cell' \| 'blank'})`, `boxW(ctx, digits)` | box height 11 / 13 / 15 mm, width ≥ 1.2 × height and ≥ `blankWidth(digits)` | inside `sentenceFrame`; word-work `layout: 'sentence'` | (blank until the critic passes) |
| `sentenceFrame` | The number sentence `[ ] ◯ [ ] = [ ]`: two number boxes (1 pt), the sign circle the pupil writes + or − in, `=`, then the `answerArea` | number sentence, plus, minus, equals | `sentenceFrame(ctx, {a, b, op, ans, unit, digits, show, ink, ids, twinHook})`, `sentenceFrameWidthMm(ctx, {digits, unitChars})` | boxes as `answerArea`; circle 9 / 11 / 13 mm | word-work `layout: 'sentence'` (`add_wp_10`, `add_wp_20`, `sub_wp_10`, `sub_wp_20` and their `_plain` twins) | (blank until the critic passes) |
| `partWholeBar` | The schematic part-whole bar (RP-70/72): the whole bar over two part bars, a writing box in each; never proportional (equal parts equal, else 60 / 40) | whole, part, bar | `partWholeBar(ctx, {whole, a, b, wMm, show, ink, gradeParts})` | bars 11 / 12.5 / 14 mm tall, whole ≥ 42 mm; boxes slot size | word-work `layout: 'bar'` (detailed lesson 2) — moved from `barLayout`; word-work `layout: 'sentence'` with the bar option on | (blank until the critic passes) |

## Approved drawings re-exported (drawn in their templates; never redrawn)

| id (library) | Source | What it shows | Where used |
|---|---|---|---|
| `tenFrame` | `cells/tenframe.js` `frameHTML` | ten frame(s), counters filled top row first | `tenframe` template |
| `barMini` | `cells/word-work.js` `barMini` | a small part-whole bar for a vocabulary card or chart caption | detailed lessons |
| `clockFace` | `cells/tmkit.js` `faceSVG` | analogue clock face, hands, numerals | `clock`, `timeline` |
| `coin`, `coinRow`, `note` | `cells/tmkit.js` | coins and notes at true relative size | `coins`, `money-columns` |
| `fractionModel` | `cells/frac-model.js` `fracModelSVG` | area / bar / circle / line fraction models | `frac-model` |
| `numberLine` | `cells/value-line.js` `valueLineSVG` | a marked number line with labelled ticks | `value-line`, `nl-place` |
| `ruler`, `thermometer` | `cells/figures.js` | measuring scales | `ruler`, `thermometer` templates |

## Representation map (which drawing a relation needs)

The rule (VQ-1) lives in WORKSHEET_DESIGN_STANDARD.md and EXTENSION_PLAYBOOK.md; the library entry
for each relation:

| Relation | Library entry |
|---|---|
| part-whole, number bond, make ten | `numberBond` |
| fact family (are these three a family? write the facts) | `factTriangle` (and `numberBond` for the four-fact cell) |
| one-step + / − story within 20 | `sentenceFrame` (+ `answerArea`), `partWholeBar` as the bar option |
| a scored number with a unit | `answerArea` |
| compare, equal groups, place value, fractions, measure, time | the re-exported drawings above; comparison bar and groups bar are still to be added |
