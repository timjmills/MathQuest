# Family review: addition

Category: `addition` (58 skills). Generator: `js/modules/gen-operations.js`; two skills live elsewhere (`add_5_pictures` in `js/modules/gen-counting.js` :823, `equal_sign` in `js/modules/gen-algebraic.js` :5346 — dead code, see summary 1). Routing: `js/modules/generate-question.js`. Machine-readable tags and verdicts: `design/catalogue/addition.overrides.json`.

## Family summary

1. Verdicts: keep 1, fix 35, redo 5, merge 13, split 4 (total 58). Hosts: `computation-grid` 25, `word-problems` 19, `equation-drill` 7, `visual-grid` 6, `k-counting` 1. The catalogue's host guesses are right for the ranged column skills and the stories; they are wrong for `add` (guessed `visual-grid`), `add_facts` (guessed `computation-grid` although half its output is horizontal), `add_three` and `equal_sign` (both guessed `visual-grid`).
2. Worst problem 1: **three skills are broken output, not weak output.** `equal_sign` never produces a true/false equation — it has no branch in the operations generator, is absent from `skillCategoryOverride` (`generate-question.js` :262-305), so it falls through to the default `ops = ["+"]` at :4573 and prints plain sums. Its baseline print sheet (`print/addition__equal_sign.png`) shows six sums labelled "True/False E", with the hint text ("Start at 1, count up 20") printed under three of them and the on-screen column widget — empty input boxes and the line "Type in boxes • Use top row for carrying" — printed under the other three. `cloze_addition` prints "___ + ___ = 18" with no rule, no box and no word bank, under the instruction "Pick one value from each list and write it in the matching blank"; there is no list on paper (`print/addition__cloze_addition.png`). `add_5_pictures` prints full-colour emoji, and item 6 of the baseline sheet prints "1 + 3 = ?" with no pictures at all.
3. Worst problem 2: **every "within N" label is wrong.** `generateAddPair` (:439-458) draws *each* addend from `[minVal, maxVal]`, so the sum reaches 2N. "Add within 10 (With Regrouping)" produced 9 + 5 and 8 + 7; "Add within 20" produced 20 + 11; "Add within 100 (With Regrouping)" produced 85 + 96 = 181; "Add within 1,000 (No Regrouping)" produced 1,000 + 388. The 16 word-problem ids do the same at :1064-1066 ("within 10" produced 6 + 6 = 12; "within 20" produced 8 + 17 = 25). This affects 40 of the 58 skills and makes the whole band ladder meaningless. `add_10_regroup` is the extreme case: a sum within 10 cannot regroup at all, so the id can only exist by breaking its own label.
4. Worst problem 3: **no zeros, no ragged lengths, no per-column regroup control.** Every generator starts at 1 or higher, so `n + 0` never appears anywhere in the family — and the owner's ruling puts the zero set last for + and −, which means it must exist. `minVal = Math.max(2, Math.floor(maxVal / 10))` (:440, :1060) forbids a short addend beside a long one, so 2d + 1d and 3d + 2d never occur. `hasCarry` is a boolean, so "regroup in the ones only", "regroup in the tens only" and "regroup in both" cannot be requested; in the baseline `add_100_regroup` sheet all six items regroup in the ones.
5. Worst problem 4: **silent type mixing (P-28) in nine ids.** `add` rotates 70% bare sum / 20% missing number / 10% **missing operator** — and the missing-operator branch (:4634-4677) picks from `+ − × ÷`, so an addition skill produces "12 ? 7 = 84" answered `×`, as a four-way multiple choice. `add_facts` mixes horizontal and vertical on the same page (baseline sheet items 1, 3, 4, 6 vertical; 2, 5 horizontal) against the owner's "both orientations as separate sections". `add_sub_10s` and `add_sub_100s` each toss a coin between + and − (:4578, :4601). `add_word_problems` and `comparison_word` divert 20% of items into a "Click ALL the numbers you need" multi-select (:3313, :1413) that exists on screen only. `add_word_problems` then rotates three story schemas (:3369). `nl_add` rotates find-sum / find-addend / find-start 4:1:1 (:616). `add_sub_fact_family` flips 60/40 between "fill all four" and "fill one" (:1653).
6. Worst problem 5: **print/screen parity breaks and screen-only scaffolds (P-29).** `_equationBuilderHTML` (:18-30) appears under every picture word problem: it hands the pupil both numbers already extracted from the story, plus a `+ − × ÷` chooser, in blue — that is the set-up step done for them, and it never prints. `cloze_addition` is a dropdown on screen and an unanswerable blank on paper. `add_5_pictures` is a 3-option multiple choice on screen and a write-in on paper. `buildColumnVisual` (:490-526) is an interactive widget whose carry boxes are **dashed** (PT-TOK-3: dashed means cut) and whose answer row has exactly `ans.toString().length` boxes, so the number of digits in the sum is given away.
7. Also family-wide: colour carries meaning (`add_three` gives each addend its own categorical fill, :1362-1366; `comparison_word` colour-codes the two bars and the difference; the fact-family and number-family boxes colour add rows green and subtract rows orange; the printed word-problem group boxes are pink / orange / yellow and dashed). The word "carrying" is used in the hint and the widget (:523, :980) against the owner's US ruling "regroup". `comparison_word` shouts in capitals ("How many MORE", :1443). The skill label is reprinted beside every single item on every sheet, and on the regrouping sheets that label tells the pupil the answer to the regroup decision.
8. What is already good: `hasCarry` / `_addRequiresRegrouping` exist and the strategic-regrouping cap at :444-455 already pushes 3-digit items to two carrying columns; word-problem icons are real line art (`word-problem-icons.js`), not emoji, everywhere except `add_5_pictures`; the story text is short (17-22 words at the top bands, 5-9 elsewhere) and uses a neutral name pool; distractors are already tagged with misconception text at :991-1002, :1403-1405, :1486-1489, which is the raw material for `wrongAnswer`; `_plain` twins are already implemented as aliases (`generate-question.js` :20, :33-40) rather than duplicated code, so the merges below are bookkeeping, not rewrites.
9. Existing worked-solution text: `workedMax` is 2 for the facts, stories and families, 4 for `add_10`-`add_50`, 7 for `add_100` and above; `solStepsMax` reaches 6-8. The long version is a per-column trace of the specific numbers, written declaratively ("The ones are 7 + 8 = 15, so write 5 and carry 1"). It is usable as the answer-key working and as the Scripted Model's filled example, but not as `workedSteps`: those must be authored as 3-6 imperative steps of ten words or fewer, and the word "carry" must become "regroup". 22 skills (the stories and the families) have no step text worth keeping at all.
10. Five ladders are proposed below (AD-F facts, AD-U unknowns and the equal sign, AD-C the column algorithm, AD-V representations, AD-S story schemas). 19 ladder steps have no skill today; nine new ids and nine split targets are listed under "New skills needed". `mixed_addition` belongs to no ladder by design.

