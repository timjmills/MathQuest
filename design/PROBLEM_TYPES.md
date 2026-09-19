# MathQuest Problem Types, Response Modes and Representations

This document is the content catalogue for the MathQuest sheet system. It lists every problem type the
generators must be able to produce, every way a pupil can answer (on paper and on screen), every diagram or
manipulative the renderers must be able to draw, the variant axes each generator must expose, and the problem
types MathQuest still lacks, in build order. It says WHAT is asked and HOW it is answered; page geometry, type
sizes and pedagogy rules live in the related documents. An implementer must be able to build from this file
without seeing any reference workbook.

## Related documents

- `WORKSHEET_DESIGN_STANDARD.md` (repo root) - the visual contract: tokens, two looks, header, cells, answer-slot shapes, line styles, grey / hatch, capacity tables.
- `PEDAGOGY_STANDARD.md` (repo root) - the teaching rules: lesson cycle, fade ladder, review cadence, instruction library, word-problem system.
- `design/PAGE_TYPES.md` - every page role with anatomy drawing, geometry table and options.
- `design/PROBLEM_TYPES.md` - this document.
- `design/EXTENSION_PLAYBOOK.md` - how the house style extends to domains the reference workbooks barely cover.
- `design/SKILL_CELL_CONTRACT.md` - the data contract (`q.cell = { template, payload }`) that lets any skill appear on any page type.

Where this document and `WORKSHEET_DESIGN_STANDARD.md` disagree on a measurement, the design standard wins.
Where this document and `PEDAGOGY_STANDARD.md` disagree on sequencing, the pedagogy standard wins.

## 0. Conventions used in this document

### 0.1 Rule and item ids

| Prefix | Meaning | Section |
|---|---|---|
| `PT-G-nn` | General rule for all problem types | 0.3 |
| `CC- PV- RD- FF- AS- MU- DV- EQ-` | Problem types: counting, place value, rounding + estimation, fact fluency, add/subtract computation, multiplication, division, unknowns + equality | 1 |
| `FR- FO- DE- RP- IN-` | Problem types: fraction concepts, fraction operations, decimals, ratio + percent, integers | 1 |
| `TM- MN- ME- GE- AP- AN- CO-` | Problem types: time, money, measurement, shapes, area/perimeter/volume, angles + lines, coordinates + transformations | 1 |
| `DA- ST- PB- PA- AL- OO- NT- VO- WP- TH-` | Problem types: graphs, statistics, probability, patterns, algebra, order of operations, number theory, vocabulary, word problems, thinking (retrieval + reasoning) | 1 |
| `RM-nn` | Response mode | 2 |
| `RL-nn` | Representation (library entry) | 3 |
| `VA-nn` | Variant axis | 4 |
| `GAP-f-nn` | Coverage gap, `f` = rollout family number | 5 |

### 0.2 Columns of the catalogue tables

| Column | Meaning |
|---|---|
| Id / Name | Stable id plus a plain name. The name is a description, not a pupil-facing title. |
| Level | Level band K, 1..6 ("Level N" is what pupil pages say; grade and CCSS code appear only in the teacher footer). |
| Representation | Library entry from section 3 (`RL-nn`), or "none" for bare symbols. |
| Format | How items sit on the page: `cells RxC` (ruled cell grid), `rows` (full-width rows), `band` (one full-width strip), `table`, `fact grid` (high-column fact layout), `page` (one item fills the page), `pair` (two per page). These are defaults; the page role may override the count, never the cell anatomy. |
| Response | Response mode from section 2, by short name. |
| Today | MathQuest skill ids (from `SKILLS` in `js/modules/data.js`) that already generate this type in whole or in part, or **NEW**. "partial" means the skill exists but lacks the listed representation, response mode or variant control. |

Skill ids are written exactly as they appear in `data.js`. Two ids are reused across categories (`identify`,
`compare`); they are written `fractions:identify`, `placevalue:identify`, `fractions:compare`, `placevalue:compare`.

### 0.3 General rules for every problem type

| Id | Rule |
|---|---|
| PT-G-01 | A problem type is data: a generator returns a payload (numbers, unknown position, representation, scaffold state); it never returns baked HTML, colour, emoji or a title string. Rendering belongs to the cell template. |
| PT-G-02 | Any problem type can be placed on any page type (opener, scripted model, guided, independent, more practice, sub-skill / decision, error analysis, review, test A/B, pre-skill check, daily spiral panel, mixed practice, Daily 4, True or False?, Reason It, Stretch, word problem). A type that cannot supply a given adapter (for example `decision`) is simply not offered on that one page type. |
| PT-G-03 | Fact and operations types (`FF-*`, and `AS- MU- DV-` items whose operands are all single facts) are "fact-like". Fact-like types additionally get the high-column fact layouts (fact rows 5-10 columns, fact probe, fact-family intro / warm-up / probe, practice strips). They still obey PT-G-02. |
| PT-G-04 | The answer-slot shape tells the answer type: line = number, square box = one digit or one missing number, circle = sign or comparison symbol, fraction bar = fraction, `__:__` = time, number line + printed unit word = measured quantity, hollow square check box = decision. A generator names the slot type; it never draws it. |
| PT-G-05 | No item tells the pupil the answer through its picture. Visuals that would reveal the answer (a filled count label, a pre-shaded target) are payload state `answered` only and are used on answer keys and Model cells. |
| PT-G-06 | No grade, CCSS code, skill id or strand name appears inside a cell. |
| PT-G-07 | Instruction text is one line of 12 words or fewer per section (one to three short imperative sentences), taken word for word from the controlled library in `PEDAGOGY_STANDARD.md`. Pupils never compose sentences; every written response is a number, a symbol, a word from a bank, a mark, or a number inside a printed sentence frame. |
| PT-G-08 | Pictures are functional line art in black plus the single 40% grey (or its photocopy-safe hatch). Counting objects come from the teacher-chosen set: plain counters, or the 8 in-house pictures (star, apple, fish, car, ball, flower, turtle, block). One kind of object per cell. |
| PT-G-09 | Money items use generic value-circles 1, 5, 10, 25 only. No national coin art, no currency names in cells. A currency sign may appear only inside word-problem text. |
| PT-G-10 | US conventions: "regroup", comma thousands separator, US long-division bracket, customary and metric units. |
| PT-G-11 | Content never shrinks to fit. A type declares its footprint; the page role paginates or lowers the item count. |
| PT-G-12 | Every type that has a Model form supplies one fully worked item in trace style (grey digits, or dotted outline digits in photocopy-safe mode) and one blank item of identical layout. |
| PT-G-13 | No problem type records, graphs or reports a pupil's progress. There are no tracker, goal, log or mastery-gate types in this catalogue. |

---

## 1. Problem-type catalogue by domain

Response names in the tables are the short names defined in section 2. Representation names are the `RL` entries
of section 3. Levels are typical; the ladder data decides the real placement.

### 1.1 Counting and cardinality (MathQuest categories `counting`, `comparing`, `composing`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| CC-01 | Count a set, choose the numeral | K | RL-01 counting objects, 1-10, dice-style scatter up to 5, rows of 3-5 above | cells 2x3, choice row of 3-5 consecutive numerals under the picture | circle-one | `count_objects` (partial: answer is typed) |
| CC-02 | Count a set, write the numeral | K-1 | RL-01, 5-20 objects in rows of 5 | cells 2x2 or 2x3, one square answer box bottom centre | write | `count_objects` |
| CC-03 | Draw that many | K | numeral on a rounded plate; first cell shows dotted placeholders | cells 2x3, at least 60% of the cell empty | draw-counters | NEW |
| CC-04 | Match a dot pattern or object row to a numeral | K | RL-02 dot tiles or RL-01 rows, anchor dot beside each item | two columns, 5 pairs, wide empty channel | match | NEW |
| CC-05 | Take N from a larger set | K-1 | row of 10 or 20 identical objects, first row pre-ringed in the Model | rows, 3-6 per page | ring-groups | NEW |
| CC-06 | Find the target numeral | K | row of 7-10 widely spaced large numerals, target recurs 3-4 times | band | circle-all | NEW |
| CC-07 | Numeral formation | K | stroke-order model with numbered arrows; boxes with a start dot alternate trace and copy | band of 5 boxes | trace, write | NEW |
| CC-08 | Numerals in order | K-1 | 5-6 boxes, first pre-filled in trace; tile strip at page foot (hands-on form) | band + tile strip | cut-paste (print), order (screen) | NEW; nearest `number_seq_fill` |
| CC-09 | Count on / count back / count from A to B | K-3 | RL-10 number track, or none | band with a ruled line or 7 short baselines, anchors pre-written; backward versions anchor the END | write, oral | `count_sequence`, `number_seq_fill`, `count_by_step_up`, `count_by_step_down` |
| CC-10 | Before / after / between; 1 more, 1 less | K-1 | RL-10 track band at top; blank sits on the meaningful side of the numeral | cells 4x2 | write | `count_sequence`, `more_less_10` |
| CC-11 | Which is more (picture bars) | K | RL-24 picture bars on one baseline, one object per unit | 2 tall cells + 1 wide cell | circle-one | `compare_groups` (partial) |
| CC-12 | Compare two groups: how many more | K-1 | two tall rounded columns, objects stacked from the bottom | count boxes, then a sentence frame with one blank | write, circle-one, frame | `compare_groups`, `comparison_word` |
| CC-13 | Compare attributes (longer, taller, heavier) | K | RL-01 object pairs on a shared baseline | cells 2x3 | circle-one | `compare_objects`, `heavier_lighter_visual` |
| CC-14 | Sort and count by category | K-1 | mixed set of 2-3 object kinds + a 2-3 row count table | band + table | table-fill, tally | `classify_count` |
| CC-15 | 120-chart missing numbers | 1 | RL-11 chart, 8-30 blanks clustered in the target band | page, with a bottom strip of four 1/10 more/less prompts | table-fill | `hundreds_chart_fill` (partial: one blank at a time) |
| CC-16 | Hundred-chart fragment | 2-3 | RL-11 fragment: 4-7 joined cells cut from the chart, 1-2 numbers given | band of 3-4 fragments | table-fill | NEW |
| CC-17 | Ten frame: how many / build | K-1 | RL-03 ten frame | cells 2x3 | write, draw-counters | `ten_frame_build`, `ten_frame_build_teen` |
| CC-18 | Number bonds within 5 / 10 | K-1 | RL-08 part-whole | cells 2x3 | write | `number_bonds`, `make_ten` |
| CC-19 | Teen numbers as ten and ones | K-1 | RL-03 double ten frame or RL-05 rod + units | cells 2x3, frame "10 + __ = __" | write, frame | `teen_compose`, `tens_foundation_visual` |
| CC-20 | Odd or even | 1-2 | RL-01 counters paired in two rows, or none | cells 2x4 / scatter field | circle-one, circle-all | `odd_even`, `select_even_odd` |
| CC-21 | Number word to numeral and back | K-2 | none | cells 2x4 or match columns | write, match, label-bank | `number_word_form`, `number_word_names` |

### 1.2 Place value and number sense (`placevalue`, part of `composing`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| PV-01 | Base-10 picture to numeral | 1-3 | RL-05 blocks | cells 2x3 | write | `base10_build` (reverse direction), `tens_foundation_visual` |
| PV-02 | Numeral to quick-draw | 1-3 | RL-05 quick-draw (open square, stick, open dot); first cell pre-drawn | cells 2x3, 60% empty | free-draw (print), draw-counters (screen: tap to add flat / rod / unit) | `base10_build`, `base10_build_hundreds` |
| PV-03 | Circle the blocks needed | 2-3 | fixed bank: 3 flats, 3 rods, 3 units (+3 thousand cubes at Level 3) | band, one third of page | circle-all | NEW |
| PV-04 | Word form into a place-value chart | 2-5 | RL-06 chart, comma pre-printed, up to hundred millions | band | digit-grid | `pv_digit_drag` (partial) |
| PV-05 | Number dictation | 2-5 | lettered rules or chart rows | band | oral -> write (print: teacher reads; screen: TTS reads) | NEW |
| PV-06 | Expanded / standard / word form | 2-5 | none, or RL-05 blocks in a labelled chart where an empty column shows the zero | frame "n = __ + __ + __"; two-way table; scrambled addends incl. zero places | write, table-fill | `expand`, `combine`, `number_word_form` |
| PV-07 | Unit form and non-standard decomposition | 2-5 | none, or a 3-column chart to draw in | frames "__ hundreds __ tens __ ones", "__ tens __ ones" with more than 9 ones | write, frame | NEW |
| PV-08 | Place-value number bond | 2-3 | RL-08 tree: whole over hundreds / tens / ones | cells 2x3 with a unit-form line | write | NEW |
| PV-09 | Place and value of a marked digit | 2-5 | underline under the digit | choose 1 of 3 (6 / 60 / 600), or a two-column Place / Value table | circle-one, table-fill | `placevalue:identify`, `value` |
| PV-10 | Compare two numbers, optional support | 1-5 | open circle 1.6x digit height; support = block chart under each number, or a stacked rewrite grid (RL-07) | rows, 6 per page, first worked | rewrite, write-symbol | `placevalue:compare` |
| PV-11 | Compare mixed representations | 2-5 | one side numeral, other side unit form / expanded form / blocks | rows | write-symbol | NEW |
| PV-12 | Order 3-4 numbers | 2-5 | none | row of quantities, then one rule per position | order | `order_least_to_greatest`, `order_greatest_to_least` |
| PV-13 | 1 / 10 / 100 more and less | 2-4 | per-digit boxed number, active place bold; hop arrows | band, or grid table, plus inverse frames "__ more than a is b" | write, table-fill | `more_less_10`, `more_less_100`, `add_sub_10s`, `add_sub_100s` |
| PV-14 | x10 / ÷10 unit-form table | 4-5 | table, first row worked | table | table-fill | `place_value_10x` (partial) |
| PV-15 | Shift digits on a chart (x / ÷ 10, 100, 1,000) | 5 | RL-06 chart with shift arrows + one sentence frame | cells 2x2 | digit-grid, frame | `place_value_10x` |
| PV-16 | Place-value disks: read / build | 2-4 | RL-06 chart with counters | cells 2x2 | write, draw-counters | `place_value_disks`, `pv_disks_build` |
| PV-17 | Cross out the unneeded zero / put in the comma | 1-4 | bare large numerals; Model shows a dotted X | cells 2x3 or strip | cross-out, write | NEW |
| PV-18 | Layered place-value strips | 2-4 | RL-09 strips (hands-on family) | page | layer, write | NEW (later family) |
| PV-19 | Today's Number | 1-5 | one number threaded through at most 11 numbered bands (black number tabs, Daily look) (count on, compare, more/less, chart, expanded, digit value, round, odd/even, draw) | own two-sided sheet; ranges to 20 / 120 / 1,000 / 10,000+; versions A-D | mixed | NEW (composer over `count_sequence`, `more_less_10`, `expand`, `value`, `nearest_10`, `odd_even`, `base10_build`) |

### 1.3 Rounding and estimation (`number_sense`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| RD-01 | Round on a labelled number line | 3-4 | RL-13 rounding line: 11 tall ticks, endpoints and midpoint labelled; early items have the dot pre-plotted | line above a two-column answer chart, rows | plot, write | `rounding_visual` |
| RD-02 | (retired; the id is not reused) | - | The arch picture for rounding is not built: rounding has one route, the number line and then place letters with a cut line (`PEDAGOGY_STANDARD.md` P-2) | - | - | not built |
| RD-03 | Place-letter and cut-line method | 2-5 | RL-07 letters Th H T O above digit dashes, target letter bold, vertical cut line after it | rows of 6, or cells 2x3 | rewrite, underline, write | `nearest_10` .. `nearest_million`, `round_decimals`, `round_thousandths` (partial: bare) |
| RD-04 | Rounding table (one number, several places) | 4-5 | table | 1-6 rows | table-fill | `rounding_table` |
| RD-05 | Which ten / hundred is it closest to | 3-5 | sentence frame, unit word after the blank | cells 2x3 | frame | NEW |
| RD-06 | Rounding sort | 3-5 | 2-3 bins labelled with the rounding targets | band + tile strip | cut-paste | `round_sort_10` .. `round_sort_hundredths` |
| RD-07 | Estimate a sum, difference, product, quotient | 3-5 | two-line rewrite: exact on top, rounded underneath | cells 2x3 | rewrite, write | `estimate_sum`, `estimate_diff`, `estimate_sums_diffs`, `estimate_products`, `estimate_quotient` |
| RD-08 | Estimate box beside a long algorithm | 4-5 | small framed mini-problem beside the digit grid | inside AS / MU / DV cells | write | NEW (scaffold, not a skill) |
| RD-09 | Round fractions and mixed numbers to a benchmark | 4-5 | RL-12 number line with benchmarks | rows | plot, write | `round_fractions`, `benchmark_fractions` |

