# Family review: mult-div-integers

Categories: `multiplication` (21), `division` (16), `integers` (10), `number_ops_mixed` (7). 54 skills. Generator: `js/modules/gen-operations.js` (five skills live in `js/modules/gen-algebraic.js`: `order_negatives` :3798, `abs_value` :5109, `opposite_numbers` :5136, `ordering_rationals` :5160). Routing: `js/modules/generate-question.js` :265-299. Machine-readable tags and verdicts: `design/catalogue/mult-div-integers.overrides.json`.

## Family summary

1. Verdicts: keep 6, fix 18, redo 5, merge 11, split 14 (total 54). Hosts after this review: `visual-grid` 29 (4 of them review pools), `word-problems` 10, `equation-drill` 6, `chart-table` 4, `computation-grid` 3, `long-division` 2. The catalogue's guess is wrong for 19 of the 54: it sends `div_facts`, `mixed_mult_div`, `box_division_easy` and `box_division_hard` to `long-division` (only `divide` and `long_div_2digit` belong there), the three `mult_chart_*` tiers and `div_remainders` to `word-problems`, `mult_facts` to `computation-grid` and `multiply` to `equation-drill` (both the wrong way round), and leaves `order_negatives`, `integer_nl_drag` and `ordering_rationals` unassigned.
2. Worst problem 1: **`long_div_2digit` is broken, not just weak.** `maxDivisor = Math.max(12, Math.min(50, Math.floor(range / 20)))` (:1499) evaluates to 12 at the default range 100, so `divisor = rng(11, maxDivisor)` only ever yields 11 or 12 and the quotient only ever reaches 9 (`distinct` 7 of 12). The baseline page is six items, all ÷11 or ÷12, each printed twice (text line and bracket), each captioned `11 × ? = 44` — the missing-factor structure handed over — plus a dead "Estimate: 11 × 1 = 11" line (quotient < 10 makes `Math.floor(quotient/10)*10 || 1` = 1). There is no work space under the bracket, no remainder slot and no estimate box: the answer goes on a rule to the right, so the algorithm this skill names is never performed. The skill label prints as "Divide by 2-" (truncated and wrong).
3. Worst problem 2: **silent type mixing is the family's default, and two rotations are dead code.** More than twenty ids rotate through 2-6 problem types, notations or unknown positions per item: `missing_mult_div` picks one of six unknown positions **and** one of three division notations per item (:2811, :2862); `mult_div_fact_family` picks a notation **per equation inside one cell** (:1704-1712); `arrays_groups` rotates count / write-the-sentence / *divide* (:2115); `mult_properties` rotates four properties (:2199); `compare_int` is 30% multi-select (:5389); `box_division_hard` is 30% remainder (:1171); `abs_value` is 35% a different skill in multiple choice (:5110). In two word-problem ids the rotation is outright broken: `pickVariant` returns a variant *name*, then `} else if (roll < 0.70)` / `(roll < 0.85)` in `mult_word_problems` (:4054, :4069) and `(roll < 0.75)` / `(roll < 0.90)` in `div_word_problems` (:4448, :4460) compare a string with a number, so four branches are **unreachable** and the third variant silently falls through to the last `else` — `mult_word_problems` never emits a comparison story (it emits a rate story instead) and `div_word_problems` never emits a measurement or array-inverse story. The same bug sits in `add_word_problems` (:3461, :3483) and `sub_word_problems` (:3710, :3738) outside this family; the operations-and-facts family review should be told.
4. Worst problem 3: **answer leaks and permanent method scaffolds on production items.** `mult_properties` commutative asks "If 5 x 4 = 20, what is 4 x 5?" — the answer is in the prompt (:2205). `dot_array_mult` prints "Count the array: 3 rows × 9 columns = ?", so the array is decoration (:933). `mult_word_problems` prints "4 rows x 2 in each row" above the picture (:4124), which is the whole of the modelling step. `sub_int`'s screen cell prints the finished rewrite `a + (-b) = ?` on every item (:5497). `add_int`'s cell prints "Positive chips: … = N / Negative chips: … = N", which *is* the answer for same-sign items (:5471-5472). `mult_chart_easy/medium/hard` print the factor pairs of the missing cells in the prompt ("Fill in the missing products: 1×11, 3×7, 8×3"), so no searching happens.
5. Worst problem 4: **`state.range` is ignored, mis-scaled, or turns a skill into a different skill.** `useFullTables = [10, 20, 50, 100].includes(range)` (:4761, :4884) is not guarded by `factsMode`, so at range 500/1000/10000 **`mult_facts` becomes 3-digit column multiplication and `div_facts` becomes long division**. At range 10 those same skills still produce 12 × 12 = 144. `area_model_div_2by1` / `_3by1` draw from a hard-coded list of friendly pairs and ignore range entirely (:3125-3145). `integer_nl_drag` is fixed at −10..10. `abs_value` and `opposite_numbers` are fixed at ±20. `order_negatives` uses `Math.min(range, 100)` (:3804), four times the playbook's ±20, and picks each sign independently, so all-positive sets appear in a skill called "Order Integers" (two of the three catalogue samples: `17,58,69,85` and `64,79,86`).
6. Worst problem 5: **colour and emoji carry the mathematics, and print does not match screen.** `mult_chart` prints four rainbow-gradient 12 × 12 charts to a page, ~7 pt numerals reversed out of saturated fills — unreadable, un-photocopiable, and the whole item is three products answered on one rule. `area_model_mult` distinguishes the partial products by teal / orange / pink (:2917). `add_int` / `compare_int` colour negatives red and positives green (:5459, :5441). `mult_word_problems`'s array builder falls back to a hard-coded emoji set (apple, cookie, blossom, book, balloon, star, ball, coin characters; :4156-4164) and the printed page renders them as broken glyphs (☺, ó). `ordering_rationals` is 4-option multiple choice on screen and a write-in rule on paper (P-29 break in the forbidden direction), and has no number line despite its name.
7. Also family-wide: no fact-set control anywhere, so the owner's {0,1,2,5,10} → {3,4,6} → {7,8,9} → {11,12} order cannot be expressed; **× 0 and ÷ by-itself / 0 ÷ n are never generated** (`rng(1, 12)` and `rng(2, 12)` everywhere), so the first two sets of both ladders have no items; `div_remainders` bakes a 17-word format instruction into `q.text`; stories run to 39 words (`mult_comparison_plain`) against the 4-line cap; "Carry when needed" appears in a pupil hint (:4818) against P-32; capitals are used for emphasis throughout ("LEAST TO GREATEST", "LEFT OVER", "FEWEST", "Click ALL"); the `_msc_*` word-problem wrapper writes "boxs" for the plural of box (:253, :257, :262).
8. What is already good: `dot_array_mult` has four real tagged distractors (:938-944) and is the only skill in the family with a misconception-based distractor set; `remainder_interpret` covers the three CCSS interpretations (round up / drop / the remainder is the answer) with correct arithmetic; `div_remainders` accepts eleven spellings of "8 R 3"; `area_model_div_*`'s friendly-pair list produces genuinely decomposable numbers; `arrays_groups`'s `inlineBlanksData` accepts both `rows, cols` and `cols, rows` for the commutative blanks; `mult_div_fact_family` correctly emits two facts, not four, for squares; `nl_mult` / `nl_div` already use the deterministic `pickVariant` rotation rather than `Math.random`, which makes converting them to per-step options cheap; `print-generate.js` already draws a real integer number line for `integer-add` and `integer-sub`.
9. Existing worked-solution text is the hint restated in one or two lines (catalogue `workedMax` 2 for 50 of 54 ids; only `add_int`, `sub_int`, `mixed_integers` and `operations_all` reach 5-7). It is usable as the key line, never as `workedSteps`. `workedSteps`, `wrongAnswer`, the `Say:` frame and vocabulary must be authored for every id except the six pools. Thirteen ids have `roles.error: "author"`, meaning no usable distractor exists today (`mult_div_fact_family`, all `number_families_*`, `mult_chart`, `divide`, `div_remainders`, `div_word_problems`, `order_negatives`, `integer_nl_drag`, `ordering_rationals`, `mixed_multiplication`, `mixed_integers`).
10. The pedagogy standard's L-6, L-7 and L-8 and the playbook's IN ladder fit this family and are adopted below with corrections. 31 ladder steps have no skill today (see "New skills needed"); the largest holes are the whole set-up / decide / notate layer for both algorithms (P-9), the 0 and 1 fact sets, and every unknown-position step for multiplication.