## Proposed ladders

One delta per step. "opt" = an option on an existing id, not a new id.

### AD-F: addition facts (K-2)

| Step | I Can ... | Delta | Skill |
|---|---|---|---|
| AD-F1 | Add 1 | one constant addend | `add_facts` opt `facts:[1]` |
| AD-F2 | Add 2 | the constant changes | same id, `facts:[2]` |
| AD-F3 | Add 3, then 4, then 5 | the constant changes | same id |
| AD-F4 | Add Doubles With Counters | a named pattern, shown | NEW `add_doubles` |
| AD-F5 | Add Doubles | the counters go | `add_doubles` opt `visual:none` |
| AD-F6 | Add Near Doubles | one more than a double | NEW `add_near_doubles` |
| AD-F7 | Add 10 | the constant changes | `add_facts` opt `facts:[10]` |
| AD-F8 | Make Ten | the unknown is the second addend | `cloze_addition` (redone) opt `whole:10` |
| AD-F9 | Bridge Through Ten | two steps instead of one | NEW `add_bridge_ten` |
| AD-F10 | Add 0 | the zero set, last (owner ruling) | `add_facts` opt `facts:[0]` |
| AD-F11 | Facts to 10 | constants mix | `add_facts` opt `facts:{0,10}` |
| AD-F12 | Facts to 20 | the range grows | `add_facts` opt `facts:{0,20}` |
| AD-F13 | Facts Written Down the Page | orientation only | `add_10_mixed`, `add_20_mixed` (column form) |
| AD-F14 | Add Three Numbers, Make a Ten First | a third addend | `add_three` |

### AD-U: unknowns and the equal sign (grades 1-2)

| Step | I Can ... | Delta | Skill |
|---|---|---|---|
| AD-U1 | Find the Total | baseline | `add_facts` |
| AD-U2 | Find the Second Addend | the unknown moves | `cloze_addition` opt `unknown:b` |
| AD-U3 | Find the First Addend | the unknown moves | `cloze_addition` opt `unknown:a` |
| AD-U4 | List the Ways to Make a Number | many answers, counted | `cloze_addition` opt `task:ways` |
| AD-U5 | Say if a Sum Is True or False | judge, do not solve | `equal_sign` (redone) opt `form:a+b=c` |
| AD-U6 | Say if Two Sums Are Equal | both sides compute | `equal_sign` opt `form:a+b=c+d` |
| AD-U7 | Balance the Equation | unknown inside a balanced pair | NEW `balance_add` |
| AD-U8 | Find the Third Member of a Family | the triple | `add_sub_fact_family` opt `blanks:member` |
| AD-U9 | Write the Four Facts | the response grows | `add_sub_fact_family` opt `blanks:results` |
| AD-U10 | Say if It Is a Fact Family | non-examples enter | `add_sub_fact_family` opt `task:sort` |

### AD-C: the column algorithm (grades 1-5)

