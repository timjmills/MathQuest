# WRM visual catalogue — Year 3 (pilot)

Phase 3 of `design/WRM_ALIGNMENT_PLAN.md`: every representation White Rose Maths draws in the Year 3
small-step materials, how WRM draws it, and whether our kit can already draw it in our own black-and-white
Andika style. **Descriptions only** — no WRM artwork, wording or layouts are copied into the repo; a
match means "our own drawing carries the same mathematical grammar", never "looks like WRM".

- Source: Google Drive, `White Rose Maths Primary / Year 3` (folder `1l9hjSYKWnwYnfwPj7Nui4Re5CDWJfWFi`),
  12 blocks, 134 small steps (block 13 "Taskmaster" not catalogued). Viewed 2026-09-25.
- For every step: the per-step Teaching Guide (Guide D, "Key model" line read as text) **and** the
  small-step PDF (`NN Step N <title>.pdf`, pages 2–3: *Key learning* and *Reasoning and problem solving*,
  which are the image pages) rendered to PNG and looked at. The teaching-slide decks and pupil worksheets
  were not opened (see method notes: the small-step PDF shows the same representations, at 1 MB instead
  of 8–14 MB).
- Coverage honesty: Blocks 1–3 and B8, B9 were viewed on both image pages; for the long uniform runs
  (B2 steps 13–18, B3 steps 7–12, B4 steps 1–9, B5, B7, B10–B12) the *Key learning* page was viewed and
  the reasoning page only where the key page was thin. The guide's key-model line was read for all
  steps except B2 S21 (download lost, see pitfalls) and B3 S8–S15 (older guide format, no key-model
  line); those steps rely on the pages alone.

## Legend

| Status | Meaning |
|---|---|
| **MATCH** | An existing kit template / option (or a legacy skill visual that is already B&W-compliant) draws the representation with the same structure. Cite = what to use. |
| **PARTIAL** | We draw the representation, but something WRM relies on differs (task, number range, orientation, what is blank, labelling) — or the drawing exists only as a **support pane** that is not yet wired as a skill option, or only as a **legacy** (coloured, non-kit) visual. What differs is stated. |
| **GAP** | Nothing draws it. A proposal is given: new option on skill X, or new template / skill. |

Citations: `template:<id>` = `js/modules/sheet/cells/<file>.js` registered cell; `pane:<id>` = support
pane in `js/modules/sheet/cells/panes/*.js` (registry `panes/index.js`); `category:skill` = skill key;
option ids are from `js/modules/skill-options.js`.

**Headline finding.** Most of the Year 3 *number* representations already exist as kit drawings — the
support panes (`base10`, `base10-quick`, `disks`, `pvgrid`, `hundreds`, `numberline`, `openline`,
`array`, `area`, `gridpaper`, `bar`, `tenframe`, `objects`) plus the `pv`, `bond`, `base10`, `stack`,
`hop-line`, `arrays`, `counters`, `clock`, `timeline`, `coins` templates. But in `skill-options.js`
only the mark-type supports (`touch`, `touchall`, `boxsign`, `startarrow`, `steps`, `round-*`, `cut`,
`line`) are wired as `support` values; **the picture/model panes are not yet offered on any skill**
(SUPPORTS.md S2). Wiring them closes roughly a third of the PARTIALs below. The real GAPs cluster in
**measurement instruments** (cm/mm ruler, jug, dial scale, balance, metre stick, double scale),
**fractions in kit B&W** (bars, walls, fraction number lines — all still legacy, coloured), **data**
(two-way table, Venn, Carroll, blank tally/sort tables), **calendar/stopwatch/Roman clock**, and a few
**number models** (bead string, bundles/packs, multi-part part-whole, split-and-operate part-whole,
10-less/number/10-more table, PV-chart exchange drawing).

---

## Block 1 — Autumn 1 · Place value (14 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Represent numbers to 100 | **Bead string** (100 beads, tens in alternating colours, read "__ tens __ ones"); **straw bundles** (banded tens + loose straws); **base-10** rods + cubes (to scale); **ten frames** of counters (full frames + part frame); **lines-and-dots quick sketch** (line = ten, dot = one) for the pupil to draw; digit cards (make 2-digit numbers); same number in two layouts. Guide: *no place-value counters yet* (they hide relative size). | Base-10 to scale: PARTIAL — `pane:base10` (to 99) not wired; draw task MATCH `template:base10` (`composing:base10_build`, T\|O mat, stick = ten, open dot = one). Quick sketch: MATCH `template:base10` symbols / `pane:base10-quick`. Ten frames: MATCH `pane:tenframe`, `template:tenframe` (K–2 range; needs 2-digit multi-frame read → PARTIAL). Bead string: **GAP** → new `pane:beadstring` (100-bead line, tens alternating solid/hollow — our two-set rule LS-5) offered as `support`/`model` on `placevalue:identify` and `composing:tens_foundation_visual`. Straw bundles: **GAP** → `objects` kind `bundles` (a ten = 10 sticks with a band) on `composing:tens_foundation_visual`. Digit cards: PARTIAL `template:cloze-bank`. |
| 2 Partition numbers to 100 | **Part-whole (cherry)** — whole circle on top, two part circles below; circles hold numbers *or* base-10 drawings; any circle blank; the model is also drawn **rotated** (whole left / right / below); "__ tens and __ ones; 67 = __ + __"; partition cards to match; pattern ladder (1 ten + 3 ones = 13, 2 tens + __ ones …). | Numbers-only: MATCH `template:bond` (`composing:number_bonds`, `unknown` A/B/whole). PARTIAL: bond is fixed whole-on-top; WRM rotates it → add `orientation` option (top/left/right/bottom) to the bond template. Pictures inside circles: **GAP** → bond payload `draw: 'base10'` using `pane:base10-quick` drawings in the circles. Sentence frames: MATCH `template:pv` kind `expand` (`placevalue:expand`). |
| 3 Number line to 100 | Horizontal line, **end labels only** (0–100, 0–50, 20–30, 30–80), intervals 1/2/5/10; pupil labels the divisions; **arrows (A, B) above a tick** to read; number cards → draw an arrow to place; estimate between ticks; sentence frame "start __, end __, __ intervals, each interval is worth __". | PARTIAL: `template:pv` kind `line-mark` (`number_sense:place_on_number_line`) marks a number between two multiples of 10/100 only; `template:hop-line` (`ticks` step/one) and `patterns:skip_count_line` count from 0. **GAP** for the full task set → new skill `number_sense:read_number_line` (tasks `label` / `read-arrow` / `place` / `estimate`; options `start`, `interval` 1·2·5·10·20·25·50·100, `ticks` all / ends / ends+mid) drawing on the `pv` rounding-line geometry, plus the interval sentence frame as a structural scaffold. |
| 4 Hundreds | Boxes/packs printed "100" and "10" (grouped objects: 6 boxes of 100); **number track in 100s** (row of boxes, some blank); **hundred flats** (10×10 squares); "__ tens in 100 / __ hundreds in 500". | Track: MATCH `template:seqstrip` (`counting:number_seq_fill`, 5 tiles; WRM rows are 10 → PARTIAL, add `tiles` 10) and `template:count-row` (`patterns:count_by_fill`). Flats: PARTIAL `template:base10` (`composing:base10_build_hundreds` is a draw mat); reading pictured flats → see R01. Packs of 100/10: **GAP** (same `bundles` objects kind as S1, with a "100" / "10" label). |
| 5 Represent numbers to 1,000 | Packs + loose; base-10 flats/rods/cubes to read; **two-column table "Base 10 \| Number"**; **quick sketch 3-digit: square = hundred, line = ten, dot = one** to complete; base-10 partly covered by a splat (find the hidden amount); two different builds of one number. | Quick sketch: MATCH `pane:base10-quick` ("open square = hundred, stick = ten, open dot = one") — wire as `support` on `placevalue:identify`/`value`; draw task MATCH `composing:base10_build_hundreds`. Read-the-blocks 3-digit: PARTIAL (no "read" kind) → add `task: 'read'` to `template:base10`. Table layout: **GAP** (see R58 data-table template). Covered amount: GAP (stretch). |
| 6 Partition numbers to 1,000 | Base-10 3-digit pictures in a box + "__ hundreds, __ tens, __ ones; __ = __ + __ + __"; **three-part part-whole** (whole on top, three parts); missing-number partition equations (847 = 800 + 40 + __); value-of-digit questions. | Sentences/equations: MATCH `template:pv` `expand` / `expand-line` (`placevalue:expand`, `form` option), `placevalue:value`. 3-part cherry: **GAP** → `parts: 2…5` option on `template:bond` (placevalue skills). |
| 7 Flexible partitioning to 1,000 | Base-10 pictures with **rings drawn round groups** to show a non-standard split, matched to 3-part part-whole models; **five-part** part-whole; 625 = 500 + __ + 20 + 5. | Equations: MATCH `placevalue:expand` (non-standard `rename` option exists: "More than 9 of one place"). Ringed base-10 / multi-part cherry: **GAP** (same `parts` option; ring marks on `pane:base10-quick`). |
| 8 Hundreds, tens and ones | **Place-value counters** (circles with 100 / 10 / 1 inside) in a row and scattered; **PV chart H\|T\|O** with counters in the columns; PV chart with **plain unlabelled dots** (value from the column); "__ is made up of __ hundreds …". Guide: counters are new here. | Counters: MATCH `template:pv` kinds `disks` / `build` (`placevalue:place_value_disks`, `placevalue:pv_disks_build`: disk = outline circle, value inside, zone per place with place letter). Plain dots in a chart: **GAP** → option `disk: 'value' \| 'dot'` on those two skills. |
| 9 Find 1, 10 or 100 more or less | Base-10 pictures A/B/C (which shows 1/10/100 more); PV chart with counters; **table "10 less \| Number \| 10 more"** (also 100) with pictures in cells, blanks elsewhere; **function-machine chain** (input → 1 more → 100 less → 10 more → output); PV chart with plain dots ("a counter fell off"). | Core: MATCH `placevalue:more_less_10` / `more_less_100` (with `_pvDigitSupport` `support: 'chart'`). Table: **GAP** → `layout: 'table'` option on more_less_10/100 (three columns, one blank per row). Machine chain: PARTIAL `template:function-table` (In/Out table; a hidden `pictures` "Machine picture" option exists on the function-table skills) → add a chained-machine look. |
| 10 Number line to 1,000 | Lines 0–500, 0–1,000, 500–1,000, 800–900, 180–184; partial labels; intervals 1/10/20/50/100; complete labels; draw arrows; read arrows A/B/C. Guide: 0–1,000 with 20 intervals (counts in 50s). | As S3 → PARTIAL `pv` `line-mark`; **GAP** for label/read/place tasks → `number_sense:read_number_line`. |
| 11 Estimate on a number line to 1,000 | Fully labelled lines and end-only lines; arrows between ticks to estimate; a line with **no interior ticks** (0–1,000) to place numbers on; two reasonable estimates. Guide: midpoint, then quarters. | PARTIAL: `pane:round-line` (rounding number line, halfway marked; `midLabel` option on rounding skills). **GAP** → `ticks: 'none' \| 'mid' \| 'quarters'` + `task: 'estimate'` on the proposed `read_number_line`. |
| 12 Compare numbers to 1,000 | Two **PV charts side by side**, counters in each; **empty PV charts** to draw counters into; base-10 picture ( ○ ) base-10 picture — a circle for < > =; counters vs base-10; lines-and-dots vs an empty box to draw; mixed forms ("nine hundred and two" vs 920; "7 hundreds and 6 ones" vs "76 tens"). | MATCH `template:pv` kind `compare` (`placevalue:compare`; sign goes in a circle — equation-frame rule). Pictures either side: PARTIAL → `support` value `disks`/`base10-quick` on `placevalue:compare`. Mixed forms: PARTIAL `placevalue:unit_form`, `number_word_names`. |
| 13 Order numbers to 1,000 | Base-10 pictures to order; small **H\|T\|O digit grids** to order; number cards; heights in cm; ascending/descending. | MATCH `template:pv` kind `order` (`placevalue:order_least_to_greatest` / `order_greatest_to_least`); digit grids = `support: 'chart'`. Pictures: PARTIAL (as S12). |
| 14 Count in 50s | **Number track whose cells hold base-10 pictures** (50, 100, 150 …) to complete by drawing; 5s track vs 50s track; tracks asc/desc with blanks; number line 0–500 (10 intervals); packs of 50 cards; **measuring jug** read in 50s; 50p coins. | Tracks: MATCH `template:count-row` / `patterns:count_by_fill` (steps incl. 50) and `seqstrip`. Pictures in track cells: GAP (low priority). Jug: GAP (see B7). |