### 1.4 Fact fluency (fact-like; `addition`, `subtraction`, `multiplication`, `division`, `number_sense`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| FF-01 | Single-fact set: Add n / Subtract n (the 0 set last) | 1-2 | RL-02 strategy cue on the smaller number (+ and − only), four-part fade (tile + circle bigger -> circle only -> none -> mixed / cumulative); subtraction may add a vertical number strip | fact probe: 15 vertical + 5 horizontal; half-page 2-up: 12 + 8; forms A/B | write | NEW (`add_facts`, `sub_facts` draw from the whole table) |
| FF-02 | Single-fact set: Multiply by n / Divide by n | 3-4 | Cue chosen per print: RL-14 skip-count side strip (default), array tile (5 columns or fewer) or none; fade strip -> grey strip -> none -> mixed / cumulative. Sets in the order {0, 1, 2, 5, 10}, {3, 4, 6}, {7, 8, 9}, {11, 12}; facts to 12 by default, limit to 10 optional. The empty strip the pupil fills is a lesson page, not a probe part. Division adds the optional grey think box (the page then drops one row); bracket and ÷ notations | fact probe, 20 items (18 with the think box) | write, table-fill (strip) | `mult_facts`, `div_facts` with the table selector (partial: no strip, no fade, no notation control) |
| FF-03 | Fact-family set | 1-4 | RL-08 family box: the three numbers over the four answered facts | three pages per set: Intro (read), Warm-up (say, then write), Probe forms A-D (40-item open grid) | oral, write | `add_sub_fact_family`, `mult_div_fact_family`, `number_families_*` (partial: no set structure) |
| FF-04 | Cumulative fact review | 1-4 | none | 40 items: 24 vertical + 16 horizontal, or 5x8 | write | `add_facts`, `sub_facts`, `mult_facts`, `div_facts`, `mixed_add_sub`, `mixed_mult_div` |
| FF-05 | Practice strip | 1-4 | target fact stub in a small outlined box in the strip's mini header (black is reserved for number tabs and Day tabs, design standard CL-35); fill-in-the-factor variant has an empty box per row | half-width strip, 10-12 rows, 2-up | write | NEW (layout of FF-01/02) |
| FF-06 | Fact rows, 5-10 columns | 1-5 | none | fact grid; label option Day bands / row letters / every fact numbered | write | `add_facts`, `sub_facts`, `mult_facts`, `div_facts` (column control broken today) |
| FF-07 | Count-on and count-back facts with dot cue | K-2 | RL-02 dots on or beside the smaller numeral | vertical items first, then horizontal | circle (bigger number), write | NEW |
| FF-08 | Doubles, subtract doubles, doubles plus one | 1-2 | anchor column "n + n = s" with one in-house picture per double; doubles + 1 shows the double beside a boxed vertical skeleton | split page, or cells 2x3 | write | `doubles_near_doubles`, `double`, `halve` (partial) |
| FF-09 | Neighbour numbers (difference of 1 or 2) | 1 | rule shown three ways: RL-12 line, RL-03 frame with crossed counters, RL-04 tally | three bands | write | NEW |
| FF-10 | Pairs that make ten | K-1 | RL-03 frame; RL-12 line with arcs joining pairs; rows of spaced digits to ring | table / rows | draw-counters, write, ring-groups | `make_ten`, `number_bonds` |
| FF-11 | 10 + n and 20 + n; teens plus / minus one digit | 1 | RL-03 frames in the Model only | cells 2x3 | write | NEW; nearest `teen_compose`, `add_20_no_regroup` |
| FF-12 | Fact-family house / triangle | 1-3 | RL-08 house (square for whole / product at the top, circles for parts / factors, 4 equation lines) or triangle | cells 2x2 | write | `add_sub_fact_family`, `mult_div_fact_family`, `number_families_add` .. `number_families_mixed_hard` |
| FF-13 | Related facts: are they related? write the related fact | 1-3 | RL-16 array beside a grouped array, or linked cubes with part / whole labels | rows with Yes / No check boxes and 3 blanks | check-box, write | NEW |
| FF-14 | Make-a-ten and compensation strategy facts | 1-3 | RL-03 double frame, moved counter crossed with a dotted arrow | cells 2x2, frame "10 + __ = __" | cross-out, draw-counters, frame | `make_a_ten`, `compensation` |
| FF-15 | Multiplication chart | 3-4 | table 10x10 or 12x12 with blanks | page | table-fill | `mult_chart`, `mult_chart_easy`, `mult_chart_medium`, `mult_chart_hard` |

### 1.5 Addition and subtraction computation (`addition`, `subtraction`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| AS-01 | Add / subtract with pictures, tallies or a ten frame | K-1 | pre-crossed object row with a fully boxed number sentence; RL-03 frame pre-filled with the first addend; RL-04 self-drawn tallies | cells 2x3 or 4 rows | draw-counters, cross-out, write | `add_5_pictures`, `sub_5_pictures` |
| AS-02 | Add / subtract on a number line | 1-2 | RL-12 line with hop arcs | rows of 3-4 | plot (hops), write | `nl_add`, `nl_sub`, `number_line_add`, `number_line_sub` |
| AS-03 | Make ten to add (+9, +8, +7, +6); make 20 | 1-2 | RL-03 double / triple frame, solid vs hollow counters | cells 2x2 with frame | cross-out, draw-counters, frame | `make_a_ten` |
| AS-04 | Three 1-digit addends | 1-2 | RL-02 cue, or two frames with different marks | open grid 2x4 | circle, write | `add_three` |
| AS-05 | Vertical multi-digit add / subtract, labelled columns | 1-5 | RL-07 digit grid: place letters, regroup boxes above, answer boxes below | cells 2x3 (I Can look); Daily-look grid 3-4 columns | digit-grid | `add_10_no_regroup` .. `add_1m_mixed`, `sub_10_no_regroup` .. `sub_1m_mixed`, `add`, `subtract` |
| AS-06 | Build a vertical sum from base-10 pictures | 1-2 | two rounded containers of RL-05 rods + units, arrows into a Tens / Ones grid | cells 2x3 | write, digit-grid | NEW |
| AS-07 | Column sum of three or four multi-digit addends | 2-4 | RL-07 grid, one regroup row, ragged lengths allowed | cells 2x3; test 4x3 | digit-grid | NEW (`add_three` stops at 20) |
| AS-08 | Regroup-or-not decision | 2-3 | two outlined decision icons each with a check box (RL-25); pupil rings the bigger ones digit first | cells 2x2 | circle, check-box | NEW |
| AS-09 | Regroup notation only (one place; then the across-zeros sub-ladder L-5Z: whole ten / hundred / thousand, one zero, two zeros, zeros in the middle) | 2-4 | labelled boxes over the top number; across zeros a wide box spans the digits that change together | cells 2x3 | cross-out, write in boxes (no answer asked) | NEW |
| AS-10 | Mixed regroup / no-regroup discrimination set | 2-4 | none beyond RL-07 | cells 2x3 | digit-grid | `add_*_mixed`, `sub_*_mixed` (partial: ratio not controllable) |
| AS-11 | Rewrite horizontal as vertical | 1-4 | empty RL-07 grid, open at the top for regrouping, traceable equals rule | cells 2x3 | rewrite (alignment is scored), then digit-grid | NEW |
| AS-12 | Add / subtract tens or hundreds mentally | 1-3 | per-digit boxed number, active place bold | cells 2x4 | write | `add_sub_10s`, `add_sub_100s` |
| AS-13 | Missing number in an add / subtract sentence | 1-3 | square box for the unknown, any position | cells 2x4 | write | `missing_add_sub`, `cloze_addition` |
| AS-14 | Mixed-sign set (+ and - in one grid) | 1-4 | identical grids; pupil rings the sign first (optional) | cells 2x3 | circle, digit-grid | `mixed_add_sub` |
| AS-15 | Check by the inverse operation | 2-4 | two grids side by side: the problem and its check | cells 2x2 | digit-grid, check-box | NEW |
| AS-16 | Missing digit in a stacked add / subtract (one digit, then two) | 3-4 | RL-07 grid with every digit printed except the unknown, whose place is a **dashed** digit box (dashed = unknown; regroup boxes stay solid) | cells 2x3 | digit-grid (the dashed box only) | NEW (option `type: missing_digits` on `add_*`, `sub_*`) |

### 1.6 Multiplication (`multiplication`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| MU-01 | Equal groups: "__ groups of __" | 2-3 | RL-16 objects in drawn ovals; include one group, groups of one and an empty oval as edge cases | cells 3x2, frame pinned to the cell foot | frame | `arrays_groups` (partial) |
| MU-02 | Array to number sentence | 2-3 | RL-16 dot array; row and column counts shown in the Model only | cells 2x3; frames "__ rows, __ in each row", "__ x __ = __" | frame | `arrays_groups`, `dot_array_mult` |
| MU-03 | Repeated addition of equal groups | 2-3 | ringed groups joined by + signs | table rows | write in box | `arrays_groups` (partial) |
| MU-04 | Skip count to multiply | 2-3 | RL-14 strip, or RL-12 line with equal hops | 4 strips per page | table-fill, write | `nl_mult`, `count_by_fill`, `skip_count_line`, `skip_count_grid`, `seq_2`, `seq_5`, `seq_10` |
| MU-05 | Multiplication properties | 3-4 | paired arrays (commutative), split array (distributive) | cells 2x3 | write, circle-one | `mult_properties`, `area_distributive_visual` |
| MU-06 | Factors ending in zeros (three steps) | 3-5 | arc joining the non-zero digits; zeros underlined then appended | cells 4x4, 16 items | underline, write | NEW |
| MU-07 | Break-apart 1 x N (distributive) | 3-5 | expanded blanks -> mini grids -> one addition grid | 3 bands, captions fade | digit-grid | `area_model_mult` (partial) |
| MU-08 | Area / box model up to 3 x 3 digits, optional estimate line | 4-6 | RL-17 table, x in the corner, heavy header row and column, tall addition grid beside it | pair (2 per page); blank reusable template | table-fill, digit-grid | `area_model_mult`, `area_model_mult_hard` |
| MU-09 | Standard algorithm 1 x N, N x N in a digit grid | 3-5 | RL-07 grid, spare regroup row, heavy rules; Model shows arrows and the placeholder zero | cells 2x2 or 2x3; More Practice pages A-J | digit-grid | `multiply` (partial: no explicit 1x2 .. 3x3 levels) |
| MU-10 | Lattice multiplication (incl. decimals) | 4-5 | RL-17 lattice, alternate triangles grey | problem list + lettered lattices | digit-grid | NEW (optional method) |
| MU-11 | Rewrite a multiplication vertically | 3-5 | empty grid with a faint x and two rules | cells 2x3 | rewrite, digit-grid | NEW |
| MU-12 | Mixed-sign set (+ or x) | 3-5 | identical grids | cells 3x3 or 2x2 | circle (sign), digit-grid | NEW |
| MU-13 | Missing factor; missing factor vs missing addend | 3 | caption arrows "count by / how many times / to end with" in the Model; two self-talk check-box lines | lettered cells or rows | write in box, check-box | `missing_mult_div` (partial) |
| MU-14 | Multiplicative comparison ("times as many") bare | 3-4 | RL-15 bar model, one unit bar and an n-unit bar | cells 2x2 | frame, write | `mult_comparison`, `mult_comparison_plain` |
| MU-15 | Missing digit in a stacked multiplication | 4 | as AS-16: the unknown digit is a dashed digit box inside the RL-07 grid | cells 2x3 | digit-grid (the dashed box only) | NEW (option `type: missing_digits` on `multiply`) |

### 1.7 Division (`division`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| DV-01 | Make equal groups from a picture; labelled blanks | 3 | tidy object rows; blanks labelled Total / In each group / How many groups | cells 2x3 | ring-groups, write | NEW; nearest `arrays_groups` |
| DV-02 | Division on a 1-20 number line; skip count to a stop | 3 | RL-12 line with hops; RL-14 arrow strip of traceable multiples ending at an octagon | 3 wide rows | plot (hops), trace, write | `nl_div` (partial) |
| DV-03 | Division fact with optional think box | 3-4 | grey think box above the fact (off by default); RL-14 strip under the title | cells 2x3; test 3x4 | tally (in think box, unscored), write | `div_facts` (partial) |
| DV-04 | Missing multiples; ring only the multiples | 2-4 | sequence with more blanks each row; scatter field with near-miss distractors | bands | write, circle-all | `multiples`, `count_by_fill` |
| DV-05 | Remainders by ringing tallies, then multiply-and-subtract | 3-4 | pre-drawn tally row, pre-boxed groups, pre-printed "- ___" line | cells 2x2 or rows | ring-groups, template ("r n") | `div_remainders` (partial) |
| DV-06 | Fix a given quotient (too small / too big); check and fix | 4-5 | printed quotient, check box decision, multiply-to-check grid | cells 3x2 or 2 rows | check-box, cross-out, digit-grid | NEW |
| DV-07 | Long division on an alignment grid | 4-5 | RL-18 bracket over a dotted grid as wide as the dividend; RD-08 estimate box for 2-digit divisors | cells 2x2 | digit-grid (quotient left to right) | `divide`, `long_div_2digit`, `div_remainders` |
| DV-08 | Digit-column organiser | 4-5 | tall frame, one column per dividend digit | 2-3 per row | digit-grid | NEW (scaffold level of DV-07) |
| DV-09 | Pre-skills: underline the part divided first; multiply inside the bracket | 4-5 | underline; dotted product boxes | cells 3x3 | underline, write | NEW |
| DV-10 | Is d a factor of N? set up, divide, check the box | 4 | empty bracket over a grid + two check box sentences | cells 2x2 | digit-grid, check-box | NEW; nearest `factors_identify` |
| DV-11 | Partial quotients / box method | 4-5 | RL-17 box-division table | pair | table-fill | `box_division_easy`, `box_division_hard`, `area_model_div_2by1`, `area_model_div_3by1` |
| DV-12 | Interpret the remainder | 4-5 | story + two unit-labelled questions | pair | frame, circle-one | `remainder_interpret`, `remainder_contexts` |

### 1.8 Unknowns and equality (`addition`, `subtraction`, `algebra`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| EQ-01 | Equal or not equal groups; make both sides equal | K-1 | two vertical RL-03 frames, stacked = / ≠ choice, dotted counters to add | cells 2x3 or rows | circle-one, draw-counters | NEW |
| EQ-02 | Missing addend: frames -> tallies -> bare; every position | 1 | RL-03 frames aligned over the numerals; RL-04 tallies over a square box | rows, or cells 2x4 | draw-counters, write | `missing_add_sub`, `cloze_addition` (partial: bare only) |
| EQ-03 | Part-part-whole diagram, find the missing part | 1-2 | RL-08 two part boxes and a heavier whole box | cells 2x2 with 2 equation frames | write, equation-frame | `number_bonds`, `tape_diagram` (partial) |
| EQ-04 | Missing sign; missing <, >, = between expressions | 1-3 | open circle for a sign; side values shown in trace in the Model | cells 2x8 | write-symbol | `compare_expressions` (partial), NEW for missing operation sign |
| EQ-05 | True or false equation | 1-3 | none | cells 2x4 with a True / False check-box pair | check-box | `equal_sign` |
| EQ-06 | Balance both sides (7 + 5 = __ + 3) | 1-4 | none, or RL-08 balance sketch in the Model | cells 2x4 | write | `balance_addsub` |
| EQ-07 | Label part / whole, choose the rule, solve, check | 1-2 | the unknown is the empty box, marked `?` at label size (design standard LS-3, RP-60); sentence with (whole / part) and (add / subtract) word choices | cells 2x2, large | label-bank, circle-one, rewrite, check-box | NEW |