| Step | I Can ... | Delta | Skill |
|---|---|---|---|
| AD-C1 | Add Tens to Tens | whole tens only | `add_sub_10s` (add branch of the split) |
| AD-C2 | Add 10 to Any Number | the other addend is not round | `add_sub_10s` opt `base:any` |
| AD-C3 | Add a One-Digit Number to a Two-Digit Number | ragged lengths | `add_100_no_regroup` opt `digits:2+1` |
| AD-C4 | Add Two Two-Digit Numbers, No Regroup | equal lengths | `add_50_no_regroup`, `add_100_no_regroup` |
| AD-C5 | Decide If It Regroups | decision only, no answer | sub-decide page on `add_100_mixed` |
| AD-C6 | Write the Regroup Mark | notate only, no answer | sub-notate page on `add_100_regroup` |
| AD-C7 | Regroup the Ones | one regroup | `add_50_regroup` opt `carry:ones` |
| AD-C8 | Regroup the Tens | the column changes | `add_100_regroup` opt `carry:tens` |
| AD-C9 | Add Two-Digit Numbers | the decision returns | `add_100_mixed` |
| AD-C10 | Add Three-Digit Numbers, No Regroup | the digits grow | `add_1k_no_regroup` |
| AD-C11 | Regroup Once in a Three-Digit Sum | one regroup | `add_1k_regroup` opt `carries:1` |
| AD-C12 | Regroup Twice | a chained carry (9 + 9) | `add_1k_regroup` opt `carries:2` |
| AD-C13 | Add Numbers of Different Lengths | length mismatch | `add_1k_*` opt `ragged` |
| AD-C14 | Add Four-Digit Numbers | the digits grow | `add_10k_*` |
| AD-C15 | Add Five- and Six-Digit Numbers | the digits grow | `add_100k_*`, `add_1m_*` |
| AD-C16 | Write It Down the Page | set-up only, no answer | sub-setup page on any `add_*` |
| AD-C17 | Add Three or More Numbers | a third addend in the column | NEW `add_column_multi` |
| AD-C18 | Find the Missing Digit | the unknown is inside the column | NEW `add_missing_digit` |
| AD-C19 | Add 100 to Any Number | the place changes | `add_sub_100s` (add branch of the split) |

Generic `add` is the range-driven adapter this ladder pulls from; it is not a step of its own.

### AD-V: representations (K-1)

| Step | I Can ... | Delta | Skill |
|---|---|---|---|
| AD-V1 | Count Them All | counters, sums to 5 | `add_5_pictures` (redone) |
| AD-V2 | Count On From the Bigger Part | one group is not counted | `add_5_pictures` opt `to:10, strategy:count_on` |
| AD-V3 | Make Ten on a Ten Frame | the frame enters | NEW `add_ten_frame` |
| AD-V4 | Follow the Hops | hops drawn, find the landing | `number_line_add`, `nl_add` (find-sum) |
| AD-V5 | Draw the Hops | the pupil draws | `nl_add` opt `hops:draw` |
| AD-V6 | Find How Far the Hop Went | the unknown moves | NEW `nl_add_addend` (split) |
| AD-V7 | Find Where the Hop Started | the unknown moves | NEW `nl_add_start` (split) |
| AD-V8 | Add With Base-Ten Blocks | tens and ones enter | NEW `add_base10_blocks` |

### AD-S: story schemas (K-5)

| Step | I Can ... | Delta | Skill |
|---|---|---|---|
| AD-S1 | Put Two Groups Together | both parts given | NEW `add_wp_join` (split) |
| AD-S2 | Add To a Group | the action changes | NEW `add_wp_change` (split) |
| AD-S3 | Find How Many Were Added | the unknown moves | NEW `add_wp_change_unknown` (split) |
| AD-S4 | Find How Many There Were at the Start | the unknown moves | NEW `add_wp_start_unknown` (split) |
| AD-S5 | Find the Missing Part | part-part-whole | NEW `add_wp_part_whole` (split) |
| AD-S6 | Find How Many More | comparison | `comparison_word` |
| AD-S7 | Find the Bigger Amount | "N more than" | `comparison_word` opt `unknown:bigger` |
| AD-S8 | Decide Whether to Add | decision only | sub-decide page on any story |
| AD-S9 | Write the Equation | set-up only | sub-setup page on any story |
| AD-S10 | Solve a Two-Step Story | a second step | NEW `add_two_step_word` |

The eight `add_wp_*` number bands (10 / 20 / 50 / 100 / 1k / 10k / 100k / 1m) are the **range** axis crossed with AD-S, not steps of their own; `add_word_problems` is their unbanded twin.

## Skill table