## Proposed ladders

One delta per step. "opt" = an option or axis on an existing id, not a new id. `responseScope` values are the contract's.

### MU-A: multiplication concepts and facts (grades 2-3)

Strategy: skip count on a count-by strip (P-2). Prerequisites: skip counting by 2, 5, 10; repeated addition.

| Step | I Can ... | Delta | Skill |
|---|---|---|---|
| MU-A1 | Count Equal Groups | start | NEW `equal_groups_count` (ovals; includes one group, groups of one, an empty oval) |
| MU-A2 | Read an Array | representation | `arrays_groups` opt `task=count_all` (redo: drop the sentence caption) |
| MU-A3 | Write the Array Sentence | response | `arrays_groups` opt `task=write_mult` |
| MU-A4 | Write Adding as Multiplying | representation (bridging) | NEW `repeated_add_to_mult` |
| MU-A5 | Tell If I Can Multiply | opMix (discriminate) | NEW `equal_or_unequal_groups` |
| MU-A6 | Multiply by 1 and by 0 | range | NEW `mult_by_0_1` (GAP: `rng(1,12)` never emits 0) |
| MU-A7 | Switch the Factors | representation | `mult_properties` opt `property=commutative` (redo: the prompt must not state the product) |
| MU-A8 | Set Up the 2 Times Table | responseScope `setup` | `mult_facts` `facts:[2]`, circle the count-by number, "Do not solve." |
| MU-A9 | Multiply by 2 | responseScope `full` | `mult_facts` opt `facts:[2]`, count-by strip printed |
| MU-A10 | Multiply by 2, Bigger Factors | range | same id, other factor 6-12 |
| MU-A11 | Multiply by 2, No Strip | scaffold | same id, strip off |
| MU-A12 | Multiply by 2 Down the Page | format | same id, vertical section (P-16) |
| MU-A13-A24 | Repeat A8-A12 for 5, 10, then 3, 4, 6, then 7, 8, 9, then 11, 12 | range | `mult_facts` opt `facts:[n]`; fixed by P-FL-18. Reviews cumulative. |
| MU-A25 | Find the Missing Factor | unknown | `missing_mult_div` opt `unknown=second_factor` |
| MU-A26 | Find the First Factor | unknown | `missing_mult_div` opt `unknown=first_factor` |
| MU-A27 | Use a Multiplication Chart | representation | `mult_chart` (redo: look up one product) |
| MU-A28 | Fill In a Multiplication Chart | response | `mult_chart_easy` opt `missing=2|6|22` |
| MU-A29 | Multiply on a Number Line | representation | `nl_mult` opt `ask=product` |
| MU-A30 | Count the Hops | unknown | `nl_mult` opt `ask=hops` |
| MU-A31 | Find the Hop Size | unknown | `nl_mult` opt `ask=hop_size` |
| MU-A32 | Build a Multiplication Fact Family | representation | `mult_div_fact_family`; `number_families_mult` is the fill-the-blanks form |

`dot_array_mult` is the picture-free array drill; it sits beside MU-A2/A3 as extra practice, not as its own step (its prompt must stop stating `r × c`).

### MU-B: multi-digit multiplication (grades 3-5)

Strategy: standard algorithm on a digit grid (P-2). Optional second ladder MU-B': area / box model.

| Step | I Can ... | Delta | Skill |
|---|---|---|---|
| MU-B1 | Multiply by 10 and by 100 | start | NEW `mult_zeros` |
| MU-B2 | Multiply a Multiple of Ten | range | `mult_zeros` opt `type=multiple_of_ten` |
| MU-B3 | Rewrite Across as Down | responseScope `setup` | `multiply` `sub-setup` page (GAP: no rewrite cell today) |
| MU-B4 | Multiply a Two-Digit Number by One Digit (no regroup) | responseScope `full` | `multiply` opt `digits=1x2, regroup=none` |
| MU-B5 | Multiply With a Regroup | range | `multiply` opt `regroup=some` |
| MU-B6 | Multiply a Three-Digit Number | range | `multiply` opt `digits=1x3` |
| MU-B7 | Write the Placeholder Zero | responseScope `notation` | NEW `mult_placeholder_zero` (the single biggest 2 × 2 error) |
| MU-B8 | Multiply Two Two-Digit Numbers | responseScope `full` | `multiply` opt `digits=2x2` |
| MU-B9 | Multiply Three by Two Digits | range | `multiply` opt `digits=2x3` |
| MU-B10 | Find the Missing Digit | unknown | NEW `mult_missing_digit` (research item 15; dashed digit box) |
| MU-B' a | Split the Number Into Tens and Ones | responseScope `setup` | `area_model_mult` `responseScope=setup` |
| MU-B' b | Area Model, One-Digit Multiplier | representation | `area_model_mult` |
| MU-B' c | Area Model, Two-Digit Multiplier | range | `area_model_mult_hard` |
| MU-B' d | Split an Array to Multiply | representation | `mult_properties` opt `property=distributive` |

### DV-A: division concepts and facts (grade 3)

Strategy: skip count the divisor into a tally box (P-2).

| Step | I Can ... | Delta | Skill |
|---|---|---|---|
| DV-A1 | Ring Equal Groups | start | NEW `share_into_groups` |
| DV-A2 | Read a Division Equation | representation | NEW `read_div_equation` |
| DV-A3 | Write a Division Equation | responseScope `notation` | NEW `write_div_equation` (labelled blanks: total ÷ in each group = groups) |
| DV-A4 | Read Division in a Bracket | format | `div_facts` opt `notation=bracket` (today all three notations rotate at random) |
| DV-A5 | Divide on a Number Line | representation | `nl_div` opt `ask=quotient` |
| DV-A6 | Find the Divisor From the Hops | unknown | `nl_div` opt `ask=divisor` |
| DV-A7 | Find the Dividend | unknown | `nl_div` opt `ask=dividend` |
| DV-A8 | Circle the Multiples of 5 | responseScope `decision` | `div_facts` decide page, `facts:[5]` |
| DV-A9 | Divide by 5 | responseScope `full` | `div_facts` opt `facts:[5]` |
| DV-A10 | Divide 0, Divide by 1, Divide by Itself | range (edge cases) | `div_facts` `edgeCases` (never generated today; ÷ 0 never emitted) |
| DV-A11-A22 | Divide by 2, 10, then 3, 4, 6, then 7, 8, 9, then 11, 12 | range | `div_facts` opt `facts:[n]`, one per step, both notations in separate sections |
| DV-A23 | Find the Missing Number in a Division | unknown | `missing_mult_div` opts `unknown=dividend|divisor|quotient`, one per step |
| DV-A24 | Build a Fact Family (× and ÷) | representation | `mult_div_fact_family`, `number_families_mult` |
| DV-A25 | Tell Missing Factor From Missing Addend | opMix (discriminate) | NEW `missing_factor_or_addend` (MU-13; collides with `missing_add_sub`) |