### 1.9 Fraction concepts (`fractions`, part of `composing`, `shapes_early`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| FR-01 | Equal or unequal parts | 1-3 | pairs of heavy-outline shapes, one partitioned equally | cells 2x4 or rows | circle-one, cross-out | `partition_shapes` (partial) |
| FR-02 | Name the parts (halves / thirds / fourths / not divided) | 1-2 | row of 2-4 wholes including an undivided whole | rows with inline word choices | circle-one | `partition_shapes` |
| FR-03 | Write the denominator only -> numerator only -> both | 2-3 | RL-19 picture, or 0-3 line with a fraction template under each whole; boxes labelled "parts in all" / "parts shaded" | rows | template | NEW (sub-skill of `write_fraction`) |
| FR-04 | Write the fraction for a shaded model (incl. values over 1) | 2-4 | RL-19 circles, bars, grids in the single grey; 3-4 wholes in a row for values over 1 | rows, 3 across | template | `fractions:identify`, `write_fraction`, `identify_nv`, `mixed_improper_visual` |
| FR-05 | Shade a given fraction | 1-4 | pre-partitioned outline, dotted partitions | cells 2x3 | shade | `shade_fraction` |
| FR-06 | Partition, then shade | 2-4 | blank shape; circles carry circumference guide dots; polygons cut from the centre | cells 2x3 | partition, shade | NEW |
| FR-07 | Partition and label a number line (horizontal, vertical) | 2-4 | RL-12 blank double-arrow line 0-1, 0-2, 0-3 | rows, or 4 columns for vertical lines | partition, label, plot | `fraction_number_line`, `order_frac_numline`, `graph_fractions`, `fraction_nl_drag`, `mixed_nl_drag` (partial: ticks pre-drawn) |
| FR-08 | Fractions equal to 1; whole numbers as fractions; compare to 1; sort <1, =1, >1; write three of each | 3-5 | large stacked fractions; 3-column sort table | row / table | multi-mark, table-fill, write | `whole_as_fraction`, `compose_whole` (partial) |
| FR-09 | Fraction number bond (shaded + unshaded = whole) | 3-4 | RL-08 bond beside RL-19 picture | cells 2x3 with an equation rule | template | `decompose_fractions`, `decompose_frac_nv` (partial) |
| FR-10 | Match picture, fraction, word (and decimal) | 3-4 | grey bars, cards in 2-3 columns | matching | match | NEW |
| FR-11 | Unit / mixed / improper conversion | 4-5 | rows of shaded wholes + one partial; loop-arrow cue in the Model | table / rows | template | `improper_mixed`, `mixed_improper_visual` |
| FR-12 | Compare fractions: same denominator, same numerator, benchmark, common denominator | 3-5 | RL-19 fraction-wall thumbnail, or paired bars; open circle | 3 columns or rows | write-symbol | `fractions:compare`, `compare_frac_lcd`, `benchmark_fractions` |
| FR-13 | Order fractions | 3-5 | none or RL-12 line | row + rules | order | `order_fractions` |
| FR-14 | Equivalent fractions: judge, write, shade, find on paired lines | 3-5 | circle pairs; paired aligned 0-2 lines; stacked bars | yes/no cells; rows | check-box, shade, template, circle-all | `equiv_frac_visual`, `equiv_frac_nv`, `equivalent`, `select_equiv_frac`, `compose_target_frac` |
| FR-15 | Missing n/n multiplier | 4-5 | parenthesised n/n between the two fractions; picture check on the first rows only | rows of 5 | write | NEW |
| FR-16 | Simplify (paired ÷ arrows; prime-factor cancel) | 4-6 | RL-20 paired curved arrows; factor stubs over a long fraction bar | 3 columns / cells 2x2 | write, cross-out | `simplify` (partial: bare) |
| FR-17 | Fraction of a set | 3-5 | RL-01 objects in equal groups | cells 2x3 | ring-groups, write | `fraction_of_set`, `fraction_of_set_hard`, `fraction_of_set_nv`, `fraction_of_set_hard_nv` |
| FR-18 | Fraction bar arithmetic picture | 3-5 | RL-19 bars | rows | template | `fraction_bar_ops` |

### 1.10 Fraction operations (`fraction_operations`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| FO-01 | Like denominators: add from pictures -> shade and add -> equations | 3-4 | paired grey area models; answer is a bare fraction bar | cells 3x2 | shade, template | `add_fractions_like`, `sub_fractions_like`, `add_frac_like_nv`, `sub_frac_like_nv` |
| FO-02 | "Can you add these as they are?" / cross out what you cannot work yet | 4 | none | cells 4x2 | circle-one, cross-out | NEW |
| FO-03 | Mixed numbers, like denominators | 4 | tall whole-number box beside a stacked fraction template | cells 2x3 | template | `add_mixed_like`, `sub_mixed_like`, `add_mixed_like_nv`, `sub_mixed_like_nv` |
| FO-04 | Unlike denominators with a fill-in frame | 4-5 | RL-20 frame: rows micro-labelled common denominator / equivalent fraction / rewrite | cells 2x2 | template | `add_frac_unlike`, `sub_frac_unlike`, `add_frac_unlike_nv`, `sub_frac_unlike_nv` |
| FO-05 | Mixed numbers, unlike denominators, stepped | 5 | six printed steps + a work-space column with grids | page, 65/35 split | template, digit-grid | `add_mixed_unlike`, `sub_mixed_unlike`, `add_mixed_unlike_nv`, `sub_mixed_unlike_nv` |
| FO-06 | Multiply fraction x whole, fraction x fraction, mixed numbers | 4-6 | repeated-addition circles with black sectors; RL-17 area square for fraction x fraction | cells 2x5 / rows / 2x2 | template | `mult_frac_whole`, `mult_frac_whole_nv`, `mult_frac_frac`, `mult_frac_frac_nv`; NEW for mixed x mixed |
| FO-07 | Multiplication as scaling | 5 | none, or RL-15 bar | cells 2x4 | circle-one (bigger / smaller / same) | `mult_scaling`, `mult_scaling_nv` |
| FO-08 | Multiply vs add/subtract discrimination | 4-6 | two mini rule strips side by side | cells 2x4 | template | NEW |
| FO-09 | Divide fractions: reciprocal -> keep-change-flip skeleton -> mixed template | 5-6 | numbered sectors / bar over a line as a picture check | rows, or 2 columns | template | `div_unit_fraction`, `div_unit_frac_nv`; NEW for fraction ÷ fraction, whole ÷ non-unit, mixed ÷ mixed |
| FO-10 | Fraction as division and the reverse | 5 | sharing picture; RL-15 bar organiser | rows of three lines | template | `frac_as_division`, `frac_as_div_nv`, `frac_as_div_word` |
| FO-11 | Tenths as hundredths; add tenths + hundredths | 4 | RL-21 strip and grid | rows | template | `frac_10_100`, `frac_10_100_nv` |
| FO-12 | Estimate a fraction sum / difference against benchmarks | 5 | RL-12 line | rows | circle-one | `estimate_frac_ops` |
| FO-13 | Error analysis: two worked solutions | 4-6 | side-by-side solutions built from `wrongAnswer` | pair | check-box (which is correct), circle (the wrong step) | NEW (page role over any FO skill) |

### 1.11 Decimals (`decimals`, `conversions`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| DE-01 | Read a decimal: write the fraction, complete the frame, say it | 4-5 | paired 0-1 lines, decimals above and fractions below, same point marked | rows of 3 | template, frame, oral | NEW |
| DE-02 | Model to decimal; decimal to model | 4 | RL-21 ten-strip and 10x10 grid | rows | write, shade | `percent_visual` (grid only); NEW for decimals |
| DE-03 | Which decimal says ...? (look-alikes 0.3 / 0.03 / 0.30) | 4-5 | none | rows with 3 choices | circle-one, write | NEW |
| DE-04 | Equivalent decimals table | 5 | table, first row traced | 9 rows | table-fill | NEW |
| DE-05 | Dual-labelled number line; name lettered points | 4-5 | RL-12 line, 11 ticks, fraction row and decimal row | band | label, write | `decimal_nl_drag` (partial) |
| DE-06 | Compare decimals with a rewrite step | 4-5 | open circle + two "___.___" rewrite lines with the points pre-aligned; contrast pairs such as 87.2 / 87.20 | rows of 6, or 3 columns | rewrite, write-symbol | `compare_decimal`, `compare_thousandths` |
| DE-07 | Order decimals | 4-5 | none | row + rules | order | `order_decimals` |
| DE-08 | Words -> decimal and fraction chart; picture / decimal / word table | 4-5 | table; RL-21 models | rows | table-fill, shade | NEW |
| DE-09 | Add / subtract decimals: aligned -> append zeros -> rewrite in a grid | 5-6 | RL-07 grid with a heavier decimal-point column, operator pre-printed | rows of 5, or cells 2x3 | rewrite, digit-grid | `add_decimal`, `sub_decimal` |
| DE-10 | Multiply decimals in a grid; x10 / x100; divide with "answer -> rounded" line | 5-6 | RL-07 / RL-18 grids; appended zeros grey | cells 2x2 / rows of 6 | digit-grid | `mult_decimal`, `div_decimal` |
| DE-11 | Round decimals | 4-5 | RD-03 letters strip with a decimal point | rows of 6 | rewrite, write | `round_decimals`, `round_thousandths`, `round_sort_tenths`, `round_sort_hundredths` |
| DE-12 | Fraction <-> decimal (by grid, by place value, by long division) | 4-6 | RL-21 grid; RL-18 bracket over a pale grid | rows | template, digit-grid | `f_to_d`, `d_to_f` |

### 1.12 Ratio and percent (`conversions`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| RP-01 | Percent on a hundred grid | 5-6 | RL-21 grid | cells 2x3 | write, shade | `percent_visual` |
| RP-02 | Fraction / decimal / percent conversion with labelled blanks | 5-6 | blanks micro-labelled "decimal", "percent" | rows | write, template | `f_to_p`, `p_to_f`, `d_to_p`, `p_to_d`, `order_fdp` |
| RP-03 | More than, less than or exactly 100% reasoning | 5-6 | inline options + check-box lines | 3 bands | circle-one, check-box | NEW |
| RP-04 | Percent of a number; find the whole | 6 | RL-15 bar model split in 10 parts; predict-then-check frame | 2 columns | check-box (prediction), write | `percent_of_number`, `find_whole_from_pct` |
| RP-05 | Write a ratio; equivalent ratios | 6 | RL-01 two object kinds; RL-15 bars | cells 2x3 | template (`__:__`), write | `ratio_intro`, `equiv_ratios` |
| RP-06 | Ratio table; double number line | 6 | table; RL-12 double line | rows / table | table-fill, write | `ratio_tables`, `double_num_line` |
| RP-07 | Unit rate | 6 | two-row table with a "per 1" column | cells 2x2 | write + unit word | `unit_rate_intro` |

### 1.13 Integers and rational numbers (`integers`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| IN-01 | Read and place integers on a line | 6 | RL-12 line through zero (horizontal; vertical thermometer form) | rows | plot, write | `number_line_int`, `integer_nl_drag` |
| IN-02 | Opposites and absolute value | 6 | RL-12 line with a distance arc | cells 2x4 | write | `opposite_numbers`, `abs_value` |
| IN-03 | Compare and order integers and rationals | 6 | open circle; row + rules | rows | write-symbol, order | `compare_int`, `order_negatives`, `ordering_rationals` |
| IN-04 | Add and subtract integers | 6 | RL-12 line with hops; two-counter model (solid / hollow) in the Model | cells 2x3 | plot (hops), write | `add_int`, `sub_int` |

### 1.14 Time (`measurement`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| TM-01 | Missing numerals on a clock face | K-1 | RL-22 face with 3-6 numerals missing | cells 2x2 | trace, write | NEW |
| TM-02 | Identify the hands (ring the hour hand; label the minute hand) | K-2 | RL-22 face, hands of clearly different length | cells 2x3 | circle-one, label | NEW |
| TM-03 | Hour, half hour, quarter hour, 5 minutes, 1 minute: analog -> digital | 1-3 | RL-22 face | cells 2x3 | template (`__:__`) | `time_hour`, `time_half_hour`, `time_quarter`, `time_5min`, `time_1min` |
| TM-04 | "__ minutes after __" with the fives ring | 1-2 | RL-22 face ringed by 12 small write-in boxes for 5, 10, 15 ... | cells 2x2 or 2x3 | table-fill (ring), frame | NEW |
| TM-05 | Spoken / word time -> `__:__` (the :00 and :05 cases) | 2 | none | cells 2x4 | template, oral | NEW |
| TM-06 | Analog <-> digital: choose 1 of 2-4; match | 1-3 | RL-22 faces and digital readouts | cells 2x3; match columns | circle-one, match | `time_analog_digital`, `time_match_clock` |
| TM-07 | Draw the hands | 1-3 | bold face without minute ticks, hour hand given at the early step | cells 2x3 | draw-hands | `time_match_clock` (partial); `clock-set` widget exists |
| TM-08 | More or less than a minute; a.m. or p.m. | 1-2 | one activity picture per cell | cells 3x2 | circle-one (word) | NEW |
| TM-09 | Order clocks | 1-3 | 3-5 faces or readouts | band; hands-on cards form | order, cut-paste | `order_clocks_analog_asc`, `order_clocks_analog_desc`, `order_clocks_digital_asc`, `order_clocks_digital_desc` |
| TM-10 | Elapsed time: two clocks; timeline | 2-4 | paired RL-22 faces; RL-12 timeline with hops labelled in hours and minutes | cells 2x2; rows | plot (hops), template, write + unit | `elapsed_30min`, `elapsed_hour`, `elapsed_15min`, `elapsed_mixed`, `elapsed_find_duration`, `elapsed_visual_easy`, `elapsed_visual_medium`, `elapsed_visual_hard` (partial: no timeline) |

### 1.15 Money (`measurement`) - generic value-circles only

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| MN-01 | Find the target coin; write the value of one coin | K-2 | RL-23 coins in a 4x4 or 6x6 mixed field | grid | circle-all, write | NEW |
| MN-02 | Like coins by skip count | 1-2 | row of 1-8 identical RL-23 coins, a short rule under each for the running total | row strips | write (running totals) | `money_count` (partial) |
| MN-03 | Unlike coins, biggest first, with the dot cue | 2 | RL-23 coins carrying count-by-five dots (5 = 1 dot, 10 = 2, 25 = 5, 1 = a stroke): printed -> pupil-drawn -> scattered coins | strips / cells 2x2 | draw-counters (dots), write | `money_count` |
| MN-04 | Compare two collections | 1-2 | two groups either side of a stacked < = > | wide cells, 3 per page | write x2, circle-one | NEW |
| MN-05 | Show an amount with coins | 2 | 12 dotted circle placeholders + a token key | rows | draw-counters (print: write the value in a circle), coin builder (screen) | `equiv_coin_sets`, `make_change_least_coins` (`coin-builder` widget) |
| MN-06 | Amount notation (whole . hundredths), zero cases | 2-3 | arrowed example in the Model | cells 2x2 | template (`__.__`) | NEW |
| MN-07 | Notes + coins | 2-3 | RL-23 upright narrow value-rectangles then coins | strips | write | `money_count` |
| MN-08 | Enough money? / make change / fewest coins | 2-4 | price tag (rounded plate) + RL-23 collection | cells 2x2 | check-box, write, coin builder | `enough_money`, `money`, `make_change_least_coins` |