| Skill id | Grade | Host | Special tags | Verdict | Defects | To author |
|---|---|---|---|---|---|---|
| `add_facts` | 1 | equation-drill | fact-layouts, flashcards, k-one-page | fix | horizontal and vertical mixed on the same page (baseline sheet items 1-6) against the owner's orientations ruling; `a = rng(1,20); b = rng(1, 20-a)` (:4745-4746) skews to small `b` and never gives 0; "20 + 1 = 21" is outside the band; no single-addend sets, no doubles, no cumulative ranges; 6 items per page on a fact sheet; label reprinted on every item | W; "counted the start number as the first count-on", "answer off by one", "reversed to subtraction"; Say: "__ plus __ equals __."; vocab: addend, sum, total |
| `add_sub_10s` | 1 | equation-drill | k-one-page, **+todays-number** | split | coin-flips + and − (:4578); only ever `multiple-of-10 ± 10`, never "43 + 10" (1.NBT.C.5, 2.NBT.B.8); `state.range` ignored; distinct 10/12; the hint states the rule and the answer (:4584) | W; "changed the ones digit instead of the tens", "counted on by one"; Say: "Ten more than __ is __."; vocab: ten more, ten less, tens digit |
| `add_sub_100s` | 2 | equation-drill | **+todays-number** | split | same coin flip (:4601); only `multiple-of-100 ± 100`; `state.range` ignored; distinct 10/12; hint gives the answer | W; "changed the tens digit instead of the hundreds"; Say: "One hundred more than __ is __."; vocab: hundred more, hundreds digit |
| `add` | 1 | equation-drill | **+sub-setup**, −fact-layouts, −flashcards, −k-one-page | redo | 10% of items are a **missing-operator multiple choice over `+ − × ÷`** (:4634-4677) inside an addition skill; 20% are missing-number (:4679-4738); the three types share one id, one label and one answer sheet; duplicates the ranged ladder with no regroup control | W; "added when the sign was not +", "ignored the unknown position"; Say: "__ plus __ equals __."; vocab: addend, sum |
| `add_word_problems` | 2 | word-problems | sub-decide, sub-setup, schema-story, −hands-sort | split | 20% diverted to screen-only multi-select (:3313); three schemas rotated silently (:3369) plus an unlabelled fourth ("N more than" comparison) in the samples; `q.answerType` flips between `col-arith`, `number` and `multi-select-check` within one id; decimals leak in when `state.decimalPlaces > 0` (:3378) | W; "subtracted because the story said more", "answered with one of the givens", "added the two numbers that appear last"; decide: "[ ] I know both parts. I add." / "[ ] I know the whole and one part. I subtract."; Say: "I know __ and __. I need __."; vocab: altogether, in all, part |
| `add_word_problems_plain` | 2 | word-problems | as above | merge → `addition:add_word_problems` | pure alias already (`generate-question.js` :20); differs only by `q.visual` | inherits its target's |
| `add_sub_fact_family` | 1 | visual-grid | fact-family, k-one-page | fix | 60/40 silent flip between "fill all four" and "fill one" (:1653); no non-examples ("is it a family?"); degenerate families allowed (doubles give two distinct facts, `n + 0` families are trivial); add rows green / sub rows orange; `data-answer` on every input; `q.ans` changes shape with the flip | W; "wrote the same fact twice", "put the whole in a part slot", "kept the order and wrote 16 − 28"; Say: "__ and __ make __. __ take away __ leaves __."; vocab: fact family, part, whole |
| `number_families_add` | 1 | visual-grid | fact-family, k-one-page | merge → `addition:add_sub_fact_family` | same task, different id; option `blanks:results` | inherits |
| `number_families_add_med` | 2 | visual-grid | fact-family | merge → `addition:add_sub_fact_family` | same task; option `blanks:two-per-row` | inherits |
| `number_families_add_hard` | 2 | visual-grid | fact-family | merge → `addition:add_sub_fact_family` | same task; option `blanks:all`. The all-blank form (:1798-1800) is answerable (the triple prints above the rows) but the key is one of four equivalent arrangements, so it cannot be marked; the baseline sheet fits only two items on a page | inherits |
| `add_three` | 1 | equation-drill | fact-layouts, k-one-page, −flashcards | fix | the three addends get three categorical fills that carry which group is which (:1362-1366); `a, b, c` are random in 1-10, so a make-ten pair appears only by accident — the whole point of 1.OA.A.2 / 2.NBT.B.6; no zeros; commutativity never exercised deliberately | W; "added only two of the three", "added the first two and stopped"; Say: "I look for two that make ten."; vocab: addend, make ten, in any order |
| `comparison_word` | 1 | word-problems | k-one-page, schema-story, **+sub-decide**, −hands-sort | fix | 20% screen-only multi-select (:1413); MORE / FEWER in capitals (:1443, :1445) — hard for ELL and never read aloud that way; the bar model colour-codes the two amounts and the difference; the difference band is drawn to the exact answer width, so the answer is measurable off the page; only difference-unknown, never bigger- or smaller-unknown; `state.range` capped at 50 | W; "added the two amounts", "answered with the larger amount", "read fewer as more"; decide: "[ ] I am putting groups together. I add." / "[ ] I am finding how many more. I subtract."; Say: "__ has __ more than __."; vocab: more, fewer, difference |
| `equal_sign` | 1 | equation-drill | k-one-page, −fact-layouts, −flashcards | redo | **produces no true/false items at all**: no branch in `gen-operations.js`, absent from `skillCategoryOverride`, falls to the default `ops = ["+"]` (:4573). The real code at `gen-algebraic.js` :5346-5400 is unreachable. The print sheet prints the hint text and the on-screen column widget as question content | W; "reads = as 'the answer comes next' (writes 8 for 3 + 5 = □ + 2)", "checked only the left side", "said false because the numbers differ"; Say: "This side is __. That side is __."; vocab: equal, true, false |
| `add_5_pictures` | K | k-counting | k-one-page | redo | literal emoji (`gen-counting.js` :824) against the no-emoji ruling; prints in colour; baseline item 6 prints with **no pictures**; 3-option multiple choice on screen, write-in on paper (P-29); `n, m ∈ 1..3` gives 8 distinct items, and the baseline sheet repeats 3 + 2 and 3 + 1; the text already states "3 + 2 = ?" so nothing has to be counted; two answer slots per item | W; "counted one group only", "recounted the first group", "counted the + sign"; Say: "__ and __ make __ in all."; vocab: in all, altogether, count on |
| `add_10_no_regroup` | K | computation-grid | fact-layouts, flashcards, k-one-page, sub-setup, −sub-decide, −sub-notate | fix | band bug (summary 3); no zeros; nothing to notate, so the derived `sub-notate` tag is wrong; grade K but the column format is 1.NBT.C.4 | W; "wrote both digits of a two-digit column"; Say: "__ ones plus __ ones is __ ones."; vocab: ones, add, sum |
| `add_10_regroup` | K | computation-grid | fact-layouts, flashcards, k-one-page, sub-notate, sub-setup, −sub-decide | redo | a sum within 10 cannot regroup; the id only exists because the generator lets sums reach 18 (9 + 5, 8 + 7 in the samples). Redefine as bridging ten: both addends ≤ 9, sum 11-18, shown as 8 + 2 + 3 | W; "wrote the ten and forgot the ones", "added to the wrong ten"; Say: "I take __ from __ to make ten."; vocab: make ten, bridge, left over |
| `add_10_mixed` | K | computation-grid | fact-layouts, flashcards, k-one-page, sub-decide, sub-setup, **+sub-notate** | fix | band bug; the two sibling ids disagree about what "within 10" means | as `add_10_no_regroup`, plus the regroup decision lines |
| `add_20_no_regroup` | 1 | computation-grid | fact-layouts, flashcards, k-one-page, sub-setup, −sub-decide, −sub-notate | fix | band bug ("20 + 11 = 31" in the samples); no zeros; no teen + one-digit as a named case | W; "added the tens to the ones"; Say: "__ ones plus __ ones is __ ones."; vocab: ones, tens, sum |
| `add_20_regroup` | 1 | computation-grid | fact-layouts, flashcards, k-one-page, sub-notate, sub-setup, −sub-decide | fix | band bug ("8 + 15 = 23"); the carry box row is dashed and its width equals the answer width (:499, :510, :519) | W; "forgot the regrouped ten", "wrote both digits"; Say: "Ten ones make one ten."; vocab: regroup, ten, ones |
| `add_20_mixed` | 1 | computation-grid | fact-layouts, flashcards, k-one-page, sub-decide, sub-setup, **+sub-notate** | fix | band bug | plus decide: "[ ] The ones make less than ten. I do not regroup." / "[ ] The ones make ten or more. I regroup one ten." |
| `add_50_no_regroup` | 2 | computation-grid | sub-setup, −sub-decide, −sub-notate | fix | band bug (47 + 47); `minVal = 5` blocks 2d + 1d; no zeros | W; "misaligned the columns"; Say: as `add_20_*`; vocab: ones, tens, line up |
| `add_50_regroup` | 2 | computation-grid | sub-notate, sub-setup, −sub-decide | fix | band bug; always regroups in the ones (only one column can carry at this size) | W; "forgot the regrouped ten", "wrote both digits of the ones column" |
| `add_50_mixed` | 2 | computation-grid | sub-decide, sub-setup, **+sub-notate** | fix | band bug | plus the regroup decision lines |
| `add_100_no_regroup` | 2 | computation-grid | sub-setup, −sub-decide, −sub-notate | fix | band bug; `minVal = 10` so a one-digit addend never appears (IXL 2-N.1 / MW4K "3-digit minus 2-digit" order) | as `add_50_no_regroup` |
| `add_100_regroup` | 2 | computation-grid | sub-notate, sub-setup, −sub-decide | fix | band bug (85 + 96 = 181, 76 + 78 = 154 on the baseline sheet); all six baseline items regroup in the ones — no tens-only and no both-columns case; the per-item label "(With Regrouping)" answers the decision before the pupil reads the numbers; only 6 items per page with large empty gaps | W; "forgot the regrouped ten", "wrote 712 for 37 + 45", "regrouped but did not add the mark" |
| `add_100_mixed` | 2 | computation-grid | sub-decide, sub-setup, **+sub-notate** | fix | band bug (96 + 22 = 118) | plus the regroup decision lines |
| `add_1k_no_regroup` | 3 | computation-grid | sub-setup, −sub-decide, −sub-notate | fix | band bug ("1,000 + 388 = 1,388"); no ragged 3d + 2d | as above |
| `add_1k_regroup` | 3 | computation-grid | sub-notate, sub-setup, −sub-decide | fix | band bug (440 + 995 = 1,435); the strategic cap at :444-455 asks for ≥ 2 carrying columns but cannot ask for a *specific* column or a chained 9 + 9 carry | W; "carried into a column and then forgot it", "regrouped the hundreds into nothing" |
| `add_1k_mixed` | 3 | computation-grid | sub-decide, sub-setup, **+sub-notate** | fix | band bug | plus the regroup decision lines |
| `add_10k_no_regroup` | 4 | computation-grid | sub-setup, −sub-decide, −sub-notate | fix | band bug (2,482 + 7,006 = 9,488 is in band, but 5,214 + 4,615 = 9,829 only by luck); `toLocaleString` puts a comma in the question and the key prints "12706" without one (`q.ans` is a raw number) | as above |
| `add_10k_regroup` | 4 | computation-grid | sub-notate, sub-setup, −sub-decide | fix | band bug (8,431 + 4,275 = 12,706); same comma inconsistency | as `add_1k_regroup` |
| `add_10k_mixed` | 4 | computation-grid | sub-decide, sub-setup, **+sub-notate** | fix | band bug | plus decision lines |
| `add_100k_no_regroup` | 5 | computation-grid | sub-setup, −sub-decide, −sub-notate | fix | band bug; every addend is 5-digit (`minVal = 10,000`), so the ragged case never occurs | as above |
| `add_100k_regroup` | 5 | computation-grid | sub-notate, sub-setup, −sub-decide | fix | band bug (92,898 + 85,608 = 178,506) | as above |
| `add_100k_mixed` | 5 | computation-grid | sub-decide, sub-setup, **+sub-notate** | fix | band bug | plus decision lines |
| `add_1m_no_regroup` | 5 | computation-grid | sub-setup, −sub-decide, −sub-notate | fix | band bug; all addends 6-digit; at this width the column cell needs the 2-column footprint, but the print size is still `standard` (3 columns) | as above |
| `add_1m_regroup` | 5 | computation-grid | sub-notate, sub-setup, −sub-decide | fix | band bug (825,285 + 544,459 = 1,369,744) | as above |
| `add_1m_mixed` | 5 | computation-grid | sub-decide, sub-setup, **+sub-notate** | fix | band bug | plus decision lines |
| `add_wp_10` | K | word-problems | k-one-page, sub-decide, sub-setup, schema-story, −fact-layouts, −flashcards | fix | band bug (10 + 1, 6 + 6 in the samples); result-unknown only; the on-screen equation builder hands over both numbers and an operator chooser (:1134) and never prints; group boxes print pink / orange / yellow and dashed; the icon count is capped at 15 (:1120) so a group labelled "49" shows 15 icons; three templates only (:1075-1078) | W; "subtracted", "answered with one of the givens"; decide: "[ ] I know both parts. I add."; Say: "__ and __ makes __ in all."; vocab: in all, altogether, more |
| `add_wp_10_plain` | K | word-problems | as above | merge → `addition:add_wp_10` | alias (`generate-question.js` :33) with `q.visual` dropped | inherits |
| `add_wp_20` | 1 | word-problems | k-one-page, sub-decide, sub-setup, schema-story, −fact-layouts, −flashcards | fix | band bug (8 + 17 = 25); baseline sheet: three items, all the same template, and the page is two-thirds blank | as `add_wp_10` |
| `add_wp_20_plain` | 1 | word-problems | as above | merge → `addition:add_wp_20` | alias | inherits |
| `add_wp_50` | 2 | word-problems | sub-decide, sub-setup, schema-story | fix | band bug (49 + 42 = 91); still draws icons (`useEmoji` true up to 100, :1054) but caps them at 15, so the picture contradicts the number | as `add_wp_10` |
| `add_wp_50_plain` | 2 | word-problems | as above | merge → `addition:add_wp_50` | alias | inherits |
| `add_wp_100` | 2 | word-problems | sub-decide, sub-setup, schema-story | fix | band bug (80 + 39 = 119); icon cap as above | as `add_wp_10` |
| `add_wp_100_plain` | 2 | word-problems | as above | merge → `addition:add_wp_100` | alias | inherits |
| `add_wp_1k` | 3 | word-problems | sub-decide, sub-setup, schema-story | fix | band bug (728 + 742 = 1,470); `minVal = 100` so a 2-digit addend never appears; two of the three templates are "counted X in the morning ... by evening there were Y more", which is a change schema wearing a join sentence | as `add_wp_10`, plus "used the time words as the operation" |
| `add_wp_1k_plain` | 3 | word-problems | as above | merge → `addition:add_wp_1k` | alias | inherits |
| `add_wp_10k` | 4 | word-problems | sub-decide, sub-setup, schema-story | fix | band bug; `lgScenarios` carry a `verb` field used only by subtraction, so the add templates ignore context variety | as `add_wp_1k` |
| `add_wp_10k_plain` | 4 | word-problems | as above | merge → `addition:add_wp_10k` | alias | inherits |
| `add_wp_100k` | 5 | word-problems | sub-decide, sub-setup, schema-story | fix | band bug (56,667 + 44,060 = 100,727); 22-word stories at the widest band | as `add_wp_1k` |
| `add_wp_100k_plain` | 5 | word-problems | as above | merge → `addition:add_wp_100k` | alias | inherits |
| `add_wp_1m` | 5 | word-problems | sub-decide, sub-setup, schema-story | fix | band bug (823,995 + 547,236 = 1,371,231 — outside the band by design) | as `add_wp_1k` |
| `add_wp_1m_plain` | 5 | word-problems | as above | merge → `addition:add_wp_1m` | alias | inherits |
| `nl_add` | 1 | visual-grid | k-one-page, −fact-layouts, −flashcards | split | three unknown positions rotated 4:1:1 in one id (:616); the find-addend and find-start variants pass `showAnswer: true` and `highlightEnd` at the answer's position (:634, :641), so the line marks the answer; colour hops; the scale jumps to the next multiple of 5, so the line length itself narrows the answer | W; "counted the starting tick as the first hop", "counted ticks instead of jumps", "hopped the wrong way"; Say: "I start at __. I hop __. I land on __."; vocab: number line, hop, start |
| `number_line_add` | 1 | visual-grid | k-one-page, −fact-layouts, −flashcards | merge → `addition:nl_add` | the B&W print twin of `nl_add`'s find-sum variant (:785-830); once the family is black and white the two are the same item. `safeB = 30 - a` can go to 0 or below if the caps ever widen | inherits |
| `cloze_addition` | 2 | equation-drill | **+todays-number**, −fact-layouts, −flashcards | redo | prints as "___ + ___ = 18" with no rule, no box and no options, under an instruction that names a list that is not there; on screen it is a 3 × 3 dropdown, which is multiple choice for a production item (P-29); the item has many correct answers but one key; both blanks are unknown at once, which skips AD-U2 and AD-U3 | W; "used the sum as one addend", "picked two that make a different total"; Say: "__ and __ make __."; vocab: addend, missing, make |
| `mixed_addition` | M | computation-grid | −fact-family, −sub-decide, −sub-setup | keep | a draw over the other ids; it inherits their defects and no more. The derived tags are wrong: a mixed page cannot isolate one decision, and it is only sometimes a fact family | none of its own; the Mixed Skill Practice page supplies the frame |