## Block 2 — Autumn 2 · Addition and subtraction (22 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Apply number bonds within 10 | **Double-sided counters** in a row (two colours; one flipped) → fact family; **pairs of part-whole models**, ones cubes in one and tens rods in the other (3 + 5 / 30 + 50); **bar models** (whole bar on top, two proportional parts, one cell blank); number line in 10s with a "+20" hop. Guide: bar model for fact families. | Two-colour counters: MATCH `pane:objects`/`k2` solid-vs-hollow two sets (LS-5) — not wired for Y3. Part-whole: MATCH `template:bond`; pictures inside → GAP (B1 S2). Bar model: PARTIAL `pane:bar` (not wired) and `algebra:tape_diagram` (legacy); fact-family from a bar → **GAP** → `model: 'bar'` option on `addition:add_sub_fact_family` / `number_families_add` (currently `template:fact-family` uses a bond). |
| 2 Add and subtract 1s | **H\|T\|O PV chart** (coloured heads) holding base-10 or PV counters beside the calculation; **table "−3 \| Number \| +3"**; pattern column (258 = 251 + 7 …); compare expressions with a circle (345 + 4 ○ 349 − 5). | Chart beside a sum: PARTIAL `pane:disks` / `pane:base10` (not wired on `addition:add_sub_10s`/`add_sub_100s`). Table: GAP (as B1 S9). Compare circle: MATCH equation frame (circle for a sign) — `addition:equal_sign`, `comparison_word`. |
| 3 Add and subtract 10s | Packs of 100/10 + loose; H\|T\|O chart with base-10, subtract by removing; table −10/Number/+10 (counters or a mini chart in cells); **counters crossed out** in the chart; digit cards; missing-digit equations (452 − _0 = 422). | `addition:add_sub_10s` exists; pictures PARTIAL (panes not wired). Crossing out: PARTIAL — `template:counters` kind `takeaway` (bold X) is K–2 objects; add crossed-out disks to `pane:disks` for "−". Missing digits: MATCH `addition:add_missing_digit`, `subtraction:sub_missing_digit`. |
| 4 Add and subtract 100s | Packs; PV counters with hundreds crossed out; table −300/Number/+300; compare circles; **path grid** puzzle (5×5 grid of ±100 ops, start → finish). | `addition:add_sub_100s` — as S3. Path grid: GAP (stretch page, low priority). |
| 5 Spot the pattern | **Part-whole with PV counters inside the circles** (ones / tens / hundreds versions in parallel); chart with base-10 → ladders 444 + 3, + 30, + 300; chart with plain dots; **function machines** (input → −20 → +200 → output, blanks at either end). | As S2–S3 (panes not wired); machines PARTIAL `template:function-table`. |
| 6 Add 1s across a 10 | Tick number line with partial labels and a **curved hop to the next multiple of 10**; **open line** (no ticks, one label); **bridging split**: the added number split into two parts under the sum (248 + 6 → 2 and 4); open line with two labelled hops (+2, +4). Guide: number line two jumps + part-whole of the ones. | Open line + hops: PARTIAL `pane:openline` (open number line, ops + −) not wired; `template:number-line` (`addition:nl_add`, `number_line_add`) ticks every whole number 0–20 and the pupil draws one hop per unit — not the bridging form. **GAP** → `line: 'open'` + `hops: 'bridge'` option on `addition:nl_add` / `subtraction:nl_sub` for 3-digit numbers. Bridging split: **GAP** → new mark pane `split` (a small two-leg split under the second number), offered as `support` on `addition:add_1k_*` and `number_sense:make_a_ten`. |
| 7 Add 10s across a 100 | **Number tracks in 10s** (blanks); part-whole (100 → 30 + __); tick line with two labelled hops (+50 to the hundred, +30) **plus a part-whole beside it** splitting the tens; missing-number bonds 350 + __ = 400. | Tracks: MATCH `template:count-row`. Line + split: as S6 (GAP/PARTIAL). Bonds: MATCH `template:equation` / `algebra:solve_unknown`. |
| 8 Subtract 1s across a 10 | Fully labelled line 173–183 with **back hops** (count back in 1s); tick line with one hop "−4" to the previous 10; bridging split (7 → 4 and 3); open line with two back hops + part-whole. | `template:number-line` supports subtraction hops (`subtraction:nl_sub`) on 0–20 → PARTIAL for 3-digit segments; rest as S6. |
| 9 Subtract 10s across a 100 | Tick line counting back in 10s (last labels given); line to the previous hundred; back hops −20, −30 + part-whole 50 → 20, 30; digit-card box template "[ ][ ][ ] − [ ]0". | As S6–S8. Digit-card template: GAP (hands-on). |
| 10 Make connections | **Base-10 key** (flat = 1 hundred, rod = 1 ten, cube = 1 one) + conversion frames (10 ones = __ ten); **ten frames filled with PV counters** — ones, tens, hundreds versions side by side (5 + 3, 50 + 30, 500 + 300; ghost counters for −); number cards → blank bar model → fact family. | Key: MATCH (`template:base10` prints the symbol key once, RP-31). Scaled ten frames: **GAP** → `unit: 1 \| 10 \| 100` option on `pane:tenframe` (frame of disks), offered on `addition:add_sub_10s`/`add_sub_100s`. Bar → fact family: GAP (S1). |
| 11 Add two numbers (no exchange) | **PV chart (T\|O / H\|T\|O) with base-10 or counters, one addend per row, "+" at the left**, beside a **column addition on squared grid paper with place heads**; part-whole (whole blank); bar model (whole blank over 524 \| 145); missing-digit boxes in a horizontal sum. | Column: MATCH `template:stack` (`addition:add_1k_no_regroup`; level 2 = place-value heads over the columns, `level` option) + `pane:gridpaper` / `pane:pvgrid` (structural, not wired). PV chart beside: PARTIAL `pane:pvgrid` / `pane:disks` (not wired; the pvgrid pane draws the two rows and an empty answer row). Bar/part-whole: PARTIAL (word-work `wpBar`; `pane:bar`). |
| 12 Subtract two numbers (no exchange) | Chart with base-10, **subtracted pieces crossed out**, beside column subtraction on squared grid; part-whole with a missing part; **comparison bar model** (two bars, labels, difference marked by a double-headed arrow and "?"); column grid with missing-digit boxes. | Column: MATCH `template:stack` (`subtraction:sub_1k_no_regroup`). Crossed-out pieces: GAP (add to `pane:disks`/`base10`). Comparison bar: MATCH word-work `wpBar` compare look (`template:word-work`, option `wpBar` on the word-problem skills). |
| 13–18 Column add/sub with exchange (across 10, across 100, 2-digit + 3-digit, 3-digit − 2-digit) | H\|T\|O chart with base-10 or counters for **both** numbers and a **totals row of boxes** under the columns; **the exchange drawn as a ring round ten ones/tens with an arrow to one new piece in the next column**; subtraction: only the top number is built, the exchanged piece is crossed out and replaced by ten in the next column; beside it the column method on squared paper, carried digit **small under the answer line**; subtraction digits crossed out with the new digit and a small 1 above; missing-digit boxes in grids; comparison bars and part-whole for word problems. | Column + regroup boxes: MATCH `template:stack` (VA-10..VA-13 regroup/carry box, VA-20..23 subtraction headroom; `regroup` option none/always/mixed; `subtraction:sub_across_zeros`). Note: WRM writes the carry under the line; our carry box sits above (VA-11) — a documented house difference, keep ours. PV-chart exchange drawing: **GAP** → new `pane:pv-exchange` (pvgrid rows + ring-and-arrow mark + totals row), `support` value on `addition:add_1k_regroup`, `subtraction:sub_1k_regroup` and siblings. Word problems: MATCH `template:word-work` with `wpBar`. |
| 19 Complements to 100 | **Hundred square (10×10 grid) shaded in two tones** (e.g. 38 and 62) with brackets at the side per row group; tens/ones bond workings (61 + [ ] = 100 via 60 + … ); open line hops +9 then +30 to 100. | Hundred square: PARTIAL `pane:hundreds` (numbered chart rows) / `pane:area` (area squares) — **GAP** for the two-tone complement grid → `pane:complement100` (10×10 unnumbered grid, part shaded in the single grey, INK-3) on `number_sense:make_a_ten`-style complement skill; a new skill `addition:complement_100` is warranted (none exists). Open line: as S6. |
| 20 Estimate answers | Tick-line segments (60–70 with 62 marked; 800–900 with 840; 478 on an end-labelled line) + "__ is closer to __ than __"; estimate-then-calculate cards; compare circles. | MATCH `template:pv` kind `estimate` (`number_sense:estimate_sum`, `estimate_diff`) and `pane:round-line`; "closer to" line: MATCH `pv` `line-mark` / `number_sense:between_tens`. |
| 21 Inverse operations | Three part-whole models with the same numbers (fact family) + sentences; **blank bar model** (whole over two parts) to complete; bar with whole blank; open line with back hops to check. | Part-whole family: MATCH `template:fact-family` (bond above four facts). Blank bar: PARTIAL (S1 GAP). Check: MATCH `subtraction:sub_check_by_adding`. |
| 22 Make decisions | **Bar models matched to problems**: two part bars vs a whole bar with a "?" bracket; comparison bars with a double-headed "?" arrow; a **journey line** (towns along a line, km segments above/below); small column grid; digit cards + op cards box template. Guide: whole vs parts tells + or −. | MATCH `template:word-work` (sign row: circle the operation; `wpBar` part-part-whole / compare). Journey line: GAP (low priority; a bar-model variant). |