### 1.16 Measurement (`measurement`, part of `shapes_early`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| ME-01 | How many units long | 1 | end-to-end unit objects under the item; later a cut-out unit strip (hands-on) | cells 2x2 | write + unit word | `measure_nonstandard` |
| ME-02 | Order by length | K-1 | 3-4 objects on one baseline | cells 2x2 | write ranks, order | `order_objects_length` |
| ME-03 | Read a ruler | 2-3 | RL-26 ruler, item aligned at zero (and later not at zero) | rows | write + unit word | `reading_ruler`, `reading_ruler_hard` |
| ME-04 | Measure lettered segments | 2 | dotted segments with dot endpoints; answer column at the left | page | measure, write | NEW (print-first) |
| ME-05 | Measuring rules: pick the correct picture | 1-2 | 3 pictures of an item against RL-26 (start at zero / gap / overlap) | rows of 3 options | circle-one | NEW |
| ME-06 | Estimate length; choose the unit | 2-4 | item picture + 2-3 unit options | cells 2x3 | circle-one | `estimate_length` |
| ME-07 | Unit conversion with the fact given | 4-5 | grey rule box holding the conversion fact; two-column table | panel / table | table-fill, write + unit | `unit_conversions`, `length_customary`, `length_metric`, `capacity`, `mass_volume_liquid`, `unit_conversion_word` |
| ME-08 | Read a scale: thermometer, measuring jug, balance | 2-4 | RL-26 vertical scale | cells 2x3 | write + unit, shade (to a level) | `temperature`, `capacity`, `mass_volume_liquid`, `heavier_lighter_visual` |

### 1.17 Shapes (`shapes_early`, `shapes_classify`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| GE-01 | Find all of one shape; trace; count sides and corners | K-1 | RL-27 scatter of outlines, varied size and turn, with near-miss shapes | 4 stacked bands | circle-all, trace, write | `name_2d_shapes`, `count_sides_vertices_2d`, `shape_corners_count`, `hotspot_quads` |
| GE-02 | Name a 2D / 3D shape | K-2 | RL-27 outline or wireframe | cells 2x3; match columns | circle-one, match, label-bank | `name_2d_shapes`, `name_3d_shapes`, `shape_name_match_2d`, `shape_name_match_3d` |
| GE-03 | Describe a solid: faces, edges, vertices; rolls / slides / stacks; which face you would trace | K-2 | RL-27 wireframe + 4 dotted 2D options | bands | write, circle-one, check-box | `count_edges_faces_vertices` (partial) |
| GE-04 | Two-bin sort (shape vs shape; flat vs solid) | K-1 | two rounded bins + 12 tiles (hands-on) | page | cut-paste | NEW; nearest `compose_from_attributes` |
| GE-05 | Position words | K | two objects, one reference | cells 2x3 | circle-one | `shape_positions` |
| GE-06 | Compose and decompose shapes | K-2 | RL-27 pattern-block outlines | cells 2x2 | draw, cut-paste | `compose_shapes`, `compose_hexagon`, `compose_rect_from_squares` |
| GE-07 | Attribute chart with non-examples; polygon vs not a polygon | 3-5 | table of shapes x attributes; two pre-sorted sets + one sentence frame | table / page | check-box, table-fill, frame | `shape_attributes`, `compose_from_attributes` (partial) |
| GE-08 | Classify triangles and quadrilaterals with a cumulative word bank | 4-5 | RL-27 figures with standard cues (tick marks, right-angle square, arcs); two stacked rules when two attributes are asked | cells 3x4; bank on Guided only | label-bank | `classify_triangles`, `classify_quads` |
| GE-09 | Lines of symmetry: judge, count, draw | 4 | RL-27 outline on a faint dot grid | cells 2x3 | check-box, write, partition (draw the line) | `symmetry`, `place_symmetry_lines` |
| GE-10 | Nets and cross-sections | 5-6 | RL-27 net outlines; solid with a cutting plane in grey | cells 2x2 | circle-one | `net_identify`, `cross_section_3d`, `net_surface_area` |

### 1.18 Area, perimeter and volume (`area_perimeter`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| AP-01 | Perimeter: sum the sides; count on a grid | 3 | RL-28 thin figure with tick-marked sides, or on a unit grid | cells 2x2 | write + unit ("P = __ units") | `perimeter_intro`, `perimeter_grid`, `perimeter` |
| AP-02 | Area: count unit squares -> rows x columns -> formula | 3-4 | RL-28 figure on a unit grid, then labelled rectangle | cells 2x2 | write + unit ("A = __ square units") | `area_unit_squares`, `area`, `area_distributive_visual` |
| AP-03 | Area and perimeter together | 3-4 | labelled rectangle | cells 2x2, two labelled answer lines | write x2 | `area_perimeter` |
| AP-04 | Composite (L, T, U) shapes | 4-5 | RL-28 figure with a dotted split line (modelled, then pupil-drawn) | pair or cells 2x2 | partition, write | `composite_shapes`, `area_polygon_decompose` |
| AP-05 | Area of a triangle | 6 | triangle inside a hairline rectangle, dotted height guide | cells 2x2 | write | `area_triangle` |
| AP-06 | Missing side from area or perimeter | 4 | labelled rectangle, one side a square box | cells 2x3 | write | NEW; nearest `area`, `perimeter` |
| AP-07 | Volume: count cubes by layer -> l x w x h | 5 | RL-28 isometric cube stack; labelled prism | cells 2x2, three-step frame in the Model | frame, write + unit | `volume`, `volume_composite` |

### 1.19 Angles and lines (`angles_lines`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| AN-01 | Name the angle type | 4 | RL-29 two rays + arc; right angle gets a square | cells 3x4; bank on Guided | label-bank, circle-one | `identify_angles` |
| AN-02 | Point, line, ray, segment; parallel, perpendicular, intersecting | 4 | RL-29 figures with end dots and arrowheads | cells 3x4 | label-bank | `identify_lines` (partial: parallel / perpendicular only) |
| AN-03 | Measure or estimate an angle | 4 | RL-29 angle under a printed protractor | cells 2x2 | write + degree sign | `measure_angles` |
| AN-04 | Additive angles; missing angle | 4 | RL-29 split angle, one part a square box | cells 2x3 | write | `additive_angles` |

### 1.20 Coordinates and transformations (`coordinates`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| CO-01 | Name a plotted point | 5-6 | RL-30 grid, quadrant I or all four | pair | template (`( __ , __ )`) | `coordinate_q1`, `coordinate_all` |
| CO-02 | Plot a point / polygon | 5-6 | RL-30 blank grid | pair | plot | `coordinate_graph`, `coord_polygon` |
| CO-03 | Distance between points on a grid line | 5-6 | RL-30 grid | pair | write + unit | `coord_distance_q1` |
| CO-04 | Rule table -> ordered pairs -> graph | 5 | two-row table beside RL-30 | page | table-fill, plot | `pattern_relationship`, `function_table_hard` (partial) |
| CO-05 | Reflect, rotate, translate | 6 | RL-30 grid with the source figure in grey | pair | circle-one, plot | `geo_reflect`, `geo_rotate`, `geo_translate` |

### 1.21 Graphs (`graphs`, part of `measurement`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| DA-01 | Read a picture graph / pictograph (scaled key, half symbols) | K-3 | RL-31 pictograph, in-house pictures or counters | graph left, 2-4 questions right | circle-one (word), write | `pictograph_intro`, `pictograph` |
| DA-02 | Read a bar graph: literal question, then compute on the same graph | 1-5 | RL-31 bar graph, solid black or grey bars on a hairline grid | graph left, 2 questions right | write | `bar_graph_intro`, `bar_graph` |
| DA-03 | Tally chart: read; record from a scene | 1-3 | RL-04 tally table with picture labels | table + questions | write, tally | `tally_chart`, `classify_count` |
| DA-04 | Build a bar graph or pictograph from a table | 2-5 | RL-31 pre-labelled blank axes | table + frame | draw-graph | `build_bar_graph`, `build_pictograph` |
| DA-05 | Line plot: read; build (whole numbers, fractions) | 2-5 | RL-31 X stacks over an RL-12 line | context + questions | write, draw-graph | `line_plot`, `line_plot_g2`, `line_plot_fractions` |
| DA-06 | Line graph: read; construct | 4-5 | RL-31 points joined on a hairline grid | graph + questions | write, draw-graph | NEW |
| DA-07 | Data table reading | 2-5 | plain table | table + questions | write | NEW |
| DA-08 | Circle graph: read; shade sectors from a tally | 2-6 | RL-31 12-sector circle with a pattern key (grey, hatch, white, dots) | graph + questions | write, shade | `pie_chart` (partial) |
| DA-09 | One fixed question set on one graph (nine questions, operators pre-printed) | 1-2 | any RL-31 graph | graph + numbered list | mixed | NEW (page composition) |
| DA-10 | One question stem across six small graphs | 1-2 | six small RL-31 graphs | cells 3x2 | circle-one / equation-frame | NEW (page composition) |
| DA-11 | Roll-and-graph game | 1-2 | column grid 2-12 (hands-on family) | half sheets | hands-on | NEW (later family) |

### 1.22 Statistics and probability (`data_analysis`, `probability`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| ST-01 | Mean, median, mode, range with an ordering step | 5-6 | data row, then an "in order" rule, then labelled blanks | cells 2x2 | order, write | `mean`, `median`, `mode`, `range` |
| ST-02 | Mean absolute deviation | 6 | three-column table (value, distance from mean) | pair | table-fill | `mad` |
| ST-03 | Box plot: read median, quartiles, range | 6 | RL-31 box plot over an RL-12 line | pair | write | `box_plot_intro` |
| ST-04 | Histogram: read | 6 | RL-31 joined bars | pair | write | `histogram_read` |
| ST-05 | Statistical question or not | 6 | none | rows with Yes / No check boxes | check-box | `statistical_question` |
| PB-01 | Likelihood words; probability as a fraction | 4-6 | RL-32 spinner, bag of counters, number cube net | cells 2x3 | circle-one, template | `probability_basic` |

### 1.23 Patterns (`patterns`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| PA-01 | Skip-count sequences with sparse anchors; fading print | K-4 | RL-14 strip or bare baselines | lines a-h / one-row table | write, table-fill | `seq_2`, `seq_5`, `seq_10`, `count_by_fill`, `count_by_step_up`, `count_by_step_down`, `count_by_powers_of_10`, `skip_count_grid`, `skip_count_line` |
| PA-02 | Number pattern: next terms, name the rule | 2-5 | none | rows with a rule frame "The rule is: __ __" (sign circle + number line) | write, equation-frame | `number_pattern` |
| PA-03 | Shape pattern: next, missing, core unit | K-2 | RL-27 outline shapes, grey / white / hatch fill | rows | circle-one, draw, ring-groups (the core) | `shape_pattern` |
| PA-04 | Input / output table; find the rule | 3-5 | two-column or two-row table | pair or cells 2x2 | table-fill, equation-frame | `function_table_easy`, `function_table_hard` |
| PA-05 | Two patterns, find the relationship | 5 | two-row table | pair | table-fill, frame | `pattern_relationship` |
| PA-06 | Doubling and halving | 1-3 | RL-03 frame mirror, or RL-15 bar split | cells 2x4 | write | `double`, `halve` |

### 1.24 Expressions, equations and order of operations (`algebra`, `order_of_operations`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| AL-01 | Solve for an unknown (box, then letter) | 3-6 | optional RL-15 bar or balance sketch in the Model | cells 2x3, one "undo" work line | write | `solve_unknown`, `solve_eq_addsub`, `solve_eq_multdiv`, `solve_eq_twostep` |
| AL-02 | Words -> expression / equation | 5-6 | none | rows; tiles form on screen | label-bank (operator + operands), write | `write_expression`, `write_equation`, `build_expr_addsub`, `build_expr_multdiv` |
| AL-03 | Evaluate an expression for a given value | 5-6 | substitution line with a box where the letter was | cells 2x3 | rewrite, write | `evaluate_expression`, `evaluate_expression_hard` |
| AL-04 | Like terms; distributive property | 6 | terms underlined with two line styles (solid / dotted) in the Model | cells 2x3 | underline, write | `combine_like_terms`, `distributive_expr` |
| AL-05 | Inequalities: write, graph on a line | 6 | RL-12 line, open / closed dot | rows | write-symbol, plot | `inequalities` |
| AL-06 | Bar model from a story | 2-6 | RL-15 | pair | label, write | `tape_diagram`, `tape_diagram_plain` |
| OO-01 | Underline the step you do first | 3-6 | none | cells 3x3 | underline | NEW (sub-skill) |
| OO-02 | Evaluate step by step, one rewrite line per operation | 3-6 | stepped rewrite lines, shorter each line | cells 2x2 or 2x3 | rewrite, write | `oop_easy`, `oop_medium`, `oop_hard`, `two_ops_no_paren`, `three_ops_no_paren`, `multi_ops_no_paren`, `paren_simple`, `paren_multi`, `nested_complex`, `exponents_simple` |
| OO-03 | Compare two expressions | 4-6 | open circle | rows | write-symbol | `compare_expressions` |
| OO-04 | Put in the parentheses to make it true | 5-6 | none | rows | partition (tap between tokens), write | NEW |

### 1.25 Number theory (`number_theory`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| NT-01 | Factor pairs | 4 | T-chart; RL-16 array in the Model; factor arcs | cells 2x2 | table-fill | `factor_tchart_easy`, `factor_tchart_medium`, `factor_tchart_hard`, `factor_links_easy`, `factor_links_medium`, `factor_links_hard`, `factors_identify` |
| NT-02 | Multiples of a number | 4 | RL-14 strip; scatter field | bands | table-fill, circle-all | `multiples` |
| NT-03 | Prime or composite (reference list; 1-20 strip) | 4-5 | spaced numerals | strip / cells 2x4 | circle-all, check-box | `prime_composite` |
| NT-04 | Divisibility by 2, 3, 5, 9, 10 with proof by dividing | 4-5 | three columns with Yes / No + a work-space bracket | bands | check-box, digit-grid, cut-paste (sort form) | `divisibility_sort` (partial) |
| NT-05 | Prime factorisation (factor tree) | 5-6 | RL-20 number with two pre-drawn branch stubs | cells 2x2 | write, draw branches | NEW |
| NT-06 | GCF and LCM from lists | 5-6 | two listed rows, common entries ringed | cells 2x2 | circle-all, write | `gcf_easy`, `gcf_hard`, `lcm` |

### 1.26 Vocabulary (`vocabulary`)

| Id | Name | Level | Representation | Format | Response | Today |
|---|---|---|---|---|---|---|
| VO-01 | Match word to definition or to a labelled mini-diagram | K-6 | any RL entry at thumbnail size | two columns, 5-6 pairs | match | `vocab_grade_K` .. `vocab_grade_6` and the strand sets |
| VO-02 | Label a diagram from a word bank | K-6 | any RL entry with 2-4 blank leader lines | cells 2x2 | label-bank | NEW |
| VO-03 | Example or non-example of a word | 1-6 | 6-8 small figures | band | circle-all, cross-out | NEW |

### 1.27 Word problems (all categories' `*_wp_*`, `*_word_problems*`, `algebra`)

The teacher chooses the system: **schema-based** (default) or **keyword-checklist panel**. Both use the same
generated stories. Stories are original, use neutral contexts and names, carry at most 4 lines with the question
last, print one sentence per line, and pre-print the unit word after the answer blank.

| Id | Schema | Level | Unknown positions | Diagram (RL-15 / RL-08 family) | Today |
|---|---|---|---|---|---|
| WP-01 | Join / separate with pictures (K picture version) | K | result | picture -> "draw lines to show it" -> frame `__ ○ __ = __` -> say it with the label | `add_5_pictures`, `sub_5_pictures`, `add_wp_10`, `sub_wp_10` (partial) |
| WP-02 | Change (start, change, end) | 1-3 | result / change / start | three square-cornered boxes in a row, start -> change -> end, joined by solid arrows; the change box carries a sign circle on its left edge | `add_wp_*`, `sub_wp_*`, `unknown_start_wp` (partial: no schema tag, no position control) |
| WP-03 | Part-whole (2 parts; 3 parts from Level 2) | 1-3 | whole / a part | whole box over part boxes | `add_wp_*`, `sub_wp_*`, `add_word_problems`, `sub_word_problems` |
| WP-04 | Compare (difference) | 1-3 | difference / bigger / smaller; consistent then inconsistent wording | long bar = short bar + a solid difference box (marked `?` when it is the unknown) | `comparison_word` |
| WP-05 | Two-change (with a distractor verb) | 2-3 | end | chained change diagram | NEW |
| WP-06 | Equal groups | 3-4 | total / groups / size | row of equal unit bars | `mult_word_problems`, `div_word_problems` (+ `_plain`) |
| WP-07 | Multiplicative compare | 4 | bigger / smaller / multiplier | unit bar and n-unit bar | `mult_comparison`, `mult_comparison_plain` |
| WP-08 | Remainder interpretation | 4 | drop / round up / the remainder is the answer | equal-groups bars + leftover box | `remainder_interpret`, `remainder_contexts` |
| WP-09 | Measurement schemas: perimeter, area, volume | 3-5 | the measure / a missing side | labelled rectangle; labelled prism | `unit_conversion_word` (partial); NEW as schemas |
| WP-10 | Elapsed time | 3-4 | end / start / duration | RL-12 timeline | `elapsed_find_duration` (partial) |
| WP-11 | Money (generic units) | 2-5 | total / change / enough | part-whole or change diagram | `money`, `enough_money` (partial) |
| WP-12 | Two-step / multi-step | 3-6 | final | two titled step columns, each with its own diagram and work grid | `multi_step_word`, `multi_step_word_plain`, `word_problems_mixed`, `algebra_word_mixed` |
| WP-13 | Fraction and decimal stories | 4-6 | as the underlying schema | same diagrams + an operation check box | `frac_word_problems`, `frac_mult_word`, `frac_word_mixed`, `frac_as_div_word` (+ `_plain`) |
| WP-14 | Percent and ratio stories | 6 | part / whole / percent | labelled equation boxes reusing the story's nouns; RL-15 bar in tenths | `percent_of_number`, `unit_rate_intro` (partial) |