## Details (every verdict other than keep)

**`equal_sign` (redo).** The only skill in the family that is entirely absent from its own generator. Add the `skillCategoryOverride` entry `'equal_sign': 'algebra'` (or move the branch into `gen-operations.js`) and then rebuild what the branch does: today it makes `a + b = c + d` only, which is AD-U6, and skips AD-U5 (`a + b = c`, the form that exposes the "= means the answer comes next" misconception). Both forms must be authorable separately, the response is two check boxes on paper and two taps on screen, and the balance-scale picture must be black and white with the pans drawn level or tilted, never colour-coded. While it is broken it must not be offered on the True or False? page, which currently prints six plain sums with the hint text under them.

**`cloze_addition` (redo).** The print path drops `clozeOptions` entirely, so the sheet asks for a choice from a list that never prints. Rebuild as one unknown at a time (AD-U2, AD-U3) with a ruled box for the blank, and keep the two-unknown form only as the AD-U4 "ways to make N" task, where the instruction states how many pairs to find and the key lists them all. If a bank is wanted on paper it must print as a word bank above the block, and the same bank must be what the screen offers, so neither medium is easier than the other.

**`add_5_pictures` (redo).** Replace the emoji set with the line-art counters already used by the word problems (`word-problem-icons.js`), print in black, and make the response a write-in on both media. The text must stop giving the equation away: the cell should show two groups and "___ and ___ makes ___ in all", with the equation appearing at the next ladder step. Widen the pool past 8 distinct items (sums to 5 gives 15 ordered pairs including zero; sums to 10 gives 55) and seed `n + 0` deliberately, late.

