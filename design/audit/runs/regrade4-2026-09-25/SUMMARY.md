# Regrade 4 — independent critic, 2026-09-25

Tree measured: `claude/sweet-newton-c8wrv1` at **9babcc0** (clean worktree). Renders:
`node tests/scripts/ws-grade-render.cjs --skills <26 skills> --roles independent,guided,test,error-analysis --out tests/audit-runs/critic-r4/`
(size L, look auto, A4). The first five skills graded (hundreds_chart_fill, number_chart_fill, compare_groups,
classify_count, teen_compose) were first viewed at 496126c and re-checked at 9babcc0: identical pages.
`add_three` was graded only at 9babcc0 (its cell changed in efa23ed). The brief's `counting:add_5_pictures`
does not exist; the skill is `addition:add_5_pictures` and that is what was graded.

Versions per skill: independent, guided, test, error-analysis (each pupil page + key), card 1280/820/390,
online worksheet 1280, quiz 1280 = 13. Rubric: `design/audit/RUBRIC.md` v1 (pass = every criterion >= 8 on
every version, no cap).

## Result: 0 of 26 pass

| Skill | Min | Failing versions | Worst versions |
|---|---|---|---|
| composing:hundreds_chart_fill | 6 | 7/13 | guided (+key), test (+key) |
| composing:number_chart_fill | 6 | 11/13 | guided (+key); every print role 7 |
| number_sense:round_nl_thousands | 6 | 7/13 | error-analysis (+key) H13; all 5 screen hosts H7 |
| number_sense:round_nl_ten_thousands | 6 | 7/13 | as above |
| number_sense:round_nl_hundred_thousands | 6 | 9/13 | as above + guided C2 7 |
| subtraction:nl_sub | 5 | 12/13 | card 390 / worksheet (start-unknown dot), cards H7 |
| addition:number_line_add | 6 | 5/13 | cards 1280/820/390 (H7) |
| division:div_remainders | 6 | 13/13 | guided, error-analysis (H13) |
| addition:add_wp_100 | 5 | 13/13 | guided (+key) H5 |
| subtraction:sub_wp_1k | 6 | 13/13 | independent, guided |
| multiplication:mult_word_problems | 5 | 13/13 | independent, guided, test (wrong carry working) |
| placevalue:compare | 6 | 8/13 | error-analysis (+key) H13 |
| placevalue:mixed_placevalue | 6 | 9/13 | independent (+key), error-analysis |
| addition:add_5_pictures | 7 | 10/13 | independent, guided, test (repeats, square pictures) |
| composing:teen_compose | 6 | 3/13 | guided (+key) |
| comparing:compare_groups | 7 | 4/13 | guided, error-analysis |
| comparing:classify_count | 7 | 5/13 | test, error-analysis, worksheet |
| addition:add_three | 3 | 4/13 | error-analysis (+key) **H1 wrong key** |
| measurement:money_compare | 6 | 8/13 | guided (+key) |
| measurement:mixed_time | 6 | 9/13 | guided, test, worksheet (H13) |
| measurement:reading_ruler | 4 | 13/13 | card 390 (H2); doubled slot everywhere (H8) |
| measurement:temperature | 1 | 13/13 | error-analysis missing (H11); JSON printed in keys |
| graphs:bar_graph | 1 | 13/13 | error-analysis missing (H11); tie item wrong key (H1) |
| area_perimeter:perimeter_intro | 1 | 13/13 | error-analysis missing (H11) |
| fractions:identify | 3 | 13/13 | every print role (H1/H2/H4/H12) |
| fractions:compare | 1 | 13/13 | error-analysis missing (H11); 'Type' on paper (H7) |

Closest to passing: teen_compose (3 failing versions, all guided pagination), compare_groups (4),
add_three (4, one H1 bug), number_line_add (5, one string), classify_count (5).

## Defects by root cause (shared code first)

### R1 · Guided role pagination and Model (`js/modules/sheet/roles/guided.js`) — 14 skills
- Model + 5 guided items spill to a second page whose last grid cell is empty (a quarter page blank):
  hundreds_chart_fill, number_chart_fill, teen_compose, sub_wp_1k, mult_word_problems, money_compare,
  mixed_time (+ temperature: page 2 holds one lone item, H5; add_wp_100: page 1 holds only the Model, H5).