Word-problem versions (all emitted from one seed so print and screen stay paired):

| Version | Items per page | Parts, top to bottom | Response modes |
|---|---|---|---|
| v1 scaffolded | 1 | rounded story box, one sentence per line, relational phrase underlined, unit-labelled blank inside the box -> schema diagram to fill -> first-person decision check boxes tied to structure, from the pedagogy standard's library ("I know the whole and one part. I subtract.") -> equation frame (Levels K-2) or work grid (Levels 3-6) | label, check-box, equation-frame or digit-grid, frame |
| v2 faded | 2 | story box -> work space -> number blank + label blank | write, write (label) |
| K picture | 1-2 | picture -> draw lines -> `__ ○ __ = __` -> oral answer with the label | draw, equation-frame, oral |
| Keyword panel (option) | 1 (it replaces the v1 schema diagram; v2 never carries it) | story box + the fixed side panel of 6 checklist steps from `PEDAGOGY_STANDARD.md` section 8.5 (read twice, circle the numbers, underline the question, box the clue words, choose the operation, solve and write the label) | circle, underline, check-box (unscored), write |

### 1.28 Thinking types (retrieval and reasoning; generated for ANY skill)

These are wrappers: each takes items from any problem type above through the skill's `wrongAnswer`, `variants`
and `representations` adapters. All wording is MathQuest's own.

| Id | Name | Built from | Format | Response |
|---|---|---|---|---|
| TH-01 | Daily 4 | four items per day: one from the last lesson, last week, last unit, last year (ladder order decides) | 4 boxed cells per day, 5 days per page, Daily look | the item's own response mode |
| TH-02 | True or False? | a correct statement or a `wrongAnswer` statement (equation, comparison, labelled picture) | rows; True / False check-box pair + one sentence frame with one or two blanks | check-box, frame |
| TH-03 | Reason It: spot the mistake | one worked solution with one wrong step from `wrongAnswer` + `workedSteps` | pair | circle (the wrong step), write (the fix) |
| TH-04 | Reason It: odd one out | 4 items, 3 share an attribute | cells 1x4 + frame "__ does not belong. It is not ______ ." with a word bank of at most 4 words | circle-one, label-bank |
| TH-05 | Reason It: always / sometimes / never | one general statement + three check boxes (Always / Sometimes / Never) + an example frame "Example: __ + __ = __" (two frames for "sometimes": one that works, one that does not) | rows | check-box, frame |
| TH-06 | Reason It: which is correct | two finished solutions labelled A and B (never named characters), one right | pair | circle-one, frame ("__ is correct. The answer is __ .") |
| TH-07 | Stretch: open problem with several answers | constraint ("two numbers with a sum of 12") + a results table with the first row traced | pair | table-fill (any valid row scores) |

---

## 2. Response modes

A response mode is one way a pupil answers. Each has a PAPER form and an ON-SCREEN twin that uses the same cell,
the same visual and the same slot positions; only the pencil action is swapped for a tap, a drag or typing.

### 2.1 Parity rules

| Id | Rule |
|---|---|
| RM-P-01 | **Production stays production.** The screen never converts an item the pupil writes, draws, places or builds on paper into multiple choice. A choice response on screen is allowed only when the paper item is itself a choice (circle-one, circle-all, check-box). |
| RM-P-02 | The screen cell is the print cell: black and white, same slot shapes, same label. Inputs sit exactly where the blanks are. Colour appears only in game chrome and in correct / incorrect feedback. |
| RM-P-03 | Every on-screen mode works by tap alone. Drag is an optional second way, never the only way (motor access, touch screens). |
| RM-P-04 | Typing uses the on-screen numeric pad (`numpad-input`) on touch devices and the keyboard elsewhere. A slot accepts only the characters its shape allows (digit box: one digit; sign circle: one of the offered symbols). |
| RM-P-05 | Feedback timing: live check mark / cross per slot in Model and Guided items; on Check in independent, probe, review and test items. Wrong entries stay visible beside the correction. Regroup boxes, think boxes, tallies, underlines and step checklists are never marked. |
| RM-P-06 | Trace content (grey model digits) is never scored and never counts toward the Score denominator. |
| RM-P-07 | A mode flagged "print-first" has no scored twin. On screen it shows the same cell with an unscored pad and the note "Show your teacher". It is excluded from on-screen tests. |
| RM-P-08 | Hands-on modes use dashed lines for cut edges and for nothing else. |
| RM-P-09 | Where an existing `answerType` is named, the build adapts it to the black-and-white cell; it does not keep that widget's present colours, emoji or titles. |

### 2.2 Mode table

`answerType` names are the values used today in `js/modules/question-render.js` / `answer-check.js` and the
widgets under `js/modules/widgets/`. "new" means a new answerType (or a new sub-mode of the sheet-kit input
layer) is required.

| Id | Short name | Paper form | On-screen twin | Existing answerType | Scored |
|---|---|---|---|---|---|
| RM-01 | write | Black answer line of width B(n), never under 14 mm (design standard 6.1), for a whole number; square box for one missing number | Tap the slot, type digits | `number`, `numpad-input`, `inline-blanks`, `inline-cloze` | yes |
| RM-02 | digit-grid | One digit per hairline box; regroup row above; heavy operation rule. Quotient boxes sit above the bracket | One single-digit input per box. Focus moves right to left for + - x, left to right for a quotient; regroup boxes are optional inputs | `col-arith`, `col-add`, `col-subtract`, `col-multiply`, `long-division`, `box-division`, `area-model` (keeps the `.column-answer-input` contract) | yes; regroup boxes no |
| RM-03 | template | The printed shape cues the form: fraction bar, whole box + fraction, `__:__`, `__.__`, `( __ , __ )`, "__ r __", `__:__` ratio | Composite input with fixed separators; equivalence-aware checking where the skill allows it | `fraction-input`, `dual-fraction`, `dual`, `coord-input`, `coordinate-multi`, `text` (time) | yes |
| RM-04 | write + unit | Line followed by the printed unit word ("__ inches"). v2 word problems: number blank + label blank | Inline number input; unit is printed, not typed. v2: second input takes a word from the story's nouns (chips) | `inline-blanks`; new sub-mode for the label chips | yes |
| RM-05 | write-symbol | Open circle of diameter Hw + 2 mm (8 / 10 / 12) between two quantities, and the same circle for an operation sign | Tap the circle, a 3-button (< = >) or 4-button (+ - x ÷) strip opens in place | `symbol`; extend for operation signs | yes |
| RM-06 | trace | Grey (or dotted-outline) digits, hands, lines or counters to go over | Tap the grey element; it turns black | new (unscored state of any slot) | no |
| RM-07 | circle-one | Options in one spaced row or stack; Model shows a dotted ring | Tap an option; a drawn ring appears round it (not a filled button) | `multiple-choice`, `choice`, `clock-choice` restyled as a ring | yes |
| RM-08 | circle-all | Field of items; the count to find may be printed ("find all 6") | Tap to toggle rings; a counter reads "3 of 6" when the count is given | `multi-select`, `multi-select-check`, `odd-even-select`, `hot-spot`, `image-hotspot` | yes (exact set) |
| RM-09 | multi-mark | Instruction assigns 2-3 marks (circle / box / cross out) to categories | Pick a mark tool, then tap items; or tap-then-tap into 2-3 bins | new; bin form can reuse `dnd-generic` | yes |
| RM-10 | cross-out | X through a counter, a used digit, an unworkable item or a wrong quotient | Tap to strike. For "cannot work this yet" items a strike disables that cell's inputs | new (counter strike exists inside `ten-frame`) | yes when the strike is the answer |
| RM-11 | underline | Pencil underline under a word, digit or sub-expression | Tap a token to toggle the underline | new | yes on sub-skill pages; no on keyword panels |
| RM-12 | check-box (named `tick` before 2026-09-19) | Hollow square check box, 5 / 6 / 7 mm, before a short first-person or Yes / No line | Tap the box | new (`multi-select-check` restyled for groups) | decision boxes yes; step checklists no |
| RM-13 | match | Two columns with anchor dots and a channel at least 40 mm wide | Tap a left item, then a right item; a straight line is drawn. Drag from dot to dot also works | `vocab-match`; generalise | yes |
| RM-14 | order | Row of items, then one short rule per position (optionally "least" / "greatest" under the ends) | Tap items in order, or type into the rules, or drag (the unified ordering widget already offers all three) | `interactive` + `interactiveType: "ordering"` | yes |
| RM-15 | cut-paste | Dashed tiles in a strip at the page foot; paste boxes the same size as the tiles; closed answer set | Tap a tile then a slot, or drag | `dnd-generic`, `drag-fill`, `tchart-drag`, `divisibility-sort`, `pv-digit-drag`, `compose-fraction-tiles`, `compose-shape-blocks`, `build-expr` | yes |
| RM-16 | layer | Value strips of graded length with a grey tab, stacked right-aligned | Tap strips in any order; they right-align and overlap in a landing box | new (later family) | yes |
| RM-17 | shade | Pre-partitioned outline; pupil shades parts | Tap a part to toggle the grey | `shade-parts` | yes (count, not position, unless the skill says so) |
| RM-18 | partition | Blank shape or line; circles carry guide dots; pupil draws the cuts | Tap two guide dots (shape) or a position on the line to add a cut; tap a cut to remove it | `place-symmetry-lines` (lines); new for equal parts and number-line ticks | yes |
| RM-19 | draw-counters | Empty ten-frame cells, tally box, dotted coin circles, place-value chart columns | Tap a cell to add a counter; tap again to remove. Tally box adds a stroke per tap and bundles the fifth | `ten-frame-build`, `ten-frame`, `pv-build`, `base10-build`, `array-builder`, `coin-builder` | yes (think-box tallies no) |
| RM-20 | ring-groups | Tidy object rows; pupil rings equal groups | Tap consecutive objects then "close group"; or drag a lasso | new | yes (group count and size) |
| RM-21 | table-fill | Hairline table, first row traced; blanks are empty cells | One input per empty cell, tab order by row | `grid-fill`, `mult-chart-cells`, `tchart-cells`, `factor-pairs`, `number-family`, `fact-family`, `interactive` + `"expanded"` | yes |
| RM-22 | label-bank | Short blank beside the item; word bank in a rounded box (shown on Guided, hidden on Independent unless "keep structural supports" is checked) | Tap the blank, choose a chip from the bank; with the bank hidden, type | `drag-fill` (chips); typed fallback `text` | yes |
| RM-23 | plot | Pre-drawn ticks or grid; pupil marks a dot, draws hops | Tap a tick or grid point to drop a dot; hops are tap start then tap end | `number-line-place`, `nl-drag`, `number-line-extended`, `coord-plot` | yes |
| RM-24 | draw-graph | Pre-labelled axes, blank pictograph rows, 12-sector circle | Tap a grid cell to fill a bar up to it; tap a row to add a symbol; tap sectors; tap intersections to join a line | `graph-builder`; new for line graph and sectors | yes |
| RM-25 | draw-hands | Face with no hands, or the hour hand only | Drag a hand, or tap a minute tick then an hour position; minute hand snaps to 5 minutes (1 minute at that level) | `clock-set` | yes |
| RM-26 | measure | Dotted segments; printed or cut-out ruler / unit strip | Draggable on-screen ruler (tap the segment to snap the ruler to its start), then type | new (print-first until built) | yes (typed value) |
| RM-27 | frame | Complete printed sentence with one or two number blanks; the unit word follows the blank | Inline inputs inside the sentence | `inline-blanks`, `inline-cloze` | yes |
| RM-28 | equation-frame | `__ ○ __ = __`: lines take numbers, circles take signs | Number inputs + sign picker (RM-05) | new (compose RM-01 + RM-05); accept any correct arrangement the skill allows | yes |
| RM-29 | rewrite | Empty digit grid or aligned lines; pupil copies the problem into the correct layout | Type digits into the grid; alignment (which column each digit sits in) is scored before the answer row unlocks | new (over `col-arith` grid) | yes |
| RM-30 | oral | One-line prompt; answer key in the teacher footer only | TTS (`hints-speech.js`) reads the prompt; pupil taps "I said it" (unscored). Dictation: TTS says the number, pupil types it (scored) | new for dictation; `number` for the typed part | dictation yes; say-aloud no |
| RM-31 | free-draw | Blank rounded box | Unscored sketch pad or text box; print-first | new (unscored) | no |
| RM-32 | hands-on | Record table or checklist beside real objects, dice, cards, cut-outs | Print-first (RM-P-07): the same cell with the note "Show your teacher"; the record table is offered as RM-21 inputs | none | no |

### 2.3 Slot shape to mode map (checked by the answer-slot lint)

| Slot shape on the page | Allowed modes |
|---|---|
| Black line | RM-01, RM-04, RM-14, RM-27 |
| Square box, digit-sized | RM-02, RM-29; RM-01 when one missing number |
| Square box, digit-sized, **dashed** (short dash) | RM-02 for the unknown digit of a missing-digit item (AS-16, MU-15); scored. Dashed = unknown, so it is never confused with the solid regroup box |
| Open circle | RM-05, the sign part of RM-28 |
| Fraction bar / composite template | RM-03 |
| Hollow check box | RM-12 |
| Dashed outline tile (long dash) | RM-15, RM-16 (cut) |
| Dotted outline | RM-06 (trace), placeholders for RM-19 |
| Grey box | think box only (unscored RM-19 tallies); never an answer slot |

---

## 3. Representations library

Every diagram and manipulative the cell templates may draw. Each entry gives drawing notes, the existing helper
that can be adapted, and what is missing. Exact stroke widths, grey value and minimum sizes are tokens in
`WORKSHEET_DESIGN_STANDARD.md`; the notes here fix shape and meaning.

### 3.1 Drawing rules for all representations