## Block 3 — Autumn 3 · Multiplication and division A (15 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Equal groups | Pictured objects in rounded groups (pears, cakes) + "There are __ equal groups with __ in each group; __ altogether"; row of packs → repeated addition + ×; unequal groups; coins in groups; plates of strawberries. Guide: counters/plates → array. | MATCH `template:arrays` ringed equal groups ("[ ] groups of [ ]. [ ] in all.", `multiplication:arrays_groups`), `multiplication:equal_or_unequal_groups`, `repeated_add_to_mult`; `pane:objects` op `*` (outline objects in equal groups). Picture objects: MATCH `objects` option (`pictures`). |
| 2 Use arrays | Object array (apples 3×5) read as **rows and as columns**; counter arrays; **match x-sentence / repeated addition / array cards** (vertical and horizontal arrays); draw arrays for 4 × 5 = 5 × 4; array partly hidden by a box. | MATCH `template:arrays` (`multiplication:arrays_groups`, `dot_array_mult`; `response: 'array-builder'` on the word skills; `pane:array`). Rows vs columns reading: PARTIAL → sentence variant "[ ] columns of [ ]". Hidden part: GAP (stretch). |
| 3 Multiples of 2 | **Number track** in 2s (3 rows, one descending); tick line in 2s (22–42, some labels); **1–50 number grid** to colour multiples; 2-row array of 24 (even); odd/even cards. Guide: NL in 2s → hundred square even columns. | Track: MATCH `template:count-row` (`multiplication:count_by_tables`). Grid colour: PARTIAL `patterns:skip_count_grid` / `pane:hundreds` (legacy grid) → kit `template:chartwindow` has a window, not a whole chart with a "shade multiples" task; `template:mult-grid` has `shade` task for a × chart — **GAP** → `task: 'shade'` on `chartwindow` whole-chart mode. Odd/even: MATCH `composing:odd_even`, `select_even_odd`. |
| 4 Multiples of 5 and 10 | Tracks asc/desc; **full hundred square** (circle ×5, colour ×10); **Venn diagram** (two overlapping circles "multiples of 5" / "multiples of 10" + outside region) to sort numbers; £5/£10 notes. | Hundred square: as S3. Venn: **GAP** → new `template:venn` (two overlapping outline circles, labels above, a box region outside; pupil writes numbers into regions; key = facsimile) + skill `number_theory:sort_multiples_venn`. |
| 5 Sharing and grouping | Scattered counters to share into 2 groups vs group in 2s (+ ÷ sentences); **bar model whole (20) over equal labelled parts** (4 4 4 4 4 = sharing) vs parts of 5 (= grouping); match statements to bar models; draw a bar model; 2×2 table story/drawing. | Counters: MATCH `template:counters` kind `share` (`division:share_into_groups`) and `template:arrays` grouping. Equal-parts bar: PARTIAL `pane:bar` / word-work `wpBar` "equal parts" — **GAP** as a skill option → `model: 'bar'` on `division:share_into_groups` and `division:div_equation_parts`. |
| 6 Multiply by 3 | **Linking-cube towers** of 3 → repeated addition + ×; groups of pictures (vases of flowers); bags of apples; 3-row array. Guide: array ↔ NL jumps of 3 ↔ bar model. | Towers: **GAP** → `objects` kind `cubes` (outline cube towers) on `multiplication:repeated_add_to_mult` / `arrays_groups`. Array/groups: MATCH `template:arrays`. NL jumps: MATCH `template:hop-line` (`multiplication:nl_mult`, `ticks`). Bar: PARTIAL. |
| 7 Divide by 3 | Plates (share); counter array arranged **in groups of 3 vs in 3 equal groups** (same counters, two ringings); **bar model 18 over 3 equal parts** (6 6 6); draw bar models for divisions. | Ringings: MATCH `template:arrays` / `template:remainder` (ring the counters, `division:div_remainders` when r = 0). Bar: PARTIAL (S5). |
| 8 The 3 times-table | Array 3 × 6 read as rows/columns → × and ÷ facts; **blank bar model** (15 over 3 empty parts); match equivalent expressions; compare circles. | MATCH `multiplication:mult_div_fact_family` (`template:fact-family`), `multiplication:mult_facts` (`constant` 3). Bar: PARTIAL. |
| 9 Multiply by 4 | Pots of pencils (groups); array 4 × 7; **arrays built from 2×2 squares of counters** matched to 4×4, 4×6, 8×4 (doubling structure); "8 × 4 is 8 × 2 × 2". | Arrays: MATCH `template:arrays`. Grouped-by-4 array look: PARTIAL (arrays deal equal groups subitised 2×2 — close). |
| 10 Divide by 4 | Scattered buttons to share into 4 vs ring groups of 4; **NL 0–20 labelled every 1 with a hop of 4 back from 20** (repeated subtraction); bags of apples. | MATCH `template:counters` share; `template:hop-line` (`division:nl_div`, `ticks: 'one'`, lines to 36). |
| 11 The 4 times-table | 1–50 grid colour ×4; array 4 × 5 → 2 × and 2 ÷ facts; compare circles; partition frames (4 × 9 = 5 × 9 − __ × 9). | Grid: as S3. Facts: MATCH `mult_div_fact_family`. |
| 12 Multiply by 8 | Bags of pears; spiders' legs (8 each); **array 3 × 8 split into 3 × 4 doubled**; **function machines ×2 ×2 ×2 vs ×4 ×2 vs ×8**. | Split array: PARTIAL `pane:area` / `area_perimeter:area_distributive_visual` (legacy). Machines: PARTIAL `template:function-table` (B1 S9). |
| 13 Divide by 8 | 32 buttons to share/group; **bar model 24 over 8 parts with counters drawn inside each part**; **stacked halving bar model** (56 → 28 \| 28 → 14 ×4 → 7 ×8, "÷2" brackets); choose bar model A vs B. | Bar with counters inside: **GAP** → `fill: 'counters'` on the proposed division bar option. Halving bars: GAP (low priority; `template:word-work` bar could stack). |
| 14 The 8 times-table | **Partial multiplication grid** (× \| 4 \| 8 heads, rows 3, 7, 8, 11) to fill; **array split by a line** into 5 × 8 and 2 × 8 with brackets; tick line 0–80 in 8s partly labelled; hundred square ×8/×4; packs of cans. | Grid: MATCH `template:mult-grid` (`multiplication:mult_chart`, task `fill`/`headers`; chosen rows/cols = PARTIAL — add non-consecutive headers). Split array: PARTIAL (S12). Line: MATCH `template:hop-line` / `count-row`. |
| 15 The 2, 4 and 8 times-tables | Cube-tower pairs 3×2, 3×4, 3×8 (doubling); partial × grid (× \| 2 4 8); match equivalent calculations; array 5 × 8 seen three ways. | Grid: MATCH `template:mult-grid`. Towers: GAP (S6). |

## Block 4 — Spring 1 · Multiplication and division B (11 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Multiples of 10 | Number track in 10s; **ten frames filled with "10" PV counters** (1 frame = 100; 17 × 10 as 10 × 10 + 7 × 10); sort multiples of 10; a long ribbon bar "270 cm" to cut into 10 cm. Guide: ten-counters on ten frames; count-in-10s NL. | Track: MATCH `template:count-row`. Ten frames of tens: **GAP** (B2 S10 `unit` option on `pane:tenframe`) for `multiplication:mult_zeros`/`place_value_10x`. |
| 2 Related calculations | Circles (groups) holding **2 ones cubes vs 2 tens rods** → 4 × 2 ones = __ ones / 4 × 2 tens = __ tens; **arrays of PV counters** (ones 5×4 vs tens 5×4); 15 ÷ 3 vs 15 tens ÷ 3 with counter arrays. | Groups/arrays: MATCH `template:arrays`; **GAP** → `counter: 'one' \| 'ten'` option on `template:arrays` (disk with "10" inside instead of a dot) for `multiplication:mult_zeros`, `division:div_facts` scaled. |
| 3 Reasoning about multiplication | Egg boxes (6s vs 3s) compare; arrays compare with circles; **two equal-length bars split into 6 vs 4 parts, stacked** (36 ÷ 6 < 36 ÷ 4); draw bar models to compare. Guide: arrays turned (a × b = b × a). | Commutativity: MATCH `multiplication:mult_properties`, `template:arrays`. Stacked comparison bars: GAP (bar option, B3 S5). |
| 4 2-digit × 1-digit, no exchange | **T\|O PV chart with base-10, one row per group** (3 rows of 32) + "3 tens × 2 = __ tens"; chart with counters 21 × 4; **part-whole for multiplication**: whole "23 × 3" on top, parts "20 × 3" and "3 × 3"; partition frames. | Area model: MATCH `template:area-model` (`multiplication:area_model_mult`: expanded parts × digit, partial-product boxes) — same partitioning, different picture. Rows-of-groups chart: **GAP** → `pane:pvgrid` rows-per-group mode (`support` on `multiplication:multiply`). Part-whole ×: GAP (next row). |
| 5 2-digit × 1-digit, with exchange | Chart with base-10 (4 rows of 24, exchange ones); chart with counters 45 × 3; **part-whole 24 → 20 and 4 with "× 8" arrows down to 160 and 32** (split-and-multiply); partition workings. | Area model: MATCH as S4. Split-and-multiply: **GAP** → new `template:split-op` (bond whose parts each carry an operator arrow to an answer box; payload op × or ÷) — serves B4 S4, S5, S7, S8. |
| 6 Link multiplication and division | **Array of ones counters** 2 × 4 and **the same array in tens counters** → four facts each. | MATCH `template:fact-family` + `template:arrays`; tens-counter array GAP (S2). |
| 7 2-digit ÷ 1-digit, no exchange | Packs of 10 + singles to share; **T\|O chart with counters in rows = groups, each row ringed**; **part-whole for division**: 48 on top, parts 40 and 8, each "÷ 4" arrow down to an answer box. Guide: T\|O chart + part-whole. | PARTIAL: `template:area-model` (`division:area_model_div_2by1`) and `division:box_division_easy`. Ringed chart: GAP (pvgrid rows mode). Split-and-divide: GAP → `template:split-op` (S5). |
| 8 ÷ flexible partitioning | Chart with a ten left over, then exchanged for 10 ones (second chart); part-whole with a friendlier split (32 → 20 + 12, each ÷ 2); three blank part-whole templates for 96. | As S7 (split-op GAP with a `split: 'friendly'` value). |
| 9 ÷ with remainders | Lolly sticks making squares (13 → 3 squares, 1 left); **NL 0–31 with repeated-subtraction back hops of 4 from 31 to 3**, the remainder ringed; chart with counters shared into 4 rows, remainder counters outside; "94 ÷ 4 = 23 r2". | MATCH `template:remainder` (counters to ring, "19 ÷ 3 = [ ] R [ ]", `division:div_remainders`). Hops with remainder: PARTIAL `template:hop-line` (exact division only) → allow a remainder landing on `division:nl_div`. Chart version: GAP (pvgrid rows mode). |
| 10 Scaling | Picture comparison (2 bananas vs 6 strawberries, "3 times as many"); **comparison bars "boys" = 1 box, "girls" = 3 equal boxes**; ribbon bars 6 cm vs 3 times as long with dashed guides at each 6 cm. | PARTIAL `multiplication:mult_comparison` (legacy, text-led). **GAP** → `model: 'bar'` option (one-box vs n-box comparison bar, labelled rows) on `mult_comparison` / `mult_comparison_plain`. |
| 11 How many ways | Pictures of T-shirts/shorts + **two-column listing table**; shape cards + digit cards; hats and scarves; snacks/drinks panels. | **GAP** → new skill `number_ops_mixed:combinations` using the data-table template (R58). |