- Model cells are full width with the worked text floating in the right half and a 20-40 % empty band
  (H13 on reading_ruler, perimeter_intro, mixed_time).
- Guided cells carry quiet letters and **no grey scaffold** in the first guided cells (BD-7) on every skill.
- Steps that do not fit the items: hundreds/number_chart_fill (Model says "number below ... ten less",
  steps say look up / add 10; column-1 blanks cannot "look left"), nl_sub / number_line_add (step 1 "put a
  dot" when the dot is printed; start-unknown items), mixed_time (steps teach o'clock, items are half past /
  "minutes to"), div_remainders (steps hard-coded "groups of 2" while items divide by 5, 3), mixed_placevalue.
- Legacy-cell skills get no Steps band and a Model that is only a grey answer: add_three, fractions:identify,
  fractions:compare, perimeter_intro, reading_ruler, temperature, bar_graph.

### R2 · Error-analysis role (`sheet/roles/error-analysis.js` + providers' `wrongAnswer`) — 12 skills
- **Missing** (H11, all four = 1): fractions:compare, perimeter_intro, temperature, bar_graph — no
  `wrongAnswer` provider.
- **Wrong-answer generator returns the right answer** (H1): add_three a (3+4+3, "wrong" 10) and b (9+8+3,
  "wrong" 20); the key then "fixes" them to the same number. Assert `wrong !== ans`.
- Full-width rows leave >= 30 % empty under the fix box (H13): div_remainders, placevalue:compare,
  mixed_placevalue, all three rounding skills; 20-30 % on the others.
- Fix slot does not match the instruction "Fix it: write the right answer": check-box fixes on
  compare_groups, placevalue:compare, fractions:identify (with a duplicated "1/2" option);
  two uncaptioned boxes on the chart skills.
- Pupil work drawn black instead of grey (rounding dots; nl_sub hops that contradict the written answer).

### R3 · Screen instruction strings and verbs (`screen-cell.js`, instruction library in `sheet/contract.js`)
- Paper verb on screen (H7): "Write the answer." on number_line_add and nl_sub cards (worksheet/quiz say
  "Type"); "Mark <n>" inside the rounding cell on all five hosts (three rounding skills).
- Screen prompt is a per-item question, not the print twin (BD-14 / SP-4): hundreds_chart_fill (three
  different strings across hosts), number_chart_fill, compare_groups, teen_compose, classify_count,
  add_three and add_5_pictures (equation repeated above the cell).
- No instruction at all on the word-problem cards (add_wp_100, sub_wp_1k, mult_word_problems) although the
  cell asks for sign + grid + answer + label.
- Second instruction inside the cell ("Tap counters to ring a group.", "Tap a zone ...") on div_remainders,
  mixed_placevalue.

### R4 · Word-work template (`sheet/cells/word-work.js`, `sheet/providers/word-work.js`, `stories.js`) — 3 skills
- Answer written twice (grid answer row and "Answer:" box) plus a label bank (doubled slot): add_wp_100,
  sub_wp_1k, mult_word_problems.
- Grid geometry leaks the answer: regroup/carry row printed only on items that need it (sub_wp_1k,
  mult_word_problems); track counts vary per item (add_wp_100); worksheet item 6 of sub_wp_1k needs a
  regroup but has no regroup row.
- **Wrong working in keys**: mult_word_problems writes a carry digit above an empty tens track for
  1-digit x 1-digit facts (5 x 5 carry 2); a stack is the wrong model for facts.
- Story bank: ungrammatical, ELL-hostile frames ("After 423 removed, how many were left?", "Then 102
  spent.", "12 presents in the birthday party") and nonsense contexts ("7 rows of cents" in a garden,
  "6 rows of dollars", "planted rock samples", "picks 37 trees", "picks stars").
- No story box / pre-printed unit word (SF-50); x and ÷ offered on a Level 2 addition page.

### R5 · Legacy cells never migrated to the kit — 6 skills (every host fails C4)
- fractions:identify: "Pick the model showing 2/5." with **no models printed** (H2/H12), slashed fractions,
  yellow-outlined cream fraction bar on paper (H4), "Answer:" list keys (H10), multiple choice on screen for
  a write item (H8), a "What fraction is shaded?" worksheet item with no picture, duplicate options, title
  "I Can name the place".