| Id | Rule |
|---|---|
| RL-G-01 | Ink is black on white plus ONE flat 40% grey. Grey is used for three things only: shaded parts, trace / model marks, faded scaffolds. No second grey, gradient, shadow, colour or emoji. |
| RL-G-02 | Photocopy-safe switch: every grey fill becomes fine 45-degree hatching; every grey trace digit becomes a dotted-outline digit; grey lines become dotted lines. Every helper takes one `mono` option object `{ photocopySafe: boolean }` and draws both forms. (`forPrint` stays as an alias during migration.) |
| RL-G-03 | Two line weights: **heavy** for frames, operation rules, outlines of things to judge; **hairline** for grids, partitions, ticks and table rules. |
| RL-G-04 | Line style carries meaning. Solid = given. Dotted = trace / model / "to be drawn here". Dashed = a cut line on a page, tile, card or strip, with one exception ruled by the owner on 2026-09-19: the unknown digit of a missing-digit item is a digit box with a short-dash outline (design standard LS-8), which tells it apart from the solid regroup box. Nothing else is dashed. An unknown in a diagram is a solid box marked `?`; a height, a split line or any other construction or measuring guide is dotted. Dashed never appears for decoration. |
| RL-G-05 | Corner style carries meaning. Square corners = structure (grids, charts, part boxes). Rounded corners = things to read or think in (story box, word bank, think box, number plate). |
| RL-G-06 | Numerals and words inside a diagram are Andika 400 or 700, never smaller than the size floor for the chosen S / M / L. A diagram scales by changing its cell size, never by shrinking its text below the floor. |
| RL-G-07 | Helpers return SVG or HTML with no inline colour literals: strokes and fills use the sheet-kit tokens of the design standard (`var(--ws-ink)`, `var(--ws-paper)`, `var(--ws-grey)`, patterns `#ws-hatch-45` and `#ws-hatch-135`). They write no title, no instruction and no answer unless `state` is `traced` or `answered`. |
| RL-G-08 | Every representation has three states: `blank` (pupil completes it), `traced` (Model: answer marks in grey / dotted), `answered` (answer key: answer marks in black). |
| RL-G-09 | Objects are countable at a glance: one kind per cell, equal size, equal spacing, rows of 5 (or 3 for sets under 10 at Level K), never overlapping, never rotated. |
| RL-G-10 | Generic, age-neutral, culture-neutral art. No faces, characters, national symbols, food brands or currency art. |

### 3.2 Library entries

`Helper today` names a function or module that already exists. "inline" means the drawing is built as a string
inside a `gen-*.js` branch and must be extracted into a helper before reuse.

