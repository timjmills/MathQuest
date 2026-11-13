# The graphic library

`js/modules/sheet/graphics/` — one drawing per representation, used by every cell template that
shows it, on paper and in the screen twin (design/audit/VISUAL_QUALITY.md §4.3, VQ-4). Started by the
visual-quality lane, 2026-10-31.

**Rules every entry keeps** (WORKSHEET_DESIGN_STANDARD.md governs; this file only catalogues):
- Pure ES module (SCC-01): no `window`, DOM, state or `Math.random`. Imported through
  `sheet/index.js` (`graphics`) or by a cell from the entry's own file.
- One drawing, two scales: written in paper mm / pt; in the twin (`ctx.options.twin`) the same numbers
  become `--mq-k2` px through `graphics/units.js` (`L`, `P`, `B`). Touch targets ≥ 44 px on screen.
- Sizes from the preset (S / M / L, `ctx.metrics`), never fixed. Ink `#000`, paper `#fff` and the one <!-- nos: S token value (compact layout / decode alias), not an offered size -->
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
| `numberBond` | Part-whole (RP-60): the whole above, two parts below, 1 pt spokes; boxes (default) or circles; whole 1.5 pt, parts 0.75 pt; the unknown is the empty place and the item's one answer slot | whole, part, number bond, makes | `numberBond(ctx, {whole, a, b, unknown, shown, ink, orientation, shape, slotId})` | side 14 / 16 / 20 mm (S/M/L); twin `--mq-bond` | `bond` template (`composing:number_bonds`, `part_whole_model`, `bonds_in_order`, …) — moved from `cells/bond.js`, output unchanged | (blank until the critic passes) <!-- nos: S token value (compact layout / decode alias), not an offered size --> |
| `factTriangle` | A fact family's three numbers at the corners of a triangle, the WHOLE (largest) at the top, the parts at the base; one 1.5 pt outline; optional `+ −` in the centre | fact family, big number, small numbers, top | `factTriangle(ctx, {top, left, right, signs, label})`, `factTriangleSize(ctx)` | equilateral, side 34 / 42 / 50 mm; numbers at the working digit size | `family-check` (`addition:fact_family_sort`) | (blank until the critic passes) |
| `answerArea` | The ONE scored place (VQ-2): a heavy 1.5 pt box and the unit word PRINTED beside it — no bank, no line to copy onto | answer, unit word | `answerArea(ctx, {id, shown, expect, digits, unit, ink, twinHook: 'cell' \| 'blank', unitChars, under})`, `boxW(ctx, digits)`; `unitChars` reserves the band's longest unit word so every box of a page stands in the same place (VQ-7); `under` hangs the word under the box (a narrow column; always on screen, so a 390 px card holds the sentence) | box height 11 / 13 / 15 mm, width ≥ 1.1 × height and ≥ `blankWidth(digits)`; twin 12 mm square (≥ 44 px) | inside `sentenceFrame`; word-work `layout: 'sentence'` | (blank until the critic passes) |
| `sentenceFrame` | The number sentence `[ ] ◯ [ ] = [ ]`: two number boxes (1 pt), the sign circle the pupil writes + or − in, `=`, then the `answerArea` | number sentence, plus, minus, equals | `sentenceFrame(ctx, {a, b, op, ans, unit, digits, show, ink, ids, twinHook})`, `sentenceFrameWidthMm(ctx, {digits, unitChars})` | boxes as `answerArea`; circle 9 / 11 / 13 mm (twin 11 mm, ≥ 44 px); paper 2-across at S, full width (story beside) or unit-under at M/L | word-work `layout: 'sentence'` (`add_wp_10`, `add_wp_20`, `sub_wp_10`, `sub_wp_20` and their `_plain` twins) | (blank until the critic passes) <!-- nos: S token value (compact layout / decode alias), not an offered size --> |
| `partWholeBar` | The schematic part-whole bar (RP-70/72): the whole bar over two part bars, a writing box in each; never proportional (equal parts equal, `equal: true` when the unknown is a part, else 60 / 40); digits proportional (VQ-5) | whole, part, bar | `partWholeBar(ctx, {whole, a, b, wMm, show, ink, gradeParts, equal, ids})` | bars 11 / 12.5 / 14 mm tall, whole ≥ 42 mm; boxes slot size | word-work `layout: 'bar'` (detailed lesson 2) — moved from `barLayout`; word-work `layout: 'sentence'`: drawn on every teaching cell (scaffold level ≥ 2: model, guided, the lesson chart), on practice pages with the bar option (round 2, critic r1 F13 / F17) | (blank until the critic passes) |
| `familyChart` | A BLANK number-family chart (owner 2026-10-31, option `familyChart`): the four related sentences `[ ] + [ ] = [ ]`, `[ ] + [ ] = [ ]`, `[ ] − [ ] = [ ]`, `[ ] − [ ] = [ ]` (× × ÷ ÷ with `op: '*'`), signs printed, one sentence a row. WORKING SPACE ONLY: every box `data-ws-graded="0"` (screen: `input.mq-wwork`, no `data-mq-expect`, never marked); 0.75 pt boxes (VQ-6: lighter than the answer place); the key writes the four facts when given `facts` + `show` | number family, fact, plus, minus, equals | `familyChart(ctx, {op, facts, show, ink, digits, id})`, `familyFacts(a, b, whole, op)`, `familyChartSize(ctx, {digits})` | boxes the `answerArea` boxes (14 × 11 / 14.3 × 13 / 17 × 15 mm at 2 digits), rows 1.6 mm apart; chart 55 × 49 / 58 × 57 / 70 × 65 mm (S/M/L) | `family-check` with `familyChart` on (`addition:fact_family_sort`): under the triangle at S, beside it at M / L | (blank until the critic passes) <!-- nos: S token value (compact layout / decode alias), not an offered size --> |

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
| fact family (are these three a family? write the facts) | `factTriangle` (and `numberBond` for the four-fact cell); `familyChart` as the working-space support |
| one-step + / − story within 20 | `sentenceFrame` (+ `answerArea`, the plural unit printed), `partWholeBar` on the teaching pages and as the practice pages' bar option |
| a scored number with a unit | `answerArea` |
| compare, equal groups, place value, fractions, measure, time | the re-exported drawings above; comparison bar and groups bar are still to be added |