### DV-B: remainders (grade 4)

| Step | I Can ... | Delta | Skill |
|---|---|---|---|
| DV-B1 | Divide With Some Left Over | start | `div_remainders` opt `representation=groups` (picture, frame `__ groups, __ left`) |
| DV-B2 | Write the Answer as q R r | format | `div_remainders` opt `representation=bare`, two slots not free text |
| DV-B3 | Fix a Remainder That Is Too Big | responseScope `judge` | NEW `remainder_too_big` |
| DV-B4 | Use the Remainder: How Many Are Left? | representation | `remainder_interpret` opt `interpret=remainder` |
| DV-B5 | Drop the Remainder: How Many Full Groups? | unknown | `remainder_interpret` opt `interpret=drop` |
| DV-B6 | Round Up: How Many Do I Need? | unknown | `remainder_interpret` opt `interpret=roundup` |
| DV-B7 | Decide What to Do With the Remainder | responseScope `decision` | `remainder_interpret` `sub-decide` page |
| DV-B8 | Mixed Remainder Stories | opMix | `remainder_interpret` mixed; `remainder_contexts` aliases here |

### DV-C: long division (grades 4-5)

Strategy: divide, multiply, subtract, bring down, on a digit grid. Optional second ladder DV-C': partial quotients.

| Step | I Can ... | Delta | Skill |
|---|---|---|---|
| DV-C1 | Underline the Part I Divide First | responseScope `decision` | `divide` `sub-decide` page, "Do not solve." |
| DV-C2 | Rewrite a Division Under the Bracket | responseScope `setup` | `divide` `sub-setup` page |
| DV-C3 | Divide a Two-Digit Number (no remainder) | responseScope `full` | `divide` opt `digits=2by1, remainder=none` |
| DV-C4 | Divide With a Remainder | range | `divide` opt `remainder=yes` |
| DV-C5 | Divide a Three-Digit Number | range | `divide` opt `digits=3by1` |
| DV-C6 | Write a Zero in the Quotient | range (case) | NEW `div_zero_in_quotient` (312 ÷ 3; research item 11g) |
| DV-C7 | Check by Multiplying | responseScope `judge` | NEW `div_check_by_multiplying` (research item 20) |
| DV-C8 | Round the Divisor to the Nearest Ten | responseScope `decision` | `long_div_2digit` `sub-decide` page |
| DV-C9 | Write My Estimate in the Estimate Box | responseScope `notation` | `long_div_2digit` `sub-notate` page |
| DV-C10 | Divide by a Two-Digit Number (10-25) | responseScope `full` | `long_div_2digit` opt `divisorBand=10-25` |
| DV-C11 | Divide by Any Two-Digit Number | range | `long_div_2digit` opt `divisorBand=10-99` |
| DV-C12 | Fix an Estimate That Is Too Big / Too Small | range (case) | NEW `div_fix_estimate` |
| DV-C' a | Divide in a Box, Two Digits | representation | `box_division_easy` |
| DV-C' b | Divide in a Box, Three Digits | range | `box_division_hard` |
| DV-C' c | Divide With an Area Model | representation | `area_model_div_2by1`, then `area_model_div_3by1` |

### WP-M: multiplicative word problems (grades 3-4)

Follows the computation steps at the same range (P-21). One schema per set.

| Step | Schema | Delta | Skill |
|---|---|---|---|
| WP-M1 | Equal groups, total unknown | start | `mult_word_problems` opt `schema=equal_groups` |
| WP-M2 | Equal groups, array wording | representation | `mult_word_problems` opt `schema=array` |
| WP-M3 | Rate ("per day", "each trip") | representation | `mult_word_problems` opt `schema=rate` (today the dead `comparison` branch lands here) |
| WP-M4 | Equal groups, size unknown | unknown | `div_word_problems` opt `schema=equal_share` |
| WP-M5 | Equal groups, number of groups unknown | unknown | `div_word_problems` opt `schema=grouping` |
| WP-M6 | Which numbers do I need? | responseScope `decision` | NEW `wp_which_numbers` (the `_msc_*` wrapper, today fired at random inside six ids) |
| WP-M7 | Multiplicative compare, bigger unknown | representation | `mult_comparison` opt `unknown=bigger` |
| WP-M8 | Multiplicative compare, multiplier unknown | unknown | `mult_comparison` opt `unknown=multiplier` |
| WP-M9 | Multiplicative compare, smaller unknown | unknown | `mult_comparison` opt `unknown=smaller` |
| WP-M10 | Add or multiply? | opMix (discriminate) | NEW `compare_add_or_mult` (IXL 4-G.9; research item 17) |
| WP-M11 | Remainder stories | representation | DV-B4 to B8 |
| WP-M12 | Two-step stories | opMix | `word_problems_mixed` (needs a declared instruction and a discrimination step in front) |

The scaffolded (v1) and faded (v2) versions of every step come from one seed, so `mult_word_problems_plain`, `mult_comparison_plain`, `div_word_problems_plain` and `word_problems_mixed_plain` become `version: v2` on their base ids, not separate skills.

### IN: integers (grade 6)

The playbook's IN-1 to IN-12 (`design/EXTENSION_PLAYBOOK.md` 4.12) is adopted unchanged. Mapping after this review:

| Step | Skill |
|---|---|
| IN-1 read a point below zero | `number_line_int` (fix: one line geometry, 0 always marked; add the standing/thermometer form) |
| IN-2 plot an integer | `integer_nl_drag` |
| IN-3 find the opposite | `opposite_numbers` |
| IN-4 distance from zero | `abs_value` opt `ask=value` |
| IN-4b which is further from zero | `abs_value` opt `ask=compare` (split: today a random 35% and multiple choice) |
| IN-5 compare two integers | `compare_int` (split: the multi-select branch becomes the hands-sort page) |
| IN-6 order integers | `order_negatives`; `ordering_rationals` is the later fractions-and-decimals step |
| IN-7 choose the hop direction | `add_int` `sub-decide` page |
| IN-8 add integers on a number line | `add_int` (redo) |
| IN-9 same signs or different signs | `add_int` `sub-decide` page, second decision |
| IN-10 rewrite subtraction as adding the opposite | `sub_int` `responseScope=setup` (owner question 5) |
| IN-11 subtract integers | `sub_int` (redo) |
| IN-12 integer stories | NEW `integer_word_problems` |

### Skills in no ladder

`mixed_multiplication`, `mixed_mult_div`, `mixed_division`, `mixed_integers`, `mixed`, `operations_all` are review pools for Mixed practice, Daily spiral and Daily 4. They inherit whatever their members become; the only work on them is a section instruction that says the set is mixed (P-28) and dropping alias ids from the pool after the merges.

## Every skill

"W" = `workedSteps` must be authored (existing worked text is not usable). Misconception ids MU-M*, DV-M* are defined in "Details"; IN-M* are the playbook's.