| Id | Representation | Drawing notes | Helper today | Missing |
|---|---|---|---|---|
| RL-01 | Counting objects | Two sets. **Plain counters**: solid disc, hollow disc, solid square, hollow square. **Pictures** (8, in-house line art, 24-unit viewBox, 1.5 stroke, no fill): star, apple, fish, car, ball, flower, turtle, block. Scatter uses dice positions up to 6; otherwise rows. | `getWordProblemIcon` in `word-problem-icons.js` (has apple, ball, star, flower among 28 icons); `createCountingDots` in `svg-base10.js` | fish, car, turtle, block icons; a `counterSet` option; removal of emoji counters in `gen-counting.js`; row / scatter layout helper |
| RL-02 | Fact strategy cue | For + and − facts only. **Dot tile** (default): rounded-square tile beside the smaller numeral showing its value as dice dots (1-6) or two-row ten-frame dots (7-9), tile side max(6 mm, 0.62 em) per design standard SF-30. **Dots on numeral** (toggle): MathQuest's own dot positions drawn on the smaller numeral's strokes, 1 dot per count, solid black. The bigger number carries a dotted ring at fade stage 1-2 in the Model, pupil rings it elsewhere. For × and ÷ facts the cue is the RL-14 side strip (default), an **array tile** (rounded tile of solid dots, the set's constant in each row, 5 columns or fewer, design standard SF-33) or none. | none | both + − cue forms; the array tile; fade-stage parameter 1-4 |
| RL-03 | Ten frame | 2x5 hairline cells, heavy outline, solid discs at 0.65 of the cell, filled top row first, left to right. Horizontal when it sits over an equation; vertical when two frames stand side by side. Second addend = hollow discs. To-be-drawn = dotted circles. Moved counter = X through the disc + dotted arrow. Double and triple frames keep a gap of half a cell. | `widgets/ten-frame.js`, `widgets/ten-frame-build.js` | print renderer sharing the widget geometry; vertical form; hollow / dotted / crossed counter states; known `initialDots` defect fixed |
| RL-04 | Tally, tally box, counter mat | Strokes evenly spaced, every fifth a diagonal across the four. Tally box: square-cornered hairline rectangle 24 x 8 / 28 x 10 / 32 x 12 mm. Think box: a rounded box with a grey 1 pt outline, at least 24 mm wide x (Hw + 4) tall (helper, unscored, off by default). Mat: rounded rectangle with a vertical divider. | inline (`tally_chart` in `gen-data-stats.js`) | tally helper; tally box; think box; mat |
| RL-05 | Base-10 blocks | Flat = 10x10 hairline grid, rod = 10 segments, unit = small square, thousand = isometric gridded cube. Units sit in rows of 5. Optional labelled chart or rounded containers with arrows into a digit grid. Quick-draw form: open square, stick, open dot. | `createBase10Blocks` in `svg-base10.js`; `widgets/base10-build.js` | thousand cube; quick-draw form; container + arrow composition; mono option |
| RL-06 | Place-value chart with counters | 2-9 columns, heavy outline, hairline dividers, bold letters H T O (Th ...) above the columns by default (dialog: words / letters / none); comma printed between periods. Counters are solid discs in rows of 5, no value printed inside when the column gives the value; disks with 1 / 10 / 100 inside only for the named "disks" problem types. Shift arrows for x / ÷ 10. | `widgets/pv-disks-build.js`, `widgets/pv-digit-drag.js` | print renderer; label-style option; shift arrows; mono option |
| RL-07 | Digit grid | One hairline box per digit, sized by S / M / L writing height; heavy operation rule; operator in its own column at the left; regroup boxes (smaller, hairline) above the top number; place letters above; optional heavier decimal-point column. Variants: stacked compare grid (2 rows), rounding strip (letters over digit dashes, target bold, cut line after it), multiplication grid with a spare regroup row. | `widgets/col-arith.js`, `widgets/col-subtract.js`; `buildColumnVisual` in `gen-operations.js`; `_regroupBoxesHTML` in `gen-measurement.js` | one shared grid renderer for print + screen; ragged-length alignment; decimal column; rounding strip; place-letter option |
| RL-08 | Part-whole family | **Bond**: whole box over two (or three) part boxes joined by short lines. **Part-part-whole strip**: two small squares, arrow, heavier whole square. **Triangle**: whole at the top corner. **House**: square at the roof apex for the whole / product, two circles at the eaves for parts / factors, four equation lines in the body. **Family box**: rounded box with the three numbers over the four facts. Boxes are square-cornered; the unknown is the empty box and is never dashed or dotted (design standard RP-60). | inline (`number_bonds` in `gen-counting.js`; `number-family`, `fact-family` renderers in `question-render.js`) | one helper with `form: bond / strip / triangle / house / familyBox`; three-part bond; print states |
| RL-09 | Layered place-value strips | Strips of graded length (1, 2, 3, 4 digit widths), poster-size digits (63 pt; the one exception to working digit size, allowed on cut-and-layer strips only: design standard RP-144), grey tab at the left, dashed cut outline, landing box. | none | whole entry (later family) |
| RL-10 | Number track | Separate rounded boxes, 10 per row, numeral centred; blanks are empty boxes; optional direction arrow above. | `createNumberLine` (different object); `number_seq_fill` grid inline | track helper |
| RL-11 | Hundred / 120 chart and fragments | 10-column hairline grid, heavy outline, numerals centred; blanks empty; target cell may be grey. Fragment = 4-7 edge-joined cells cut from the chart, drawn without the rest of the grid. | inline (`hundreds_chart_fill`, `skip_count_grid`) | chart helper with `rows`, `blanks`, `fragment` options; multi-blank input on screen (`grid-fill`) |
| RL-12 | Number line | Heavy line with arrowheads at both ends; tall ticks for labelled values, short ticks for parts; labels below (second label row above for dual lines). Plotted point = solid dot, optional item letter above. Hops = arcs above the line with the step size on the arc. Forms: horizontal, vertical, double (two aligned lines), timeline (times under ticks, hop labels in hours / minutes), open (no ticks, pupil partitions). | `createNumberLine`, `createHopNumberLine` in `svg-base10.js`; `widgets/nl-drag.js`, `widgets/number-line-extended.js` | vertical, double, timeline and open forms; mono option (today uses `CLOCK_COLORS` / `LINK_COLORS`); letter tags on points |
| RL-13 | Rounding line | RL-12 with 11 tall ticks, the two endpoints and the midpoint labelled, optional pre-plotted dot. No arch form is drawn (one rounding route, `PEDAGOGY_STANDARD.md` P-2). | `rounding_visual` inline over `createNumberLine` | pre-plotted / blank states |
| RL-14 | Skip-count strip | Rounded strip of 10 (or 12) joined cells, multiples printed (full), partly printed, or empty for the pupil. Arrow form: long arrow of traceable multiples ending at an octagon outline that holds the dividend. | inline (`count_by_fill`) | strip helper with fill states; arrow form |
| RL-15 | Bar model and schema diagrams | Bars are heavy-outline (1.5 pt) rectangles on a common left edge, 10 / 12 / 14 mm tall, role labels printed, number slots inside, the unknown = a solid box marked `?` (never dashed), bracket over a total. Bar lengths are schematic and never encode the numbers. **Schema set**: part-whole (whole box over part boxes), change (three boxes in a row, start -> change -> end, joined by solid arrows, a sign circle on the change box), compare (two left-aligned bars, the shorter extended by a solid difference box), equal groups (row of identical unit bars under a total brace), multiplicative compare (one unit bar over n unit bars), measurement (labelled rectangle / prism), elapsed time (RL-12 timeline), two-step (two titled columns). Every part carries a short printed role label and a blank. | tape diagram inline in `gen-algebraic.js` (`tape_diagram`); `createLabeledRectSVG`, `createWordProblemShapeSVG` in `svg-geometry.js` | whole schema helper set; role labels; blank / traced states |
| RL-16 | Equal groups and arrays | Groups: objects inside plain ovals (hairline), equal spacing; an empty oval is legal. Array: dots or squares in a rectangular grid, optional row and column counts outside in the Model; split array has a solid hairline divider. | `createDotArray` in `svg-base10.js`; `widgets/array-builder.js` | oval groups; split array; ring-groups interaction |
| RL-17 | Area-model table, lattice, box division | Table with the operation sign in the corner cell, heavy header row and column, hairline inner cells, partial products written in cells, tall addition grid at the right. Lattice: square cells cut by a diagonal, alternate triangles grey. Box division: joined boxes left to right, subtraction stacks inside, quotient parts above. | `area-model` and `box-division` renderers in `question-render.js` | print parity; lattice; mono option; blank reusable template |
| RL-18 | Long-division grid | US bracket; dotted alignment grid as wide as the dividend, one digit per column, quotient boxes above the bracket, subtraction rules printed at scaffold level 3 and removed as support fades; optional column organiser (tall frame, one column per dividend digit); optional estimate box for 2-digit divisors. | `long-division` renderer | grid scaffold levels; organiser; estimate box; remainder template |
| RL-19 | Fraction models | Circle sectors, bars, square grids, polygons cut from the centre; heavy outline, hairline partitions (dotted where the pupil will shade), shaded parts in the grey. Values over 1: 2-4 wholes in one row, same size. Fraction wall thumbnail: stacked equal-length bars 1 to 1/12. Circles for pupil partitioning carry 12 or 24 guide dots on the circumference. | `fracCircleSVG`, `fracBarHTML`, `fracWithVisual`, `fracHTML`, `fracEquationHTML`, `fracCompareHTML` in `svg-fractions.js`; `shade-parts` renderer | mono option (today coloured); grids and polygons; fraction wall; guide dots; blank fraction template sized to S / M / L |
| RL-20 | Procedure organisers | Paired curved arrows labelled "÷ n" above and below a fraction pair; crossing arrows for compare; loop arrow for mixed -> improper; factor-tree stubs (two short branches under a number); fill-in frame with row micro-labels at the right; work-space column. | `createFactorLinksSVG` in `svg-factors.js` (factor arcs only) | all others |
| RL-21 | Decimal models | Ten-strip (1 x 10), hundred grid (10 x 10), thousand strip optional; shaded cells in the grey, column-first fill; dual-labelled 0-1 line (RL-12 double form). | `percent_visual` inline | helper shared by decimals and percent |
| RL-22 | Clocks | Double-ring rim, 12 numerals, minute ticks (hairline, 5-minute ticks heavier), arrow hands of clearly different length (hour 0.46 R, minute 0.78 R, so the hour hand is about 60% of the minute hand; design standard RP-101), hour hand heavier, solid pivot dot. Variants: numerals missing; ring of 12 small rounded boxes outside the rim for the fives; half-shaded face for "half past"; bold face without minute ticks for drawing hands; digital readout as a rounded plate with `__:__`. | `createAnalogClockSVG`, `createDigitalClockHTML`, `createClockChoiceWithMagnify` in `svg-clock.js`; `widgets/clock-set.js` | mono option (uses `CLOCK_COLORS`); the four variants; size floor so minute ticks survive photocopying |
| RL-23 | Generic coins and notes | Coins: outlined circles sized by value, 25 > 10 > 5 > 1 (24.26, 22.0, 19.75 and 17.5 mm; not US relative sizes, design standard RP-111), heavy rim plus a hairline inner ring (the double ring tells a coin from a counter), the value numeral centred in Andika 700, nothing else. Count-by-five dot cue optional: 5 = 1 dot, 10 = 2, 25 = 5, 1 = a short stroke. Notes: upright narrow rectangles with the value numeral. Placeholder = dotted circle. Price tag = rounded plate with a punched hole. | `_coinSvg` in `widgets/coin-builder.js` | replace present coin art with value-circles everywhere (`money_count`, `money`, `equiv_coin_sets`, `enough_money`, `make_change_least_coins`); notes; dot cue; placeholder |
| RL-24 | Picture bars | One object per unit in a hairline bar, bars on one baseline (vertical) or one left edge (horizontal); no axis numbers. | none (`compare_groups` inline) | whole entry |
| RL-25 | Decision icons | Check box (hollow 5 mm square); two outlined decision shapes (an arrow outline = "go on, no regrouping", an octagon outline = "stop, regroup first") each with its check box; dotted "ring this" outline (a modelled mark, first cell only). | none | whole entry |
| RL-26 | Rulers and scales | Ruler: heavy outline, numerals under the tall ticks, inch form with halves / quarters, centimetre form with millimetres at Level 3+; zero at the first tick, not at the ruler's end. Vertical scale (thermometer, jug): hairline ticks, labelled every 5 or 10, level shown in the grey. Balance: beam + two pans, tilt 0 or 10 degrees. | inline (`reading_ruler`, `temperature`, `capacity`, `heavier_lighter_visual` in `gen-measurement.js`) | helpers; mono option; draggable ruler (RM-26) |
| RL-27 | Shapes and solids | Heavy outline for shapes to judge; hairline + dotted partitions for shapes to shade. Varied size, orientation and proportion; near-miss non-examples (open shapes, curved sides). Solids as wireframes: visible edges heavy, hidden edges as a 0.5 pt solid hairline, never dashed and never grey. Pattern-block outlines; nets as joined hairline faces. | `createShapeSVG`, `createSquareSVG`, `createTriangleSVG`, `create3DBoxSVG` in `svg-geometry.js`; shape generators inline in `gen-geometry.js` | mono option; non-example generator; nets and wireframes as helpers |
| RL-28 | Measurement figures | Thin figures with side labels outside the figure, tick marks for equal sides, right-angle squares, dotted height or split-line guide, unit grid as hairlines, isometric cube stacks with visible-layer shading in the grey. Labels carry units. | `createRectangleSVG`, `createLabeledRectSVG`, `createLShapeSVG`, `createTShapeSVG`, `createTriangleSVG`, `create3DBoxSVG` | U shapes; cube stacks; missing-side box state; mono option |
| RL-29 | Angles and lines | Two rays from a solid vertex dot, arc at 12-15% of ray length, right angle = small square; line = arrowheads both ends, ray = dot + arrowhead, segment = two dots; parallel marks = matching arrow ticks; printed protractor as a hairline semicircle with 10-degree labels. | `createAngleSVG`, `computeTriangleAngles` | line / ray / segment figures; protractor; mono option |
| RL-30 | Coordinate grid | Hairline grid, heavy axes with arrowheads, labels every 1 or 2 units outside the grid, origin labelled once; points = solid dots with a letter; source figure for a transformation in the grey. | inline in `gen-geometry.js`; `widgets/coord-plot.js` | shared print / screen helper; mono option |
| RL-31 | Graphs | Bar graph: hairline grid, heavy axes, bars grey with a heavy outline (one series) or grey + white, both heavy-outlined (two series; never more), category labels under bars, scale labels at every grid line. Pictograph: table with a key row, half symbols allowed, symbols from RL-01. Line plot: X marks stacked over an RL-12 line. Line graph: dots joined by heavy segments. Circle graph: 12 equal sectors, categories told apart by printed labels on leader lines, with grey and white fills only (hatch appears only as the photocopy-safe form of the grey). Box plot, histogram: hairline over an RL-12 line. Every graph has a title line and axis labels (printed, or blank when building). | inline in `gen-data-stats.js`; `widgets/graph-builder.js` | helpers per graph type; pattern fills instead of colours; known defects fixed (line-plot X marks, circle-graph "undefined" labels) |
| RL-32 | Probability objects | Spinner: circle with equal sectors told apart by a printed letter, word or shape token (white or the one grey), arrow from a solid pivot dot. Bag: rounded outline with RL-01 counters told apart by solid / hollow / square. Number cube net. | inline (`probability_basic`) | helpers; label and token marking instead of colours |

### 3.3 Representation stage (links to variant axis VA-04)

Every representation above maps to one of three stages. A generator that declares `representations[]` lists the
stages it supports; the page role and ladder step choose one.

| Stage | Meaning | Examples |
|---|---|---|
| `concrete` | Countable objects the pupil can touch, cross out or ring | RL-01, RL-03, RL-04, RL-05, RL-16, RL-23 |
| `pictorial` | A structured diagram that stands for the quantities | RL-06, RL-08, RL-12, RL-13, RL-15, RL-17, RL-19, RL-21 |
| `abstract` | Symbols only, with or without a structural grid | none, RL-07, RL-18 |
| `bridging` | Picture and symbols side by side in one cell (used for exactly one step when a ladder moves between stages) | RL-05 + RL-07, RL-19 + fraction template |

---

## 4. Variant axes every generator should expose

Owner decision: the problem mix of a section is teacher-selectable - ONE problem type + notation, or
deliberately mixed. That only works if generators stop mixing silently and instead accept explicit options.
Options travel in `generateQuestionFor({ category, skill, range, decimals, opts, seed })`; a skill honours an
axis only if it declares it (see `design/SKILL_CELL_CONTRACT.md`, `variants[]`, `representations[]`).

### 4.1 Rules

| Id | Rule |
|---|---|
| VA-R-01 | **No silent mixing.** With `opts` absent, a generator uses its declared `default` for every axis, and that default is a single value, not a random pick. Randomising across values happens only when the caller passes `"mixed"` (or a weighted list) for that axis. |
| VA-R-02 | Every axis value is a stable string id. Ids appear in the print dialog ("Problem type", "Notation", "Unknown") with plain labels, in ladder steps, and in saved section state. They are never renamed; retired values get an alias. |
| VA-R-03 | A section stores one value per axis, or `mixed` with optional weights. A "mixed" section must still hold format constant where `PEDAGOGY_STANDARD.md` requires it (a ladder step never mixes formats; review, spiral and test pages may). |
| VA-R-04 | The generator reports what it produced in the contract's fields: `q.variant` (the problem-type id), `q.notation`, `q.representation`, and the honoured `constraints` echoed back (`unknown`, `profile`, `edge`, `nonExample`). Page roles, the content audit and the answer key read this; nothing sniffs the HTML. |
| VA-R-05 | All randomness comes from the seeded RNG passed in. Same seed + same opts = same item, on paper and on screen, for Test A/B, probe forms A-D, Today's Number versions A-D and Day bands. |
| VA-R-06 | `state.range` and `state.decimalPlaces` stay the outer bounds. An axis narrows inside them and never exceeds them. Fixed-domain skills (time, angles, coordinates) ignore range as they do today. |
| VA-R-07 | If a requested combination is impossible (for example "regroup" within 10 with no teen sums), the constraint is never silently relaxed: generation for that section fails loudly in the dialog (contract SCC-D1) and the dialog names the combination. Nothing is printed on the pupil sheet. |
| VA-R-08 | Duplicates: within one section no two items share the same operands in the same order; a commuted pair counts as a duplicate for fact sets of 20 items or fewer unless the pool is too small. |

### 4.2 The axes

The keys in brackets are catalogue names. In code they travel in the contract's `GenOpts`: VA-01 is
`opts.variant`; VA-02 is `opts.notation`; VA-04 is `opts.representation`; VA-05 is `opts.scaffoldLevel`; VA-03 and
VA-06 to VA-11 are keys of `opts.constraints` (`unknown`, `regroup`, `zeros`, `digits`, `profile`, `edge`,
`edgeCases`, `nonExample`, `contrast`, `language`, `context`), whose closed vocabulary is section 9.3 of
`design/SKILL_CELL_CONTRACT.md`.

| Id | Axis (`opts` key) | Values | Applies to | Notes |
|---|---|---|---|---|
| VA-01 | Problem type (`type`) | The `PT` ids of section 1 that the skill covers, exposed as short ids, e.g. `add_facts`: `add_n`, `doubles`, `near_doubles`, `make_ten`, `teens_plus_1digit`, `any` | every skill with more than one item shape | Replaces today's weighted internal `pick([...])` calls and the `variant-cycler.js` rotation as the only source of type choice. `variant-cycler.js` remains the chooser when the caller passes `mixed` on screen. |
| VA-02 | Notation / orientation (`notation`) | `vertical`, `horizontal`, `bracket` (division), `obelus` (÷), `fraction_bar` (division as a fraction), `words` (number sentence in words), `mixed` | operations, facts, fractions, decimals | Fact probes use a fixed split (15 vertical + 5 horizontal); that split is a page-role rule, not `mixed`. |
| VA-03 | Unknown position (`unknown`) | Computation: `result`, `second`, `first` (a + __ = c, __ + b = c), `both_sides` (a + b = __ + d). Word problems: per schema - change: `result / change / start`; part-whole: `whole / part`; compare: `difference / bigger / smaller`; equal groups: `total / groups / size`; multiplicative compare: `bigger / smaller / multiplier` | equations, facts, families, word problems | Default `result`. Ladder data introduces the others one at a time. |
| VA-04 | Representation stage (`stage`) + representation (`rep`) | `stage`: `concrete`, `pictorial`, `bridging`, `abstract`. `rep`: an `RL` id the skill supports (e.g. `RL-03`, `RL-12`) | any skill with a visual form | Merges today's paired skills (`*_nv`, `*_plain`, "(Visual)" twins) into one skill + option; the old ids stay as aliases. |
| VA-05 | Scaffold level (`scaffoldLevel`) | `3` full (place letters, regroup boxes, traced first step, captions) .. `0` none | every cell template | Hint scaffolds fade with the level; structural scaffolds (digit grid, regroup boxes, frames) persist while "keep structural supports" is checked. Not a content axis, listed here because generators must supply the data the scaffolds need (regroup digits, partial products, step marks). |
| VA-06 | Number profile (`profile`) | Set of flags: `regroup: none / ones / tens / multiple / across_zero / any`; `zeros: none / in_minuend / in_factor / in_quotient / trailing`; `zeroRun: whole_ten / whole_hundred / whole_thousand / one / two / middle` (the across-zeros sub-ladder, taught after general regrouping; the zero count or position is the only thing that changes per step); `lengths: equal / ragged` (e.g. 3-digit + 2-digit); `digits: [n, m]` per operand; `facts: [n...]` (which tables or addends); `within: N` (sum / minuend cap); `denominators: like / related / unlike`; `result: proper / improper / whole / needs_simplifying`; `remainder: none / some / always`; `decimals: aligned / ragged` | operations, facts, fractions, decimals, division | Replaces the 48 `add_*` / `sub_*` range-by-regroup skill ids as the real control; those ids remain as presets (aliases that set `within` + `regroup`). |
| VA-07 | Edge-case seeding (`edge`) | `off`, `seeded` (default), `only`. Each skill declares its edge list, e.g. + 0, x 0, x 1, n - n, n ÷ n, n ÷ 1, 0 in the tens place, 1000 - n, sums of exactly 10 / 100, fraction equal to 1, empty group, a.m./p.m. crossing 12, 0 coins of a kind | every skill | `seeded` places each declared edge case at least once per 20 items and never in the first two items of a new step. |
| VA-08 | Non-example ratio (`nonExample`) | `0` .. `0.5` (default `0` for computation; `0.25-0.4` for judge / discrimination types) | decision, discrimination, True or False?, classify, "can you work this?" types | Share of items whose correct response is "no", "not equal", "cannot", "does not belong". Runs of the same answer are capped at 3. |
| VA-09 | Discrimination pairing (`contrast`) | `none`, or the id of a second skill / type to interleave (e.g. missing addend vs missing factor; + vs x; like vs unlike denominators; 87.2 vs 87.20) + a ratio | discrimination pages, mixed-sign sets | Items keep identical layout so only the mathematical feature differs. |
| VA-10 | Language form (`language`) | Word problems: `consistent`, `inconsistent` ("fewer than" with the bigger quantity unknown), `distractor_verb`, `extra_number`; all types: `symbolic`, `words` | word problems, comparison, time, place value | `inconsistent` and distractors start at Level 2 by default. |
| VA-11 | Context hold (`context`) | `vary` (default), `hold` (one story context across a set of 4, only the numbers and the unknown change), a named context id | word problems | Contexts come from a neutral list (classroom, garden, library, sports kit, market stall, bus, bakery without brands). |
| VA-12 | Units and conventions (`units`) | `customary`, `metric`, `both`; money `generic` (fixed) | measurement, money, word problems | Default `both` for conversion sets, `metric` for stories unless the ladder says otherwise. |
| VA-13 | Response mode (`response`) | any `RM` short name the skill declares as equivalent for the item | skills that can be answered more than one way (e.g. compare: write-symbol or circle-one; shapes: circle-all or label-bank) | The print and screen items always share the same value (RM-P-01). |
| VA-14 | Form / seed (`form`) | `A`, `B`, `C`, `D`, or an integer seed | tests, probes, Today's Number, Daily 4, Day bands | Form letters map to fixed seed offsets so form B is parallel (same profile, different numbers). |

### 4.3 What the print dialog shows per section

```
Section: Subtract within 1,000                         [ remove ]
  Problem mix   (o) One type   ( ) Mixed
  Type          [ Vertical, regroup tens only      v ]
  Notation      [ Vertical  v ]     Unknown  [ Result v ]
  Numbers       Regroup [ tens v ]  Zeros [ none v ]  Lengths [ equal v ]
  Supports      Scaffold [ 2 v ]  [x] keep structural supports  [ ] hints on tests
  Edge cases    [ seeded v ]        Non-examples [ 0% ]
  Columns       [ Auto v ]   Size [ L v ]   Labels [ letters v ]
  note: 4 columns asked, 3 fit at size L with 3-digit numbers.   <- dialog only
```

Only the rows a skill declares are shown. A skill with no declared axes shows Problem mix as disabled with the
text "This skill has one problem type".

### 4.4 Minimum axis support by family (exit criterion for each family migration)

| Family | Must declare |
|---|---|
| Operations + facts | VA-01, 02, 03, 05, 06, 07, 09, 14 |
| K-2 number sense | VA-01, 04 (counter set via `rep`), 05, 07, 13, 14 |
| Time + money | VA-01, 04, 05, 07, 13 |
| Place value + rounding | VA-01, 04, 05, 06 (`digits`, `zeros`), 07 |
| Fractions / decimals | VA-01, 02, 04, 05, 06 (`denominators`, `result`, `decimals`), 07, 08, 09 |
| Geometry + measurement | VA-01, 04, 07, 08, 12, 13 |
| Data | VA-01 (question kind: literal / compute / compare), 04 (graph type), 13 |
| Algebra / order of operations / number theory | VA-01, 02, 03, 06, 07, 08 |
| Word problems (all families) | VA-01 (schema), 03, 06, 10, 11, 12, 14 |

---

## 5. Coverage gaps: problem types to add, in rollout order

Checked against `SKILLS` in `js/modules/data.js` (573 entries across 35 categories, including mixed and
vocabulary sets). Gaps are grouped by rollout family. Within a family, priority is **P1** (needed for the
family's first ladders and mock-ups), **P2** (needed before the family is called done), **P3** (nice to have,
may slip to a later family).

Rules for adding:

| Id | Rule |
|---|---|
| GAP-R-01 | Prefer a new **option on an existing skill** (a VA-01 type value or VA-06 profile) to a new skill id. Add a new skill id only when the item needs its own label in the Skills Navigator or its own ladder. |
| GAP-R-02 | A new skill id is appended to its category in `SKILLS` (never inserted - positional share codes), gets a frozen code, a `grade`, a `SKILL_PRINT_SIZE` entry, and a footprint in the cell contract. |
| GAP-R-03 | Twin skills (`*_nv`, `*_plain`, `*_no_regroup / _regroup / _mixed`, easy / medium / hard) are merged by alias, never deleted or spliced. |
| GAP-R-04 | Research the type on the repo's mandated reference sites before building (see `CLAUDE.md`), then write all items, stories and instructions in MathQuest's own words. |
| GAP-R-05 | Nothing in this list tracks pupils. Types that exist only to log progress are out of scope (PT-G-13). |

### 5.1 Family 1 - operations + facts

| Id | Add | How | Pri | PT ref |
|---|---|---|---|---|
| GAP-1-01 | Single-fact sets "Add n" / "Subtract n" (n = 1..9, then the 0 set last) with the four-part cue fade | `type: add_n / sub_n` + `facts: [n]` on `add_facts`, `sub_facts`; RL-02 cue | P1 | FF-01 |
| GAP-1-02 | "Multiply by n" / "Divide by n" sets in the order {0, 1, 2, 5, 10}, {3, 4, 6}, {7, 8, 9}, {11, 12}, to 12 by default, with the × ÷ cue (strip / array tile / none) and its fade (strip -> grey strip -> none -> mixed), bracket and ÷ notation, optional think box | `facts: [n]` + `notation` on `mult_facts`, `div_facts`; RL-14 | P1 | FF-02 |
| GAP-1-03 | Fact-family sets with Intro / Warm-up / Probe A-D structure | new set structure over `add_sub_fact_family`, `mult_div_fact_family`; `form` axis | P1 | FF-03 |
| GAP-1-04 | High-column fact rows (5-10), practice strips, cumulative review | layouts over the four fact skills (fixes the column bug) | P1 | FF-04..06 |
| GAP-1-05 | Teens plus / minus one digit; 10 + n, 20 + n | `type: teens_pm_1digit`, `ten_plus_n` on `add_facts` / `sub_facts` | P1 | FF-11 |
| GAP-1-06 | Column sums of 3-4 multi-digit addends, ragged lengths | new skill `add_column_multi` (category `addition`) | P1 | AS-07 |
| GAP-1-07 | Regroup-or-not decision | `decision(q)` adapter on the add / subtract skills -> sub-skill page | P1 | AS-08 |
| GAP-1-08 | Regroup notation only, incl. the across-zeros sub-ladder (L-5Z) | `setupOnly(q)` adapter + `profile.regroup: across_zero` + `profile.zeroRun` | P1 | AS-09 |
| GAP-1-09 | Rewrite horizontal -> vertical (whole numbers, x, ragged decimals) | `response: rewrite` (RM-29) on add / subtract / multiply / decimal skills | P1 | AS-11, MU-11, DE-09 |
| GAP-1-10 | Number profile control (regroup place, zeros, ragged) replacing silent mixing | VA-06 on `add_*`, `sub_*`, `add`, `subtract`, `multiply`, `divide` | P1 | AS-05, AS-10 |
| GAP-1-11 | Discrimination sets: missing sign; + vs x; missing addend vs missing factor | `contrast` axis; new type on `missing_add_sub`, `missing_mult_div` | P2 | EQ-04, MU-12, MU-13 |
| GAP-1-12 | Count-on / count-back facts with dot cue; neighbour numbers; subtract doubles; doubles + 1 | types on `add_facts`, `sub_facts`, `doubles_near_doubles` | P2 | FF-07..09 |
| GAP-1-13 | Related facts yes / no + write the related fact | new type on the fact-family skills; RM-12 | P2 | FF-13 |
| GAP-1-14 | Factors ending in zeros | new skill `mult_zeros` (category `multiplication`) | P2 | MU-06 |
| GAP-1-15 | Explicit algorithm levels 1x2, 1x3, 1x4, 2x2, 2x3, 3x3 in a digit grid | `profile.digits` on `multiply` | P1 | MU-09 |
| GAP-1-16 | Equal groups with "__ groups of __" language, edge groups (one group, groups of one, empty) | type on `arrays_groups` | P2 | MU-01 |
| GAP-1-17 | Division concepts: ring equal groups with labelled blanks; skip count to a stop | types on `div_facts` / `nl_div`; RM-20 | P2 | DV-01, DV-02 |
| GAP-1-18 | Long-division pre-skills (underline the first part, multiply inside the bracket), quotient too small / too big, check-and-fix, estimate box, column organiser | adapters + scaffold levels on `divide`, `long_div_2digit`, `div_remainders` | P2 | DV-06..09, RD-08 |
| GAP-1-19 | Is d a factor of N by dividing | type on `factors_identify` | P3 | DV-10 |
| GAP-1-20 | Remainders by ringing tallies | type on `div_remainders` | P2 | DV-05 |
| GAP-1-21 | Check by inverse | type on add / subtract / divide skills | P3 | AS-15 |
| GAP-1-22 | Lattice multiplication | optional method on `multiply`, `mult_decimal` | P3 | MU-10 |
| GAP-1-23 | Schema word problems for + - x ÷ (WP-02..08, 12) with schema tag, unknown position, v1 / v2 / K picture from one seed; keyword panel option | schema engine over `add_wp_*`, `sub_wp_*`, `mult_word_problems`, `div_word_problems`, `comparison_word`, `unknown_start_wp`, `multi_step_word`; new types two-change, 3-part | P1 (change, part-whole, compare, equal groups), P2 (rest) | WP-01..08, WP-12 |
| GAP-1-24 | `wrongAnswer` and `workedSteps` adapters for all operations skills (feeds error analysis, True or False?, Reason It, scripted Model) | adapters | P1 | TH-02..06, FO-13 |
| GAP-1-25 | Missing-digit items for +, -, x: one unknown digit, then two, drawn as a dashed digit box | `type: missing_digits` on `add_*`, `sub_*`, `multiply`; slot shape `box-unknown` | P2 | AS-16, MU-15 |

### 5.2 Family 2 - K-2 number sense

| Id | Add | How | Pri | PT ref |
|---|---|---|---|---|
| GAP-2-01 | Count and choose the numeral (circle-one) alongside count and write | `response` axis on `count_objects` | P1 | CC-01 |
| GAP-2-02 | Draw that many | type on `count_objects`; RM-19 | P1 | CC-03 |
| GAP-2-03 | Dot pattern / object row to numeral match | type on `count_objects`; RM-13 | P2 | CC-04 |
| GAP-2-04 | Take N from a larger set | type on `count_objects`; RM-20 | P2 | CC-05 |
| GAP-2-05 | Find the target numeral; numeral formation (trace, copy) | new skill `numeral_formation` (category `counting`) | P2 | CC-06, CC-07 |
| GAP-2-06 | 120 chart with many blanks + 1 / 10 more / less strip; hundred-chart fragments | types on `hundreds_chart_fill`; RL-11 | P1 | CC-15, CC-16 |
| GAP-2-07 | Today's Number sheet (to 20 / 120 / 1,000 / 10,000+, versions A-D) | composer, not a skill | P1 | PV-19 |
| GAP-2-08 | Equal / not equal groups; make both sides equal | new skill `equal_groups_compare` (category `comparing`) | P2 | EQ-01 |
| GAP-2-09 | Missing addend with frames -> tallies -> bare | `stage` axis on `missing_add_sub` | P1 | EQ-02 |
| GAP-2-10 | Label part / whole, choose the rule | `decision(q)` adapter on `missing_add_sub`, `number_bonds` | P2 | EQ-07 |
| GAP-2-11 | Counter-set option (plain counters / 8 pictures) on every counting skill; four new icons | RL-01 | P1 | all CC |
| GAP-2-12 | Picture bars "which is more" | type on `compare_groups`; RL-24 | P2 | CC-11 |
| GAP-2-13 | Numerals in order (order on screen, cut-and-glue later) | type on `number_seq_fill` | P3 | CC-08 |

### 5.3 Family 3 - time + money

| Id | Add | How | Pri | PT ref |
|---|---|---|---|---|
| GAP-3-01 | Clock numerals; identify the hands | new skill `clock_parts` (category `measurement`) | P1 | TM-01, TM-02 |
| GAP-3-02 | "__ minutes after __" with the fives ring | type on `time_5min`; RL-22 variant | P1 | TM-04 |
| GAP-3-03 | Word / spoken time -> `__:__` (:00 and :05 cases as seeded edges) | type on `time_hour` .. `time_5min` | P2 | TM-05 |
| GAP-3-04 | Draw the hands as a production item on every time skill | `response: draw-hands` via `clock-set` | P1 | TM-07 |
| GAP-3-05 | a.m. / p.m.; more or less than a minute | new skill `time_sense` | P3 | TM-08 |
| GAP-3-06 | Elapsed time on a timeline | `rep: RL-12 timeline` on `elapsed_*` | P2 | TM-10, WP-10 |
| GAP-3-07 | Generic value-circle coins everywhere | RL-23 replaces present coin art | P1 | all MN |
| GAP-3-08 | Like coins with running totals; unlike coins with the count-by-five dot cue (printed -> drawn -> none) | types + cue fade on `money_count` | P1 | MN-02, MN-03 |
| GAP-3-09 | Find the target coin; value of one coin | type on `money_count` | P2 | MN-01 |
| GAP-3-10 | Compare two collections | new skill `money_compare` | P2 | MN-04 |
| GAP-3-11 | Show an amount (draw / build), amount notation with zero cases | types on `equiv_coin_sets`; new type `money_notation` | P2 | MN-05, MN-06 |
| GAP-3-12 | Money stories as a schema with generic units | WP-11 over `money`, `enough_money` | P3 | WP-11 |

### 5.4 Family 4 - place value + rounding

| Id | Add | How | Pri | PT ref |
|---|---|---|---|---|
| GAP-4-01 | Unit form and non-standard decomposition | new skill `unit_form` (category `placevalue`) | P1 | PV-07 |
| GAP-4-02 | Number dictation (TTS on screen, teacher-read on paper) | new skill `number_dictation`; RM-30 | P1 | PV-05 |
| GAP-4-03 | Word form into a chart with the comma pre-printed | type on `pv_digit_drag` / `number_word_form` | P2 | PV-04 |
| GAP-4-04 | Compare with a rewrite grid or block support; compare mixed representations | `stage` + `type` on `placevalue:compare` | P1 | PV-10, PV-11 |
| GAP-4-05 | Circle the blocks needed; numeral -> quick-draw | types on `base10_build` | P2 | PV-02, PV-03 |
| GAP-4-06 | Place-value number bond | type on `expand` | P2 | PV-08 |
| GAP-4-07 | Inverse more / less frames ("__ more than a is b") | `unknown` axis on `more_less_10`, `more_less_100` | P2 | PV-13 |
| GAP-4-08 | Cross out the unneeded zero; put in the comma | new skill `number_format` | P3 | PV-17 |
| GAP-4-09 | Place-letter + cut-line rounding method; "closest to which ten" frame | `rep` + `type` on `nearest_*`, `round_decimals` | P1 | RD-03, RD-05 |
| GAP-4-10 | Pre-plotted -> blank fade on the rounding line | `scaffoldLevel` on `rounding_visual` | P2 | RD-01 |
| GAP-4-11 | Layered strips | later hands-on family | P3 | PV-18 |

### 5.5 Family 5 - fractions / decimals

| Id | Add | How | Pri | PT ref |
|---|---|---|---|---|
| GAP-5-01 | Equal vs unequal parts; name the parts incl. "not divided" | types on `partition_shapes` | P1 | FR-01, FR-02 |
| GAP-5-02 | Denominator only -> numerator only -> both | `setupOnly` style sub-steps on `write_fraction` | P1 | FR-03 |
| GAP-5-03 | Partition then shade; partition a blank number line; vertical and 0-3 lines | RM-18 on `shade_fraction`, `fraction_number_line` | P1 | FR-06, FR-07 |
| GAP-5-04 | Compare to 1, sort <1 / =1 / >1, make n/n, write three of each | new skill `fractions_and_one` | P2 | FR-08 |
| GAP-5-05 | Fraction number bond; missing n/n multiplier | types on `decompose_fractions`, `equivalent` | P2 | FR-09, FR-15 |
| GAP-5-06 | Simplify with paired ÷ arrows / prime-factor cancel | `rep: RL-20` on `simplify` | P2 | FR-16 |
| GAP-5-07 | "Can you add these as they are?"; multiply vs add discrimination | `decision` adapter + `contrast` on fraction-operation skills | P1 | FO-02, FO-08 |
| GAP-5-08 | Fraction ÷ fraction, whole ÷ non-unit fraction, mixed ÷ mixed, reciprocals; mixed x mixed | new skills `div_fractions`, `mult_mixed` (category `fraction_operations`) | P2 | FO-06, FO-09 |
| GAP-5-09 | Read / write decimals with word form and frames; look-alike decimals; equivalent-decimal table; grid -> decimal | new skills `decimal_read_write`, `decimal_models` (category `decimals`) | P1 | DE-01..04, DE-08 |
| GAP-5-10 | Compare decimals with a rewrite step and contrast pairs | `response: rewrite` + seeded edges on `compare_decimal` | P1 | DE-06 |
| GAP-5-11 | More / less / exactly 100% reasoning; "x out of y" as a percent | type on `percent_of_number`, `percent_visual` | P3 | RP-03 |
| GAP-5-12 | Match picture / fraction / word / decimal | RM-13 type on `fractions:identify`, `f_to_d` | P3 | FR-10 |

### 5.6 Family 6 - geometry + measurement

| Id | Add | How | Pri | PT ref |
|---|---|---|---|---|
| GAP-6-01 | Point / line / ray / segment; intersecting lines | types on `identify_lines` | P1 | AN-02 |
| GAP-6-02 | Polygon vs not a polygon; attribute chart with non-examples | `nonExample` axis on `shape_attributes` | P1 | GE-07 |
| GAP-6-03 | Solids: rolls / slides / stacks, which face you would trace; flat vs solid sort | types on `name_3d_shapes`, `count_edges_faces_vertices` | P2 | GE-03, GE-04 |
| GAP-6-04 | Cumulative word-bank labelling (bank on Guided only) | RM-22 on `identify_angles`, `classify_triangles`, `classify_quads` | P1 | GE-08, AN-01 |
| GAP-6-05 | Measuring rules: pick the correct picture | new skill `measuring_rules` | P2 | ME-05 |
| GAP-6-06 | Measure lettered segments (print-first) | type on `reading_ruler` | P3 | ME-04 |
| GAP-6-07 | Missing side from area / perimeter | `unknown` axis on `area`, `perimeter` | P2 | AP-06 |
| GAP-6-08 | Perimeter / area / volume as word-problem schemas | WP-09 | P2 | WP-09 |
| GAP-6-09 | Pupil-drawn split line on composite shapes | RM-18 on `composite_shapes` | P3 | AP-04 |

### 5.7 Family 7 - data

| Id | Add | How | Pri | PT ref |
|---|---|---|---|---|
| GAP-7-01 | Line graph: read and construct | new skill `line_graph` (category `graphs`) | P1 | DA-06 |
| GAP-7-02 | Data-table reading | new skill `data_table` | P2 | DA-07 |
| GAP-7-03 | Question-kind control: literal / compute / compare on every graph skill | VA-01 on `bar_graph`, `pictograph`, `line_plot*`, `pie_chart`, `tally_chart` | P1 | DA-01..05 |
| GAP-7-04 | Shade a 12-sector circle graph from a tally; pattern key | type on `pie_chart`; RL-31 | P2 | DA-08 |
| GAP-7-05 | Scene -> tally -> bar graph chain on one page | page composition over `tally_chart`, `build_bar_graph` | P2 | DA-03, DA-04 |
| GAP-7-06 | Nine-question routine on one graph; one stem across six graphs | page compositions | P3 | DA-09, DA-10 |
| GAP-7-07 | Roll-and-graph game | later hands-on family | P3 | DA-11 |

### 5.8 Family 8 - algebra, order of operations, number theory, vocabulary

| Id | Add | How | Pri | PT ref |
|---|---|---|---|---|
| GAP-8-01 | Underline the step you do first | `decision` adapter on all `order_of_operations` skills; RM-11 | P1 | OO-01 |
| GAP-8-02 | Stepped rewrite lines as the standard cell for order of operations | RM-29 on the same skills | P1 | OO-02 |
| GAP-8-03 | Put in the parentheses | new skill `insert_parens` | P3 | OO-04 |
| GAP-8-04 | Prime factorisation (factor tree) | new skill `prime_factorization` (category `number_theory`) | P1 | NT-05 |
| GAP-8-05 | Divisibility with proof by dividing | type on `divisibility_sort` | P2 | NT-04 |
| GAP-8-06 | Rule frame for number patterns ("The rule is ○ __") | RM-28 on `number_pattern`, `function_table_*` | P2 | PA-02, PA-04 |
| GAP-8-07 | Label a diagram from a bank; example / non-example of a word | types on the `vocab_grade_*` sets | P2 | VO-02, VO-03 |
| GAP-8-08 | Percent and ratio stories with labelled equation boxes | WP-14 | P3 | WP-14 |

### 5.9 Cross-family additions (built once in the foundation, used by every family)

| Id | Add | Pri |
|---|---|---|
| GAP-0-01 | The four thinking wrappers TH-01..07 driven by `wrongAnswer`, `workedSteps`, `variants` | P1 |
| GAP-0-02 | New response modes with no answerType today: RM-06 trace, RM-09 multi-mark, RM-10 cross-out, RM-11 underline, RM-12 check-box, RM-18 partition (equal parts, ticks), RM-20 ring-groups, RM-28 equation-frame, RM-29 rewrite, RM-30 dictation | P1: 06, 12, 28, 29; P2: 10, 11, 18, 20, 30; P3: 09 |
| GAP-0-03 | `mono` option through every `svg-*.js` helper and every widget renderer (RL-G-02) | P1 |
| GAP-0-04 | Extraction of inline drawings into helpers: tally, ruler, scales, graphs, tape / schema diagrams, number track, hundred chart, part-whole family, decision icons | P1 for the family being migrated |
| GAP-0-05 | Hands-on forms (cut-paste tiles, cut-and-order cards, match, find-and-colour, layered strips, flashcards) for CC-08, PV-18, TM-09, GE-04, RD-06, DA-11, FF-03 flashcards | later family |

### 5.10 Out of scope (do not build)

Pupil progress trackers, goal pages, class record sheets, mastery logs, progress graphs, mastery gates,
placement data sheets that record trials, any third-party curriculum's question wording or branding, realistic
national coin or note art.

---

## 6. Acceptance checks for this document's rules

| Check | Verifies | Where it runs |
|---|---|---|
| `q.variant`, `q.notation` and `q.representation` are set and match the requested `opts`; an impossible combination fails in the dialog | VA-R-01, VA-R-04, VA-R-07 | `ws-content-audit.cjs` |
| Same seed + opts gives an identical payload in print and screen generation | VA-R-05, RM-P-02 | `ws-content-audit.cjs` |
| Declared edge cases appear at least once per 20 items, never in the first two | VA-07 | `ws-content-audit.cjs` |
| Runs of identical yes / no answers are at most 3; non-example share within 5 points of the request | VA-08 | `ws-content-audit.cjs` |
| Screen response mode equals print response mode for every item; no choice widget on a production item | RM-P-01 | `ws-compliance.cjs` DOM lint |
| Slot shape matches the declared response mode | PT-G-04, section 2.3 | `ws-compliance.cjs` DOM lint |
| Rendered cell contains greys from the token list only, no emoji code points, no colour | RL-G-01 | ink lint |
| Photocopy-safe render contains no grey fill at all | RL-G-02 | ink lint |
| No grade / CCSS / skill-id text inside `.cell` | PT-G-06 | DOM lint |
| Coin drawings contain only a circle and one of the numerals 1, 5, 10, 25 | PT-G-09, RL-23 | DOM lint |
| Every skill id named in this document exists in `SKILLS` | section 1 "Today" column | `ws-lint-static.mjs` |