**`add` (redo).** Three different question types under one label and one answer sheet. Delete the missing-operator branch from this id: choosing between `+ − × ÷` is a mixed-operations skill and does not belong in the addition category at all. Move the missing-number branch to `cloze_addition` (AD-U2, AD-U3). What is left is a plain range-driven sum, which is the adapter the Daily Spiral and Mixed pages need, and which should then carry a regroup policy like the banded ids.

**`add_10_regroup` (redo).** "Within 10, with regrouping" is an empty set. The id has to mean something else, and the step the ladder needs here is bridging ten: 8 + 5 shown as 8 + 2 + 3, both addends single-digit, sum 11-18. Keep the id and its share code; change what it generates and its label.

**`add_sub_10s`, `add_sub_100s` (split).** Each id coin-flips between adding and subtracting, so no page can state one instruction, no test A/B can be balanced, and the answer key mixes two operations. Split the subtraction halves out to the subtraction family (`sub_10_less`, `sub_100_less`) and keep the addition halves here. Then fix what each generates: 1.NBT.C.5 and 2.NBT.B.8 want "10 more than 43", not "40 + 10", so the non-round addend must be the default and the whole-tens form becomes the first step (AD-C1). Both ids should also drive a Today's Number band ("10 more", "10 less", "100 more", "100 less"), which is what the tag added here is for.

