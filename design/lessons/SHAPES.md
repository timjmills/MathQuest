# Lesson shapes (E4)

Every lesson of `design/lessons-first/queue.json` with its archetype (`lessons/schema.js` ARCHETYPES, A1-A13) and its LESSON SHAPE: one of
the shapes the compiler knows (`js/modules/lessons/shapes/index.js`), or `new: <archetype>` (no compiled lesson of that kind
yet; its first two lessons certify a new shape, IMPROVEMENT_PLAN §1.6.5 Lessons item 6). The queue script reads the Archetype
column (`tests/scripts/ws-lessons-first-queue.cjs` shapeOf); a lesson card reads the Shape column (`ws-lesson-card --draft`).

Kept by `node tests/scripts/ws-lesson-card.mjs --shapes`: a row already here is kept as it is (decide a lesson's shape by editing
its row), a new queue lesson is added with the proposal. `--shapes --check` fails when a queue lesson has no row.

## The shapes

| Shape | What it teaches | Archetype | Certified by | Templates it needs | Lessons |
|---|---|---|---|---|--:|
| `forms` | read / write a number in its forms | A4 pv | g2-nbt3-read-write-1000 | pv, number-word, equation | 41 |
| `bar-story` | a bar-model word problem | A13 story | g1-oa1-bar-model-wp-20 | word-work, bar-model | 30 |
| `property` | a property of an operation | A7 groups | g3-oa5-mult-properties | arrays, equation | 8 |
| `table-pattern` | a pattern on a table | A2 fact | g3-oa9-mult-table-patterns | mult-grid, fact | 7 |
| `rule-table` | a rule table | A5 partwhole | g3-oa9-input-output-rule | function-table | 4 |
| new: column | (new shape) | A1 column | - | stack, long-division, long-multiplication | 28 |
| new: count | (new shape) | A6 count | - | counters, tenframe, count-row, k2kit | 53 |
| new: data | (new shape) | A12 data | - | figures, graph-axes, data-table | 29 |
| new: fact | (new shape) | A2 fact | - | fact, family, equation | 76 |
| new: fraction | (new shape) | A8 fraction | - | frac-model, hundred-square | 154 |
| new: groups | (new shape) | A7 groups | - | ops-counters, area-model, mult-grid | 13 |
| new: line | (new shape) | A3 line | - | number-line, hop-line, value-line, pv | 34 |
| new: measure | (new shape) | A9 measure | - | figures, measure-scale, shape-figure | 83 |
| new: partwhole | (new shape) | A5 partwhole | - | bond, equation, cloze, bar-model | 53 |
| new: pv | (new shape) | A4 pv | - | pv, base10, pv-exchange | 43 |
| new: shape | (new shape) | A11 shape | - | shapes, coord-grid, solid-kit, angle-kit | 132 |
| new: timemoney | (new shape) | A10 timemoney | - | clock, timeline, coins, tmkit | 55 |

Lessons 6 (g4-nbt1-ten-times-value) and 7 (g3-oa8-two-step-wp) are the compiler's hold-outs: they take the nearest passed shape
(`forms`, `bar-story`) and `design/lessons/proof/DIFF.md` records what compiled.

## What the next lesson of a shape checks first (lf-engine P1d, 2026-11-07)

- `bar-story` (from lesson 2, E24b): before the card is signed, count the distinct facts the story rule holds against every place
  that deals one - Prerequisite Check facts included - with LR-6 (no near twins on a page) per page: `ws-lesson-unit --only
  pool-capacity`, then the 25-seed `ws-detailed-lesson --sweep`. A pack that needs every fact of its pool fails at some seed.
  If a set exists but the greedy deal misses it, give the Practice sheet `solve` (its stories solved first, the generator pinned
  to them - print-sheet.js solveStoryFacts, page-deal.js setDealPin): `ws-lesson-unit --only solve-story` (lesson 2, attempt 2).
  A pack that needs nearly every fact of its pool (lesson 2: ~18 of 20) is not fixed by solving one page first - the shortage
  moves to the next page (lesson 2 solve-first, 2026-11-08): count the WHOLE pack in node per seed, then solve it jointly or widen the data.
  The whole-pack count models each place from its OWN source (lesson 2 attempt 4: green while seeds 2 and 5 failed): a P0 range
  must survive any greedy first choice (two items need values 3 apart: 17-20 does not), and a narrow chart case (equal parts) gets
  its own case pool with the pack's avoid keys - `ws-lesson-unit --only pack-feasible` (pack-solve.js placeSources).
  CHECK FIRST (owner ruling 2026-11-08): a Prerequisite Check never draws from the lesson's own story pool (lesson 2: its +
  facts are a teen and ones, 12 + 5); count every place that does - chart, Guided, Practice, word problem, slip, Check
  Question - per seed with lessons/pack-solve.js (`ws-lesson-unit --only pack-feasible`) BEFORE any render, and take Practice's
  set from that whole-pack solution.
- `property` (from lesson 3a, LP-FAMILY-REPEAT): size the Practice cell from the families the pack needs (owner ruling: full-width
  cells, one item a row, arrays up to 6 x 6), never the families from the cell; every dealt ref keeps one spare fact family
  (the x 2 check: 2 x 6 to 2 x 10 for four items). Note: arrays past 5 a row fail gate E27 (rows of at most 5) until lf-checks reads the ruling.

## Every lesson