| Skill id | Grade | Host | Special tags | Verdict | Defects (short) | To author |
|---|---|---|---|---|---|---|
| `mult_facts` | 3 | equation-drill | fact-layouts, flashcards | fix | becomes 3-digit column multiplication at range >= 500 (:4761); × 0 never generated (`rng(1,12)`); vertical / horizontal 50-50 per item (:5252), so no single-orientation section; no `facts:[n]` set control; factor `a` comes from the table grid, `b` is always 1-12 | W; MU-M1, MU-M3, "counts one group too few"; Say: "___ groups of ___ is ___."; vocab: factor, product, groups of |
| `multiply` | 3 | computation-grid | sub-setup | split | 10% missing-operator and 20% missing-number fire inside it (:4629, :4677), and the missing-operator branch picks a random operation, so "Basic Multiplication" prints `39 ? 37 = 2` with answer − (catalogue `ops` shows ×10, −1, ÷1); production item shown as 4-option multiple choice; digit levels (1x2, 1x3, 2x2, 2x3) not selectable; "Carry when needed" in a pupil hint (:4818) | variants `facts`, `1x2`, `1x3`, `2x2`, `2x3`; missing-number branch aliases `missing_mult_div`; missing-operator branch leaves the family; W; MU-M4, MU-M5, MU-M1; set-up line: "Write it down the page."; Say: "___ times ___ is ___."; vocab: factor, product, regroup |
| `arrays_groups` | 2 | visual-grid | (none) | split | three types at random (:2115) and one of them is division ("How many rows?", :2178); rows and cols both `rng(2, …)`, so one group, groups of one and an empty group never appear (MU-01 edge cases); the cell title repeats the question; green dots | variants `count_all`, `write_mult`; the division type aliases `division:nl_div`/DV-A1; W; MU-M1, MU-M2, "counts the rows as the total"; Say: "___ rows of ___ is ___."; vocab: row, array, in all |
| `dot_array_mult` | 2 | visual-grid | (none) | fix | the prompt states the fact ("Count the array: 3 rows x 9 columns = ?", :933) and the caption repeats it, so the array is decoration; `rng(2, …)` again excludes 1 and 0; dots in `COLORS.primary` | W (its tagged distractors at :938-944 are the family's best and become `wrongAnswer`); MU-M1, MU-M2; Say: "___ rows of ___ is ___."; vocab: array, row, column |
| `mult_properties` | 3 | visual-grid | (none) | split | four properties at random (:2199); the commutative prompt contains the answer (:2205); the distributive item is 16 words of symbols with the array split by colour; identity and zero are rule-recall, not the same skill | variants `commutative`, `distributive`, `identity_zero` (the last aliases the new `mult_by_0_1`); W; MU-M3, MU-M7, "splits the wrong factor"; Say: "___ times ___ is the same as ___ times ___."; vocab: order, same product, split |
| `mult_word_problems` | 3 | word-problems | schema-story | split | `roll < 0.70` / `roll < 0.85` compare a string with a number (:4053, :4069), so the price and comparison branches are dead and "comparison" items become rate items; 20% `_msc_` multi-select fires at random (:3956); the picture is captioned "4 rows x 2 in each row" (the modelling step) and is drawn for rate stories too; emoji icons (:4156-4164) print as broken glyphs; one "Answer:" rule, no schema diagram, no unit word | variants `equal_groups`, `array`, `rate`; the multi-select branch becomes `wp_which_numbers`; W; MU-M1, MU-M6, "multiplies the distractor number"; Say: "___ groups of ___ is ___ ___."; vocab: in all, each, altogether |
| `mult_word_problems_plain` | 3 | word-problems | schema-story | merge -> `multiplication:mult_word_problems` | twin: the same stories with `visual` suppressed; inherits the dead branches and "boxs" (:253) | alias option `version=v2` (faded) |
| `mult_comparison` | 4 | word-problems | schema-story | split | 20% `_msc_` multi-select (:1558); the three unknown positions (bigger / smaller / multiplier) rotate inside one section; stories to 32 words with two distractor sentences before the question; no unit-bar diagram | options `unknown=bigger|smaller|multiplier`; W; MU-M6, "adds the multiplier", "reverses which person has more"; Say: "___ times as many as ___ is ___."; vocab: times as many, as many as |
| `mult_comparison_plain` | 4 | word-problems | schema-story | merge -> `multiplication:mult_comparison` | twin; 39-word stories, the family's longest | alias option `version=v2` |
| `area_model_mult` | 4 | visual-grid | (none) | fix | parts told apart by teal / orange / pink (:2917); ones digit `rng(1,9)`, so a zero in the ones (the case the model exists to show) never occurs; no set-up step (the split is pre-drawn); no step column for the partial products, only the total is asked | W; MU-M7, MU-M4, "adds the two part widths"; Say: "___ times ___ plus ___ times ___ is ___."; vocab: split, part, partial product |
| `area_model_mult_hard` | 5 | visual-grid | (none) | fix | same colour coding; 2 × 2 and 2 × 3 rotate (:3006) so cell height varies inside a section; four partial products with no addition frame | W; MU-M4, MU-M7, "adds three of the four parts"; Say: as above; vocab: as above |
| `mult_div_fact_family` | 3 | visual-grid | fact-family, flashcards | fix | notation picked per equation (:1704-1712), so one cell can hold `÷`, a fraction bar and a bracket at once; factors `rng(2,12)` with no fact-set control; squares (2 facts) and non-squares (4 facts) alternate, so cell height varies; no "is this a family?" or "find the missing member" type | W; DV-M1, DV-M5, "writes 4 facts for a square"; Say: "___ times ___ is ___, so ___ divided by ___ is ___."; vocab: fact family, factor, product |
| `number_families_mult` | 3 | visual-grid | fact-family | split | `maxFactor = 5` gives 16 possible items (catalogue `distinct` 8 of 12); the tier changes the factor range **and** the missing positions together (two deltas, P-1) | options `factorMax`, `missing=result|mixed|all`; W; DV-M1, "fills the same product in every row"; Say: as `mult_div_fact_family`; vocab: as above |
| `number_families_mult_med` | 3 | visual-grid | fact-family | merge -> `multiplication:number_families_mult` | tier twin | alias option `factorMax=10, missing=mixed` |
| `number_families_mult_hard` | 4 | visual-grid | fact-family | merge -> `multiplication:number_families_mult` | tier twin | alias option `factorMax=12, missing=all` |
| `mult_chart` | 3 | chart-table | todays-number | redo | rainbow gradient by product (:2377-2400) prints four saturated 12 × 12 charts a page at ~7 pt, unreadable and un-photocopiable; two answer types in one id (look up a product / fill 1-3 cells); the prompt lists the missing cells' factors, so nothing is searched for; one "Answer:" rule for three products | rebuild as "use the chart to find one product" on a B&W chart with a shaded row and column; W; MU-M2, "reads the row header as the product", "reads across one row too far"; Say: "Row ___, column ___ is ___."; vocab: row, column, product |
| `mult_chart_easy` | 3 | chart-table | (none) | fix | same prompt leak; screen says "Hover any empty cell for a hint" and the worksheet path turns it into one comma-separated text answer in reading order (high response load, P-13); one item = 2 to 22 graded answers, which no Score denominator can express | become the fill-in id with `missing=2|6|22`; W; MU-M2, "off by one row / column"; Say: as `mult_chart`; vocab: as above |
| `mult_chart_medium` | 4 | chart-table | (none) | merge -> `multiplication:mult_chart_easy` | tier twin (count only) | alias option `missing=6` |
| `mult_chart_hard` | 5 | chart-table | (none) | merge -> `multiplication:mult_chart_easy` | tier twin (count only) | alias option `missing=22` |
| `nl_mult` | 3 | visual-grid | (none) | split | three unknown positions rotate 3:1:1 (:702) inside one section; the line's end tick is labelled on `find_product`, so the product can be read off; hop labels `+n` teach repeated addition, not the count-by strip the ladder uses | options `ask=product|hops|hop_size`; W; MU-M1, IN-M7-style "counts the start tick as hop 1", "counts the ticks, not the hops"; Say: "___ hops of ___ lands on ___."; vocab: hop, skip count, in all |
| `mixed_multiplication` | M | visual-grid | (none) | keep | inherits (incl. the dead word-problem branches and the emoji array builder); pool must drop alias ids after the merges | section instruction that says the set is mixed |
| `div_facts` | 3 | equation-drill | fact-layouts, flashcards | fix | becomes long division at range >= 500 (:4884); three notations rotate 1:1:1 per item (:5267); the fraction-bar form is not a grade-3 US convention; dividend to 144 whatever the range (:5057); `0 ÷ n`, `n ÷ n`, `n ÷ 1` never generated (`rng(1,12)` / `rng(2,…)`); no `facts:[n]` control | W; DV-M1, DV-M5, "answers with the dividend"; Say: "___ divided by ___ is ___."; vocab: divide, divisor, quotient |
| `divide` | 3 | long-division | sub-setup, sub-decide | split | same 30% missing-operator / missing-number roll, and it emits × and − items inside "Basic Division" (catalogue `ops` ÷9, ×2, −1); 50-50 bracket / bare per item (:4887); the bracket cell has a work area only when the dividend has 2+ digits; no remainder, ever; no estimate box; digit levels not selectable | variants `facts`, `2by1`, `3by1`, `4by1`, each × `remainder=none|yes|mixed`; W; DV-M1, DV-M3, DV-M6; decision line: "the first digit is smaller than the divisor, so I take two digits"; set-up line: "Write it under the bracket."; Say: "___ into ___ goes ___ times."; vocab: dividend, divisor, quotient |
| `div_remainders` | 4 | visual-grid | (none) | fix | a 17-word format instruction is baked into `q.text` (:2600) instead of the section instruction; free-text answer where two slots (`__ R __`) are the right shape; dividend to 999 with divisor 2-9 at high range, so the picture can need 300 dots; no "remainder too big" case; the groups picture is drawn on every item with no fade | W; DV-M2, DV-M4, "writes the remainder as the quotient"; Say: "___ groups of ___, and ___ left over."; vocab: remainder, left over, groups of |
| `div_word_problems` | 3 | word-problems | schema-story | split | three schemas rotate 1:1:1 (:4379), and two of the five branches are unreachable (:4448, :4460); 33% `_msc_` multi-select (:4338); stories to 36 words; "boxs" from the wrapper; no schema diagram, no unit word after the blank | options `schema=equal_share|grouping|remainder`; the multi-select branch becomes `wp_which_numbers`; W; DV-M1, DV-M4, "divides the smaller number by the larger"; Say: "___ shared into ___ groups is ___ each."; vocab: share, equally, each |
| `div_word_problems_plain` | 3 | word-problems | schema-story | merge -> `division:div_word_problems` | twin with `visual` suppressed | alias option `version=v2` |
| `remainder_interpret` | 4 | word-problems | schema-story, sub-decide | split | three interpretations rotate at random (:4195), so a set never isolates one; capitals for emphasis ("LEFT OVER", "FEWEST"); no equal-groups-plus-leftover diagram; no decide-only step although the decision is the whole skill | options `interpret=roundup|drop|remainder`; W; DV-M2, DV-M4, "gives the plain quotient when the question asks how many are needed"; decision lines: "some are left, so I need one more", "I can only use full groups", "the question asks for what is left"; Say: "___ groups, and ___ left over."; vocab: left over, fewest, full |
| `remainder_contexts` | 4 | word-problems | schema-story | merge -> `division:remainder_interpret` | twin: the same three patterns with bus / box / money / car nouns; `answerType` differs (text vs number) for no pedagogical reason | alias option `contexts=buses|boxes|money|cars` |
| `box_division_easy` | 3 | long-division -> visual-grid | (none) | fix | grade 3 is too early for partial quotients (CCSS 4.NBT.B.6); the box carries an automatic carry arrow that does the bring-down for the pupil (:1280); carried digits shown in orange (:1236); the hint uses "Carry the remainder" (:1296) | W; DV-M1, DV-M6, "writes the remainder of a step as a quotient digit"; Say: "___ tens divided by ___ is ___ tens."; vocab: box, partial, quotient |
| `box_division_hard` | 4 | long-division -> visual-grid | (none) | fix | 30% of items carry a remainder at random (:1171), so a section silently mixes two answer shapes; three-digit dividends before the two-digit ladder is finished | W; as `box_division_easy` plus DV-M2; Say: as above |
| `area_model_div_2by1` | 4 | visual-grid | (none) | fix | 76 hard-coded pairs (:3125-3145), so `state.range` does nothing and repeats are certain at 12 items (`distinct` 11); the split rule `part1 = floor(tensBase / divisor) * divisor` can produce a non-friendly first part; a second partial-quotient representation alongside `box_division_*` (owner question 4) | W; DV-M7, MU-M7, "divides only the first part"; Say: "___ divided by ___ is ___, plus ___ divided by ___ is ___."; vocab: part, partial quotient, total |
| `area_model_div_3by1` | 5 | visual-grid | (none) | fix | same structure, same fixed list | W; as above |
| `long_div_2digit` | 5 | long-division | sub-decide, sub-notate | redo | divisor is only ever 11 or 12 at the default range (:1499); quotient <= 9, so no two-digit quotient; `distinct` 7 of 12; the estimate line always reads `× 1`; `divisor × ? = dividend` printed under every item; no work space, no remainder slot, no estimate box; the answer is one number written on a rule beside the bracket; the printed skill label is "Divide by 2-" | rebuild on the digit grid with an estimate box; W; DV-M3, DV-M6, DV-M8, "estimate too big and no adjustment"; decision line: "round 38 to 40"; notate line: "write the estimate in the box; do not divide"; Say: "___ into ___ goes about ___ times."; vocab: estimate, adjust, bring down |
| `missing_mult_div` | 3 | equation-drill | (none) | split | six unknown positions picked per item (:2811) and three division notations picked per item (:2862); labelled "Missing Factors (×/÷)" but two thirds of the positions are division; `mmFactorMax` jumps to 25 above range 100 | options `unknown=first_factor|second_factor|product|dividend|divisor|quotient`, `notation=symbol|bracket`; W; DV-M1, MU-M1, "subtracts instead of dividing"; Say: "___ times what is ___?"; vocab: missing factor, missing number |
| `nl_div` | 3 | visual-grid | (none) | split | three unknown positions rotate 3:1:1 (:750); divisor capped at `sqrt(range)` so only 2-10 ever, quotient to 12, and the line can be 0-120 wide in a half-page cell | options `ask=quotient|divisor|dividend`; W; DV-M1, "counts the ticks not the hops", IN-M7; Say: "___ hops of ___ reaches ___."; vocab: hop, groups of, left over |
| `mixed_mult_div` | 3 | long-division -> visual-grid | (none) | keep | inherits; pool is tagged grade 3 but draws `div_remainders` and `area_model_div_*` (grade 4-5) | mixed instruction |
| `mixed_division` | M | computation-grid -> visual-grid | (none) | keep | inherits | mixed instruction |
| `number_line_int` | 6 | visual-grid | (none) | fix | `intMax` runs to 50 from `state.range` (:5309) and `nlTickStep` becomes 5 or 10 (:5322), so the arrow can point between ticks and be unreadable; each item has its own line range and label step (baseline page: six different lines, one with no 0 marked); no standing / thermometer form (IN-1 asks for both); `buildNumericOptions` is set but never used | W; IN-M1, IN-M7, "reads left as bigger"; Say: "The point is at ___."; vocab: negative, below zero, integer |
| `compare_int` | 6 | visual-grid -> equation-drill | (none) | split | 30% multi-select "Click ALL integers greater than N" (:5389); "=" is offered but can never be correct (:5436), a dead distractor; look-alike pairs (−8 and −3, −5 and 5) are not seeded; negatives coloured orange, positives green (:5441) | variants `compare_pair` (stays), the select-all form becomes the hands-sort page; W; IN-M1, "compares the digits only"; Say: "___ is less than ___ because it is further left."; vocab: less than, greater than, further left |
| `add_int` | 6 | visual-grid | sub-decide | redo | no number line on screen at all; the chip box prints the positive and negative totals (:5471-5472), which is the answer for same-sign items; the sign rule is printed in the hint on every item; red / green sign colouring (:5459); parentheses inconsistent between screen (`-4 + (-2)`) and print (`(-14) + 8`); print draws a line but never marks the start or the hops, and its range and label step change item to item | W; IN-M2, IN-M3, IN-M5; decision lines: "adding a positive: hop right", "adding a negative: hop left", "same signs" / "different signs"; Say: "Start at ___, hop ___ ___."; vocab: hop, opposite, sum |
| `sub_int` | 6 | visual-grid | sub-decide | redo | the cell prints the finished rewrite `a + (-b) = ?` on every item (:5497), so IN-10 and IN-11 are both done for the pupil and never faded; the hint states the rule and the rewritten sentence; no line, no rewrite blanks | W; IN-M4, IN-M2, IN-M6; decision line: "change the sign of the second number only"; Say: "___ minus ___ is ___ plus ___."; vocab: opposite, add the opposite, difference |
| `order_negatives` | 6 | unassigned -> visual-grid | hands-order | fix | `limit = min(range, 100)` (:3804) instead of the playbook's ±20; each sign is picked independently, so all-positive sets occur in an integers skill (two of three catalogue samples); count `randInt(3, 6)` varies the item size inside a section; no number line; capitals "LEAST TO GREATEST"; least-to-greatest only | W; IN-M1, "orders by digit size", "puts 0 with the negatives"; Say: "___ is the least because it is furthest left."; vocab: least, greatest, order |
| `integer_nl_drag` | 6 | unassigned -> visual-grid | (none) | fix | 35% of items place three integers, 65% place one (:5360), so cell height and score vary inside a section; candidates exclude 0 and both endpoints (:5365-5368), so the boundary cases never appear; fixed −10..10 ignores `state.range`; `distinct` 9 of 12 | W; IN-M1, IN-M7, "counts from the left end instead of from 0"; Say: "___ is ___ steps left of zero."; vocab: tick, zero, left |
| `mixed_integers` | M | equation-drill -> visual-grid | (none) | keep | inherits | mixed instruction |
| `abs_value` | 6 | equation-drill | (none) | split | 35% is a different task ("Which has the greater absolute value?") and is 2-option multiple choice (:5110-5121), a P-29 break; fixed ±20 range; no number line and no distance arc, so absolute value is a sign rule rather than a distance; the compare variant's answer is the *number*, not its absolute value, which reads as a trick | options `ask=value|compare`; W; IN-M6, "answers with the negative", "thinks |−8| < |3| because −8 is less"; Say: "___ is ___ steps from zero."; vocab: absolute value, distance from zero |
| `opposite_numbers` | 6 | equation-drill | (none) | fix | two phrasings rotate 40-60 (:5137), one of them 19 words ("What number is the same distance from 0 as −13 but on the other side of the number line?"); fixed ±20; no number line or distance arc | W; IN-M6, "gives the absolute value", "gives 0"; Say: "The opposite of ___ is ___."; vocab: opposite, same distance, other side |
| `ordering_rationals` | 6 | unassigned -> visual-grid | hands-order | redo | production ordering shown as 4-option multiple choice on screen while the printed item is a write-in rule 40 mm long (P-29, the forbidden direction); no number line despite the skill name; fractions and decimals mixed in an `integers` skill with no common representation; fixed 11-value pool, so repeats within a page; distractors are pair swaps, not misconceptions; capitals | rebuild as plot-then-order on a marked line; W; IN-M1, "orders −1/2 before −3/4 by numerator", "treats −0.2 as less than −0.5"; Say: "___ is least, then ___."; vocab: least, greatest, between |
| `mixed` | M | visual-grid -> computation-grid | (none) | keep | inherits; the four operations appear with no instruction that the set is mixed and no discrimination step in front (P-11, P-28) | mixed instruction; "Look at the sign." |
| `word_problems_mixed` | 3 | word-problems | schema-story | fix | four operations and four schemas in one set with no declared mix and no discrimination step; 8% `_msc_` multi-select at random; stories to 32 words; no schema diagram | W; "picks the operation from a keyword", MU-M1, DV-M1; decision lines: "I know the parts, so I add", "I know the whole and one part, so I subtract", "equal groups, so I multiply"; Say: as the chosen schema; vocab: in all, each, left |
| `word_problems_mixed_plain` | 3 | word-problems | schema-story | merge -> `number_ops_mixed:word_problems_mixed` | twin with `visual` suppressed | alias option `version=v2` |
| `number_families_mixed` | 2 | visual-grid | fact-family | fix | tagged grade 2 but every item contains a division fact (3.OA content); `maxFactor` band gives `distinct` 6 of 12, the worst duplicate rate in the family; four operations in one cell is the opposite of "isolate sub-skills" (P-9); the prompt "Complete ALL equations using 5 and 3" uses capitals | re-tag grade 3; W; DV-M1, MU-M1, "uses the sum where the product belongs"; Say: "___ and ___ make ___ and ___."; vocab: fact family, sum, product |
| `number_families_mixed_med` | 3 | visual-grid | fact-family | merge -> `number_ops_mixed:number_families_mixed` | tier twin | alias option `factorMax=10` |
| `number_families_mixed_hard` | 4 | visual-grid | fact-family | merge -> `number_ops_mixed:number_families_mixed` | tier twin | alias option `factorMax=12` |
| `operations_all` | M | computation-grid | (none) | keep | inherits; draws 5-digit addends (`maxOperand` 92,808) into a pool tagged for all grades | mixed instruction |

Host notes: `long-division` is reserved for the two skills that use the US bracket as the working layout (`divide`, `long_div_2digit`). `box_division_*` and `area_model_div_*` are tables inside a cell, so they take `visual-grid`, not `long-division`. `equation-drill` takes the one-line skills whose cell is a horizontal sentence with one slot (`mult_facts`, `div_facts`, `missing_mult_div`, `compare_int`, `abs_value`, `opposite_numbers`). `chart-table` takes the four `mult_chart*` ids because one chart carries many items and must print full width. `sub-setup` is given only to `multiply` and `divide`, where the rewrite is genuinely horizontal-to-vertical; `sub-notate` only to `long_div_2digit`, where the estimate can be written without dividing. `fact-layouts` and `flashcards` are removed from 14 ids the catalogue tagged: a number-line hop, a box-division table, a word problem and an area model are not fact-like and cannot go into a 5-10 column fact grid (PT-CMP-2).

## Details (every verdict other than keep)

**`mult_facts` (fix).** The core is right and it is the only id in the family with a table-selection hook (`ensureTables()`), which is the seed of the `facts:[n]` option the research asks for. Three fixes: guard `useFullTables` with `factsMode` so a range change can never turn a fact page into column multiplication; let 0 into the factor pool so the {0, 1, 2, 5, 10} set exists; make orientation a section option rather than a per-item coin flip, since P-16 wants vertical and horizontal in separate sections and a fact page mixing both cannot be laid out in 5-10 columns.

**`multiply` (split).** Two unrelated things share the id. The missing-operator branch picks its operation at random *after* the skill has chosen `×`, so "Basic Multiplication" prints subtraction and division items and turns a write-the-number task into a four-way multiple choice — the single clearest P-28 and P-29 breach in the family. Send missing numbers to `missing_mult_div`, drop missing operators from this family, and expose the digit levels (1x2, 1x3, 2x2, 2x3) that the research names as the ladder. The `sub-setup` page (rewrite across as down) and the placeholder-zero notate page are the two sub-skill pages this algorithm needs.

**`arrays_groups` (split).** The third branch computes `total ÷ cols` and asks "How many rows?", which is DV-A1 content inside a grade-2 multiplication id. Keep counting and writing the sentence here; the picture must stop being captioned with the answer sentence; add the three MU-01 edge cases (one group, groups of one, an empty group) that `rng(2, …)` currently forbids.

**`dot_array_mult` (fix).** One change matters: remove `r rows × c columns` from the prompt and the caption. Everything else is sound, and its four tagged distractors should become the family's `wrongAnswer` template.

**`mult_properties` (split).** Commutative, distributive, identity and zero are four different steps of MU-A, each with its own worked steps. The commutative prompt must stop containing the product ("Here is 5 × 4. Write the other fact for this array."); the distributive item needs the split array with the two parts lettered A and B rather than coloured; identity and zero belong to the new `mult_by_0_1`.

**`mult_word_problems` (split).** Fix the string-versus-number comparison first: `roll` is a variant name, so two of the five branches are unreachable and the comparison variant silently produces rate stories. Then one schema per section, the picture drawn only for the schema it fits (an array for array stories, unit bars for comparison, nothing for rate), the caption removed, the emoji fallback replaced by the eight in-house line-art pictures or plain counters, and the v1 page given the schema diagram, the decision lines and the unit word that PROBLEM_TYPES 1.27 specifies.

**`mult_word_problems_plain`, `mult_comparison_plain`, `div_word_problems_plain`, `word_problems_mixed_plain` (merge).** The only difference from their bases is that `q.visual` is empty. That is the v1 / v2 pairing the standard already defines, generated from one seed, not four separate skills. Alias each to its base with `version: 'v2'`; the ids and their share codes stay.

**`mult_comparison` (split).** The three unknown positions of WP-07 are three steps. The multi-select branch leaves. Stories must lose the two distractor sentences from the plain set-up (they belong on the `wp_which_numbers` page) and gain the unit bar.

**`area_model_mult`, `area_model_mult_hard` (fix).** Letter the parts A, B (and C, D), print an addition frame for the partial products, allow a zero in the ones so the pupil meets `4 × 50`, and split the 2 × 2 and 2 × 3 sizes into separate sections. Add the set-up-only page: write the expanded form in the box headers, do not multiply.

**`mult_div_fact_family` (fix).** Pick one notation per section instead of per equation. Add the three types the research names (sort family / not a family; find the missing member; build from an array) as options. Exclude 0 and 1 from the family pool, which the code already does, and seed at most one square per set as the P-10 edge case.

**`number_families_mult` (split), `_med`, `_hard` (merge).** The tiers change two things at once. Make `factorMax` and `missing` independent options on the base id and alias the tiers. The easy tier's 16-item pool must widen or every printed set repeats.

**`mult_chart` (redo), `mult_chart_easy` (fix), `_medium`, `_hard` (merge).** The rainbow chart is the family's worst print artefact: four full-colour 12 × 12 grids to a page, numerals about 7 pt reversed out of saturated fills, three products answered on one rule, and the prompt naming the cells to find. Rebuild the chart in black and white with the target row and column lightly shaded; `mult_chart` becomes look-up-one-product (a real 3.OA.C.7 task), `mult_chart_easy` becomes fill-in with `missing` as an option, and each missing cell gets its own numbered blank so the Score denominator means something.

**`nl_mult` (split), `nl_div` (split).** Both already rotate deterministically, so converting the rotation into an `ask` option is small work. The line must not label the landing tick when the product or dividend is the unknown, and the strip should be the count-by strip of the house strategy rather than `+n` hop labels.

**`div_facts` (fix).** The three notations are three ladder steps (DV-A4 makes the bracket its own step), not a per-item shuffle, and the fraction-bar form should be an option, not a default, for grade 3. Guard `useFullTables` as for `mult_facts`. The missing edge cases (`0 ÷ n`, `n ÷ n`, `n ÷ 1`, never `÷ 0`) are named in the research and must be seeded.

**`divide` (split).** The same random-operation branch as `multiply`, plus a coin-flip between the bracket and a bare sentence. Once the missing branches are gone this is the long-division id: digit levels, remainder policy, the decide page (underline the part divided first) and the set-up page (rewrite under the bracket).

**`div_remainders` (fix).** Move the format explanation out of `q.text` into the section instruction and give the cell two slots (`__ R __`) instead of free text. Cap the dividend so the group picture stays drawable, fade the picture after the concept step, and add the "remainder too big" judge page.

**`div_word_problems` (split), `remainder_interpret` (split), `remainder_contexts` (merge).** One schema per set; one remainder interpretation per set. `remainder_contexts` is the same three patterns with different nouns and becomes a `contexts` option. The decide-only page ("what do I do with what is left?") is the step this pair is missing and is the reason `sub-decide` is tagged here.

**`box_division_easy`, `box_division_hard` (fix).** The automatic carry arrow does the bring-down, so the box teaches nothing about where the next digit comes from; make it a scaffold that fades. Remove the orange carry colour and the word "Carry" from the hint. `box_division_hard`'s 30% remainder must become an option. Both are the optional second strategy (P-2), so they follow DV-C, not replace it; the grade-3 tag on `box_division_easy` should move to 4.

**`area_model_div_2by1`, `area_model_div_3by1` (fix).** Replace the 76-pair table with a generator that respects `state.range` and guarantees a friendly first part, or keep the table and add enough pairs that a 12-item page cannot repeat. See owner question 4 about keeping two partial-quotient representations.

**`long_div_2digit` (redo).** Everything in summary 2. The rebuild needs the digit grid with one column per dividend digit, the estimate box beside it, a remainder slot, four items to a page, the 10-25 divisor band as the first step, and removal of the `divisor × ? = dividend` line and the always-`× 1` estimate. Until then the skill cannot support the Model, Guided, Error analysis or Test roles, because there is no working to show, mark or get wrong.

**`missing_mult_div` (split).** Six unknown positions and three notations multiply out to eighteen item shapes in one section. P-16 wants one position per step and then mixed; the notation is a separate axis. The label should also stop saying "Factors" when four of the six positions are division.

**`number_line_int` (fix).** One line geometry for the whole section: the playbook's −10 to 10 at 8 mm pitch, 0 with a taller tick and a bold numeral, every integer ticked, landmarks every 5. Today each item invents its own range and label step, and at `state.range` 1000 the tick step is 10 while the target is any integer, so the arrow points at empty line. Add the standing thermometer form, which IN-1 requires and which nothing in the family draws.

**`compare_int` (split).** Keep the pair comparison; move the select-all form to the hands-sort page. Drop "=" from the options or generate equal pairs. Seed the two look-alike pairs the playbook names, and replace the sign colouring with position on a shared line.

**`add_int` (redo), `sub_int` (redo).** Both print their own method on every item: the chip totals in `add_int` are the answer for same-sign sums, and `sub_int` prints the completed rewrite. Neither shows a number line on screen, while the printed page shows a line that nothing is marked on. Rebuild both on one line geometry with a marked start point and hop arcs that fade, and put the rule where it belongs — on the decide-only pages (IN-7, IN-9) and the Opener's Rule band, not under every practice item.

**`order_negatives` (fix).** Bound the values at ±20, force at least one negative and at least one positive in every set, fix the count per section, put a line under each row, and add a greatest-to-least step as a separate rung.

**`integer_nl_drag` (fix).** Fix the count per section; let 0 and the endpoints be targets; widen the line range as a later step.

**`abs_value` (split), `opposite_numbers` (fix).** Both are sign rules today because neither draws a line. Give both the line with a distance arc, make `ask=value|compare` an option on `abs_value` (the compare form is not multiple choice on paper, so it must not be on screen), and cut the 19-word phrasing on `opposite_numbers` to the frame "___ is the opposite of ___."

**`ordering_rationals` (redo).** The response mode is wrong on both media and in opposite ways. Rebuild as: plot four values on a marked line, then write them in order in four boxes. Split fractions from decimals into two steps, widen the pool, and build the distractors from IN-M1 rather than pair swaps. It is also arguably a fractions-family skill; see owner question 6.

**`word_problems_mixed` (fix), `number_families_mixed` (fix).** Both mix by design, which P-28 allows only when the instruction says so and a discrimination step comes first. `word_problems_mixed` needs "Add, subtract, multiply or divide. Read the question." plus the new `compare_add_or_mult` rung in front of it. `number_families_mixed` is tagged grade 2 while every item contains division; re-tag to 3 and widen the number pool, which today repeats one item in two.

## New skills needed

Proposed ids, append-only; never reorder existing ids (share codes are positional).

| Id | Category | Ladder step | Note |
|---|---|---|---|
| `equal_groups_count` | multiplication | MU-A1 | ovals; edge cases one group, groups of one, empty oval |
| `repeated_add_to_mult` | multiplication | MU-A4 | bridging: `4 + 4 + 4` and `3 × 4` in one row |
| `equal_or_unequal_groups` | multiplication | MU-A5 | discrimination; "I can multiply" / "I must add" |
| `mult_by_0_1` | multiplication | MU-A6 | the 0 and 1 sets, which no generator can emit today |
| `mult_zeros` | multiplication | MU-B1, B2 | × 10, × 100, multiples of ten; research item 10 |
| `mult_placeholder_zero` | multiplication | MU-B7 | notate-only; the 2 × 2 error |
| `mult_missing_digit` | multiplication | MU-B10 | dashed digit box; research item 15 |
| `share_into_groups` | division | DV-A1 | ring groups from a picture |
| `read_div_equation` | division | DV-A2 | "12 in all, 3 in each group" |
| `write_div_equation` | division | DV-A3 | labelled blanks; notate-only |
| `missing_factor_or_addend` | division | DV-A25 | discrimination with `missing_add_sub` |
| `remainder_too_big` | division | DV-B3 | judge page; remainder >= divisor |
| `div_zero_in_quotient` | division | DV-C6 | 312 ÷ 3; research item 11g |
| `div_check_by_multiplying` | division | DV-C7 | judge page; research item 20 |
| `div_fix_estimate` | division | DV-C12 | estimate too big / too small |
| `wp_which_numbers` | number_ops_mixed | WP-M6 | the `_msc_` wrapper, fired deliberately instead of at random in six ids |
| `compare_add_or_mult` | multiplication | WP-M10 | "how many more" against "times as many"; research item 17 |
| `integer_word_problems` | integers | IN-12 | change diagram with a standing line |

## Questions for the owner

1. **RULED (owner, 2026-09-19): fact sets are an option, not skills.** `facts: [n] | {from, to} | 'all'` on `mult_facts` and `div_facts` and on their + / − twins, rather than 24 new skill ids; the ladder steps then differ only by the option value, which is exactly one delta per step. The constant runs 0 to 12 for × and ÷ in the ruled set order, and 0 to 13 for + and −, whose facts run to 30 with a band of their own (P-FL-18, P-FL-20).
2. **RULED in part (owner, 2026-09-19): a band caps the answer.** `mult_facts` and `div_facts` change identity today when the teacher raises Max Number: at range 500 or above they become column multiplication and long division. Under the ruling a band on a × or ÷ section caps the **product** or the **dividend**, so it can no longer turn a fact page into an algorithm page. Remaining recommendation: × ÷ facts keep stating their limit as a factor limit (facts to 12, or limit to 10) and ignore `state.range`, and the print dialog notes it when a fact section is chosen with a large Max Number (P-FL-19).
3. **Two partial-quotient representations.** `box_division_easy/hard` and `area_model_div_2by1/3by1` teach the same optional second strategy with different drawings. Recommendation: keep both ids (share codes), make the box the default drawing for the DV-C' ladder and list the area model as the same step's alternative representation, so a teacher never gets both shapes in one section. **RULED in part (2026-09-19):** the easy / hard pair inside `box_division_*` is one skill with a practice level, both ids kept in position as aliases (P-AT-9); what remains open is only which drawing leads.
4. **Grade tags to correct.** `box_division_easy` is tagged 3 (partial quotients is 4.NBT.B.6); `number_families_mixed` is tagged 2 but every item contains division (3.OA); `mixed_mult_div` is tagged 3 but draws grade 4-5 members. Recommendation: correct all three in this family's migration. Grade tags drive filters and the teacher footer only, so no share code moves.
5. **Is the integer rewrite a set-up page?** IN-10 ("rewrite `5 − 8` as `__ + __`") is a rewrite with no answer, but `sub-setup` is defined as horizontal-to-vertical. Recommendation: keep the tag's strict meaning, and let `sub_int`'s ladder step unlock the page through `responseScope: 'setup'` instead — the same ruling the geometry review asked for. If the owner prefers, widen `sub-setup` to "rewrite in the taught frame" and tag `sub_int`.
6. **Where does `ordering_rationals` live?** It is in `integers` but its content is fractions and decimals on a line. Recommendation: leave the id and code where they are (share codes) and list it under the fractions family's ordering ladder in the navigator; confirm with the fractions review which id owns positive-only ordering so the two do not duplicate.
7. **The "click all the numbers you need" wrapper.** It fires at random inside six word-problem ids, turning a production story into a checkbox item on both media. It is a good task, wrongly placed. Recommendation: remove the random roll everywhere and make it the new `wp_which_numbers` skill, which becomes the decide-only page of the word-problem ladder. This is the single change that makes one-schema pages, tests A/B and facsimile keys possible for the nine word-problem ids.
8. **Distractor sentences in stories.** The wrapper's stories add irrelevant ages, distances and times, which is a real CCSS 4.OA skill but doubles the reading load for ELL pupils. Recommendation: irrelevant information is an option (`distractors: 0 | 1 | 2`, default 0) on every story skill, on by default only for `wp_which_numbers`, and stories stay within four lines with the question last.