## Block 5 — Spring 2 · Length and perimeter (12 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Measure in m and cm | Horizontal **cm ruler** (0–15, mm minor ticks, "cm" at 0) with a line / object from 0; lines at angles to measure with a real ruler (printed to scale); **vertical metre stick** (labelled every 10 cm) beside a child, dashed guide at the head → "__ m and __ cm". | Ruler: PARTIAL `measurement:reading_ruler` / `reading_ruler_hard` — **inches only**, legacy SVG. **GAP** → `units: 'in' \| 'cm' \| 'mm'` option on reading_ruler (kit template `ruler`: RP-? ruler rules §11.14; `start: 'zero' \| 'offset'`). Metre stick: **GAP** → same template, `orientation: 'vertical'`, scale 0–100 cm in 10s. Print-to-scale lines: GAP (hands-on page; needs true-mm printing). |
| 2 Measure in mm | mm rulers labelled 0 10 20 … 50; **double scale zoom** 0–1 cm over 0–10 mm with arrows A B C; short lines on a cm ruler; draw lines of given mm. Guide: count in 10s then 1s. | GAP (ruler template, `units: 'mm'`); double scale → R40. |
| 3 Measure in cm and mm | Objects (carrot, banana) on a cm ruler, **one not starting at 0** (dashed guides at both ends); lines to measure; object on a short ruler (3 cm 5 mm). | GAP (ruler `start: 'offset'`, answer "__ cm __ mm" two-box slot like the time/money slot). |
| 4 m, cm and mm | **Sorting table with three heads** (Metres \| Centimetres \| Millimetres); compare circles in mixed units; order cards. | Sort table: PARTIAL — the `hands-sort` page tag (cut-and-glue sort) exists; kit sort-table **GAP** (R72). Compare: MATCH `template:pv` compare look / `measurement:length_metric`. |
| 5 Equivalent lengths (m and cm) | **Conversion bar models**: a row of "1 m" cells over a bar of "100 cm" per cell (some blank); part-whole 260 cm → 200 cm + 60 cm; **striped measuring stick 0–2 m** (alternating 10 cm bands) to place cards; bar whole in cm over "m \| cm" parts. Guide: 1 m = 100 cm strip / double number line + part-whole. | Conversion: PARTIAL `measurement:length_metric` (`forms` cm↔mm, m↔cm; text only). **GAP** → `model: 'bars' \| 'double-line' \| 'bond'` option on length_metric (unit bars; double line R40; `template:bond` with unit labels). Striped stick: GAP (ruler template, `style: 'bands'`). |
| 6 Equivalent lengths (cm and mm) | Conversion bars (1 cm cells over 10 mm); **double number line mm above / cm below** (0–30 mm / 0–3 cm) with arrows; part-whole 68 mm → 60 mm + 8 mm. | As S5. |
| 7 Compare lengths | Mixed-unit conversion frames (3 cm 6 mm = __ mm); compare circles; order cards; taller/shorter sentences. Guide: convert-to-common-unit table. | MATCH-ish `measurement:length_metric` + compare circle; the common-unit table → R58. |
| 8 Add lengths | Box tower with dimension labels and bracket; two worked methods side by side; **bar models with unit heads** ("cm" whole over 11 cm \| 20 mm; "m \| cm" over 90 cm \| 20 cm \| 2 m); **table of jumps** (Child \| Jump 1 \| 2 \| 3 \| Total). Guide: bar model + column addition. | Column: MATCH `template:stack` (units after the answer, SL-9). Bars: PARTIAL `pane:bar`/`wpBar` (units in labels). Table: GAP (R58). |
| 9 Subtract lengths | Bar models (78 mm over 70 mm \| __ mm); objects (bottle, can) on cm rulers to compare; worked-method boxes. | As S8; rulers GAP (S1). |
| 10 What is perimeter | Outline shapes (rounded, open, sector, arrow, crescent…) — which have a perimeter; pairs to compare; **rectangle on 1 cm squared grid, edge ticks counted around** (scale key "1 cm"); rectilinear shapes on the grid. Guide: trace outline, count grid squares. | MATCH `area_perimeter:perimeter_grid`, `perimeter_intro` (`labels` option "Figure labels" all/some/none). "Has a perimeter?" open/closed sort: GAP (small option). |
| 11 Measure perimeter | Shapes drawn to scale (rectangle, triangle, kite, L-hexagons) to measure and label; square with two sides labelled; "__ + __ + __ + __ = __ cm" frame. | Labelled perimeter: MATCH `area_perimeter:perimeter` (`labels` all/some). Measure-from-print: GAP (hands-on, needs true scale). |
| 12 Calculate perimeter | Rectangles with two adjacent sides labelled (mixed units); square one side labelled; **rectilinear shapes with dimension arrows on every side, some missing**; triangle/pentagon with one unknown side and the perimeter given; worked box. | MATCH `area_perimeter:perimeter` (`labels: 'some'` = one length and one width). Rectilinear with missing sides / find-a-side-from-perimeter: PARTIAL (`area_perimeter:composite_shapes` is area) → add `task: 'missing-side'` to perimeter. |

## Block 6 — Spring 3 · Fractions A (10 steps)

All fraction visuals in the app are still **legacy** (`svg-fractions.js`: `fracBarHTML`, `fracCircleSVG`, coloured fills) —
the catalogue flags 358 skills with colour inside the visual. There is **no kit fraction template**. So
every fraction row below is at best PARTIAL until a B&W `template:fraction-bar` / `fraction-line` exists
(shaded parts in the single grey INK-3 or a hatch for photocopy mode). This is the single largest gap
in Year 3.

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Denominators of unit fractions | Shapes split into **equal and unequal parts** (bar of 5, grid, circle cut unequally, triangle, rectangle with a diagonal) — "which are split into equal parts?"; bars/circle with one part shaded ("which show 1/7?", with unequal distractors); shapes split into thirds vs not. Guide: one whole split into N equal parts, 1 shaded. | PARTIAL `fractions:identify`, `shade_fraction`, `shapes_early:partition_shapes` (legacy). **GAP** → kit `template:fraction-shape` (bar / circle / rectangle / triangle; `parts`, `equal: true\|false` non-examples, `task: 'name' \| 'shade' \| 'equal?'`). |
| 2 Compare & order unit fractions | Fraction cards matched to bars (same length, 1 part shaded); **pairs of stacked equal-length bars** (1/4 vs 1/5) + compare circle; **bar above a 0–1 number line** (fifths, eighths) stacked; order cards. Guide: two same-length strips stacked. | PARTIAL `fractions:compare`, `order_fractions` (legacy). GAP → `template:fraction-bar` `stack: 2` + compare circle. |
| 3 Numerators of non-unit fractions | Bar of 8 with 5 shaded (parts, shaded, numerator, denominator); square in quarters; **draw bar models** for 2/3, 4/5, 7/10; "which diagrams show 3/5?" — circle sectors, bar, 0–1 line with 1/5 marked, vertical strips, triangle in layers (incl. non-examples). | PARTIAL `fractions:write_fraction`, `shade_fraction`, `identify_nv`. GAP (as S1; `task: 'draw'` = empty bar). |
| 4 Understand the whole | Shaded grids/strips → "__ of the shape is shaded" with **empty fraction-frame boxes** (numerator/denominator); shade to complete the whole ("__ more needed"); fractions equal to 1 (6/_ …); **part-whole with fractions**: whole "1" or 5/5 on top, parts as fractions each with a mini bar in the circle. | Fraction frame: MATCH `template:equation` stacked fraction (TY-7). Whole: PARTIAL `composing:whole_as_fraction`, `compose_whole`. Fraction part-whole: **GAP** → `values: 'fraction'` on `template:bond`. |
| 5 Compare & order non-unit fractions | 2×2 grids shaded (1/4 vs 3/4); stacked equal bars (3/5 vs 4/5); **empty stacked bars for the pupil to shade** (7/8 vs 3/8); compare circles; order cards; same-numerator comparison bars (3/7 vs 3/5). | PARTIAL `fractions:compare`, `order_fractions` (legacy). GAP (fraction-bar, `task: 'shade'`). |
| 6 Fractions and scales | Shaded shapes; **metre sticks split into equal sections with a line above** (what fraction of a metre?); **measuring jugs (1 litre) with unlabelled equal marks and a water level**; jugs with scale only (how many parts); **dial weighing scales 0–1 kg** with the needle, marks in halves/quarters/thirds unlabelled; mass cards to order. Guide: scale as a fraction strip 0–1. | **GAP** (instrument templates R39, R43, R45 with fractional unlabelled marks). |
| 7 Fractions on a number line | 0–1 lines with N equal intervals (one with intervals marked by small arcs); count parts; **vertical number line**; lines with fraction labels **above** each tick and 0/1 below; draw lines split into N parts; fraction box "each interval is worth __". | PARTIAL `composing:fraction_number_line`, `fractions:fraction_nl_drag`, `graph_fractions` (legacy). **GAP** → kit `template:fraction-line` (`labels: 'all' \| 'ends' \| 'some'`, `task: 'label' \| 'read' \| 'draw'`, `orientation`). |
| 8 Count in fractions on a NL | **Fraction circles** (fifths) progressively shaded **above** a 0–1 line; 0 to 10/10 lines; count backwards with some labels; missing fractions (2/9, 3/9, _, 7/9); lines labelled at one tick only; two correct labellings (4/4 vs 1). | PARTIAL (as S7); the circles-above-line look → `support: 'circles'` on the fraction-line template. `patterns:count_by_fill`-style fraction count row: GAP (count-row with fraction values). |
| 9 Equivalent fractions on a NL | **Double (stacked) number lines 0–1 aligned** (halves over quarters) with a dashed box linking 1/2 and 2/4; thirds over sixths; blank stacked lines to label; tenths over fifths; fraction-box equations. | PARTIAL `fractions:equiv_frac_visual`, `equiv_frac_nv` (legacy bars). GAP → fraction-line `stack: 2`. |
| 10 Equivalent fractions as bar models | Bars split into 3 and 6 to shade 1/3 and 2/6; **pairs of stacked bars** (quarters over eighths…) with box equations; one bar with each part split further (dashed lines inside a shaded part); **fraction-wall stacks** (thirds/sixths/ninths/twelfths). | PARTIAL `fractions:equiv_frac_visual`, `select_equiv_frac` (legacy). GAP → fraction-bar `stack: 2..4` (= fraction wall) and `split: n` dashed subdivision. |