- fractions:compare: "(Type the greater fraction, or "equal")" printed on paper (H7), "Circle" instruction
  with nothing to circle, solid-black pies, unshaded bars on screen, quiz item "5/6 or 5/6".
- temperature: mouse-only sort into bins on paper (H12), C to F conversion at Level 3, **raw JSON and option
  ids printed in the answer key**, OVERFLOW, 1000 px thermometer on the quiz.
- bar_graph: tie item keyed to one answer (H1), plot areas far below 100 x 80 mm, value labels over every
  bar on screen (answer given), "CCSS: 3.MD.B.3" printed in the cell, 6 px labels at 390.
- perimeter_intro, reading_ruler: in-cell headings/hints, "Answer:" list keys; reading_ruler's doubled slot
  ("? inches" blank + Answer line, H8), non-true-scale ruler, illegible ruler at 390 (H2).

### R6 · Chart template (`sheet/cells/chartwindow.js`) — hundreds_chart_fill, number_chart_fill
- Numeral beside an answer box drops 2-3 px off the row baseline.
- 3-digit charts: 17.7 mm tracks for 3-digit numerals and answers (B(3) = 25 mm at L); the test role packs a
  hundreds chart 3-across at 11 mm tracks.
- number_chart_fill windows never cross a hundred and stay in 101-198; tab "All levels".

### R7 · Titles, levels, page frame (`sheet/adapters.js` title builder, skill `grade` in `data.js`)
- "I Can work on <label>" pasted titles: perimeter_intro ("... perimeter intro - sum the sides"),
  reading_ruler, temperature, bar_graph, mixed_time, mixed_placevalue; wrong-topic titles:
  fractions:identify ("name the place"), fractions:compare ("compare numbers"); broken grammar on the
  classify_count test ("sorting and count one kind").
- "All levels" / "Grade mixed" tab and footer: number_chart_fill, mixed_time, mixed_placevalue;
  perimeter_intro says Level 1 for 3.MD.8; reading_ruler Level 2 deals quarter inches.

### R8 · Generators (item choice)
- Repeats / low variety: add_5_pictures (identical facts side by side; no +0), classify_count test (answers
  5,5,5,4,5,6), compare_groups (c = d), placevalue:compare guided (all '<'), mixed_time test repeats the
  practice items, round_nl_hundred_thousands over-samples 900,000-1,000,000, teen_compose worksheet in
  order 11-16.
- Start-unknown items on the Level 1 hop-back page (nl_sub) with a solid start dot on the RESULT on screen
  (card 390, worksheet item 5): hopping back as taught gives the wrong number.
- Division counters in rows of 9-11 at 4.5 mm (groups cross row breaks); keys draw no rings.
- add_5_pictures uses outlined squares as counting pictures beside a square answer box.
- money_compare: sets A and B are unpanelled clusters; second-row coins read as either set.
- mixed_placevalue: "88 = [ ] tens [ ]" with "ones" wrapped under the first box.

### R9 · Screen layout
- One-column worksheets with > 50 % empty cards (H13): mixed_time, perimeter_intro, reading_ruler,
  mixed_placevalue, bar_graph (cards of wildly different size).
- Number-line cards clip end labels ("0" at 1280, "8"/"12" at 390).

## By file / owner

| File / area | Root causes | Skills |
|---|---|---|
| `sheet/roles/guided.js` | R1 | 14 |
| `sheet/roles/error-analysis.js`, providers' `wrongAnswer` (ops-counters provider, `k2.js`, `pv.js`, `time-money.js`) | R2 | 12 (4 missing, 1 H1) |
| `screen-cell.js`, `sheet/contract.js` strings, number-line / value-line cells | R3, R9 | 13 |
| `sheet/cells/word-work.js`, `providers/word-work.js`, `providers/stories.js` | R4 | 3 |
| legacy generators `gen-fractions.js`, `gen-measurement.js`, `gen-data-stats.js`, `gen-geometry.js` (kit migration) | R5 | 6 |
| `sheet/cells/chartwindow.js` | R6 | 2 |
| `sheet/adapters.js` (title), `data.js` (grade) | R7 | 9 |
| per-skill generators (`gen-counting.js`, `gen-algebraic.js`, `gen-operations.js`) | R8 | 10 |