**`add_word_problems` (split).** Four schemas share the id: join, change-unknown ("started with 88, now has 92"), part-part-whole, and an unlabelled comparison ("27 more rock samples than Emma"). Each is a different diagram and a different decision, so each needs its own id, its own instruction and its own key — that is AD-S1 to AD-S5. Delete the 20% multi-select diversion; select-all is a `hands-find` page, not a random branch. The decimal leak at :3378 must go: a story about apples cannot have 2.4 apples.

**`add_word_problems_plain` and the eight `add_wp_*_plain` ids (merge).** These are already aliases in `generate-question.js`; nothing is generated twice. Formalise them as the option `pictures:off` on their twin, keeping every id and its position so share codes are untouched. After the split above, the `_plain` alias becomes an option on each schema id rather than on the band id.

**`add_wp_10` to `add_wp_1m` (fix).** One shared fix list: bound the sum by the band, allow a short addend beside a long one, generate every unknown position (AD-S1 to AD-S5 cross the bands), print a schema diagram and an equation frame instead of the screen-only equation builder, draw the counters in black with no dashed boxes, and either draw the real count or drop the picture — a group labelled "49" showing 15 icons teaches that the picture may be ignored. The `spacious` print size promises an 80 px work box that the baseline sheets do not show; that is a print-generate gap, not a generator gap, but it is what makes these pages usable.

**The 23 ranged column ids (fix).** One shared fix list: interpret "within N" as the sum, not the addends; add a three-way regroup policy (none / some / all) and a per-column control so "regroup the tens only" and "two chained carries" are requestable; allow ragged lengths; seed zeros; drop "carrying" for "regroup" in the hint, the widget and the answer key; make the carry boxes solid, not dashed; stop sizing the answer row to the answer; stop printing the "(With Regrouping)" label beside every item, which decides AD-C5 for the pupil; and fit more than six items on a page.

**`add_facts` (fix).** Separate the two orientations into requestable sections instead of tossing a coin per item. Add single-addend sets as the unit (`facts:[n]`), cumulative ranges as the only mixed form, and the zero set last, per the owner's ruling and the read-across in `design/research/operations-facts.md` §1. Fix the pair generation so the constant addend can be controlled and so `b` is not squeezed by `a`.

**`add_three` (fix).** Make the make-ten pair deliberate (about 70% of items contain a pair that sums to ten, in the first, middle or last position; the rest do not, so the strategy stays a choice). Drop the three categorical colours — label the groups a, b, c in black. Use commutativity explicitly: 4 + 7 + 6 and 4 + 6 + 7 on the same page.