## Block 7 — Spring 4 · Mass and capacity (11 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Use scales | Tick lines with N intervals (how many parts); 0–100 line with a bracket "100" above the whole (divide to find the interval); end-labelled lines to label (0–100, 0–200, 50–150); arrows A/B/C; a paint blob covering a label. Guide: count the gaps, not the marks. | As B1 S3/S10 → **GAP** `number_sense:read_number_line` (add `task: 'hidden-label'`). |
| 2 Measure mass in grams | **Dial scales** (kitchen-scale: circular face, 0 at the top, labelled every 100 g or 10 g, a needle) with the object on top; **empty dials to draw the needle**; **two-pan balance** with an object vs gram weights (20 g, 50 g) — level = equal. Guide: dial "unrolled" as a straight NL. | PARTIAL `measurement:mass_volume_liquid` "Read the scale" (legacy coloured dial; `_p12Match` option). **GAP** → kit `template:dial` (face 0 at top, `max`, `interval`, `labels: 'all' \| 'some'`, `task: 'read' \| 'draw-needle'`, `support: 'unrolled'` = straight line under the dial). Balance: PARTIAL `measurement:heavier_lighter_visual` (K heavier/lighter) → **GAP** `template:balance` (two pans, weights labelled). |
| 3 Mass in kg and g | **Double scale line kg above / g below** (0–1 kg over 0–1,000 g; 0–2 kg over 0–2,000 g) with arrows; dials in g and in kg (1 kg halves); draw the needle for "1 kg and 700 g". Guide: kg arc unrolled as 0–1,000 g line. | GAP (R40 double scale; dial `units: 'kg+g'` with a two-box "__ kg __ g" slot). |
| 4 Equivalent masses | Sorting table "Equivalent to 1 kg \| Not"; part-whole 1 kg → 360 g + 540 g; pyramid of 100 g weights; dials in kg with quarter/half marks; bonds to 1,000 g. | Part-whole: MATCH `template:bond` (numbers with units). Sort table: GAP (R72). Dial: GAP. |
| 5 Compare mass | **See-saw** (tipped) heavier/lighter; two-pan balance equal; see-saw with labelled weights (200 g vs 100 g flour); compare circles in mixed units. | PARTIAL `measurement:heavier_lighter_visual`; GAP `template:balance` with `state: 'tipped-left' \| 'tipped-right' \| 'level'`. |
| 6 Add and subtract mass | Part-whole (5 kg → 2 kg, 3 kg; 550 g → 300 g, 250 g) + workings; dials to add; **bar models with a "?" whole**, comparison bar with a 500 g difference arrow, long bar split kg/g. Guide: bar model part-whole, NL for difference. | Bond: MATCH. Bars: PARTIAL `wpBar` (word-work). Dials: GAP. |
| 7 Capacity in ml | **Measuring jugs** (outline jug with handle, vertical scale on one side, only the top value labelled, minor marks unlabelled) — read capacity, **label the divisions**, read the water level; **empty jugs to shade** to a given amount; fully labelled jug (50 … 500 ml); frame "(end − start) ÷ intervals". Guide: jug/cylinder scale, marks between labels. | PARTIAL `measurement:mass_volume_liquid` "Read the graduated cylinder (mL)" (legacy). `measurement:capacity` is a sort (emoji, colour). **GAP** → kit `template:jug` (`shape: 'jug' \| 'beaker' \| 'cylinder'`, `max`, `interval`, `labels`, `task: 'read' \| 'label' \| 'shade'`), level = single grey fill. |
| 8 Capacity in l and ml | Jugs labelled 1 litre / 2 litres with unlabelled mid-marks to label; sets of beakers (1 litre + 100 ml beakers) to total; shade jugs to "1 l and 400 ml"; buckets. Guide: jug scale unrolled as a NL. | GAP (jug template, `units: 'l+ml'`). |
| 9 Equivalent capacities | 1,000 ml jug vs 1 litre jug (same scale, different labels); jugs read in ml; shade to 500 ml, 700 ml …; bonds to 1,000 ml. Guide: bar/NL partitioned in ml totalling 1,000. | GAP (jug); bonds MATCH `template:equation`. |
| 10 Compare capacity | Containers A–D (different shapes, same capacity) to order by volume; bath/cup/spoon; pairs of jugs with a compare circle; jugs with different scales to order. | GAP (jug); compare circle MATCH. |
| 11 Add/subtract capacity | Jug word problems; **part-whole** (5 litres → 3 l, 2 l; 900 ml → 500 ml, 400 ml) + workings; jug pair with a difference arrow; measuring cylinders X/Y/Z. | Bond MATCH; jugs GAP. |

## Block 8 — Summer 1 · Fractions B (6 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Add fractions | Paper-strip folding; word-unit analogies (1 egg + 2 eggs / 1 fifth + 2 fifths); fraction-box equations; **0–1 NL (fifths) with the two addends drawn as consecutive segments above the line** (2/5 + 1/5 = 3/5); blank lines to colour; draw bar models for sums. Guide: strip/bar, count shaded parts. | PARTIAL `fraction_operations:add_fractions_like`, `add_frac_like_nv` (legacy); unit-word analogies MATCH `placevalue:unit_form` style text. **GAP** → fraction-line `segments` task. |
| 2 Subtract fractions | Word-unit analogies; **bar with shaded parts, the parts taken away crossed out (X in cells)**; two-tone bar; two bars with a difference arrow; **fraction part-whole** (9/11 over 7/11 and _/11) → four facts. | PARTIAL `sub_fractions_like` (legacy). GAP → fraction-bar `cross: k`; fraction bond (B6 S4). |
| 3 Partition the whole | Bar with shaded/unshaded split (4/7 shaded, _/7 not); circle in eighths; triangle in quarters; **part-whole with whole "1" or 10/10**; bars of thirds/quarters/sevenths → complement to 1. | PARTIAL `fraction_operations:decompose_fractions`, `composing:compose_whole` (legacy). GAP (fraction bond). |
| 4 Unit fractions of a set | 12 apples → arrow → the same apples **ringed into 4 equal rows**; 10 marbles into 5 groups; **bar model split into 3 equal parts with base-10 drawn in each part** (1/3 of 69); "1/2 of 60" cards. Guide: bar in n parts + counters/base-10. | Ringed set: PARTIAL `fractions:fraction_of_set` (legacy) — kit `template:arrays` ringed groups could draw it → add `fractions:fraction_of_set` cell using `arrays`. Bar with base-10 in parts: **GAP** (bar `fill: 'base10'`). |
| 5 Non-unit fractions of a set | Apples ringed into 4 groups (3/4 of 12); marbles; **bar model whole 24 on top over 3 parts labelled 8 8 8, two parts shaded** + working box (24 ÷ 3 = 8, 8 × 2 = 16). | PARTIAL `fraction_of_set_hard`, `fraction_of_set_nv` (legacy). GAP (equal-parts bar with shaded parts). |
| 6 Reasoning with fractions of an amount | 2 rows of 10 apples (statements both ways); **analogue clock with minute marks** (2/3 of an hour); counters problems; multi-step word problems. Guide: bar with parts labelled and a "?". | Clock: MATCH `template:clock` (`support: 'ring'` minute ring). Bar: PARTIAL. Word problems: PARTIAL `fraction_operations:frac_word_problems` (legacy). |

## Block 9 — Summer 2 · Money (5 steps)

WRM uses UK £/p notes and coins. Our coins template offers `currency` plain / QAR / USD
(`_tmCurrency`), drawing coins as **plain value circles** (never realistic coins, RP-110). £/p maps
one-to-one onto riyal/dirham (100 per unit), so the representations are covered; GBP itself is not
offered and need not be (the school is in Qatar).

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Pounds and pence | Notes and coins matched to word cards (fifteen pounds / fifty pence); a jar of money "There is £__ and __p"; rows of notes + coins per person (named rows); fewest notes and coins; compare circle between two collections. Guide: sort into a pounds group and a pence group. | MATCH `template:coins` kind `count` (notes and coins in rows, highest first; `answer: 'two'` = "[ ] riyals [ ] dirhams"), kind `tally` (fewest coins, `measurement:make_change_least_coins`), `measurement:money_compare`. Word-card match: PARTIAL (hands-match page). |
| 2 Convert pounds and pence | Scattered coin field (count groups of 100p); coins in a boxed row → write in £ and p; match "£4 and 20p" to "420p"; mixed collections in boxes. Guide: circle groups of 100p; part-whole pounds \| pence. | MATCH `template:coins` kind `find` (circle every coin worth N) and `count`; `measurement:money_notation`. Conversion match: PARTIAL (text). |
| 3 Add money | Coin rows for two people → frames (£3 + £2 = £__; 30p + 10p = __p; £__ + __p = £__ and __p); **bar models** whole blank over "£4 and 30p \| £2 and 99p", a part shown as coins; price tags on items. Guide: part-whole pounds/pence. | MATCH `template:money-columns` (adding prices in columns, point track) and `template:coins`. Bar: PARTIAL `wpBar`. Part-whole with units: MATCH `template:bond`. |
| 4 Subtract money | **Part-whole models with coins/notes drawn inside the whole and one part** (other part blank); **open NL counting back** (−5p, −80p, −£2) and counting on (+15p, +£2) with money labels. Guide: part-whole + NL count on/back. | Coins in circles: GAP (bond `draw: 'coins'`). Open NL: PARTIAL `pane:openline` (not wired) → option on `measurement:money_change`. |
| 5 Find change | Price tags; **open NL count on** (+30p to £2, +£3 to £5); part-whole £5 → £4 + 100p with a working box; coins shown as change. Guide: NL count on + part-whole/bar (paid = cost + change). | MATCH `measurement:money_change` (`money-columns` change in columns), `measurement:enough_money`. Count-on line: PARTIAL (open line, as S4). |