| Lesson | Unit | Title | Archetype | Shape | Templates |
|---|---|---|---|---|---|
| `R.B13.S6` | GK-Y1.B1 | Verbal counting patterns | A2 | `table-pattern` | mult-grid, fact |
| `Y1.B1.S2` | GK-Y1.B1 | Count objects | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B1.S3` | GK-Y1.B1 | Count objects from a larger group | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B1.S4` | GK-Y1.B1 | Represent objects | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B1.S5` | GK-Y1.B1 | Recognise numbers as words | A4 | `forms` | pv, number-word, equation |
| `Y1.B1.S6` | GK-Y1.B1 | Count on from any number | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B1.S7` | GK-Y1.B1 | 1 more | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B1.S8` | GK-Y1.B1 | Count backwards within 10 | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B1.S9` | GK-Y1.B1 | 1 less | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B1.S10` | GK-Y1.B1 | Compare groups by matching | A4 | new: pv | pv, base10, pv-exchange |
| `Y1.B1.S11` | GK-Y1.B1 | Fewer, more, same | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B1.S12` | GK-Y1.B1 | Less than, greater than, equal to | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B1.S13` | GK-Y1.B1 | Compare numbers | A4 | new: pv | pv, base10, pv-exchange |
| `Y1.B1.S14` | GK-Y1.B1 | Order objects and numbers | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B1.S15` | GK-Y1.B1 | The number line | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y1.B1.S1` | GK-Y1.B1 | Sort objects | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y2.B1.S1` | G1-Y2.B1 | Numbers to 20 | A4 | `forms` | pv, number-word, equation |
| `Y2.B1.S2` | G1-Y2.B1 | Count objects to 100 by making 10s | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y2.B1.S3` | G1-Y2.B1 | Recognise tens and ones | A4 | new: pv | pv, base10, pv-exchange |
| `Y2.B1.S4` | G1-Y2.B1 | Use a place value chart | A4 | new: pv | pv, base10, pv-exchange |
| `Y2.B1.S5` | G1-Y2.B1 | Partition numbers to 100 | A4 | `forms` | pv, number-word, equation |
| `Y2.B1.S6` | G1-Y2.B1 | Write numbers to 100 in words | A4 | `forms` | pv, number-word, equation |
| `Y2.B1.S7` | G1-Y2.B1 | Flexibly partition numbers to 100 | A4 | `forms` | pv, number-word, equation |
| `Y2.B1.S8` | G1-Y2.B1 | Write numbers to 100 in expanded form | A4 | `forms` | pv, number-word, equation |
| `Y2.B1.S9` | G1-Y2.B1 | 10s on the number line to 100 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y2.B1.S10` | G1-Y2.B1 | 10s and 1s on the number line to 100 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y2.B1.S11` | G1-Y2.B1 | Estimate numbers on a number line | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y2.B1.S12` | G1-Y2.B1 | Compare objects | A4 | new: pv | pv, base10, pv-exchange |
| `Y2.B1.S13` | G1-Y2.B1 | Compare numbers | A4 | new: pv | pv, base10, pv-exchange |
| `Y2.B1.S14` | G1-Y2.B1 | Order objects and numbers | A4 | new: pv | pv, base10, pv-exchange |
| `Y2.B1.S15` | G1-Y2.B1 | Count in 2s, 5s and 10s | A2 | new: fact | fact, family, equation |
| `Y2.B1.S16` | G1-Y2.B1 | Count in 3s | A2 | new: fact | fact, family, equation |
| `G1\|-\|countonto120` | G1-Y2.B1 | Count on to 120 | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y3.B1.S1` | G2-Y3.B1 | Represent numbers to 100 | A4 | `forms` | pv, number-word, equation |
| `Y3.B1.S2` | G2-Y3.B1 | Partition numbers to 100 | A4 | `forms` | pv, number-word, equation |
| `Y3.B1.S4` | G2-Y3.B1 | Hundreds | A4 | new: pv | pv, base10, pv-exchange |
| `Y3.B1.S5` | G2-Y3.B1 | Represent numbers to 1,000 | A4 | `forms` | pv, number-word, equation |
| `Y3.B1.S6` | G2-Y3.B1 | Partition numbers to 1,000 | A4 | `forms` | pv, number-word, equation |
| `Y3.B1.S7` | G2-Y3.B1 | Flexible partitioning of numbers to 1,000 | A4 | `forms` | pv, number-word, equation |
| `Y3.B1.S8` | G2-Y3.B1 | Hundreds, tens and ones | A4 | new: pv | pv, base10, pv-exchange |
| `Y3.B1.S9` | G2-Y3.B1 | Find 1, 10 or 100 more or less | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y3.B1.S12` | G2-Y3.B1 | Compare numbers to 1,000 | A4 | `forms` | pv, number-word, equation |
| `G2\|-\|readandwritenumbersto1000inwordsnumeralsandexpandedform` | G2-Y3.B1 | Read and write numbers to 1,000 in words, numerals and expanded form | A4 | `forms` | pv, number-word, equation |
| `Y3.B1.S13` | G2-Y3.B1 | Order numbers to 1,000 | A4 | `forms` | pv, number-word, equation |
| `Y3.B1.S14` | G2-Y3.B1 | Count in 50s | A2 | new: fact | fact, family, equation |
| `Y3.B1.S3` | G2-Y3.B1 | Number line to 100 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y3.B1.S10` | G2-Y3.B1 | Number line to 1,000 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y3.B1.S11` | G2-Y3.B1 | Estimate on a number line to 1,000 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y4.B4.S1` | G3-Y4.B4 | Multiples of 3 | A2 | new: fact | fact, family, equation |
| `Y4.B4.S2` | G3-Y4.B4 | Multiply and divide by 6 | A2 | new: fact | fact, family, equation |
| `Y4.B4.S3` | G3-Y4.B4 | 6 times-table and division facts | A2 | new: fact | fact, family, equation |
| `Y4.B4.S4` | G3-Y4.B4 | Multiply and divide by 9 | A2 | new: fact | fact, family, equation |
| `Y4.B4.S5` | G3-Y4.B4 | 9 times-table and division facts | A2 | new: fact | fact, family, equation |
| `Y4.B4.S6` | G3-Y4.B4 | The 3, 6 and 9 times-tables | A2 | new: fact | fact, family, equation |
| `Y4.B4.S7` | G3-Y4.B4 | Multiply and divide by 7 | A2 | new: fact | fact, family, equation |
| `Y4.B4.S8` | G3-Y4.B4 | 7 times-table and division facts | A2 | new: fact | fact, family, equation |
| `Y4.B4.S9` | G3-Y4.B4 | 11 times-table and division facts | A2 | new: fact | fact, family, equation |
| `Y4.B4.S10` | G3-Y4.B4 | 12 times-table and division facts | A2 | new: fact | fact, family, equation |
| `Y4.B4.S11` | G3-Y4.B4 | Multiply by 1 and 0 | A2 | new: fact | fact, family, equation |
| `Y4.B4.S12` | G3-Y4.B4 | Divide a number by 1 and itself | A2 | new: fact | fact, family, equation |
| `Y4.B4.S13` | G3-Y4.B4 | Multiply three numbers | A2 | new: fact | fact, family, equation |
| `G3\|-\|patternsonthemultiplicationtable` | G3-Y4.B4 | Patterns on the multiplication table | A2 | `table-pattern` | mult-grid, fact |
| `G3\|-\|findtheruleinaninputoutputtable` | G3-Y4.B4 | Find the rule in an input-output table | A5 | `rule-table` | function-table |
| `G3\|-\|propertiesofmultiplicationcommutativeidentityanddistributive` | G3-Y4.B4 | Properties of multiplication: commutative, identity and distributive | A7 | `property` | arrays, equation |
| `G3\|-\|twostepwordproblemswiththefouroperations` | G3-Y4.B4 | Two-step word problems with the four operations | A13 | `bar-story` | word-work, bar-model |
| `Y5.B3.S1` | G4-Y5.B3 | Multiples | A2 | new: fact | fact, family, equation |
| `Y5.B3.S2` | G4-Y5.B3 | Common multiples | A2 | new: fact | fact, family, equation |
| `Y5.B3.S3` | G4-Y5.B3 | Factors | A2 | new: fact | fact, family, equation |
| `Y5.B3.S4` | G4-Y5.B3 | Common factors | A2 | new: fact | fact, family, equation |
| `Y5.B3.S5` | G4-Y5.B3 | Prime numbers | A2 | new: fact | fact, family, equation |
| `Y5.B3.S10` | G4-Y5.B3 | Multiples of 10, 100 and 1,000 | A2 | new: fact | fact, family, equation |
| `G4\|-\|findemergentfeaturesegunitsdigitcycle` | G4-Y5.B3 | Find emergent features (e.g., units digit cycle) | A9 | new: measure | figures, measure-scale, shape-figure |
| `G4\|-\|extendgrowingshapepatterns` | G4-Y5.B3 | Extend growing shape patterns | A2 | `table-pattern` | mult-grid, fact |
| `G4\|-\|followagivenruletoextendanumberpattern` | G4-Y5.B3 | Follow a given rule to extend a number pattern | A5 | `rule-table` | function-table |
| `G4\|-\|multiplicativecomparisontimesasmany` | G4-Y5.B3 | Multiplicative comparison: times as many | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `G4\|-\|multistepwordproblemsdivideandinterprettheremainder` | G4-Y5.B3 | Multi-step word problems: divide and interpret the remainder | A13 | `bar-story` | word-work, bar-model |
| `Y5.B3.S6` | G4-Y5.B3 | Square numbers | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B3.S7` | G4-Y5.B3 | Cube numbers | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B1.S1` | G5-Y6.B1 | Numbers to 1,000,000 | A4 | `forms` | pv, number-word, equation |
| `Y6.B1.S2` | G5-Y6.B1 | Numbers to 10,000,000 | A4 | `forms` | pv, number-word, equation |
| `Y6.B1.S3` | G5-Y6.B1 | Read and write numbers to 10,000,000 | A4 | `forms` | pv, number-word, equation |
| `Y6.B1.S4` | G5-Y6.B1 | Powers of 10 | A4 | new: pv | pv, base10, pv-exchange |
| `Y6.B1.S5` | G5-Y6.B1 | Number line to 10,000,000 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y6.B1.S6` | G5-Y6.B1 | Compare and order any integers | A4 | new: pv | pv, base10, pv-exchange |
| `Y6.B1.S7` | G5-Y6.B1 | Round any integer | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y6.B1.S8` | G5-Y6.B1 | Negative numbers | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B4.S1` | GK-Y1.B4 | Count within 20 | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B4.S7` | GK-Y1.B4 | 1 more and 1 less | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B4.S7` | GK-Y1.B4 | 1 more and 1 less | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B4.S7` | GK-Y1.B4 | 1 more and 1 less | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B4.S8` | GK-Y1.B4 | The number line to 20 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y1.B4.S9` | GK-Y1.B4 | Use a number line to 20 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y1.B4.S10` | GK-Y1.B4 | Estimate on a number line to 20 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y1.B4.S11` | GK-Y1.B4 | Compare numbers to 20 | A4 | `forms` | pv, number-word, equation |
| `Y1.B4.S12` | GK-Y1.B4 | Order numbers to 20 | A4 | `forms` | pv, number-word, equation |
| `Y1.B4.S2` | GK-Y1.B4 | Understand 10 | A4 | new: pv | pv, base10, pv-exchange |
| `Y1.B4.S3` | GK-Y1.B4 | Understand 11, 12 and 13 | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B4.S4` | GK-Y1.B4 | Understand 14, 15 and 16 | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B4.S5` | GK-Y1.B4 | Understand 17, 18 and 19 | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B4.S6` | GK-Y1.B4 | Understand 20 | A4 | new: pv | pv, base10, pv-exchange |
| `G1\|-\|solveonestepwordproblemswithin20usingbarmodels` | G1-Y2.B2 | Solve one-step word problems within 20 using bar models | A13 | `bar-story` | word-work, bar-model |
| `Y2.B2.S4` | G1-Y2.B2 | Bonds to 100 (tens) | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y2.B2.S8` | G1-Y2.B2 | Add to the next 10 | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y2.B2.S15` | G1-Y2.B2 | Add two 2-digit numbers (not across a 10) | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B2.S17` | G1-Y2.B2 | Subtract two 2-digit numbers (not across a 10) | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B2.S18` | G1-Y2.B2 | Subtract two 2-digit numbers (across a 10) | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B2.S9` | G1-Y2.B2 | Add across a 10 | A1 | new: column | stack, long-division, long-multiplication |
| `Y2.B2.S13` | G1-Y2.B2 | 10 more, 10 less | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y2.B2.S14` | G1-Y2.B2 | Add and subtract 10s | A4 | new: pv | pv, base10, pv-exchange |
| `Y2.B2.S16` | G1-Y2.B2 | Add two 2-digit numbers (across a 10) | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B2.S19` | G1-Y2.B2 | Mixed addition and subtraction | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y2.B2.S1` | G1-Y2.B2 | Bonds to 10 | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y2.B2.S2` | G1-Y2.B2 | Fact families - addition and subtraction bonds within 20 | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y2.B2.S12` | G1-Y2.B2 | Subtract a 1-digit number from a 2-digit number (across a 10) | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B2.S3` | G1-Y2.B2 | Related facts | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y2.B2.S5` | G1-Y2.B2 | Add and subtract 1s | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y2.B2.S6` | G1-Y2.B2 | Add by making 10 | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y2.B2.S7` | G1-Y2.B2 | Add three 1-digit numbers | A4 | new: pv | pv, base10, pv-exchange |
| `Y2.B2.S10` | G1-Y2.B2 | Subtract across 10 | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y2.B2.S11` | G1-Y2.B2 | Subtract from a 10 | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y2.B2.S20` | G1-Y2.B2 | Compare number sentences | A4 | new: pv | pv, base10, pv-exchange |
| `Y2.B2.S21` | G1-Y2.B2 | Missing number problems | A13 | `bar-story` | word-work, bar-model |
| `Y3.B2.S2` | G2-Y3.B2 | Add and subtract 1s | A4 | new: pv | pv, base10, pv-exchange |
| `Y3.B2.S3` | G2-Y3.B2 | Add and subtract 10s | A4 | new: pv | pv, base10, pv-exchange |
| `Y3.B2.S4` | G2-Y3.B2 | Add and subtract 100s | A4 | new: pv | pv, base10, pv-exchange |
| `Y3.B2.S5` | G2-Y3.B2 | Spot the pattern | A2 | `table-pattern` | mult-grid, fact |
| `Y3.B2.S6` | G2-Y3.B2 | Add 1s across a 10 | A1 | new: column | stack, long-division, long-multiplication |
| `Y3.B2.S7` | G2-Y3.B2 | Add 10s across a 100 | A1 | new: column | stack, long-division, long-multiplication |
| `Y3.B2.S8` | G2-Y3.B2 | Subtract 1s across a 10 | A1 | new: column | stack, long-division, long-multiplication |
| `Y3.B2.S9` | G2-Y3.B2 | Subtract 10s across a 100 | A1 | new: column | stack, long-division, long-multiplication |
| `Y3.B2.S10` | G2-Y3.B2 | Make connections | A4 | new: pv | pv, base10, pv-exchange |
| `Y3.B2.S11` | G2-Y3.B2 | Add two numbers (no exchange) | A1 | new: column | stack, long-division, long-multiplication |
| `Y3.B2.S12` | G2-Y3.B2 | Subtract two numbers (no exchange) | A1 | new: column | stack, long-division, long-multiplication |
| `Y3.B2.S13` | G2-Y3.B2 | Add two numbers (across a 10) | A1 | new: column | stack, long-division, long-multiplication |
| `Y3.B2.S14` | G2-Y3.B2 | Add two numbers (across a 100) | A1 | new: column | stack, long-division, long-multiplication |
| `Y3.B2.S15` | G2-Y3.B2 | Subtract two numbers (across a 10) | A1 | new: column | stack, long-division, long-multiplication |
| `Y3.B2.S16` | G2-Y3.B2 | Subtract two numbers (across a 100) | A1 | new: column | stack, long-division, long-multiplication |
| `Y3.B2.S17` | G2-Y3.B2 | Add 2-digit and 3-digit numbers | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y3.B2.S18` | G2-Y3.B2 | Subtract a 2-digit number from a 3-digit number | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y3.B2.S19` | G2-Y3.B2 | Complements to 100 | A4 | new: pv | pv, base10, pv-exchange |
| `Y3.B2.S20` | G2-Y3.B2 | Estimate answers | A4 | new: pv | pv, base10, pv-exchange |
| `Y3.B2.S21` | G2-Y3.B2 | Inverse operations | A8 | new: fraction | frac-model, hundred-square |
| `Y3.B2.S22` | G2-Y3.B2 | Make decisions | A4 | new: pv | pv, base10, pv-exchange |
| `G2\|-\|adduptofourtwodigitnumbers` | G2-Y3.B2 | Add up to four two-digit numbers | A4 | new: pv | pv, base10, pv-exchange |
| `Y3.B2.S1` | G2-Y3.B2 | Apply number bonds within 10 | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `G2\|-\|solveonestepwordproblemsusingbarmodels` | G2-Y3.B2 | Solve one-step word problems using bar models | A13 | `bar-story` | word-work, bar-model |
| `G2\|-\|solvetwostepwordproblemsidentifyingbothoperations` | G2-Y3.B2 | Solve two-step word problems identifying both operations | A13 | `bar-story` | word-work, bar-model |
| `Y4.B7.S1` | G3-Y4.B7 | Understand the whole | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B7.S2` | G3-Y4.B7 | Count beyond 1 | A6 | new: count | counters, tenframe, count-row, k2kit |
| `G3\|-\|partitionshapesintoequalareas` | G3-Y4.B7 | Partition shapes into equal areas | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B7.S3` | G3-Y4.B7 | Partition a mixed number | A4 | `forms` | pv, number-word, equation |
| `Y4.B7.S4` | G3-Y4.B7 | Number lines with mixed numbers | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y4.B7.S5` | G3-Y4.B7 | Compare and order mixed numbers | A4 | new: pv | pv, base10, pv-exchange |
| `Y3.B6.S7` | G3-Y4.B7 | Fractions on a number line | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B7.S6` | G3-Y4.B7 | Understand improper fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B7.S7` | G3-Y4.B7 | Convert mixed numbers to improper fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B7.S9` | G3-Y4.B7 | Equivalent fractions on a number line | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B7.S8` | G3-Y4.B7 | Convert improper fractions to mixed numbers | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B7.S10` | G3-Y4.B7 | Equivalent fraction families | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B7.S11` | G3-Y4.B7 | Add two or more fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B7.S12` | G3-Y4.B7 | Add fractions and mixed numbers | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B7.S13` | G3-Y4.B7 | Subtract two fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B7.S14` | G3-Y4.B7 | Subtract from whole amounts | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B7.S15` | G3-Y4.B7 | Subtract from mixed numbers | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B1.S1` | G4-Y5.B1 | Roman numerals to 1,000 | A4 | `forms` | pv, number-word, equation |
| `Y5.B1.S2` | G4-Y5.B1 | Numbers to 10,000 | A4 | `forms` | pv, number-word, equation |
| `Y5.B1.S3` | G4-Y5.B1 | Numbers to 100,000 | A4 | `forms` | pv, number-word, equation |
| `Y5.B1.S12` | G4-Y5.B1 | Round to the nearest 10, 100 or 1,000 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y5.B1.S4` | G4-Y5.B1 | Numbers to 1,000,000 | A4 | `forms` | pv, number-word, equation |
| `Y5.B1.S5` | G4-Y5.B1 | Read and write numbers to 1,000,000 | A4 | `forms` | pv, number-word, equation |
| `Y5.B1.S6` | G4-Y5.B1 | Powers of 10 | A4 | new: pv | pv, base10, pv-exchange |
| `Y5.B1.S7` | G4-Y5.B1 | 10 / 100 / 1,000 / 10,000 / 100,000 more or less | A6 | new: count | counters, tenframe, count-row, k2kit |
| `G4\|-\|multiplyanddividemultiplesof10usingbasicfactseg90x5030030` | G4-Y5.B1 | Multiply and divide multiples of 10 using basic facts (e.g., 90 x 50, 300 ÷ 30) | A2 | new: fact | fact, family, equation |
| `Y5.B1.S8` | G4-Y5.B1 | Partition numbers to 1,000,000 | A4 | `forms` | pv, number-word, equation |
| `Y5.B1.S9` | G4-Y5.B1 | Number line to 1,000,000 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y5.B1.S10` | G4-Y5.B1 | Compare and order numbers to 100,000 | A4 | `forms` | pv, number-word, equation |
| `Y5.B1.S11` | G4-Y5.B1 | Compare and order numbers to 1,000,000 | A4 | `forms` | pv, number-word, equation |
| `Y5.B1.S13` | G4-Y5.B1 | Round within 100,000 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y5.B1.S14` | G4-Y5.B1 | Round within 1,000,000 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y6.B2.S1` | G5-Y6.B2 | Add and subtract integers | A4 | new: pv | pv, base10, pv-exchange |
| `Y6.B2.S7` | G5-Y6.B2 | Multiply up to a 4-digit number by a 2-digit number | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B2.S8` | G5-Y6.B2 | Solve problems with multiplication | A13 | `bar-story` | word-work, bar-model |
| `Y6.B2.S9` | G5-Y6.B2 | Short division | A1 | new: column | stack, long-division, long-multiplication |
| `Y6.B2.S10` | G5-Y6.B2 | Division using factors | A2 | new: fact | fact, family, equation |
| `Y5.B5.S1` | G5-Y6.B2 | Multiply up to a 4-digit number by a 1-digit number | A1 | new: column | stack, long-division, long-multiplication |
| `Y6.B2.S11` | G5-Y6.B2 | Introduction to long division | A1 | new: column | stack, long-division, long-multiplication |
| `Y6.B2.S12` | G5-Y6.B2 | Long division with remainders | A1 | new: column | stack, long-division, long-multiplication |
| `Y6.B2.S13` | G5-Y6.B2 | Solve problems with division | A13 | `bar-story` | word-work, bar-model |
| `Y6.B2.S17` | G5-Y6.B2 | Reason from known facts | A2 | new: fact | fact, family, equation |
| `G5\|-\|comparedigitvaluesadigitisworth10timestheplacetoitsrightand110oftheplacetoitsleft` | G5-Y6.B2 | Compare digit values: a digit is worth 10 times the place to its right and 1/10 of the place to its left | A2 | new: fact | fact, family, equation |
| `G5\|-\|readandwritedecimalstothousandthsinwordformandexpandedform` | G5-Y6.B2 | Read and write decimals to thousandths in word form and expanded form | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B2.S2` | G5-Y6.B2 | Common factors | A2 | new: fact | fact, family, equation |
| `Y6.B2.S3` | G5-Y6.B2 | Common multiples | A2 | new: fact | fact, family, equation |
| `Y6.B2.S16` | G5-Y6.B2 | Mental calculations and estimation | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y6.B2.S4` | G5-Y6.B2 | Rules of divisibility | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y6.B2.S5` | G5-Y6.B2 | Primes to 100 | A2 | new: fact | fact, family, equation |
| `Y6.B2.S14` | G5-Y6.B2 | Solve multi-step problems | A13 | `bar-story` | word-work, bar-model |
| `Y6.B2.S15` | G5-Y6.B2 | Order of operations | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B2.S6` | G5-Y6.B2 | Square and cube numbers | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y1.B6.S1` | GK-Y1.B6 | Count from 20 to 50 | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B6.S2` | GK-Y1.B6 | 20, 30, 40 and 50 | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B6.S6` | GK-Y1.B6 | The number line to 50 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y1.B6.S7` | GK-Y1.B6 | Estimate on a number line to 50 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y1.B6.S8` | GK-Y1.B6 | 1 more, 1 less | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B6.S8` | GK-Y1.B6 | 1 more, 1 less | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B6.S3` | GK-Y1.B6 | Count by making groups of tens | A7 | new: groups | ops-counters, area-model, mult-grid |
| `Y1.B6.S4` | GK-Y1.B6 | Groups of tens and ones | A7 | new: groups | ops-counters, area-model, mult-grid |
| `Y1.B6.S5` | GK-Y1.B6 | Partition into tens and ones | A4 | `forms` | pv, number-word, equation |
| `Y1.B6.S5` | GK-Y1.B6 | Partition into tens and ones | A4 | `forms` | pv, number-word, equation |
| `Y2.B3.S2` | G1-Y2.B3 | Count sides on 2D shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B3.S3` | G1-Y2.B3 | Count vertices on 2D shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B3.S4` | G1-Y2.B3 | Draw 2D shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B3.S5` | G1-Y2.B3 | Lines of symmetry on shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B3.S7` | G1-Y2.B3 | Sort 2D shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B3.S8` | G1-Y2.B3 | Count faces on 3D shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B3.S9` | G1-Y2.B3 | Count edges on 3D shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B3.S10` | G1-Y2.B3 | Count vertices on 3D shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B3.S11` | G1-Y2.B3 | Sort 3D shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B3.S12` | G1-Y2.B3 | Make patterns with 2D and 3D shapes | A2 | `table-pattern` | mult-grid, fact |
| `Y2.B3.S1` | G1-Y2.B3 | Recognise 2D and 3D shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `G1\|-\|composeandrecomposeshapes` | G1-Y2.B3 | Compose and recompose shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B3.S6` | G1-Y2.B3 | Use lines of symmetry to complete shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y3.B3.S4` | G2-Y3.B3 | Multiples of 5 and 10 | A2 | new: fact | fact, family, equation |
| `Y3.B3.S1` | G2-Y3.B3 | Multiplication - equal groups | A7 | new: groups | ops-counters, area-model, mult-grid |
| `Y3.B3.S2` | G2-Y3.B3 | Use arrays | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y3.B3.S3` | G2-Y3.B3 | Multiples of 2 | A2 | new: fact | fact, family, equation |
| `Y3.B3.S6` | G2-Y3.B3 | Multiply by 3 | A2 | new: fact | fact, family, equation |
| `Y3.B3.S8` | G2-Y3.B3 | The 3 times-table | A2 | new: fact | fact, family, equation |
| `Y3.B3.S9` | G2-Y3.B3 | Multiply by 4 | A2 | new: fact | fact, family, equation |
| `Y3.B3.S11` | G2-Y3.B3 | The 4 times-table | A2 | new: fact | fact, family, equation |
| `G2\|-\|oddandevennumbers` | G2-Y3.B3 | Odd and even numbers | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y3.B3.S5` | G2-Y3.B3 | Sharing and grouping | A7 | new: groups | ops-counters, area-model, mult-grid |
| `Y3.B3.S7` | G2-Y3.B3 | Divide by 3 | A2 | new: fact | fact, family, equation |
| `Y3.B3.S10` | G2-Y3.B3 | Divide by 4 | A2 | new: fact | fact, family, equation |
| `Y3.B3.S12` | G2-Y3.B3 | Multiply by 8 | A2 | new: fact | fact, family, equation |
| `Y3.B3.S13` | G2-Y3.B3 | Divide by 8 | A2 | new: fact | fact, family, equation |
| `Y3.B3.S14` | G2-Y3.B3 | The 8 times-table | A2 | new: fact | fact, family, equation |
| `Y3.B3.S15` | G2-Y3.B3 | The 2, 4 and 8 times-tables | A2 | new: fact | fact, family, equation |
| `Y4.B1.S1` | G3-Y4.B1 | Represent numbers to 1,000 | A4 | `forms` | pv, number-word, equation |
| `Y4.B1.S2` | G3-Y4.B1 | Partition numbers to 1,000 | A4 | `forms` | pv, number-word, equation |
| `Y4.B1.S8` | G3-Y4.B1 | Find 1, 10, 100, 1,000 more or less | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y4.B1.S9` | G3-Y4.B1 | Number line to 10,000 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y4.B1.S13` | G3-Y4.B1 | Roman numerals | A4 | `forms` | pv, number-word, equation |
| `Y4.B1.S14` | G3-Y4.B1 | Round to the nearest 10 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y4.B1.S10` | G3-Y4.B1 | Estimate on a number line to 10,000 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y4.B1.S15` | G3-Y4.B1 | Round to the nearest 100 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y4.B1.S16` | G3-Y4.B1 | Round to the nearest 1,000 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y4.B1.S17` | G3-Y4.B1 | Round to the nearest 10, 100 or 1,000 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y4.B1.S3` | G3-Y4.B1 | Number line to 1,000 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y4.B1.S4` | G3-Y4.B1 | Thousands | A4 | new: pv | pv, base10, pv-exchange |
| `Y4.B1.S5` | G3-Y4.B1 | Represent numbers to 10,000 | A4 | `forms` | pv, number-word, equation |
| `Y4.B1.S6` | G3-Y4.B1 | Partition numbers to 10,000 | A4 | `forms` | pv, number-word, equation |
| `Y4.B1.S7` | G3-Y4.B1 | Flexible partitioning of numbers to 10,000 | A4 | `forms` | pv, number-word, equation |
| `Y4.B1.S11` | G3-Y4.B1 | Compare numbers to 10,000 | A4 | `forms` | pv, number-word, equation |
| `Y4.B1.S12` | G3-Y4.B1 | Order numbers to 10,000 | A4 | `forms` | pv, number-word, equation |
| `Y5.B2.S8` | G4-Y5.B2 | Find missing numbers | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y5.B2.S1` | G4-Y5.B2 | Mental strategies | A4 | new: pv | pv, base10, pv-exchange |
| `Y5.B2.S2` | G4-Y5.B2 | Add whole numbers with more than four digits | A4 | new: pv | pv, base10, pv-exchange |
| `Y5.B2.S3` | G4-Y5.B2 | Subtract whole numbers with more than four digits | A4 | new: pv | pv, base10, pv-exchange |
| `Y5.B2.S4` | G4-Y5.B2 | Round to check answers | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y5.B2.S5` | G4-Y5.B2 | Inverse operations (addition and subtraction) | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B2.S6` | G4-Y5.B2 | Multi-step addition and subtraction problems | A13 | `bar-story` | word-work, bar-model |
| `Y5.B2.S7` | G4-Y5.B2 | Compare calculations | A4 | new: pv | pv, base10, pv-exchange |
| `G4\|-\|multiplicativecomparisonwordproblemshowmanytimesasmanyunknownmultiplier` | G4-Y5.B2 | Multiplicative comparison word problems: how many times as many? (unknown multiplier) | A13 | `bar-story` | word-work, bar-model |
| `G4\|-\|placevalue10timesandonetenthofadigitsvalue` | G4-Y5.B2 | Place value: 10 times and one tenth of a digit's value | A4 | `forms` | pv, number-word, equation |
| `Y6.B8.S1` | G5-Y6.B8 | Place value within 1 | A4 | new: pv | pv, base10, pv-exchange |
| `Y6.B8.S2` | G5-Y6.B8 | Place value - integers and decimals | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B8.S3` | G5-Y6.B8 | Round decimals | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B8.S4` | G5-Y6.B8 | Add and subtract decimals | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B8.S5` | G5-Y6.B8 | Multiply by 10, 100 and 1,000 | A2 | new: fact | fact, family, equation |
| `Y6.B8.S5` | G5-Y6.B8 | Multiply by 10, 100 and 1,000 | A2 | new: fact | fact, family, equation |
| `Y6.B8.S6` | G5-Y6.B8 | Divide by 10, 100 and 1,000 | A2 | new: fact | fact, family, equation |
| `Y6.B8.S6` | G5-Y6.B8 | Divide by 10, 100 and 1,000 | A2 | new: fact | fact, family, equation |
| `Y6.B8.S7` | G5-Y6.B8 | Multiply decimals by integers | A8 | new: fraction | frac-model, hundred-square |
| `G5\|-\|multiplyanddividedecimalsbypowersof10writtenwithexponents101102103andexplainthepattern` | G5-Y6.B8 | Multiply and divide decimals by powers of 10 written with exponents (10^1, 10^2, 10^3) and explain the pattern | A2 | `table-pattern` | mult-grid, fact |
| `Y6.B8.S8` | G5-Y6.B8 | Divide decimals by integers | A8 | new: fraction | frac-model, hundred-square |
| `G5\|-\|dividebyadecimal` | G5-Y6.B8 | Divide by a decimal | A8 | new: fraction | frac-model, hundred-square |
| `G5\|-\|multiplydecimalsbydecimals` | G5-Y6.B8 | Multiply decimals by decimals | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B3.S3` | G5-Y6.B8 | Factors | A2 | new: fact | fact, family, equation |
| `Y6.B8.S9` | G5-Y6.B8 | Multiply and divide decimals in context | A8 | new: fraction | frac-model, hundred-square |
| `Y1.B12.S1` | GK-Y1.B12 | Count from 50 to 100 | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B12.S2` | GK-Y1.B12 | Tens to 100 | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B12.S4` | GK-Y1.B12 | The number line to 100 | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y1.B12.S6` | GK-Y1.B12 | Compare numbers with the same number of tens | A4 | new: pv | pv, base10, pv-exchange |
| `Y1.B12.S7` | GK-Y1.B12 | Compare any two numbers | A4 | new: pv | pv, base10, pv-exchange |
| `Y2.B8.S1` | G1-Y2.B8 | Introduction to parts and whole | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B8.S2` | G1-Y2.B8 | Equal and unequal parts | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B8.S3` | G1-Y2.B8 | Recognise a half | A8 | new: fraction | frac-model, hundred-square |
| `Y2.B8.S4` | G1-Y2.B8 | Find a half | A8 | new: fraction | frac-model, hundred-square |
| `Y2.B8.S12` | G1-Y2.B8 | Recognise the equivalence of a half and two quarters | A8 | new: fraction | frac-model, hundred-square |
| `Y2.B8.S13` | G1-Y2.B8 | Recognise three quarters | A8 | new: fraction | frac-model, hundred-square |
| `Y2.B8.S5` | G1-Y2.B8 | Recognise a quarter | A8 | new: fraction | frac-model, hundred-square |
| `Y2.B8.S6` | G1-Y2.B8 | Find a quarter | A8 | new: fraction | frac-model, hundred-square |
| `Y2.B8.S9` | G1-Y2.B8 | Find the whole | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B8.S10` | G1-Y2.B8 | Unit fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y2.B8.S7` | G1-Y2.B8 | Recognise a third | A8 | new: fraction | frac-model, hundred-square |
| `Y2.B8.S8` | G1-Y2.B8 | Find a third | A8 | new: fraction | frac-model, hundred-square |
| `Y2.B8.S11` | G1-Y2.B8 | Non-unit fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y2.B8.S14` | G1-Y2.B8 | Find three-quarters | A8 | new: fraction | frac-model, hundred-square |
| `Y2.B8.S15` | G1-Y2.B8 | Count in fractions up to a whole | A8 | new: fraction | frac-model, hundred-square |
| `Y3.B5.S1` | G2-Y3.B5 | Measure in metres and centimetres | A9 | new: measure | figures, measure-scale, shape-figure |
| `G2\|-\|addandsubtractwithin100onanumberlinejumpsoftensandones` | G2-Y3.B5 | Add and subtract within 100 on a number line (jumps of tens and ones) | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y3.B5.S2` | G2-Y3.B5 | Measure in millimetres | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B5.S3` | G2-Y3.B5 | Measure in centimetres and millimetres | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B5.S4` | G2-Y3.B5 | Metres, centimetres and millimetres | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B5.S5` | G2-Y3.B5 | Equivalent lengths (metres and centimetres) | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B5.S6` | G2-Y3.B5 | Equivalent lengths (centimetres and millimetres) | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B5.S7` | G2-Y3.B5 | Compare lengths | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B5.S8` | G2-Y3.B5 | Add lengths | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B5.S9` | G2-Y3.B5 | Subtract lengths | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B5.S10` | G2-Y3.B5 | What is perimeter? | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B5.S11` | G2-Y3.B5 | Measure perimeter | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B5.S12` | G2-Y3.B5 | Calculate perimeter | A9 | new: measure | figures, measure-scale, shape-figure |
| `G2\|-\|measureandestimateininchesandfeet` | G2-Y3.B5 | Measure and estimate in inches and feet | A9 | new: measure | figures, measure-scale, shape-figure |
| `G2\|-\|compareunitsinchesfeetyardsandcentimetres` | G2-Y3.B5 | Compare units: inches, feet, yards and centimetres | A9 | new: measure | figures, measure-scale, shape-figure |
| `G2\|-\|measurelengthsofasetofobjectstothenearestwholeunit` | G2-Y3.B5 | Measure lengths of a set of objects to the nearest whole unit | A3 | new: line | number-line, hop-line, value-line, pv |
| `G2\|-\|recordthemeasurementdatainatable` | G2-Y3.B5 | Record the measurement data in a table | A12 | new: data | figures, graph-axes, data-table |
| `G2\|-\|showmeasurementdataonalineplot` | G2-Y3.B5 | Show measurement data on a line plot | A12 | new: data | figures, graph-axes, data-table |
| `G2\|-\|solvelongerbyproblemsusingbarmodels` | G2-Y3.B5 | Solve 'longer by' problems using bar models | A13 | `bar-story` | word-work, bar-model |
| `G2\|-\|solveshorterbyproblemsusingbarmodels` | G2-Y3.B5 | Solve 'shorter by' problems using bar models | A13 | `bar-story` | word-work, bar-model |
| `Y4.B2.S1` | G3-Y4.B2 | Add and subtract 1s, 10s, 100s and 1,000s | A4 | new: pv | pv, base10, pv-exchange |
| `Y4.B2.S2` | G3-Y4.B2 | Add up to two 4-digit numbers - no exchange | A1 | new: column | stack, long-division, long-multiplication |
| `Y4.B2.S3` | G3-Y4.B2 | Add two 4-digit numbers - one exchange | A1 | new: column | stack, long-division, long-multiplication |
| `Y4.B2.S4` | G3-Y4.B2 | Add two 4-digit numbers - more than one exchange | A1 | new: column | stack, long-division, long-multiplication |
| `Y4.B2.S5` | G3-Y4.B2 | Subtract two 4-digit numbers - no exchange | A1 | new: column | stack, long-division, long-multiplication |
| `Y4.B2.S6` | G3-Y4.B2 | Subtract two 4-digit numbers - one exchange | A1 | new: column | stack, long-division, long-multiplication |
| `Y4.B2.S7` | G3-Y4.B2 | Subtract two 4-digit numbers - more than one exchange | A1 | new: column | stack, long-division, long-multiplication |
| `Y4.B2.S8` | G3-Y4.B2 | Efficient subtraction | A4 | new: pv | pv, base10, pv-exchange |
| `Y4.B2.S9` | G3-Y4.B2 | Estimate answers | A4 | new: pv | pv, base10, pv-exchange |
| `Y4.B2.S10` | G3-Y4.B2 | Checking strategies | A4 | new: pv | pv, base10, pv-exchange |
| `Y6.B1.S8` | G3-Y4.B2 | Negative numbers | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y5.B5.S6` | G4-Y5.B5 | Solve problems with multiplication | A13 | `bar-story` | word-work, bar-model |
| `Y5.B5.S11` | G4-Y5.B5 | Solve problems with multiplication and division | A13 | `bar-story` | word-work, bar-model |
| `Y5.B5.S1` | G4-Y5.B5 | Multiply up to a 4-digit number by a 1-digit number | A1 | new: column | stack, long-division, long-multiplication |
| `Y5.B5.S2` | G4-Y5.B5 | Multiply a 2-digit number by a 2-digit number (area model) | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B5.S3` | G4-Y5.B5 | Multiply a 2-digit number by a 2-digit number | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B5.S7` | G4-Y5.B5 | Short division | A1 | new: column | stack, long-division, long-multiplication |
| `Y5.B5.S8` | G4-Y5.B5 | Divide a 4-digit number by a 1-digit number | A1 | new: column | stack, long-division, long-multiplication |
| `Y5.B5.S9` | G4-Y5.B5 | Divide with remainders | A2 | new: fact | fact, family, equation |
| `Y5.B5.S10` | G4-Y5.B5 | Efficient division | A4 | new: pv | pv, base10, pv-exchange |
| `Y5.B5.S4` | G4-Y5.B5 | Multiply a 3-digit number by a 2-digit number | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B5.S5` | G4-Y5.B5 | Multiply a 4-digit number by a 2-digit number | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B7.S1` | G5-Y6.B7 | 1-step function machines | A5 | `rule-table` | function-table |
| `Y6.B7.S3` | G5-Y6.B7 | Form expressions | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `G5\|-\|evaluateexpressionswithparenthesesbracketsandbraces` | G5-Y6.B7 | Evaluate expressions with parentheses, brackets and braces | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `G5\|-\|writeandinterpretnumericalexpressionswordstoexpressionsexpressionstowords` | G5-Y6.B7 | Write and interpret numerical expressions (words to expressions, expressions to words) | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y6.B7.S2` | G5-Y6.B7 | 2-step function machines | A5 | `rule-table` | function-table |
| `Y6.B7.S5` | G5-Y6.B7 | Formulae | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y6.B7.S8` | G5-Y6.B7 | Solve 2-step equations | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y6.B7.S9` | G5-Y6.B7 | Find pairs of values | A4 | new: pv | pv, base10, pv-exchange |
| `Y6.B7.S10` | G5-Y6.B7 | Solve problems with two unknowns | A13 | `bar-story` | word-work, bar-model |
| `G5\|-\|formorderedpairsfromcorrespondingterms` | G5-Y6.B7 | Form ordered pairs from corresponding terms | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `G5\|-\|generatetwosequencesusingtwodifferentrules` | G5-Y6.B7 | Generate two sequences using two different rules | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y6.B7.S4` | G5-Y6.B7 | Substitution | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y6.B7.S6` | G5-Y6.B7 | Form equations | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y6.B7.S7` | G5-Y6.B7 | Solve 1-step equations | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y1.B2.S1` | GK-Y1.B2 | Introduce parts and wholes | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y1.B2.S2` | GK-Y1.B2 | Part-whole model | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y1.B2.S3` | GK-Y1.B2 | Write number sentences | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B2.S4` | GK-Y1.B2 | Fact families - addition facts | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y1.B2.S11` | GK-Y1.B2 | Find a part | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B2.S12` | GK-Y1.B2 | Subtraction - find a part | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B2.S5` | GK-Y1.B2 | Number bonds within 10 | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y1.B2.S6` | GK-Y1.B2 | Systematic number bonds within 10 | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y1.B2.S7` | GK-Y1.B2 | Number bonds to 10 | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y1.B2.S8` | GK-Y1.B2 | Addition - add together | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B2.S9` | GK-Y1.B2 | Addition - add more | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B2.S14` | GK-Y1.B2 | Subtraction - take away cross out (How many left ) | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B2.S10` | GK-Y1.B2 | Addition problems | A13 | `bar-story` | word-work, bar-model |
| `Y1.B2.S13` | GK-Y1.B2 | Fact families - the eight facts | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y1.B2.S15` | GK-Y1.B2 | Subtraction - take away (How many left ) | A6 | new: count | counters, tenframe, count-row, k2kit |
| `K\|-\|addandsubtractwithin5writtenverticallycolumnform` | GK-Y1.B2 | Add and subtract within 5 written vertically (column form) | A1 | new: column | stack, long-division, long-multiplication |
| `Y1.B2.S16` | GK-Y1.B2 | Subtraction on a number line | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y1.B2.S17` | GK-Y1.B2 | Add or subtract 1 or 2 | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y2.B11.S1` | G1-Y2.B11 | Language of position | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B11.S2` | G1-Y2.B11 | Describe movement | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B11.S4` | G1-Y2.B11 | Describe movement and turns | A7 | `property` | arrays, equation |
| `Y2.B11.S3` | G1-Y2.B11 | Describe turns | A7 | `property` | arrays, equation |
| `Y2.B11.S5` | G1-Y2.B11 | Shape patterns with turns | A7 | `property` | arrays, equation |
| `Y3.B9.S1` | G2-Y3.B9 | Pounds and pence (US: dollars & cents) | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y3.B9.S2` | G2-Y3.B9 | Convert pounds and pence (US: dollars & cents) | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y3.B9.S3` | G2-Y3.B9 | Add money (US: dollars & cents) | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y3.B9.S4` | G2-Y3.B9 | Subtract money (US: dollars & cents) | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y3.B9.S5` | G2-Y3.B9 | Find change (US: dollars & cents) | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y4.B5.S1` | G3-Y4.B5 | Factor pairs | A2 | new: fact | fact, family, equation |
| `Y4.B5.S2` | G3-Y4.B5 | Use factor pairs | A2 | new: fact | fact, family, equation |
| `Y4.B5.S8` | G3-Y4.B5 | Informal written methods for multiplication | A1 | new: column | stack, long-division, long-multiplication |
| `Y4.B5.S11` | G3-Y4.B5 | Divide a 2-digit number by a 1-digit number (1) | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B5.S12` | G3-Y4.B5 | Divide a 2-digit number by a 1-digit number (2) | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B5.S14` | G3-Y4.B5 | Correspondence problems | A13 | `bar-story` | word-work, bar-model |
| `Y4.B5.S15` | G3-Y4.B5 | Efficient multiplication | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y4.B5.S3` | G3-Y4.B5 | Multiply by 10 | A2 | new: fact | fact, family, equation |
| `Y4.B5.S4` | G3-Y4.B5 | Multiply by 100 | A2 | new: fact | fact, family, equation |
| `Y4.B5.S7` | G3-Y4.B5 | Related facts - multiplication and division | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y4.B5.S9` | G3-Y4.B5 | Multiply a 2-digit number by a 1-digit number | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `G3\|-\|solveadditionandsubtractionwordproblemswithin1000usingbarmodels` | G3-Y4.B5 | Solve addition and subtraction word problems within 1,000 using bar models | A13 | `bar-story` | word-work, bar-model |
| `Y4.B5.S5` | G3-Y4.B5 | Divide by 10 | A2 | new: fact | fact, family, equation |
| `Y4.B5.S6` | G3-Y4.B5 | Divide by 100 | A2 | new: fact | fact, family, equation |
| `Y4.B5.S10` | G3-Y4.B5 | Multiply a 3-digit number by a 1-digit number | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B5.S13` | G3-Y4.B5 | Divide a 3-digit number by a 1-digit number | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B12.S9` | G4-Y5.B12 | Decimal sequences | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y5.B12.S10` | G4-Y5.B12 | Multiply by 10, 100 and 1,000 | A2 | new: fact | fact, family, equation |
| `Y5.B12.S10` | G4-Y5.B12 | Multiply by 10, 100 and 1,000 | A2 | new: fact | fact, family, equation |
| `Y5.B12.S11` | G4-Y5.B12 | Divide by 10, 100 and 1,000 | A2 | new: fact | fact, family, equation |
| `Y5.B12.S11` | G4-Y5.B12 | Divide by 10, 100 and 1,000 | A2 | new: fact | fact, family, equation |
| `Y5.B12.S1` | G4-Y5.B12 | Use known facts to add and subtract decimals within 1 | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B12.S3` | G4-Y5.B12 | Add and subtract decimals across 1 | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B12.S4` | G4-Y5.B12 | Add decimals with the same number of decimal places | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B12.S5` | G4-Y5.B12 | Subtract decimals with the same number of decimal places | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B12.S6` | G4-Y5.B12 | Add decimals with different numbers of decimal places | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B12.S7` | G4-Y5.B12 | Subtract decimals with different numbers of decimal places | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B12.S8` | G4-Y5.B12 | Efficient strategies for adding and subtracting decimals | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B12.S2` | G4-Y5.B12 | Complements to 1 | A4 | new: pv | pv, base10, pv-exchange |
| `Y5.B12.S12` | G4-Y5.B12 | Multiply and divide decimals - missing values | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B3.S1` | G5-Y6.B3 | Equivalent fractions and simplifying | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B3.S2` | G5-Y6.B3 | Equivalent fractions on a number line | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B3.S3` | G5-Y6.B3 | Compare and order (denominator) | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B3.S4` | G5-Y6.B3 | Compare and order (numerator) | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B3.S5` | G5-Y6.B3 | Add and subtract simple fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B3.S6` | G5-Y6.B3 | Add and subtract any two fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B3.S7` | G5-Y6.B3 | Add mixed numbers | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B3.S8` | G5-Y6.B3 | Subtract mixed numbers | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B3.S9` | G5-Y6.B3 | Multi-step problems | A13 | `bar-story` | word-work, bar-model |
| `G5\|-\|multiplicationasscaling` | G5-Y6.B3 | Multiplication as scaling | A8 | new: fraction | frac-model, hundred-square |
| `Y1.B5.S1` | GK-Y1.B5 | Add by counting on within 20 | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B5.S2` | GK-Y1.B5 | Add ones using number bonds | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y1.B5.S3` | GK-Y1.B5 | Find and make number bonds to 20 | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y1.B5.S4` | GK-Y1.B5 | Doubles | A2 | new: fact | fact, family, equation |
| `Y1.B5.S5` | GK-Y1.B5 | Near doubles | A2 | new: fact | fact, family, equation |
| `Y1.B5.S6` | GK-Y1.B5 | Subtract ones using number bonds | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y1.B5.S7` | GK-Y1.B5 | Subtraction - counting back | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B5.S8` | GK-Y1.B5 | Subtraction - finding the difference | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y1.B5.S9` | GK-Y1.B5 | Related facts | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y1.B5.S10` | GK-Y1.B5 | Missing number problems | A13 | `bar-story` | word-work, bar-model |
| `Y2.B6.S1` | G1-Y2.B6 | Measure in centimetres | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y2.B6.S2` | G1-Y2.B6 | Measure in metres | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y2.B6.S3` | G1-Y2.B6 | Compare lengths and heights | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y2.B6.S4` | G1-Y2.B6 | Order lengths and heights | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y2.B6.S5` | G1-Y2.B6 | Four operations with lengths and heights | A8 | new: fraction | frac-model, hundred-square |
| `Y3.B10.S1` | G2-Y3.B10 | Roman numerals to 12 | A4 | `forms` | pv, number-word, equation |
| `Y3.B10.S2` | G2-Y3.B10 | Tell the time to 5 minutes | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y3.B10.S3` | G2-Y3.B10 | Tell the time to the minute | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y3.B10.S4` | G2-Y3.B10 | Read time on a digital clock | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y3.B10.S5` | G2-Y3.B10 | Use am and pm | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B10.S6` | G2-Y3.B10 | Years, months and days | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y3.B10.S7` | G2-Y3.B10 | Days and hours | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y3.B10.S8` | G2-Y3.B10 | Hours and minutes - use start and end times | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y3.B10.S9` | G2-Y3.B10 | Hours and minutes - use durations | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y3.B10.S10` | G2-Y3.B10 | Minutes and seconds | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y3.B10.S11` | G2-Y3.B10 | Units of time | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y3.B10.S12` | G2-Y3.B10 | Solve problems with time | A13 | `bar-story` | word-work, bar-model |
| `Y4.B3.S1` | G3-Y4.B3 | What is area? | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y4.B3.S2` | G3-Y4.B3 | Count squares | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B3.S3` | G3-Y4.B3 | Make shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B3.S4` | G3-Y4.B3 | Compare areas | A9 | new: measure | figures, measure-scale, shape-figure |
| `G3\|-\|areaasmultiplication` | G3-Y4.B3 | Area as multiplication | A9 | new: measure | figures, measure-scale, shape-figure |
| `G3\|-\|distributiveandadditivearea` | G3-Y4.B3 | Distributive and additive area | A7 | `property` | arrays, equation |
| `G4\|-\|decomposeafractionintoasumoffractionsequationsanddrawings` | G4-Y5.B4 | Decompose a fraction into a sum of fractions (equations and drawings) | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B4.S1` | G4-Y5.B4 | Find fractions equivalent to a unit fraction | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B4.S2` | G4-Y5.B4 | Find fractions equivalent to a non-unit fraction | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B4.S3` | G4-Y5.B4 | Recognise equivalent fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B7.S11` | G4-Y5.B4 | Add two or more fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B4.S4` | G4-Y5.B4 | Convert improper fractions to mixed numbers | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B4.S5` | G4-Y5.B4 | Convert mixed numbers to improper fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B4.S6` | G4-Y5.B4 | Compare fractions less than 1 | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B4.S17` | G4-Y5.B4 | Subtract two mixed numbers | A1 | new: column | stack, long-division, long-multiplication |
| `Y5.B4.S7` | G4-Y5.B4 | Order fractions less than 1 | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B4.S8` | G4-Y5.B4 | Compare and order fractions greater than 1 | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B4.S9` | G4-Y5.B4 | Add and subtract fractions with the same denominator | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B4.S10` | G4-Y5.B4 | Add fractions within 1 | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B4.S11` | G4-Y5.B4 | Add fractions with total greater than 1 | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B4.S12` | G4-Y5.B4 | Add to a mixed number | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B4.S13` | G4-Y5.B4 | Add two mixed numbers | A1 | new: column | stack, long-division, long-multiplication |
| `Y5.B4.S14` | G4-Y5.B4 | Subtract fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B4.S16` | G4-Y5.B4 | Subtract from a mixed number - breaking the whole | A8 | new: fraction | frac-model, hundred-square |
| `G4\|-\|addtenthsandhundredthsrenametenthsashundredths` | G4-Y5.B4 | Add tenths and hundredths (rename tenths as hundredths) | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B4.S15` | G4-Y5.B4 | Subtract from a mixed number | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B4.S1` | G5-Y6.B4 | Multiply fractions by integers | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B4.S2` | G5-Y6.B4 | Multiply fractions by fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B4.S3` | G5-Y6.B4 | Divide a fraction by an integer | A8 | new: fraction | frac-model, hundred-square |
| `G5\|-\|findtheareaofarectanglewithfractionalsidelengths` | G5-Y6.B4 | Find the area of a rectangle with fractional side lengths | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B4.S4` | G5-Y6.B4 | Divide any fraction by an integer | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B4.S5` | G5-Y6.B4 | Mixed questions with fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B4.S6` | G5-Y6.B4 | Fraction of an amount | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B4.S7` | G5-Y6.B4 | Fraction of an amount - find the whole | A8 | new: fraction | frac-model, hundred-square |
| `G5\|-\|divideawholenumberbyaunitfraction` | G5-Y6.B4 | Divide a whole number by a unit fraction | A8 | new: fraction | frac-model, hundred-square |
| `Y1.B9.S2` | GK-Y1.B9 | Count in 10s | A2 | new: fact | fact, family, equation |
| `Y1.B9.S4` | GK-Y1.B9 | Recognise equal groups | A7 | new: groups | ops-counters, area-model, mult-grid |
| `Y1.B9.S5` | GK-Y1.B9 | Add equal groups | A7 | new: groups | ops-counters, area-model, mult-grid |
| `Y1.B9.S6` | GK-Y1.B9 | Make arrays | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y1.B9.S7` | GK-Y1.B9 | Make doubles | A2 | new: fact | fact, family, equation |
| `Y1.B9.S1` | GK-Y1.B9 | Count in 2s | A2 | new: fact | fact, family, equation |
| `Y1.B9.S3` | GK-Y1.B9 | Count in 5s | A2 | new: fact | fact, family, equation |
| `Y1.B9.S8` | GK-Y1.B9 | Make equal groups - grouping | A7 | new: groups | ops-counters, area-model, mult-grid |
| `Y1.B9.S9` | GK-Y1.B9 | Make equal groups - sharing | A7 | new: groups | ops-counters, area-model, mult-grid |
| `Y2.B10.S2` | G1-Y2.B10 | Tables | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y2.B10.S1` | G1-Y2.B10 | Make tally charts | A12 | new: data | figures, graph-axes, data-table |
| `Y2.B10.S3` | G1-Y2.B10 | Block diagrams | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y2.B10.S4` | G1-Y2.B10 | Draw pictograms (1-1) | A12 | new: data | figures, graph-axes, data-table |
| `Y2.B10.S5` | G1-Y2.B10 | Interpret pictograms (1-1) | A12 | new: data | figures, graph-axes, data-table |
| `Y2.B10.S6` | G1-Y2.B10 | Draw pictograms (2, 5 and 10) | A12 | new: data | figures, graph-axes, data-table |
| `Y2.B10.S7` | G1-Y2.B10 | Interpret pictograms (2, 5 and 10) | A12 | new: data | figures, graph-axes, data-table |
| `Y3.B12.S1` | G2-Y3.B12 | Interpret pictograms | A12 | new: data | figures, graph-axes, data-table |
| `Y3.B12.S2` | G2-Y3.B12 | Draw pictograms | A12 | new: data | figures, graph-axes, data-table |
| `Y3.B12.S3` | G2-Y3.B12 | Interpret bar charts | A12 | new: data | figures, graph-axes, data-table |
| `Y3.B12.S4` | G2-Y3.B12 | Draw bar charts | A12 | new: data | figures, graph-axes, data-table |
| `Y3.B12.S5` | G2-Y3.B12 | Collect and represent data | A12 | new: data | figures, graph-axes, data-table |
| `Y3.B12.S6` | G2-Y3.B12 | Two-way tables | A12 | new: data | figures, graph-axes, data-table |
| `Y4.B6.S3` | G3-Y4.B6 | Perimeter on a grid | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y4.B6.S4` | G3-Y4.B6 | Perimeter of a rectangle | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B6.S5` | G3-Y4.B6 | Perimeter of rectilinear shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B6.S6` | G3-Y4.B6 | Find missing lengths in rectilinear shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B6.S7` | G3-Y4.B6 | Calculate the perimeter of rectilinear shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B6.S8` | G3-Y4.B6 | Perimeter of regular polygons | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B6.S9` | G3-Y4.B6 | Perimeter of polygons | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `G3\|-\|measureandestimatemassandliquidvolumegkgmll` | G3-Y4.B6 | Measure and estimate mass and liquid volume (g, kg, ml, l) | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y4.B6.S1` | G3-Y4.B6 | Measure in kilometres and metres | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y4.B6.S2` | G3-Y4.B6 | Equivalent lengths (kilometres and metres) | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y5.B6.S1` | G4-Y5.B6 | Multiply a unit fraction by an integer | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B6.S2` | G4-Y5.B6 | Multiply a non-unit fraction by an integer | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B6.S3` | G4-Y5.B6 | Multiply a mixed number by an integer | A2 | new: fact | fact, family, equation |
| `Y5.B6.S4` | G4-Y5.B6 | Calculate a fraction of a quantity | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B6.S5` | G4-Y5.B6 | Fraction of an amount | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B6.S6` | G4-Y5.B6 | Find the whole | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B6.S7` | G4-Y5.B6 | Use fractions as operators | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B5.S1` | G5-Y6.B5 | Metric measures | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y6.B5.S2` | G5-Y6.B5 | Convert metric measures | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y6.B5.S3` | G5-Y6.B5 | Calculate with metric measures | A9 | new: measure | figures, measure-scale, shape-figure |
| `G5\|-\|convertcustomaryunitsoflengthinchesfeetyardsmiles` | G5-Y6.B5 | Convert customary units of length (inches, feet, yards, miles) | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y6.B5.S4` | G5-Y6.B5 | Miles and kilometres | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y6.B5.S5` | G5-Y6.B5 | Imperial measures | A9 | new: measure | figures, measure-scale, shape-figure |
| `K\|-\|sortintocategoriescounteachgroupandfindthetotal` | GK-Y1.B7 | Sort into categories, count each group and find the total | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B7.S1` | GK-Y1.B7 | Compare lengths and heights | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y1.B7.S2` | GK-Y1.B7 | Measure length using objects | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y1.B7.S3` | GK-Y1.B7 | Measure length in centimetres | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y2.B5.S13` | G1-Y2.B5 | The 10 times-table | A2 | new: fact | fact, family, equation |
| `Y2.B5.S15` | G1-Y2.B5 | The 5 times-table | A2 | new: fact | fact, family, equation |
| `Y2.B5.S17` | G1-Y2.B5 | The 5 and 10 times-tables | A2 | new: fact | fact, family, equation |
| `Y2.B5.S1` | G1-Y2.B5 | Recognise equal groups | A7 | new: groups | ops-counters, area-model, mult-grid |
| `Y2.B5.S2` | G1-Y2.B5 | Make equal groups | A7 | new: groups | ops-counters, area-model, mult-grid |
| `Y2.B5.S3` | G1-Y2.B5 | Add equal groups | A7 | new: groups | ops-counters, area-model, mult-grid |
| `Y2.B5.S4` | G1-Y2.B5 | Introduce the multiplication symbol | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y2.B5.S5` | G1-Y2.B5 | Multiplication sentences | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y2.B5.S6` | G1-Y2.B5 | Use arrays | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y2.B5.S7` | G1-Y2.B5 | Make equal groups – grouping | A7 | new: groups | ops-counters, area-model, mult-grid |
| `Y2.B5.S8` | G1-Y2.B5 | Make equal groups – sharing | A7 | new: groups | ops-counters, area-model, mult-grid |
| `Y2.B5.S9` | G1-Y2.B5 | The 2 times-table | A2 | new: fact | fact, family, equation |
| `Y2.B5.S10` | G1-Y2.B5 | Divide by 2 | A2 | new: fact | fact, family, equation |
| `Y2.B5.S11` | G1-Y2.B5 | Doubling and halving | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y2.B5.S12` | G1-Y2.B5 | Odd and even numbers | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y2.B5.S14` | G1-Y2.B5 | Divide by 10 | A2 | new: fact | fact, family, equation |
| `Y2.B5.S16` | G1-Y2.B5 | Divide by 5 | A2 | new: fact | fact, family, equation |
| `Y3.B6.S7` | G2-Y3.B6 | Fractions on a number line | A8 | new: fraction | frac-model, hundred-square |
| `Y3.B6.S1` | G2-Y3.B6 | Understand the denominators of unit fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y3.B6.S3` | G2-Y3.B6 | Understand the numerators of non-unit fractions | A8 | new: fraction | frac-model, hundred-square |
| `G2\|-\|partitionarectangleintorowsandcolumnsofsquares` | G2-Y3.B6 | Partition a rectangle into rows and columns of squares | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y3.B6.S4` | G2-Y3.B6 | Understand the whole | A8 | new: fraction | frac-model, hundred-square |
| `Y3.B6.S6` | G2-Y3.B6 | Fractions and scales | A8 | new: fraction | frac-model, hundred-square |
| `Y3.B6.S2` | G2-Y3.B6 | Compare and order unit fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y3.B6.S5` | G2-Y3.B6 | Compare and order non-unit fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y3.B6.S8` | G2-Y3.B6 | Count in fractions on a number line | A8 | new: fraction | frac-model, hundred-square |
| `Y3.B6.S9` | G2-Y3.B6 | Equivalent fractions on a number line | A8 | new: fraction | frac-model, hundred-square |
| `Y3.B6.S10` | G2-Y3.B6 | Equivalent fractions as bar models | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B10.S5` | G3-Y4.B10 | Calculate with money (US: dollars & cents) | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y4.B10.S4` | G3-Y4.B10 | Estimate with money (US: dollars & cents) | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y4.B10.S1` | G3-Y4.B10 | Pounds, tens, ones and pence (US: dollars & cents) | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y4.B10.S2` | G3-Y4.B10 | Convert between pounds and pence | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y4.B10.S3` | G3-Y4.B10 | Compare amounts of money | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y4.B10.S6` | G3-Y4.B10 | Solve problems with money (US: dollars & cents) | A13 | `bar-story` | word-work, bar-model |
| `Y4.B10.S1` | G3-Y4.B10 | Write money using decimals | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y5.B7.S6` | G4-Y5.B7 | Thousandths as decimals | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B7.S7` | G4-Y5.B7 | Thousandths on a place value chart | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B7.S1` | G4-Y5.B7 | Decimals up to 2 decimal places | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B7.S2` | G4-Y5.B7 | Equivalent fractions and decimals (tenths) | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B7.S3` | G4-Y5.B7 | Equivalent fractions and decimals (hundredths) | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B7.S4` | G4-Y5.B7 | Equivalent fractions and decimals | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B7.S5` | G4-Y5.B7 | Thousandths as fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B7.S8` | G4-Y5.B7 | Order and compare decimals (same number of decimal places) | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B7.S9` | G4-Y5.B7 | Order and compare any decimals with up to 3 decimal places | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B7.S12` | G4-Y5.B7 | Understand percentages | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B7.S13` | G4-Y5.B7 | Percentages as fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B7.S14` | G4-Y5.B7 | Percentages as decimals | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B7.S15` | G4-Y5.B7 | Equivalent fractions, decimals and percentages | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B7.S10` | G4-Y5.B7 | Round to the nearest whole number | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y5.B7.S11` | G4-Y5.B7 | Round to 1 decimal place | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B10.S1` | G5-Y6.B10 | Shapes - same area | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B10.S2` | G5-Y6.B10 | Area and perimeter | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y6.B10.S3` | G5-Y6.B10 | Area of a triangle (counting squares) | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B10.S4` | G5-Y6.B10 | Area of a right-angled triangle | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B10.S5` | G5-Y6.B10 | Area of any triangle | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B10.S6` | G5-Y6.B10 | Area of a parallelogram | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B10.S7` | G5-Y6.B10 | Volume - counting cubes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B10.S8` | G5-Y6.B10 | Volume of a cuboid | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `G5\|-\|volumeofcompositesolids` | G5-Y6.B10 | Volume of composite solids | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y1.B8.S1` | GK-Y1.B8 | Heavier and lighter | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y1.B8.S2` | GK-Y1.B8 | Measure mass | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y1.B8.S3` | GK-Y1.B8 | Compare mass | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y1.B8.S4` | GK-Y1.B8 | Full and empty | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y1.B8.S5` | GK-Y1.B8 | Compare volume | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y1.B8.S6` | GK-Y1.B8 | Measure capacity | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y1.B8.S7` | GK-Y1.B8 | Compare capacity | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y2.B4.S6` | G1-Y2.B4 | Compare amounts of money | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y2.B4.S7` | G1-Y2.B4 | Find the total (US: dollars & cents) | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y2.B4.S7` | G1-Y2.B4 | Find the difference (US: dollars & cents) | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y2.B4.S9` | G1-Y2.B4 | Find change (US: dollars & cents) | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y2.B4.S1` | G1-Y2.B4 | Count money - pence (US: dollars & cents) | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y2.B4.S2` | G1-Y2.B4 | Count money - pounds (notes and coins) (US: dollars & cents) | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y2.B4.S3` | G1-Y2.B4 | Count money - pounds and pence | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y2.B4.S5` | G1-Y2.B4 | Make the same amount (US: dollars & cents) | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y2.B4.S2` | G1-Y2.B4 | Count money - notes and coins (US: dollars & cents) | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y2.B4.S4` | G1-Y2.B4 | Choose notes and coins | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y2.B4.S4` | G1-Y2.B4 | Select money (US: dollars & cents) | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y2.B4.S7` | G1-Y2.B4 | Calculate with money | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y2.B4.S8` | G1-Y2.B4 | Make a pound | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y2.B4.S10` | G1-Y2.B4 | Two-step problems (US: dollars & cents) | A13 | `bar-story` | word-work, bar-model |
| `Y3.B11.S4` | G2-Y3.B11 | Measure and draw accurately | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B11.S7` | G2-Y3.B11 | Recognise and describe 2D shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y3.B11.S1` | G2-Y3.B11 | Turns and angles | A7 | `property` | arrays, equation |
| `Y3.B11.S2` | G2-Y3.B11 | Right angles | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y3.B11.S9` | G2-Y3.B11 | Recognise and describe 3D shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y3.B11.S10` | G2-Y3.B11 | Make 3D shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y3.B11.S3` | G2-Y3.B11 | Compare angles | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y3.B11.S5` | G2-Y3.B11 | Horizontal and vertical | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y3.B11.S6` | G2-Y3.B11 | Parallel and perpendicular | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y3.B11.S8` | G2-Y3.B11 | Draw polygons | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B11.S1` | G3-Y4.B11 | Years, months, weeks and days | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y4.B11.S2` | G3-Y4.B11 | Hours, minutes and seconds | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y4.B11.S3` | G3-Y4.B11 | Convert between analogue and digital times | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y4.B11.S4` | G3-Y4.B11 | Convert to the 24 hour clock | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y4.B11.S5` | G3-Y4.B11 | Convert from the 24 hour clock | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y3.B10.S12` | G3-Y4.B11 | Solve problems with time | A13 | `bar-story` | word-work, bar-model |
| `Y5.B10.S1` | G4-Y5.B10 | Understand and use degrees | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B10.S2` | G4-Y5.B10 | Classify angles | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `G4\|-\|pointslineslinesegmentsandrays` | G4-Y5.B10 | Points, lines, line segments and rays | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B10.S4` | G4-Y5.B10 | Measure angles up to 180° | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B10.S5` | G4-Y5.B10 | Draw lines and angles accurately | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B10.S8` | G4-Y5.B10 | Lengths and angles in shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B10.S9` | G4-Y5.B10 | Regular and irregular polygons | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B10.S10` | G4-Y5.B10 | 3D shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B10.S3` | G4-Y5.B10 | Estimate angles | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B10.S6` | G4-Y5.B10 | Calculate angles around a point | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y5.B10.S7` | G4-Y5.B10 | Calculate angles on a straight line | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B11.S2` | G5-Y6.B11 | Dual bar charts | A12 | new: data | figures, graph-axes, data-table |
| `Y6.B11.S5` | G5-Y6.B11 | Draw pie charts | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y6.B11.S6` | G5-Y6.B11 | The mean | A12 | new: data | figures, graph-axes, data-table |
| `G5\|-\|fractionlineplots` | G5-Y6.B11 | Fraction line plots | A12 | new: data | figures, graph-axes, data-table |
| `Y6.B11.S1` | G5-Y6.B11 | Line graphs | A12 | new: data | figures, graph-axes, data-table |
| `Y6.B11.S3` | G5-Y6.B11 | Read and interpret pie charts | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y6.B11.S4` | G5-Y6.B11 | Pie charts with percentages | A8 | new: fraction | frac-model, hundred-square |
| `Y1.B11.S1` | GK-Y1.B11 | Describe turns | A7 | `property` | arrays, equation |
| `Y1.B11.S2` | GK-Y1.B11 | Describe position - left and right | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y1.B11.S3` | GK-Y1.B11 | Describe position - forwards and backwards | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y1.B11.S4` | GK-Y1.B11 | Describe position - above and below | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y1.B11.S5` | GK-Y1.B11 | Ordinal numbers | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y2.B7.S1` | G1-Y2.B7 | Compare mass | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y2.B7.S9` | G1-Y2.B7 | Temperature | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y2.B7.S5` | G1-Y2.B7 | Compare volume and capacity | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y2.B7.S2` | G1-Y2.B7 | Measure in grams | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y2.B7.S3` | G1-Y2.B7 | Measure in kilograms | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y2.B7.S4` | G1-Y2.B7 | Four operations with mass | A8 | new: fraction | frac-model, hundred-square |
| `Y2.B7.S7` | G1-Y2.B7 | Measure in litres | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y2.B7.S6` | G1-Y2.B7 | Measure in millilitres | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y2.B7.S8` | G1-Y2.B7 | Four operations with volume and capacity | A8 | new: fraction | frac-model, hundred-square |
| `Y3.B4.S1` | G2-Y3.B4 | Multiples of 10 | A2 | new: fact | fact, family, equation |
| `Y3.B4.S3` | G2-Y3.B4 | Reasoning about multiplication | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y3.B4.S2` | G2-Y3.B4 | Related calculations | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y3.B4.S7` | G2-Y3.B4 | Divide a 2-digit number by a 1-digit number - no exchange | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y3.B4.S8` | G2-Y3.B4 | Divide a 2-digit number by a 1-digit number - flexible partitioning | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y3.B4.S9` | G2-Y3.B4 | Divide a 2-digit number by a 1-digit number - with remainders | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y3.B4.S4` | G2-Y3.B4 | Multiply a 2-digit number by a 1-digit number - no exchange | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y3.B4.S5` | G2-Y3.B4 | Multiply a 2-digit number by a 1-digit number - with exchange | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y3.B4.S6` | G2-Y3.B4 | Link multiplication and division | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y3.B4.S10` | G2-Y3.B4 | Scaling | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y3.B4.S11` | G2-Y3.B4 | How many ways? | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y3.B12.S4` | G3-Y4.B13 | Draw bar charts | A12 | new: data | figures, graph-axes, data-table |
| `Y4.B13.S1` | G3-Y4.B13 | Interpret charts | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y4.B13.S2` | G3-Y4.B13 | Comparison, sum and difference | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B12.S1` | G3-Y4.B13 | Interpret pictograms | A12 | new: data | figures, graph-axes, data-table |
| `Y3.B12.S2` | G3-Y4.B13 | Draw pictograms | A12 | new: data | figures, graph-axes, data-table |
| `G3\|-\|buildalineplotfrominchmeasurements` | G3-Y4.B13 | Build a line plot from inch measurements | A12 | new: data | figures, graph-axes, data-table |
| `G3\|-\|measuretothehalfandquarterinch` | G3-Y4.B13 | Measure to the half and quarter inch | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B13.S3` | G3-Y4.B13 | Interpret line graphs | A12 | new: data | figures, graph-axes, data-table |
| `Y4.B13.S4` | G3-Y4.B13 | Draw line graphs | A12 | new: data | figures, graph-axes, data-table |
| `Y5.B11.S1` | G4-Y5.B11 | Read and plot coordinates | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B11.S2` | G4-Y5.B11 | Problem solving with coordinates | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B11.S3` | G4-Y5.B11 | Translation | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B11.S4` | G4-Y5.B11 | Translation with coordinates | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B11.S5` | G4-Y5.B11 | Lines of symmetry | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B11.S6` | G4-Y5.B11 | Reflection in horizontal and vertical lines | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B12.S1` | G5-Y6.B12 | Measure and classify angles | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B12.S8` | G5-Y6.B12 | Angles in polygons | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B12.S2` | G5-Y6.B12 | Calculate angles | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B12.S3` | G5-Y6.B12 | Vertically opposite angles | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B12.S4` | G5-Y6.B12 | Angles in a triangle | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B12.S6` | G5-Y6.B12 | Angles in a triangle - missing angles | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B12.S7` | G5-Y6.B12 | Angles in quadrilaterals | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B12.S9` | G5-Y6.B12 | Circles | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B12.S5` | G5-Y6.B12 | Angles in a triangle - special cases | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B12.S10` | G5-Y6.B12 | Draw shapes accurately | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `G5\|-\|classifytwodimensionalfiguresinahierarchy` | G5-Y6.B12 | Classify two-dimensional figures in a hierarchy | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B12.S11` | G5-Y6.B12 | Nets of 3D shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `K\|-\|buildanddrawshapes` | GK-Y1.B3 | Build and draw shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `K\|-\|composeshapesfromsmallershapes` | GK-Y1.B3 | Compose shapes from smaller shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y1.B3.S1` | GK-Y1.B3 | Recognise and name 3D shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y1.B3.S2` | GK-Y1.B3 | Sort 3D shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y1.B3.S3` | GK-Y1.B3 | Recognise and name 2D shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y1.B3.S4` | GK-Y1.B3 | Sort 2D shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y1.B3.S5` | GK-Y1.B3 | Patterns with 2D and 3D shapes | A2 | `table-pattern` | mult-grid, fact |
| `Y2.B9.S1` | G1-Y2.B9 | O'clock and half past | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y2.B9.S6` | G1-Y2.B9 | Minutes in an hour | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y2.B9.S7` | G1-Y2.B9 | Hours in a day | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y2.B9.S2` | G1-Y2.B9 | Quarter past and quarter to | A8 | new: fraction | frac-model, hundred-square |
| `Y2.B9.S3` | G1-Y2.B9 | Tell time past the hour | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y2.B9.S4` | G1-Y2.B9 | Tell time to the hour | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y2.B9.S5` | G1-Y2.B9 | Tell the time to 5 minutes | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y3.B10.S8` | G1-Y2.B9 | Hours and minutes - use start and end times | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y3.B7.S5` | G2-Y3.B7 | Compare mass | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B7.S10` | G2-Y3.B7 | Compare capacity and volume | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B7.S1` | G2-Y3.B7 | Use scales | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B7.S2` | G2-Y3.B7 | Measure mass in grams | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B7.S9` | G2-Y3.B7 | Equivalent capacities and volumes (litres and millilitres) | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B7.S3` | G2-Y3.B7 | Measure mass in kilograms and grams | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B7.S4` | G2-Y3.B7 | Equivalent masses (kilograms and grams) | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B7.S6` | G2-Y3.B7 | Add and subtract mass | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B7.S11` | G2-Y3.B7 | Add and subtract capacity and volume | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B7.S7` | G2-Y3.B7 | Measure capacity and volume in millilitres | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y3.B7.S8` | G2-Y3.B7 | Measure capacity and volume in litres and millilitres | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y4.B12.S2` | G3-Y4.B12 | Identify angles | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B12.S6` | G3-Y4.B12 | Polygons | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B12.S3` | G3-Y4.B12 | Compare and order angles | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B12.S4` | G3-Y4.B12 | Triangles | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B12.S5` | G3-Y4.B12 | Quadrilaterals | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B12.S7` | G3-Y4.B12 | Lines of symmetry | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B12.S8` | G3-Y4.B12 | Complete a symmetric figure | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B12.S1` | G3-Y4.B12 | Understand angles as turns | A7 | `property` | arrays, equation |
| `Y5.B8.S1` | G4-Y5.B8 | Perimeter of rectangles | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B8.S4` | G4-Y5.B8 | Area of rectangles | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `G4\|-\|anglesareadditivefindanunknownangleinadecomposedangle` | G4-Y5.B8 | Angles are additive: find an unknown angle in a decomposed angle | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B8.S2` | G4-Y5.B8 | Perimeter of rectilinear shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B8.S3` | G4-Y5.B8 | Perimeter of polygons | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B8.S5` | G4-Y5.B8 | Area of compound shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B8.S6` | G4-Y5.B8 | Estimate area | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y6.B13.S1` | G5-Y6.B13 | The first quadrant | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B13.S2` | G5-Y6.B13 | Read and plot points in four quadrants | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B13.S3` | G5-Y6.B13 | Solve problems with coordinates | A13 | `bar-story` | word-work, bar-model |
| `Y6.B13.S4` | G5-Y6.B13 | Translations | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B13.S5` | G5-Y6.B13 | Reflections | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y1.B13.S4` | GK-Y1.B13 | Count in coins (US: dollars & cents) | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y1.B13.S1` | GK-Y1.B13 | Unitising | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y1.B13.S2` | GK-Y1.B13 | Recognise coins (US: dollars & cents) | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y1.B13.S3` | GK-Y1.B13 | Recognise notes (US: dollars & cents) | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y3.B8.S1` | G2-Y3.B8 | Add fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y3.B8.S2` | G2-Y3.B8 | Subtract fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y3.B8.S3` | G2-Y3.B8 | Partition the whole | A4 | `forms` | pv, number-word, equation |
| `Y3.B8.S4` | G2-Y3.B8 | Unit fractions of a set of objects | A8 | new: fraction | frac-model, hundred-square |
| `Y3.B8.S5` | G2-Y3.B8 | Non-unit fractions of a set of objects | A8 | new: fraction | frac-model, hundred-square |
| `Y3.B8.S6` | G2-Y3.B8 | Reasoning with fractions of an amount | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B8.S1` | G3-Y4.B8 | Tenths as fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B8.S2` | G3-Y4.B8 | Tenths as decimals | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B8.S3` | G3-Y4.B8 | Tenths on a place value chart | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B8.S4` | G3-Y4.B8 | Tenths on a number line | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B8.S5` | G3-Y4.B8 | Divide a 1-digit number by 10 | A2 | new: fact | fact, family, equation |
| `Y4.B8.S6` | G3-Y4.B8 | Divide a 2-digit number by 10 | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B8.S7` | G3-Y4.B8 | Hundredths as fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B8.S8` | G3-Y4.B8 | Hundredths as decimals | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B8.S9` | G3-Y4.B8 | Hundredths on a place value chart | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B8.S10` | G3-Y4.B8 | Divide a 1- or 2-digit number by 100 | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B9.S3` | G4-Y5.B9 | Read and interpret tables | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y5.B9.S4` | G4-Y5.B9 | Two-way tables | A12 | new: data | figures, graph-axes, data-table |
| `Y5.B9.S5` | G4-Y5.B9 | Read and interpret timetables | A12 | new: data | figures, graph-axes, data-table |
| `G4\|-\|lineplotswithfractions` | G4-Y5.B9 | Line plots with fractions | A12 | new: data | figures, graph-axes, data-table |
| `Y5.B9.S1` | G4-Y5.B9 | Draw line graphs | A12 | new: data | figures, graph-axes, data-table |
| `Y5.B9.S2` | G4-Y5.B9 | Read and interpret line graphs | A12 | new: data | figures, graph-axes, data-table |
| `Y6.B6.S1` | G5-Y6.B6 | Add or multiply? | A2 | new: fact | fact, family, equation |
| `Y6.B6.S6` | G5-Y6.B6 | Use scale factors | A2 | new: fact | fact, family, equation |
| `Y6.B6.S2` | G5-Y6.B6 | Use ratio language | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B6.S3` | G5-Y6.B6 | Introduction to the ratio symbol | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B6.S4` | G5-Y6.B6 | Ratio and fractions | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B6.S5` | G5-Y6.B6 | Scale drawing | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y6.B6.S7` | G5-Y6.B6 | Similar shapes | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y6.B6.S8` | G5-Y6.B6 | Ratio problems | A13 | `bar-story` | word-work, bar-model |
| `Y6.B6.S9` | G5-Y6.B6 | Proportion problems | A13 | `bar-story` | word-work, bar-model |
| `Y6.B6.S10` | G5-Y6.B6 | Recipes | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y1.B14.S2` | GK-Y1.B14 | Days of the week | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y1.B14.S3` | GK-Y1.B14 | Months of the year | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y1.B14.S1` | GK-Y1.B14 | Before and after | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y1.B14.S4` | GK-Y1.B14 | Hours, minutes and seconds | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y1.B14.S5` | GK-Y1.B14 | Tell the time to the hour | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y1.B14.S6` | GK-Y1.B14 | Tell the time to the half hour | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y4.B9.S1` | G3-Y4.B9 | Make a whole with tenths | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B9.S2` | G3-Y4.B9 | Make a whole with hundredths | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B9.S3` | G3-Y4.B9 | Partition decimals | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B9.S5` | G3-Y4.B9 | Compare decimals | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B9.S6` | G3-Y4.B9 | Order decimals | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B9.S4` | G3-Y4.B9 | Flexibly partition decimals | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B9.S7` | G3-Y4.B9 | Round to the nearest whole number | A3 | new: line | number-line, hop-line, value-line, pv |
| `Y4.B9.S8` | G3-Y4.B9 | Halves and quarters as decimals | A8 | new: fraction | frac-model, hundred-square |
| `Y5.B14.S1` | G4-Y5.B14 | Kilograms and kilometres | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y5.B14.S2` | G4-Y5.B14 | Millimetres and millilitres | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y5.B14.S3` | G4-Y5.B14 | Convert units of length | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y5.B14.S4` | G4-Y5.B14 | Convert between metric and imperial units | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y5.B14.S5` | G4-Y5.B14 | Convert units of time | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `Y5.B14.S6` | G4-Y5.B14 | Calculate with timetables | A12 | new: data | figures, graph-axes, data-table |
| `G4\|-\|customarycapacitycupspintsquartsandgallons` | G4-Y5.B14 | Customary capacity: cups, pints, quarts and gallons | A9 | new: measure | figures, measure-scale, shape-figure |
| `G4\|-\|customarylengthandweightinchesfeetyardsouncesandpounds` | G4-Y5.B14 | Customary length and weight - inches, feet, yards, ounces and pounds | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `G4\|-\|measurementwordproblemsdistancetimemassmoneyandcapacity` | G4-Y5.B14 | Measurement word problems: distance, time, mass, money and capacity | A13 | `bar-story` | word-work, bar-model |
| `Y6.B5.S1` | G4-Y5.B14 | Metric measures | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y6.B9.S1` | G5-Y6.B9 | Decimal and fraction equivalents | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B9.S2` | G5-Y6.B9 | Fractions as division | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B9.S5` | G5-Y6.B9 | Equivalent fractions, decimals and percentages | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B9.S6` | G5-Y6.B9 | Order fractions, decimals and percentages | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B9.S3` | G5-Y6.B9 | Understand percentages | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B9.S7` | G5-Y6.B9 | Percentage of an amount – one step | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B9.S8` | G5-Y6.B9 | Percentage of an amount – multi-step | A13 | `bar-story` | word-work, bar-model |
| `Y6.B9.S4` | G5-Y6.B9 | Fractions to percentages | A8 | new: fraction | frac-model, hundred-square |
| `Y6.B9.S9` | G5-Y6.B9 | Percentages - missing values | A8 | new: fraction | frac-model, hundred-square |
| `Y1.B10.S1` | GK-Y1.B10 | Recognise a half of an object or a shape | A8 | new: fraction | frac-model, hundred-square |
| `Y1.B10.S2` | GK-Y1.B10 | Find a half of an object or a shape | A8 | new: fraction | frac-model, hundred-square |
| `Y1.B10.S3` | GK-Y1.B10 | Recognise a half of a quantity | A8 | new: fraction | frac-model, hundred-square |
| `Y1.B10.S5` | GK-Y1.B10 | Recognise a quarter of an object or a shape | A8 | new: fraction | frac-model, hundred-square |
| `Y1.B10.S4` | GK-Y1.B10 | Find a half of a quantity | A8 | new: fraction | frac-model, hundred-square |
| `Y1.B10.S6` | GK-Y1.B10 | Find a quarter of an object or a shape | A8 | new: fraction | frac-model, hundred-square |
| `Y1.B10.S7` | GK-Y1.B10 | Recognise a quarter of a quantity | A8 | new: fraction | frac-model, hundred-square |
| `Y1.B10.S8` | GK-Y1.B10 | Find a quarter of a quantity | A8 | new: fraction | frac-model, hundred-square |
| `Y4.B14.S3` | G3-Y4.B14 | Draw 2-D shapes on a grid | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B14.S1` | G3-Y4.B14 | Describe position using coordinates | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B14.S2` | G3-Y4.B14 | Plot coordinates | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B14.S4` | G3-Y4.B14 | Translate on a grid | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y4.B14.S5` | G3-Y4.B14 | Describe translation on a grid | A11 | new: shape | shapes, coord-grid, solid-kit, angle-kit |
| `Y5.B15.S4` | G4-Y5.B15 | Estimate capacity | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y5.B15.S1` | G4-Y5.B15 | Cubic centimetres | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y5.B15.S2` | G4-Y5.B15 | Compare volume | A9 | new: measure | figures, measure-scale, shape-figure |
| `Y5.B15.S3` | G4-Y5.B15 | Estimate volume | A9 | new: measure | figures, measure-scale, shape-figure |
| `G5\|-\|consolidationofarithmetic` | G5-Y6.B14 | Consolidation of arithmetic | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `G5\|-\|endofyearinvestigationprojects` | G5-Y6.B14 | End-of-year investigation projects | A10 | new: timemoney | clock, timeline, coins, tmkit |
| `G5\|-\|problemsolvingacrossstrands` | G5-Y6.B14 | Problem solving across strands | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `G5\|-\|reasoningtasks` | G5-Y6.B14 | Reasoning tasks | A5 | new: partwhole | bond, equation, cloze, bar-model |
| `Y6.B1.S8` | G4-Y5.B13 | Negative numbers | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y5.B13.S1` | G4-Y5.B13 | Understand negative numbers | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y5.B13.S2` | G4-Y5.B13 | Count through zero in 1s | A6 | new: count | counters, tenframe, count-row, k2kit |
| `Y5.B13.S3` | G4-Y5.B13 | Count through zero in multiples | A2 | new: fact | fact, family, equation |
| `Y5.B13.S4` | G4-Y5.B13 | Compare and order negative numbers | A4 | new: pv | pv, base10, pv-exchange |
| `Y5.B13.S5` | G4-Y5.B13 | Find the difference | A6 | new: count | counters, tenframe, count-row, k2kit |