## Vocabulary pictures (lane lf-vocab, 2026-11-07; design/cards/vocabulary/vocabulary.md)

One shared set (owner 2026-10-25): the same drawing of a word serves the lesson's vocabulary page (lesson part
`vocab-page`) and the vocabulary practice (`vocab-match3`, `vocab-pick3`). `js/modules/sheet/graphics/vocab-pictures.js`:
`vocabPictureSVG(ctx, word, {wMm})`, `vocabPictureAlt(word)`, `hasVocabPicture(word)`, `VOCAB_PICTURE_IDS`. Each picture is
drawn once on a 60 x 40 canvas and scaled to the width the cell gives it; strokes are non-scaling (named mark 1.5 pt, parts
1 pt, fine 0.75 pt); black on white, no grey; text >= 5.8 canvas units; a picture never prints its own word. Words whose
pictures could be read as each other are never offered together (`notWith`, `sheet/lesson-pages/vocab-words.js`).

Sizes in use: 38 / 40 / 40 mm (Match 3 at S / M / L); 80 / 40 / 34 mm (1 picture, 3 words, grades K-1 / 2-3 / 4-5; x 0.88 at <!-- nos: S token value (compact layout / decode alias), not an offered size -->
S, x 0.94 at M). Library range 34-82 mm. Critic evidence: pending (lf-vocab critic r1). <!-- nos: S token value (compact layout / decode alias), not an offered size -->

| id (word) | What it shows (the heavy mark is the word's part) | Lesson sets |
|---|---|---|
| `even` | six dots in three ringed pairs | G3 table patterns |
| `odd` | three ringed pairs and one dot alone, heavy ring | G3 table patterns |
| `product` | 4 × 3 = 12, the 12 boxed | G3 (4 sets), G4 units digit, times as many |
| `factor` | 4 × 3 = 12, the 4 and 3 boxed | G3 input-output, properties; G4 times as many |
| `row` / `column` | a times table, one row / one column outlined | G3 table patterns |
| `multiple` | number line 0-12, hops of 3 landing on 3, 6, 9, 12 | G3 table patterns; G4 units digit |
| `input` / `output` | In / Out table, the In / Out column outlined | G3 input-output |
| `rule` | 2 → [+ 3] → 5, the rule boxed | G3 input-output; G4 shape patterns, follow a rule |
| `pattern` | 2, 4, 6, 8 … with +2 hops | G3 input-output; G4 shape patterns |
| `array` | three rows of four dots | G3 properties |
| `commutative` | 2 × 3 array turned to 3 × 2, "2 × 3 = 3 × 2" | G3 properties |
| `identity` | five rings of one dot, "5 × 1 = 5" | G3 properties |
| `distributive` | 3 × 7 dots split 5 + 2 by a heavy line, "3 × 5 + 3 × 2" | G3 properties |
| `step` | box ① → box ② with work lines | G3 two-step problems |
| `total` | bar 5 + 3 under a whole bar marked ? | G3 two-step problems |
| `left` | seven circles, three crossed out | G3 two-step problems |
| `equal groups` | three rings of four dots | G3 two-step problems |
| `unknown` | 8 + [?] = 13 | G3 two-step problems; G4 times as many |
| `count on` | track 112-115 with forward hops | G1 count to 120 |
| `one more` / `one less` | 4 dots → 5 dots (new one ringed) / six dots, one crossed out | G1 count to 120 |
| `before` / `after` | track 104 105 106, hop back to 104 / on to 106 (boxed) | G1 count to 120 |
| `hundred chart` | 101-104 over 111-114 | G1 count to 120 |
| `hundred` / `ten` / `one` | a 10 × 10 flat / a rod of ten / one unit square | G2 read and write to 1,000 |
| `digit` | one large 7 | G2 read and write to 1,000 |
| `expanded form` / `number name` | 300 + 40 + 7 / "three hundred forty-seven" | G2 read and write to 1,000 |
| `ones digit` | 473, the 3 boxed | G4 units digit, follow a rule |
| `repeat` | 2 4 8 6 2 4 8 6, each four bracketed | G4 units digit, follow a rule |
| `sequence` | 5, 10, 15, 20, … | G4 units digit, shape patterns, follow a rule |
| `cycle` | 2 → 4 → 8 → 6 round a ring of arrows | G4 units digit |
| `grow` | figures of 1, 3, 5 squares | G4 shape patterns |
| `term` / `first term` | 4, [7], 10 / [3], 7, 11, 15 | G4 shape patterns, follow a rule |
| `times as many` | a one-part bar and a three-part bar, ×3 | G4 times as many |
| `compare` | a long bar over a short bar, the difference arrowed | G4 times as many |
| `equation` | 12 = 3 × 4 | G4 times as many, remainder |
| `remainder` | three rings of four and one dot in a heavy ring | G4 remainder |
| `quotient` / `divisor` / `dividend` | 13 ÷ 4 = [3] R 1 / 13 ÷ [4] / [13] ÷ 4 | G4 remainder |
| `round up` | three full boxes of four and a fourth box with one | G4 remainder |