## Block 10 — Summer 3 · Time (12 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Roman numerals to 12 | Numeral cards 1–12 matched to Roman cards; **clock face with Roman numerals** (some missing, to complete); Roman vs Arabic faces showing the same time; read Roman clocks; draw hands on blank Roman faces. Guide: clock face + value table I → XII. | Clock: MATCH `template:clock` (`response: 'draw'` blank face; `numerals` all/quarters/twelve). **GAP** → `numerals: 'roman'` value on `_tmNumerals`, and a small Roman-numeral match skill (`number_sense:roman_to_12`). |
| 2 Time to 5 minutes | Analogue clocks to read; **"past / to" half-shaded face** (right half "past", left half "to") with minute labels round the edge; blank faces to draw hands (5 past 5, quarter to 6); Roman faces. Guide: geared clock + 0–60 minute NL. | MATCH `template:clock` (`measurement:time_5min`, `support` "Minute ring" plain/ring, `response` write/draw). Past/to halves: **GAP** → hint pane `past-to` (face split by the 12–6 line, one half in the single grey) as a `support` value on the time skills. |
| 3 Time to the minute | **Timeline between two o'clocks**: an arc "44 minutes" past 3 and a second arc "__ minutes" to 4 (past/to as complement to 60); clock + worked count (5 × 5 = 25 + 2 = 27); faces with all 60 marks; draw hands (8 past 12, 4 to 4). | MATCH `template:clock` (`measurement:time_1min`) and `template:timeline` (hour-to-hour line with hops). Past/to complement arcs: PARTIAL (timeline duration mode) → `task: 'past-to'`. |
| 4 Read time on a digital clock | Analogue beside a **digital display** (seven-segment 11:10); match analogue to digital; digital → "__ minutes past __ / __ minutes to __"; draw hands from digital. | MATCH `template:clock` (`readoutSlot` digital readout, `measurement:time_analog_digital`, `time_match_clock`, `stimulus` option). |
| 5 Use a.m. and p.m. | Sort events into a **2-column table Morning (am) \| Afternoon (pm)**; analogue clock + a blank digital box to fill; time cards (earliest/latest). Guide: daily timeline midnight → noon → midnight. | Timeline: PARTIAL `template:timeline` (`noon` option "Cross 12 noon"). Day timeline 0–24 h: **GAP** (timeline `span: 'day'`). Sort table: GAP (R72). |
| 6 Years, months and days | Month names list; 2-col table Name \| Date; **calendar month grid** (Mon–Sun heads, dates) with questions; compare circles (6 days ○ 1 week). Guide: calendar + rhyme. | **GAP** → `template:calendar` (month grid, outline cells, weekday heads) + skill `measurement:calendar_read`. |
| 7 Days and hours | Calendar grid questions; fact boxes "1 week = 7 days", "1 day = 24 hours" used to fill conversions; compare circles. Guide: conversion ladder day × 24 → hours. | Conversions: PARTIAL `measurement:unit_conversions` (no time units) → add time units. Calendar: GAP. |
| 8 Start and end times | Start and finish **analogue pair** and **digital pair**; **timetable table** (Programme \| Start \| Finish \| Duration); **open timeline** hops (+35 mins to 3:00, +18 mins; +1 hour, +27 minutes) — hop to the next o'clock first. | MATCH `template:timeline` (`measurement:elapsed_find_duration`, mode `duration`; `notation` option analog/digital for start and end; "hop the hours, then the minutes" ruling Q5). Timetable table: GAP (R58). |
| 9 Durations | Word problems; table (Train \| Leaves \| Duration); two ways on an open timeline; **backwards timeline from the end time** (−12, −24 mins, −1 hour; start "?"). | MATCH `template:timeline` modes `later` / `earlier` / `start` (`measurement:elapsed_*`, `elapsed_find_start`). |
| 10 Minutes and seconds | Stopwatch activity cards; **stopwatch displays (00:02:05)** matched to words; **bar model of seconds**: four cells of 60 + 31 with a "seconds" brace + working box; compare circles. Guide: one 60-second bar per minute. | Stopwatch: **GAP** (digital readout `format: 'mm:ss'`). Unit bar: GAP (same unit-bar option as B5 S5). Compare: MATCH. |
| 11 Units of time | Unit word cards (seconds/minutes/hours) to complete sentences; longer/shorter cards; compare circles; 2-col table Activity \| Duration. Guide: conversion ladder s → min → h → day → week. | PARTIAL `measurement:time_sense`. Ladder: GAP (low priority). |
| 12 Solve problems with time | Roman-numeral reasoning; clock face (start) + digital display (end, 1:20 pm) → duration; parking tariff sign; order mixed-unit time cards. Guide: NL + bar (start · duration · end). | MATCH `template:timeline` + `template:clock`. |

## Block 11 — Summer 4 · Shape (10 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Turns and angles | Clock face (minute hand turned a quarter / half turn); **compass rose (N E S W)** — describe clockwise turns; pairs of segments — "which show an angle?". Guide: before → after pictures; clock hands clockwise. | **GAP** → skill `angles_lines:turns` (quarter/half/three-quarter/whole, clockwise/anticlockwise) drawing a compass rose and a before/after arrow; clock turns reuse `template:clock`. |
| 2 Right angles | 1 right angle = a __ turn; **right-angle checker** (a circle with a quarter cut out); **rectilinear U-shape with six right angles to mark with the square symbol**; shapes sorted into a table by number of right angles (0–4); crossing lines — count right angles; **square dot grid** with a line — draw a line to make a right angle. | PARTIAL `angles_lines:identify_angles` (legacy). **GAP** → angle-marking task (square corner symbol) and `template:dot-grid` (R68). |
| 3 Compare angles | Angles A–E (two rays with an arc) sorted into a **table "Less than \| Equal to \| Greater than a right angle"**; pairs with a compare circle; label acute/obtuse in pictures; table Acute \| Right \| Obtuse to draw into; draw a hexagon with given angles. Guide: checker: fits = right, smaller = acute, larger = obtuse. | MATCH-ish `angles_lines:identify_angles` (acute/right/obtuse; legacy, coloured). Sort table: GAP (R72). |
| 4 Measure and draw accurately | Lines above **cm rulers starting at 0**; lines at angles to measure; rectangle on 1 cm squared grid; draw lines of given lengths (5 cm, 60 mm, 7 cm 5 mm); nearest cm. | GAP (metric ruler, B5 S1); grid rectangle MATCH `area_perimeter:perimeter_grid`. |
| 5 Horizontal and vertical | Blue horizontal / red vertical lines; **table Horizontal \| Vertical**; label lines in pictures; shapes to draw **vertical / horizontal lines of symmetry**. | PARTIAL `angles_lines:identify_lines`, `symmetry`, `place_symmetry_lines` (legacy; colour for H/V must become a label, INK-1). |
| 6 Parallel and perpendicular | Pairs of segments at various orientations — parallel? perpendicular?; draw a parallel/perpendicular line; shapes (parallelogram, trapezium) to mark parallel sides with **arrow marks**; right-angle symbol in shapes; lines A–E on a **squared grid**. Guide: rulers/geostrips on a squared grid + right-angle corner. | PARTIAL `angles_lines:identify_lines` (legacy). Marking conventions (arrow ticks, square corner): GAP (task option). Squared grid: MATCH `pane:gridpaper` (not wired). |
| 7 Recognise and describe 2-D shapes | Name cards matched to shapes (incl. rotated rectangle, L-hexagon); name shapes; property sentences (It has __ angles / right angles / obtuse / acute / lines of symmetry); property list → draw the shape; compare two shapes. | MATCH `shapes_early:name_2d_shapes`, `shape_name_match_2d`, `count_sides_vertices_2d`, `shape_attributes`; `shapes_classify:classify_quads`. |
| 8 Draw polygons | **Square dot grid (dotty paper)** with marked vertices (×) to join (pentagon, quadrilateral); complete a square from two sides; draw given shapes on dotted paper; **2×2 Carroll diagram** (4 sides / not 4 sides × at least one pair of parallel lines / none). Guide: dotty paper + ruler; cm-squared paper. | **GAP** → `template:dot-grid` (square dot lattice at a fixed pitch, `task: 'join' \| 'complete' \| 'draw'`; key draws the shape) + `template:carroll` (2×2 labelled regions) for `shapes_classify`. |
| 9 Recognise and describe 3-D shapes | Solids matched to name cards; **property table (3-D shape \| edges \| faces \| vertices \| curved surfaces)** with a drawn solid per row; "This shape is a __. It has __ faces …"; real-object solids. Guide: real solids + opened-up net. | MATCH `shapes_early:name_3d_shapes`, `shape_name_match_3d`, `count_edges_faces_vertices`; nets `shapes_classify:net_identify`. Property table layout: GAP (R58). |
| 10 Make 3-D shapes | **Interlocking-cube constructions** (6 cubes, 10 cubes); **straw-and-marshmallow skeleton** cuboid; table (shape \| straws = edges \| clay = vertices); **nets** (cube cross, triangular pyramid, prism) to cut and fold. | Nets: MATCH `shapes_classify:net_identify` (identify, not cut-out). Skeleton / cube builds: GAP (hands-on page family, later). |

## Block 12 — Summer 5 · Statistics (6 steps)

| Step | WRM representations (how drawn) | Match |
|---|---|---|
| 1 Interpret pictograms | **Pictogram as a two-column table** (category \| symbols) with a **key box** (1 circle = 1 child; square = 5 books; symbol = 4 flowers) incl. **part symbols** (half/quarter). Guide: read the key, skip-count. | MATCH `graphs:pictograph` ("Each icon = scale"; legacy). Part-symbols: PARTIAL → `part: true` option. Emoji icons must become outline symbols (INK). |
| 2 Draw pictograms | Data table (category row + Number row) → draw with a given key (1 counter = 2 children); partially drawn pictogram with half symbols to complete; vertical pictogram. | MATCH `graphs:build_pictograph` (legacy). Orientation: PARTIAL → reuse the `bars` option vertical/horizontal. |
| 3 Interpret bar charts | **Vertical bar chart**, y-axis titled, scale 0–7 in 1s and 0–30 in 5s/10s with gridlines, bars with gaps, category labels, axis titles. Guide: trace the bar top across to the axis. | MATCH `graphs:bar_graph` (`bars` vertical/horizontal, AP2 `labels` all/some on axes). Legacy colour: bars must be outline / single grey. |
| 4 Draw bar charts | Data table → **partially drawn bar chart on a grid** (some bars given, others blank, labels missing); pictogram → bar chart; **tally chart (Sport \| Tally \| Total)** → bar chart; choose a scale (0–20 in 2s). Guide: squared grid, bars 2 squares wide, 1 gap. | MATCH `graphs:build_bar_graph`, `graphs:tally_chart` (legacy). |
| 5 Collect and represent data | **Blank tally charts** (Travel to school \| Tally \| Total) to collect then represent. | PARTIAL `graphs:tally_chart` (reads a given tally). Blank collect sheet: GAP (hands-on/data-table template R58). |
| 6 Two-way tables | **2×2 two-way tables** (Girls/Boys × Age 7/8; Year 3/4 × flavour; Glasses/No glasses **with a Total row and column to complete**). Guide: part-whole for a missing value. | **GAP** → skill `graphs:two_way_table` on the data-table template (R58), totals row/column, blanks anywhere, key = facsimile. |