**`comparison_word` (fix).** Take the capitals out; "How many more marbles does Carlos have than Priya?" reads better and can be spoken. Add the bigger-unknown and smaller-unknown forms (AD-S7) — "N more than" is the form that makes pupils add when they should subtract and subtract when they should add, and is the reason this skill sits in the addition category. Draw the comparison bars in black with the difference bracket left open, and stop drawing it to the exact answer width. Remove the 20% multi-select diversion.

**`add_sub_fact_family` (fix) and the three `number_families_*` ids (merge).** One skill with a `blanks` option (`results` / `two-per-row` / `member` / `all`) and a `task` option (`complete` / `sort`). The sort task with non-examples is what MW4K does and what P-10 asks for, and it is missing entirely today. Exclude degenerate triples (doubles, and any triple containing 0 or 1) from the "write four facts" task, or state on the page that this family has only two facts. Mark the two addition rows as one pair and the two subtraction rows as another using position, not colour.

**`nl_add` (split) and `number_line_add` (merge).** Three unknown positions become three ids (AD-V4, AD-V6, AD-V7). Stop drawing the answer: for find-addend and find-start the hop must be dashed with no landing marker and no highlight. Keep one number-line renderer — `number_line_add`'s black-and-white ticks-and-arcs version — and alias the colour one to it.

## New skills needed

Nine new ids, plus nine ids created by the splits.

| Proposed id | Ladder step | Why it does not exist today |
|---|---|---|
| `add_doubles` | AD-F4, AD-F5 | doubles never appear as a named set; the fact generator cannot request `a = b` |
| `add_near_doubles` | AD-F6 | no strategy step between doubles and bridging |
| `add_bridge_ten` | AD-F9 | `add_10_regroup` will carry this after its redo; listed here if the owner would rather keep that id's label |
| `add_ten_frame` | AD-V3 | no ten-frame renderer is wired to any addition skill |
| `add_base10_blocks` | AD-V8 | `createBase10Blocks` exists in `svg-base10.js` but no addition skill calls it |
| `balance_add` | AD-U7 | `equal_sign` judges; nothing asks the pupil to complete a balanced pair |
| `add_column_multi` | AD-C17 | 2.NBT.B.6 (up to four two-digit addends), 3.NBT.A.2, 4.NBT.B.4; only `add_three` exists, horizontally and capped at 20 |
| `add_missing_digit` | AD-C18 | named at every size by IXL, MW4K and Math-Aids; nothing in the family generates it |
| `add_two_step_word` | AD-S10 | the family has no two-step story |
| `add_wp_join`, `add_wp_change`, `add_wp_change_unknown`, `add_wp_start_unknown`, `add_wp_part_whole` | AD-S1 to AD-S5 | split of `add_word_problems` |
| `nl_add_addend`, `nl_add_start` | AD-V6, AD-V7 | split of `nl_add` |
| `add_10_more`, `add_100_more` | AD-C2, AD-C19 | addition halves of the `add_sub_10s` / `add_sub_100s` splits (the subtraction halves go to that family) |

## Questions for the owner

1. **What does "within N" mean?** Today each addend is drawn from 1..N, so the sum reaches 2N and every band label is false. Recommendation: the **sum** is bounded by N, which is what CCSS and every reference site mean, and retune all 24 ranged ids and all 16 word-problem ids. Consequence: `add_10_regroup` becomes an empty set and must be redefined (see question 2).
2. **What should `add_10_regroup` become?** Recommendation: bridging ten — both addends single-digit, sum 11 to 18, taught as 8 + 2 + 3. It is the missing step between facts to 10 and facts to 20, the id keeps its position and share code, and only its label changes.
3. **Addition facts band: to 20 or to 12?** The owner's "facts to 12 by default" ruling was given for × and ÷. Recommendation: + and − facts run to 20 (1.OA.C.6, 2.OA.B.2), with a `facts:{0,10}` option for the earlier step; the to-12 default stays with × and ÷.
4. **Three fact-family ids collapse to one.** `number_families_add`, `_med` and `_hard` differ only in which boxes are blank. Recommendation: merge into `add_sub_fact_family` as a `blanks` option, keep all four ids as aliases so share codes and their positions are untouched, and show one name in the navigator. Confirm that losing three names from the visible skill list is acceptable.
5. **`comparison_word` is a subtraction schema in the addition category.** Recommendation: leave the id where it is (positional codes) and present it as AD-S6 in this family, cross-listed from the subtraction family's compare ladder, rather than moving it.
6. **Should `add_three` force a make-ten pair?** Recommendation: about 70% of items contain a pair summing to ten, in a varied position, and 30% do not, so looking for the pair stays a decision rather than a guarantee. A page with no non-examples teaches "always add the first two".
7. **Icon counts in word-problem pictures.** The picture is capped at 15 counters however large the number is. Recommendation: draw the picture only when the count is at most 20 (so `add_wp_10` and `add_wp_20` keep it, `add_wp_50` upward lose it), and use a bar or a tape diagram above 20. A labelled group of 15 icons standing for 49 is worse than no picture.
8. **Per-item skill labels on regrouping sheets.** "Add within 100 (With Regrouping)" printed beside every item tells the pupil the answer to the AD-C5 decision. Recommendation: the label prints once in the page header, never per item, on any sheet whose skill name names the strategy. The existing `printShowSkillLabels` toggle already exists; this makes the header the default position for this family.