---

## Every Year 3 representation (de-duplicated)

"Where" lists the first block/steps that use it. Status is the best match across the app.

| # | Representation | Where (Y3) | Status | Existing / proposed |
|---|---|---|---|---|
| R01 | Base-10 blocks to scale (read a picture) | B1 S1,4,5,9,12–13; B2 S2–S5,11–18; B4 S2,4 | PARTIAL | `pane:base10` (to 99, not wired); add `task:'read'` + hundreds to `template:base10` |
| R02 | Base-10 quick sketch (square/line/dot) | B1 S1,5,12 | MATCH | `pane:base10-quick`; draw: `template:base10` (`composing:base10_build`, `base10_build_hundreds`) |
| R03 | Place-value counters (disks) loose/in a row | B1 S8; B2 S2–S5 | MATCH | `template:pv` kind `disks` (`placevalue:place_value_disks`); `pane:disks` |
| R04 | H\|T\|O chart with counters (build/read) | B1 S8–S9,12; B2 S2–S5,11–18; B4 S4–S9 | MATCH / PARTIAL | `template:pv` `build` (`placevalue:pv_disks_build`); beside a calculation → wire `pane:pvgrid`/`disks` |
| R05 | Chart with plain unlabelled dots | B1 S8–S9; B2 S5 | GAP | option `disk:'value'\|'dot'` on place_value_disks / pv_disks_build |
| R06 | H\|T\|O digit chart / place heads | B1 S13; B2 S11–18 | MATCH | `_pvDigitSupport` `support:'chart'`; `template:stack` level 2 heads |
| R07 | Bead string (100) | B1 S1 | GAP | new `pane:beadstring` (tens alternating solid/hollow) |
| R08 | Bundles / packs of 10 and 100 | B1 S1,4,5; B2 S3–S4; B4 S1,7 | GAP | `objects` kind `bundles` (+ "100"/"10" packs) |
| R09 | Ten frame of counters | B1 S1 | MATCH | `template:tenframe`, `pane:tenframe` |
| R10 | Ten frame of PV counters (10s, 100s) | B2 S10; B4 S1 | GAP | `unit:1\|10\|100` option on `pane:tenframe` |
| R11 | Part-whole (cherry), 2 parts, numbers | B1 S2; B2 S1,5,7,21; B5 S5–6; B7 S4,6,11; B9 S3,5 | MATCH | `template:bond` (`composing:number_bonds`); fact family `template:fact-family` |
| R12 | Part-whole rotated / pictures (base-10, counters, coins) in circles | B1 S2; B2 S1,5; B9 S4 | GAP | bond `orientation` + `draw:'base10'\|'disks'\|'coins'` |
| R13 | Part-whole 3–5 parts | B1 S6–S7 | GAP | bond `parts:2..5` |
| R14 | Part-whole with fractions (whole 1, n/n) | B6 S4; B8 S2–S3 | GAP | bond `values:'fraction'` (stacked fractions, TY-7) |
| R15 | Split-and-operate part-whole (× / ÷ arrows) | B4 S4–S5,7–8 | GAP | new `template:split-op` |
| R16 | Area model | (B4 S4–S5 alternative) | MATCH | `template:area-model` (`multiplication:area_model_mult`, `division:area_model_div_2by1`) |
| R17 | Number line, end-labelled, intervals to label / arrows to read / place | B1 S3,10; B7 S1 | PARTIAL | `pv` `line-mark` (`number_sense:place_on_number_line`); new skill `number_sense:read_number_line` |
| R18 | Estimate on a number line (no/mid ticks) | B1 S11; B2 S20 | PARTIAL | `pane:round-line`, `pv` `estimate`; `ticks` option on read_number_line |
| R19 | Skip-count line / multiplication hops | B3 S6,10; B4 S9 | MATCH | `template:hop-line` (`nl_mult`, `nl_div`, `ticks`, `response`, `support` hop numbers); remainder landing PARTIAL |
| R20 | Open number line with labelled hops (bridge 10/100, count on/back) | B2 S6–S9,19,21; B9 S4–S5 | PARTIAL | `pane:openline` (not wired); `template:number-line` is 0–20 ticked → `line:'open'` option on nl_add/nl_sub/money_change |
| R21 | Bridging split under the sum (6 → 2 + 4) | B2 S6,8 | GAP | new mark pane `split` (support value on add/sub 1k) |
| R22 | Number track (row of boxes) | B1 S4,14; B2 S7; B3 S3–4; B4 S1 | MATCH | `template:seqstrip` (`counting:number_seq_fill`), `template:count-row` (`count_by_fill`, `count_by_tables`); 10-box rows PARTIAL |
| R23 | Hundred square / 1–50 grid (colour multiples) | B3 S3–4,11,14 | PARTIAL | `template:chartwindow`, `pane:hundreds`, `patterns:skip_count_grid` (legacy) → `task:'shade'` whole-chart |
| R24 | Two-tone 10×10 complement grid | B2 S19 | GAP | `pane:complement100` + new skill `addition:complement_100` |
| R25 | Bar model part-whole (whole over parts, blanks) | B2 S1,10–12,21–22; B5 S8–9; B7 S6; B9 S3 | PARTIAL | `template:word-work` `wpBar`, `pane:bar` (not wired), `algebra:tape_diagram` (legacy) |
| R26 | Comparison bar (two bars, "?" difference arrow) | B2 S12,15–18,22; B7 S6 | MATCH / PARTIAL | `wpBar` compare look; not on non-word skills |
| R27 | Equal-parts bar (÷, fraction of amount) incl. counters/base-10 inside parts | B3 S5,7–8,13; B8 S4–5 | GAP | `model:'bar'` on share_into_groups / div_equation_parts / fraction_of_set; `fill:'counters'\|'base10'` |
| R28 | Scaling comparison bar (1 box vs n boxes) | B4 S10; B4 S3 stacked | GAP | `model:'bar'` on `multiplication:mult_comparison` |
| R29 | Unit-conversion bars (1 m cells over 100 cm; 60-s cells) | B5 S5–6; B10 S10 | GAP | `model:'bars'` on `measurement:length_metric`, time conversions |
| R30 | Column method on squared grid with place heads | B2 S11–18; B5 S8 | MATCH | `template:stack` (`level`, `regroup`), `pane:gridpaper` |
| R31 | PV chart beside the column with exchange ring + arrow + totals row | B2 S13–18; B4 S5,8 | GAP | new `pane:pv-exchange` |
| R32 | Crossed-out counters / blocks (take away) | B2 S3–4,12,15–16; B8 S2 | PARTIAL | `template:counters` `takeaway` (K–2 objects); add to `pane:disks`/`base10` and fraction bars |
| R33 | Missing-digit boxes (row or column) | B2 S3,11–18 | MATCH | `addition:add_missing_digit`, `subtraction:sub_missing_digit` (VA-7) |
| R34 | Compare circle (< > =) between expressions/pictures | B1 S12; B2 S2–4,20; B3 S8; B5 S4,7; B7 S5,10 | MATCH | equation frame (sign in a circle); `template:pv` `compare`; pictures PARTIAL |
| R35 | "−n \| Number \| +n" table | B1 S9; B2 S2–4 | GAP | `layout:'table'` on `placevalue:more_less_10/100`, `addition:add_sub_10s/100s` |
| R36 | Function machine chain | B1 S9; B2 S5; B3 S12 | PARTIAL | `template:function-table` (hidden `pictures` "Machine picture") → chained look |
| R37 | Equal groups (objects in rings, plates, bags) | B3 S1,6,9–10,12; B4 S2 | MATCH | `template:arrays` groups, `pane:objects` op `*`, `multiplication:equal_or_unequal_groups` |
| R38 | Arrays (rows/columns; split array; hidden part) | B3 S2,8–9,11,14–15; B4 S2–3,6 | MATCH / PARTIAL | `template:arrays`, `pane:array`, `pane:area`; split/hidden PARTIAL |
| R39 | Arrays / groups of PV counters (tens) | B4 S2,6 | GAP | `counter:'one'\|'ten'` on `template:arrays` |
| R40 | Sharing vs grouping counters; remainder counters | B3 S5,7,10,13; B4 S9 | MATCH | `template:counters` `share`, `template:remainder` |
| R41 | Linking-cube towers / cube builds | B3 S6,15; B11 S10 | GAP | `objects` kind `cubes` |
| R42 | Multiplication grid (partial headers) | B3 S14–15 | MATCH | `template:mult-grid`, `template:mult-chart` (`mult_chart`, `chart` window/whole) |
| R43 | Venn diagram (2 sets) | B3 S4 | GAP | new `template:venn` |
| R44 | Carroll diagram (2×2) | B11 S8 | GAP | new `template:carroll` |
| R45 | Stacked halving bar | B3 S13 | GAP | low priority (bar stack) |
| R46 | Ruler, cm with mm (object/line; offset start) | B5 S1–3,9; B11 S4 | PARTIAL | `measurement:reading_ruler` is inches, legacy → kit `template:ruler` `units`, `start` |
| R47 | Metre stick (vertical; striped 0–2 m) | B5 S1,5; B6 S6 | GAP | `template:ruler` `orientation`, `style:'bands'` |
| R48 | Double scale / double number line (cm\|mm, kg\|g, m\|cm) | B5 S2,5–6; B7 S3 | GAP | `template:double-scale` (`conversions:double_num_line` is ratio, G6) |
| R49 | Dial weighing scale (read / draw needle; fractional marks) | B6 S6; B7 S2–6 | PARTIAL | `measurement:mass_volume_liquid` "Read the scale" (legacy) → kit `template:dial` |
| R50 | Balance / see-saw with weights | B7 S2,5 | PARTIAL | `measurement:heavier_lighter_visual` (K) → `template:balance` |
| R51 | Measuring jug / beaker / cylinder (read, label, shade) | B1 S14; B6 S6; B7 S7–11 | PARTIAL | `mass_volume_liquid` "graduated cylinder" (legacy) → kit `template:jug` |
| R52 | Perimeter on squared grid; labelled / rectilinear polygons | B5 S10–12; B11 S4 | MATCH / PARTIAL | `area_perimeter:perimeter_grid`, `perimeter_intro`, `perimeter` (`labels`); missing-side task PARTIAL |
| R53 | Fraction shapes (equal / unequal parts, shade) | B6 S1,3–5; B8 S3 | PARTIAL | legacy `fractions:identify`, `shade_fraction`, `shapes_early:partition_shapes` → kit `template:fraction-shape` |
| R54 | Fraction bars / strips, stacked, fraction wall | B6 S2–5,10; B8 S1–2 | PARTIAL | legacy `fractions:compare`, `equiv_frac_visual`, `fraction_bar_ops` → kit `template:fraction-bar` |
| R55 | Fraction number line 0–1 (labels, count, circles above, segments) | B6 S7–8; B8 S1 | PARTIAL | legacy `composing:fraction_number_line`, `fractions:fraction_nl_drag` → kit `template:fraction-line` |
| R56 | Double fraction number lines (equivalence) | B6 S9 | PARTIAL | legacy `equiv_frac_nv` → fraction-line `stack:2` |
| R57 | Fraction of a set (objects ringed into groups) | B8 S4–5 | PARTIAL | legacy `fractions:fraction_of_set` → reuse `template:arrays` ringed groups |
| R58 | Data / listing table with blanks (conversions, timetable, jumps, 3-D properties, combinations, tally collect) | B1 S5; B4 S11; B5 S7–8; B10 S8–9,11; B11 S9–10; B12 S5 | GAP | new `template:data-table` (ruled table, heads, blank cells = writing boxes) |
| R59 | Sort table (2–3 labelled columns) | B5 S4; B7 S4; B10 S5; B11 S2–3,5 | PARTIAL | `hands-sort` page tag exists; kit `template:sort-table` GAP |
| R60 | Analogue clock (Arabic; draw hands; minute ring) | B8 S6; B10 S1–4,8,12 | MATCH | `template:clock` (`response`, `numerals`, `support` minute ring) |
| R61 | Roman-numeral clock face | B10 S1–2 | GAP | `numerals:'roman'` on `_tmNumerals` |
| R62 | Past/to half-shaded face | B10 S2 | GAP | hint pane `past-to` |
| R63 | Digital clock readout | B10 S4–5,8,12 | MATCH | `template:clock` `readoutSlot`, `measurement:time_analog_digital`, `stimulus` |
| R64 | Time line (to next hour; elapsed hops forward/back) | B10 S3,8–9,12 | MATCH | `template:timeline` (modes later/earlier/duration/start; `noon`, `notation`) |
| R65 | Day timeline (midnight–noon–midnight) | B10 S5 | GAP | `template:timeline` `span:'day'` |
| R66 | Calendar month grid | B10 S6–7 | GAP | new `template:calendar` + `measurement:calendar_read` |
| R67 | Stopwatch display (mm:ss) | B10 S10 | GAP | digital readout `format:'mm:ss'` |
| R68 | Coins and notes (count, find, fewest, order, change) | B1 S14; B3 S1; B9 S1–5 | MATCH | `template:coins` (count/find/order/tally), `template:money-columns`; `currency` plain/QAR/USD (no GBP — not needed) |
| R69 | Price tags on items | B9 S3–5 | PARTIAL | money word problems (`template:word-work`) |
| R70 | Pictogram with key (part symbols; vertical) | B12 S1–2 | MATCH / PARTIAL | `graphs:pictograph`, `build_pictograph` (legacy); part symbols + orientation PARTIAL |
| R71 | Bar chart (read / draw on grid; scales 1,2,5,10) | B12 S3–4 | MATCH | `graphs:bar_graph`, `build_bar_graph` (`bars` vertical/horizontal; legacy colour) |
| R72 | Tally chart | B12 S4–5 | MATCH | `graphs:tally_chart` (legacy) |
| R73 | Two-way table with totals | B12 S6 | GAP | new skill `graphs:two_way_table` on R58 |
| R74 | Angles (two rays + arc), right-angle checker, square-corner mark | B11 S1–3,6 | PARTIAL | `angles_lines:identify_angles` (legacy); marking task GAP |
| R75 | Line pairs: parallel / perpendicular / horizontal / vertical; arrow marks | B11 S5–6 | PARTIAL | `angles_lines:identify_lines` (legacy) |
| R76 | Lines of symmetry on shapes | B11 S5 | PARTIAL | `angles_lines:symmetry`, `place_symmetry_lines` (legacy) |
| R77 | Square dot grid (dotty paper) — join / complete / draw polygons | B11 S2,8 | GAP | new `template:dot-grid` (`pane:gridpaper` = squares only) |
| R78 | 2-D shapes: names, properties | B11 S7 | MATCH | `shapes_early:name_2d_shapes`, `shape_attributes`, `count_sides_vertices_2d`, `shapes_classify:classify_quads` |
| R79 | 3-D solids, properties, nets | B11 S9–10 | MATCH | `shapes_early:name_3d_shapes`, `count_edges_faces_vertices`, `shapes_classify:net_identify` |
| R80 | Compass rose / turns | B11 S1 | GAP | new skill `angles_lines:turns` |
| R81 | Digit / number / operation cards and box templates ("3[ ][ ] + [ ]") | B1 S1,6; B2 S6,9,22 | PARTIAL | `template:cloze-bank`; digit-card box template GAP (hands-on) |
| R82 | Grouped-object pictures for word problems (jars, bags, egg boxes, packs) | B2–B4, B7, B9 | PARTIAL | `pane:objects` / `template:wordpic` (K); Y3 picture support = `pictures` option on word skills |
| R83 | Journey / distance line (towns, km segments) | B2 S22 | GAP | low priority (bar-model variant) |
| R84 | Path / maze grid of operations | B2 S4 | GAP | low priority (stretch page) |

**Counts (84 representations):** MATCH 22 · MATCH/PARTIAL 5 · PARTIAL 24 · GAP 33.
Of the PARTIAL rows, about 9 close by **wiring existing panes** as `support` values (R01, R04, R20, R25, R30-grid,
R32, R34-pictures, R38, R52-grid) and 12 are **legacy visuals** that need the kit/B&W migration (fractions R53–R57,
measurement R46/R49–R51, graphs R70–R72, angles R74–R76).

**Suggested build order (by Year 3 reach × effort):**
1. Wire the existing panes (base10, base10-quick, disks, pvgrid, openline, bar, gridpaper, hundreds) as
   `support` values on the Y3 place-value and add/sub skills — no new drawing.
2. `template:fraction-bar` + `fraction-shape` + `fraction-line` (B&W) — unlocks all of B6/B8 (16 steps).
3. Number-line reading skill `number_sense:read_number_line` (R17/R18) — B1 S3/S10/S11, B7 S1 and the
   scale-reading grammar reused by every instrument.
4. Instrument templates `ruler` (cm/mm, metre stick), `jug`, `dial`, `balance`, `double-scale` — B5 and B7
   (23 steps) and B6 S6.
5. `bond` options (`parts`, `orientation`, `draw`, `values:'fraction'`) + `template:split-op` — B1 S2/S6/S7,
   B4 S4–S8, B6 S4, B8 S2–S3.
6. `template:data-table` (+ two-way, sort-table, calendar) and `venn`/`carroll`/`dot-grid`.
7. Smaller options: tens-counter arrays/ten frames, more/less table layout, Roman numerals, past/to pane,
   stopwatch, bead string, bundles, cube towers, bridging split, PV-exchange pane.

---

## Method notes (for fanning out to the other years)

**What to open per step.** In each block folder the file `NN Step N <title>.pdf` (≈0.8–3.8 MB, 3 pages
landscape) is the WRM small-step page: p1 notes and guidance (text), **p2 Key learning** and **p3
Reasoning and problem solving** — both are images and show every representation the lesson uses. That
is the file to render. The per-step `… - Teaching Guide.pdf` (≈280 KB) is text; its "Key model" line
names the representation WRM leans on and what it deliberately avoids (e.g. "no place-value counters
yet" in B1 S1) — read it first. The teaching-slide `.pptx` decks (8–14 MB) and worksheets repeat the
same models and were not needed; the 19 MB `00 Scheme of learning.pdf` is over the 10 MB download cap.

**Finding the files.** One Drive query per block lists both the guides and the step PDFs:
`parentId = '<block>' and mimeType = 'application/pdf' and title contains 'Step' and not title contains
'Worksheet' and not title contains 'Answers' and not title contains 'Pre-teach' and not title contains
'false'`. The first page of results returns only 5 files; the second (via `pageToken`) returns the rest.
List the Year folder with `parentId = '<year>'` (also paginated) to get the block ids.

**Tooling.** `download_file_content` returns base64 JSON; anything over the token limit is saved by the
harness to `~/.claude/projects/<session>/tool-results/mcp-Google_Drive-download_file_content-<ms>.txt`.
A small script (`decall.py`) decodes every saved result to `<scratch>/wrm/y3/<title>`, deletes the
result file, and for each Teaching Guide extracts the text with PyMuPDF and prints only the
"Key model" and "Avoid" lines (≈80 tokens per guide instead of ≈4 k for `read_file_content`). Rendering:
**PyMuPDF (`pymupdf` 1.28)** — `pdftoppm`, `pypdfium2` and `pdf2image` are not installed. `multi.py`
renders chosen pages at 52 dpi and tiles them 2 × 3 into one PNG (1218 × 1290 px): three steps (p2 + p3)
or six key-learning pages per image, which is fully legible and costs one `Read` call. No browser was used.

**Time and cost.** A 10–15-step block took ~6–10 minutes wall-clock: 1–2 list queries, one parallel batch
of guide downloads, one decode, two parallel batches of step-PDF downloads, and 2–3 contact-sheet reads.
Year 3 (134 steps) needed ≈ 290 tool calls and ≈ 400 k tokens; the image reads are ~1.5 k tokens each.
Delete each block's PDFs after viewing (disk stays under 20 MB).

**Pitfalls.**
- **Saved-result filename collision:** two downloads that finish in the same millisecond write the same
  `…-<ms>.txt`, so one file is lost (happened twice: B2 guide 21, B12 step 5). After decoding, check
  the file count against the number of downloads and re-download the missing one.
- Guides come in two formats: Guide D ("Key model: … Biggest Errors") and an older one ("KEY MODEL …"
  upper-case, or no model line at all in B3 S8–S15). Match case-insensitively and fall back to a
  keyword window ("array", "bar", "number line", "counters").
- `read_file_content` on a guide works but costs ~4 k tokens; downloading + local extraction is cheaper.
- Pages are colour-coded by WRM; our standard is B&W — catalogue the *structure* (orientation, what is
  labelled, what is blank, the task), never the colour or characters.
- WRM number ranges and currency are UK (Year N = US grade N−1; £/p): map to our bands and `currency`
  option rather than flagging them as gaps.
- Step 20 of B2 was missing from the first listing page; search `title contains 'Step 20'` when a number
  is skipped.
