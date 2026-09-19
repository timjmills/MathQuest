# Family review: fractions, decimals and conversions

Categories: `fractions` (27), `decimals` (11), `conversions` (16), `frac_dec_mixed` (4). 58 skills. Generator: `js/modules/gen-fractions.js` (three exported entry points: `generateFractionsQuestion` :8, `generateConversionsQuestion` :6280, `generateDecimalsQuestion` :7346). One skill of this family is generated elsewhere: `round_decimals` in `js/modules/gen-algebraic.js:2715` (routed by `generate-question.js:272`). Machine-readable tags and verdicts: `design/catalogue/fractions-decimals-conversions.overrides.json`. `fraction_operations` is a separate family and is reviewed in `design/catalogue/fraction-operations.md`.

## Family summary

1. Verdicts: keep 6, fix 23, redo 2, merge 4, split 23 (total 58). Hosts after review: `visual-grid` 22, `equation-drill` 22, `computation-grid` 5, `long-division` 1, `chart-table` 1, `word-problems` 1, plus the 6 review pools. The catalogue's guesses of `unassigned` (5), `long-division` for `mixed_decimals` and `decimals_all`, `word-problems` for `ratio_tables`, and `equation-drill` for `identify` and `fractions_all` are wrong.
2. Worst problem 1: **two named skills can never generate their own item.** `generate-question.js:206` treats *any* skill id starting with `mixed_` as a category-wide random pool. `fractions:mixed_improper_visual` ("Mixed ↔ Improper (Visual Pizza)") and `fractions:mixed_nl_drag` ("Drag Mixed Numbers onto Number Line") are hijacked, so their generator blocks (`gen-fractions.js:6049` and `:5698`) only ever run when something else picks them. The baseline proves it: `print/fractions__mixed_nl_drag.png` is a page of "Frac of Set" and "Compare Fractions" items with no number line anywhere. A teacher who selects the skill, prints it, or shares its code gets a random fractions grab-bag, and no answer key can be a facsimile of a page whose content is decided at render time.
3. Worst problem 2: **blank and self-answering print cells.** `identify`'s "Pick the model showing 1/2." prints with no models at all (`print/fractions__identify.png`, items 3 and 6) — the option SVGs are dropped exactly as they are in the geometry family. `percent_visual`'s `shade` type prints the grid **already shaded to the target percent** and then asks how many squares are shaded (`print/conversions__percent_visual.png`, item 3), so the answer is drawn on the page. `mult_decimal` prints a three-line method box on every cell but no grid to multiply in (`print/decimals__mult_decimal.png`), and on screen its visual computes the whole-number product for the pupil (`gen-fractions.js:7410`).
4. Worst problem 3: **silent type mixing (P-28) in 23 of the 54 teaching skills.** Random `Math.random()` branches or `pickVariant` rotations put 2-4 unrelated problem types behind one id: `identify` (:5051), `equivalent` (:5327 plus a 25% drag-fill at :5402), `compare` (:5473), `simplify` (:5741), `improper_mixed` (:5860), `equiv_frac_nv` (:4204, :4259, :4306), `benchmark_fractions` (:4567, :4599, :4667, :4738), `order_frac_numline` (:4458), `compare_frac_lcd` (:4787), `round_fractions` (:4906), `fraction_bar_ops` (:5567), `fraction_of_set` (:3883), `compare_decimal` (:7478, :7505, :7549), `f_to_d`/`d_to_f`/`f_to_p`/`p_to_f` (:6628), `percent_visual` (:6794, :6842), `percent_of_number` (:6925), `find_whole_from_pct` (:7071), `ratio_intro` (:6288), `equiv_ratios` (:6430). The baseline pages show the result: `print/fractions__compare.png` puts three different questions and two different response modes on one sheet under the headings "COMPARE FRACTIONS / COMPARE FRAC".
5. Worst problem 4: **answer leaks in hints and visuals.** `graph_fractions`'s hint ends "…is at position 2", which is the tick to click (:4871). `equivalent` prints "Multiply top and bottom by **3**" under the item (:5445, :5466). `mult_decimal` shows the completed whole-number product (:7410). `f_to_d`, `compare_frac_lcd`, `round_decimals` and `percent_of_number` all print the method or the deciding structure inside the practice cell, which belongs in the Opener's Steps band (P-4, P-6).
6. Worst problem 5: **the decimal edge cases the whole domain turns on are unreachable.** `genDecimal` (:7353) gives both operands the *same* number of places, so `compare_decimal` can never show 0.4 against 0.35 (DE-M1), never 0.6 against 0.60 (DE-M4), and `add_decimal`/`sub_decimal` never show a ragged pair such as 2.5 + 1.25 (DE-M5). The fractional part is `rng(1, 10^p - 1)`, so a zero in the tenths or hundredths place (0.05, 4.03) and a subtraction across zeros (5.00 − 2.34) never occur. `compare_thousandths`'s prompt is also broken on paper: `gen-fractions.js:31` writes `(use <, >, or =)` and the print path inserts `problem.text` as raw HTML (`print-generate.js:4296` and its siblings), so `<, >` is swallowed and the sheet reads "(use , or =)".
7. Also family-wide: colour carries meaning on 21 of 27 fraction skills and on the decimal comparison (green first number, orange second, `:7568-7570`); emoji appear in `fraction_of_set` ("Click 1/2 of the 🍌", :3883 branch), `mult_decimal` and `div_decimal` (🔢 headers, :7406, :7466); "Click ALL" wording survives into print on some formats; prompts carry screen instructions ("Type the greater fraction, or \"equal\"", "Click parts to toggle shading. Then press Submit."); several titles overflow the header and clip ("Compare Fractions (>, <, =)", "…onto Number Line (Interactive)", "Percent Grid (Visual)").
8. `state.range` is ignored by every fractions and conversions skill. In decimals it is used only as a 9-or-99 switch on the whole part (`:7366`, `:7399`, `:7482`). `state.decimalPlaces` is honoured. Denominators have a per-grade cap (`_capDen`, `:65-71`) but most blocks pick from a hard-coded pool and never call it: `compare` uses denominators to 12 at grade 4, `select_equiv_frac` produces denominators to 40, `equivalent`'s drag-fill palette runs to 2× the expanded denominator.
9. What is already good: `write_fraction` is a clean single-type skill with `noSimplify` set so the counted fraction is the answer; `shade_fraction` marks on the count of shaded parts, not on which parts; `select_equiv_frac` tags each distractor with a named misconception through `window.tagDistractor` (:5303) and is the only skill in the family that already carries `wrongAnswer` material; `round_decimals` and `round_fractions` both guard against trivial items (`gen-algebraic.js:2726`, `gen-fractions.js:4913`); `div_decimal` rotates its three forms through `pickVariant` rather than `Math.random`, and always lands on a clean quotient; `compare_thousandths` seeds a 25% "equal pair" edge case (:17); `equiv_ratios`' simplify branch reduces a:b first so the key is right (:6463); the printed `fraction-of-set` cell already draws equal groups in rows with a line-art counter, which is the right cell.
10. Worked-solution text is one or two restated lines for 52 of 58 skills (`workedMax` 2). Only the four decimal operations reach 5-6 (`add_decimal`, `sub_decimal`, `mult_decimal`, `div_decimal`) and those read as a method, not as imperatives. Treat the existing text as the key line: `workedSteps`, `wrongAnswer`, the `Say:` frame and vocabulary must be authored for all 54 teaching skills. Misconception ids below are the playbook's `DE-M*` and `PC-M*` plus `FR-M*` defined in this document.

## Misconception ids used below

| Id | Error |
|---|---|
| FR-M1 | Counts shaded against unshaded (3 of 4 shaded → 3/1) |
| FR-M2 | Accepts unequal parts as halves / thirds |
| FR-M3 | Bigger denominator means bigger fraction (1/8 > 1/4) |
| FR-M4 | Compares numerators only, or denominators only |
| FR-M5 | Counts marks, not spaces, on a number line |
| FR-M6 | Adds the same number to top and bottom to make an equivalent fraction |
| FR-M7 | Uses a different multiplier on top and bottom |
| FR-M8 | Simplifies by subtracting the common factor instead of dividing |
| FR-M9 | Mixed → improper: adds the whole to the numerator (2 3/4 → 5/4) |
| FR-M10 | Improper → mixed: uses the remainder as the whole number |
| FR-M11 | Fraction of a set: multiplies by the denominator, or divides by the numerator |
| FR-M12 | Rounds a mixed number by dropping the fraction every time |
| FR-M13 | Reads a fraction of a set as "how many are left" |
| DE-M1..M8 | `design/EXTENSION_PLAYBOOK.md` 4.10 |
| PC-M1..M7 | `design/EXTENSION_PLAYBOOK.md` 4.11 |

## Proposed ladders

One delta per step. "opt" = an option on an existing id, not a new id. `scope` values are the contract's `responseScope`.

### FR-A: name and write a fraction (grade 3; PEDAGOGY L-9 steps 6-11)

Prerequisites (equal / unequal parts, name the equal shares) are ladder SH-C in the geometry review; `partition_shapes`'s a/b type aliases in here.

| Step | I Can … | Delta | Skill |
|---|---|---|---|
| FR-A1 | Write the Denominator | count every equal part; numerator printed | `write_fraction` scope=notation |
| FR-A2 | Write the Numerator | the counted part changes; denominator printed | `write_fraction` scope=notation |
| FR-A3 | Write the Fraction (captions) | both boxes, captions "shaded parts" / "equal parts" | `write_fraction` scaffold 3 |
| FR-A4 | Write the Fraction | scaffold: captions removed | `write_fraction` |
| FR-A5 | Write the Fraction From a Bar, Then an Array | representation, one per step | `write_fraction` opt `model` |
| FR-A6 | Shade a Fraction | response: shade | `shade_fraction` |
| FR-A7 | Cut the Shape, Then Shade | the pupil partitions first | NEW `partition_then_shade` |
| FR-A8 | Show Fractions Equal to 1 and More Than 1 | range crosses 1 | NEW `fractions_and_one` |
| FR-A9 | Name the Top and Bottom Numbers | vocabulary, no model | `identify` opt `task=name_part` |
| FR-A10 | Match a Picture, a Fraction and a Word | representation: matching | NEW `match_frac_word` |
| FR-A11 | Write the Fraction From a Sentence | words only | `identify_nv` |

### FR-B: fractions on a number line (grade 3; L-10)

| Step | I Can … | Delta | Skill |
|---|---|---|---|
| FR-B1 | Count the Parts Between 0 and 1 | denominator only | `graph_fractions` scope=notation |
| FR-B2 | Count the Hops From 0 | numerator only, hops drawn | `graph_fractions` scope=notation |
| FR-B3 | Write the Fraction at the Dot | response: write | NEW `read_frac_numline` |
| FR-B4 | Put a Fraction on the Line | response: mark | `graph_fractions` |
| FR-B5 | Put Three Fractions on One Line | count changes | `fraction_nl_drag` |
| FR-B6 | Fractions At 1 and Past 1 | range 0-2, then 0-3 | `mixed_nl_drag` (redo) |
| FR-B7 | Name the Lettered Point | response: choose a letter | `order_frac_numline` opt `task=name` |
| FR-B8 | Order Fractions Using the Line | response: order | `order_frac_numline` opt `task=order` |

Follow-on: a vertical line; cut a blank line into equal parts (NEW `partition_numberline`, GAP-5-03).

### FR-C: equivalence and simplifying (grades 3-5)

| Step | I Can … | Delta | Skill |
|---|---|---|---|
| FR-C1 | Say Whether Two Models Show the Same Amount | yes / no | `equiv_frac_visual` opt `task=judge` |
| FR-C2 | Write Both Fractions From Two Models | response: two templates | `equiv_frac_visual` |
| FR-C3 | Find the Missing Numerator | unknown position | `equivalent` opt `unknown=num` |
| FR-C4 | Find the Missing Denominator | unknown position | `equivalent` opt `unknown=den` |
| FR-C5 | Write the Missing Multiplier | the n/n between the fractions | NEW `equiv_missing_multiplier` |
| FR-C6 | Say Whether Two Fractions Are Equal (no model) | representation removed | `equiv_frac_nv` opt `task=judge` |
| FR-C7 | Circle Every Fraction Equal to This One | response: circle all | `select_equiv_frac` |
| FR-C8 | Say Whether a Fraction Is Already Simplest | decide only | `simplify` scope=decision |
| FR-C9 | Write the Common Factor | notate only | `simplify` scope=notation |
| FR-C10 | Simplify a Fraction | full procedure, paired ÷ arrows | `simplify` |
| FR-C11 | Build a Fraction From Unit Tiles | representation: tiles | `compose_target_frac` |

### FR-D: compare and order (grades 3-5)

| Step | I Can … | Delta | Skill |
|---|---|---|---|
| FR-D1 | Compare Two Unit Fractions | same numerator 1, two models | `compare` opt `set=unit` |
| FR-D2 | Compare Fractions With the Same Bottom Number | denominator fixed | `compare` opt `set=same_den` |
| FR-D3 | Compare Fractions With the Same Top Number | numerator fixed | `compare` opt `set=same_num` |
| FR-D4 | Compare a Fraction to One Half | benchmark enters | `compare` opt `set=half` |
| FR-D5 | Sort Fractions by Their Nearest Benchmark | response: sort into 0 / ½ / 1 | `benchmark_fractions` opt `task=sort` |
| FR-D6 | Choose the Closest Benchmark | response: circle one | `benchmark_fractions` opt `task=choose` |
| FR-D7 | Say Whether You Need a Common Bottom Number | decide only | `compare_frac_lcd` scope=decision |
| FR-D8 | Write the Common Bottom Number | notate only | `compare_frac_lcd` scope=notation |
| FR-D9 | Compare Using a Common Bottom Number | full procedure | `compare_frac_lcd` |
| FR-D10 | Order Three Fractions, Then Five | count changes | `order_fractions` |

### FR-E: mixed numbers (grade 4)

| Step | I Can … | Delta | Skill |
|---|---|---|---|
| FR-E1 | Say Whether an Amount Is More Than One Whole | decide only | `improper_mixed` scope=decision |
| FR-E2 | Ring Each Whole | notate only | `improper_mixed` scope=notation |
| FR-E3 | Write the Mixed Number From a Model | response: template | `improper_mixed` opt `task=model_to_mixed` |
| FR-E4 | Write the Improper Fraction From a Model | the form changes | `improper_mixed` opt `task=model_to_improper` |
| FR-E5 | Write Both Forms From One Model | two templates | `improper_mixed` opt `task=both` (alias of `mixed_improper_visual`) |
| FR-E6 | Change an Improper Fraction to a Mixed Number | scaffold: model removed | `improper_mixed` opt `task=i2m` |
| FR-E7 | Change a Mixed Number to an Improper Fraction | direction changes | `improper_mixed` opt `task=m2i` |
| FR-E8 | Say Whether the Fraction Part Is More Than a Half | decide only | `round_fractions` scope=decision |
| FR-E9 | Round a Mixed Number to the Nearest Whole | full procedure | `round_fractions` opt `to=whole` |
| FR-E10 | Round a Mixed Number to the Nearest Half | the target place changes | `round_fractions` opt `to=half` |

### FR-F: fraction of a set (grades 3-4)

| Step | I Can … | Delta | Skill |
|---|---|---|---|
| FR-F1 | Ring the Equal Groups | notate only | `fraction_of_set` scope=notation |
| FR-F2 | Find a Unit Fraction of a Set | numerator 1, picture | `fraction_of_set` opt `num=1` |
| FR-F3 | Find a Fraction of a Set | numerator > 1 | `fraction_of_set` |
| FR-F4 | Find a Fraction of a Number | picture removed | `fraction_of_set_nv` |
| FR-F5 | Bigger Numbers, Same Method | range | `fraction_of_set_nv` opt `practiceLevel=3` (alias of both `*_hard` ids) |
| FR-F6 | Find the Missing Top Number | unknown position | NEW `frac_of_set_missing` |
| FR-F7 | Find the Whole From a Part | unknown position | NEW `frac_of_set_whole` |
| FR-F8 | Fraction-of-a-Set Story | word problem after the computation (P-21) | NEW `frac_of_set_word` |

### DE: decimals (grades 4-6)

Playbook ladder DE adopted with two corrections: reading and writing decimals has no skill at all today, and subtracting across zeros is its own sub-ladder (owner ruling).

| Step | Skill |
|---|---|
| DE-1 to DE-3 read tenths, then hundredths, on a strip and a grid | NEW `decimal_models` (GAP-5-09) |
| DE-4 zero placeholder (0.05 against 0.50) | NEW `decimal_read_write` |
| DE-5 tell look-alike decimals apart | NEW `decimal_lookalikes` |
| DE-6 place a decimal on a dual-labelled line | `decimal_nl_drag` |
| DE-7a decide "do these have the same number of places?" | `compare_decimal` scope=decision |
| DE-7b write both numbers in the place grid, fill the zeros | `compare_decimal` scope=setup, then scope=notation |
| DE-7c compare tenths and hundredths | `compare_decimal` |
| DE-7d compare thousandths | `compare_thousandths` |
| DE-8 order three, then five decimals | `order_decimals` |
| DE-9a draw the cut line / underline the target place | `round_decimals` scope=notation |
| DE-9b round to the nearest tenth, then hundredth, then thousandths source | `round_decimals` (alias target of `round_thousandths`) |
| DE-10 line up to add or subtract, no computing | `add_decimal` / `sub_decimal` scope=setup |
| DE-11a add decimals in the grid | `add_decimal` |
| DE-11b subtract decimals in the grid | `sub_decimal` |
| DE-11z subtract across zeros (sub-ladder, after DE-11b) | NEW `sub_decimal_zeros` |
| DE-12 multiply a decimal by a whole number | `mult_decimal` |
| DE-13a divide a decimal by a whole number | `div_decimal` opt `form=dec_by_whole` |
| DE-13b move both points, then divide | NEW `div_decimal_by_decimal` (split) |
| DE-14 fraction ↔ decimal | `f_to_d`, `d_to_f` |

### PC-R ratios, PC-P percents (grade 6)

Playbook ladders PC-R1..R7 and PC-P1..P7 adopted. Mapping after this review:

| Step | Skill |
|---|---|
| PC-R1 describe a picture with "for every" | NEW `ratio_for_every` |
| PC-R2 write a : b in the right order | `ratio_intro` |
| PC-R3 part-to-part or part-to-whole (decide only) | `ratio_intro` scope=decision |
| PC-R4 complete a ratio table (×2, ×3) | `ratio_tables` opt `given=multiplier`; `equiv_ratios` opt `task=find_missing` |
| PC-R5 find a missing value in a ratio table | `ratio_tables` |
| PC-R5b are these two ratios equal? | `equiv_ratios` opt `task=judge` |
| PC-R5c write a ratio in simplest form | NEW `ratio_simplify` (split of `equiv_ratios`) |
| PC-R6 use a double number line | `double_num_line` |
| PC-R7 find a unit rate | `unit_rate_intro` |
| PC-P1 read a percent on a hundred grid | `percent_visual` |
| PC-P1b shade a grid to show a percent | NEW `shade_percent_grid` (split) |
| PC-P1c write the grid as a fraction | `percent_visual` opt `ask=fraction` |
| PC-P2 percent ↔ decimal | `d_to_p`, `p_to_d` |
| PC-P3 percent ↔ fraction | `p_to_f`, `f_to_p` |
| PC-P4 find 50%, 25% and 10% of a number | `percent_of_number` opt `set=benchmark` |
| PC-P5 find any percent of a number (step columns) | `percent_of_number` |
| PC-P6 find the whole from a percent | `find_whole_from_pct` |
| PC-P7 order fractions, decimals and percents | `order_fdp` |

### Skills in no ladder

`mixed_fractions`, `mixed_decimals`, `mixed_conversions`, `fractions_all`, `decimals_all`, `conversions_all`, `fdp_all` are review pools (Mixed practice, Daily spiral). `fraction_bar_ops` sits in `fractions` but is a fraction-operations skill (FO-01 / FO-04); it belongs to that family's ladder (owner question 4).

## Every skill

"W" = `workedSteps` must be authored; existing worked text is usable only as the key line unless stated.

| Skill id | Gr | Host | Special tags | Verdict | Defects | To author |
|---|---|---|---|---|---|---|
| `identify` | 3 | visual-grid | hands-find, hands-match | split | 3 types rotate (:5051): shaded model, "Pick the model" MC, "What is the numerator of 2/8?"; the MC type **prints with no models** (`print/fractions__identify.png` 3, 6); the answer is auto-simplified (`simplifyFraction`, :5121) while the options include the unsimplified equivalent, so 2/4 is marked wrong against a 2-of-4 picture; label collides with `placevalue:identify` and prints "Name the Place"; denominator pool 2-8 ignores `_capDen` | variants `shaded` (stays), `pick_model` → FR-A10 match, `name_part` → FR-A9; W; FR-M1, FR-M2, FR-M13; Say: "___ parts shaded of ___ equal parts. That is ___."; vocab: numerator, denominator, equal parts |
| `write_fraction` | 3 | visual-grid | sub-notate | fix | one type, good; cyan fill is the only mark of "shaded"; no denominator-only / numerator-only steps (GAP-5-02); circle / bar / array chosen at random per item (:5146); no value over 1; prompt duplicated by nothing, but no captions band | W (3 steps); FR-M1, FR-M2, "writes parts-shaded over parts-unshaded"; notate lines: "Write how many equal parts.", "Write how many are shaded."; Say: "___ out of ___ equal parts."; vocab: numerator, denominator, whole |
| `shade_fraction` | 3 | visual-grid | hands-find | fix | the visual repeats the prompt as a purple heading "Shade 3/4" (:5260) and carries screen instructions "Click parts to toggle shading. Then press Submit." (:5262); hard-coded `#1e88e5` fill (:5191); shape chosen at random per item; parts always pre-drawn (no partition-then-shade step); distinct 8 of 12 | W; FR-M2, "shades the number of parts equal to the denominator", "shades from both ends"; Say: "I shade ___ of the ___ equal parts."; vocab: shade, equal parts |
| `equiv_frac_visual` | 3 | visual-grid | hands-match | fix | prompt is 15 words and asks two things at once ("Write each fraction and tell if they are equivalent"); two response modes rotate (write both / answer = or ≠); colour distinguishes the two models; no yes/no judge step before the write step | W; FR-M6, FR-M3, "reads two different-sized wholes as comparable"; Say: "___ and ___ cover the same amount."; vocab: equivalent, same amount |
| `equiv_frac_nv` | 3 | equation-drill | hands-sort, sub-notate | split | 3 branches at random (:4204 multi-select, :4259 drag-to-bin, :4306 missing number); the bin type is a sort page, not a practice item; no multiplier-notation step | variants `missing_number` (stays), `judge` (yes/no), sort → hands-sort page only; W; FR-M6, FR-M7, FR-M8; notate line: "Write the number you multiply by."; Say: "Multiply the top and the bottom by ___."; vocab: equivalent, multiply |
| `select_equiv_frac` | 4 | equation-drill | hands-sort | fix | denominators run to 40 (base den to 8 × multiplier 5, :5281) at grade 4, above the grade cap; the count of correct tiles is always 2-3 of 6, so "pick 2 or 3" is learnable; "Click ALL" wording; no picture check on the first row | W; FR-M6, FR-M7, "reciprocal pattern"; the six `msg` strings at :5289-5294 are usable `wrongAnswer.explain` text; Say: "___ and ___ are the same amount."; vocab: equivalent |
| `equivalent` | 4 | equation-drill | hands-sort, sub-notate | split | 4 types (:5327 yes/no, multi-select, standard, plus a 25% drag-fill at :5402); the cell prints "Multiply top and bottom by **3**" — the method is given (:5445, :5466); unknown is numerator or denominator at random; drag-fill palette runs to 2× the denominator | variants `missing_num`, `missing_den`, `judge`, NEW `equiv_missing_multiplier`; W; FR-M6, FR-M7; Say: "___ times ___ is ___, so ___ is ___."; vocab: equivalent, multiplier |
| `fraction_of_set` | 3 | visual-grid | sub-notate, schema-story | split | 25% branch is "Click 1/2 of the 🍌" — emoji objects, against the owner's ruling (:3883 region); printed caption "5 equal groups of 6 · 30 objects total" gives the group structure away (`print/fractions__mixed_nl_drag.png`); denominators 2-6 mixed with any numerator; no ring-the-groups step | variants `picture` (stays) and the select-all form as the hands-sort page only; W; FR-M11, FR-M13, "counts the groups, not the objects"; notate line: "Ring the equal groups."; Say: "___ groups of ___. ___ groups is ___."; vocab: group, of, set |
| `fraction_of_set_hard` | 4 | visual-grid | schema-story | merge → `fractions:fraction_of_set` | twin: same code path (:3848), differing only in the denominator pool (:3873) and a 60% "missing numerator" branch (:3883); same emoji branch | alias option `practiceLevel=3`; the missing-numerator branch becomes NEW `frac_of_set_missing` |
| `compare` | 4 | visual-grid | sub-decide | split | 3 types at random (:5473); "Which is greater … (Type the greater fraction, or \"equal\")" is screen wording printed on paper and answered on a ruled line while other cells use a symbol box (`print/fractions__compare.png`); the two bars are drawn at the same width but a second circle can fall below its partner; denominators to 12 at grade 4; no unit-fraction step, no same-numerator step | variants `unit`, `same_den`, `same_num`, `half`; W; FR-M3, FR-M4, "more parts means a bigger fraction"; decision lines: "same bottom number → compare the tops", "same top number → fewer parts is bigger"; Say: "___ is greater than ___."; vocab: greater than, less than, compare |
| `simplify` | 4 | equation-drill | hands-sort, sub-decide, sub-notate | split | 4 types (:5741 multi-select, then :5776 yes/no, GCF-only, simplify); the GCF type asks a number-theory question inside a fractions skill; no paired ÷ arrows (GAP-5-06); prompt to 13 words | variants `simplify` (stays), `judge` (decide), `gcf` (notate); W; FR-M8, "divides the top only", "stops at a common factor that is not the greatest"; decision line: "Is there a number that divides both?"; Say: "Divide the top and the bottom by ___."; vocab: simplest form, common factor |
| `improper_mixed` | 4 | visual-grid | hands-sort, hands-match, sub-decide, sub-notate | split | 4 types (:5860 multi-select, then three modes at :5920) across 4 print formats; the `visual_to_both` mode is a duplicate of `mixed_improper_visual`; the cell prints its own method line "(4 × 3) + 2 = ?" (:5991) and "Divide 14 by 3: the quotient is the whole…" (:5953); colour separates the two forms | variants `model_to_mixed`, `model_to_improper`, `both`, `i2m`, `m2i`; W (existing 5-step text is a usable start); FR-M9, FR-M10, "writes the remainder as the whole"; decision line: "Is the top bigger than the bottom?"; Say: "___ wholes and ___ of ___."; vocab: mixed number, improper fraction, whole |
| `mixed_improper_visual` | 4 | visual-grid | (none) | merge → `fractions:improper_mixed` | **never generates its own item** (`generate-question.js:206` hijack); its block (:6049) is a duplicate of `improper_mixed`'s `visual_to_both`; pastel pizza fill chosen at random from 4 colours (:6057); the visual contains live `<input>` elements and a Check button, so the print path has to strip them | alias option `task=both`; keeps the two-input cell, which is the right cell for FR-E5 |
| `mixed_fractions` | M | visual-grid | (none) | keep | review pool; inherits every defect above; the pool is "every playable fractions skill", so it can draw `mixed_improper_visual` and `mixed_nl_drag`, which is the only way those two ever run | section instruction that says "mixed"; drop alias ids after the merges |
| `compose_target_frac` | 4 | visual-grid | (none) | fix | print rewrites the prompt to "Write the fractions that add up to 2/4" (`print-generate.js:3879`), which is a different task from dragging tiles into a bar (P-29); targets are not reduced (2/4, 2/8, 10/12), so the tile set gives the answer away; distinct 9 of 12; no unit-tile-only step | W; FR-M3, "uses tiles of mixed sizes without checking the whole", FR-M6; Say: "___ tiles of ___ make ___."; vocab: unit fraction, tile, whole |
| `identify_nv` | 3 | equation-drill | schema-story | split | 3 types in one id (:1868): "numerator 6, denominator 12" (whose answer is the *simplified* 1/2, :126 of the catalogue sample — a marking trap), "1 out of 2 parts are shaded" with no picture, and a pizza story to 17 words; story and non-story items on one page | variants `from_words`, `from_sentence`, story → NEW `frac_story` or `schema-story` page; W; FR-M1, "reverses numerator and denominator", FR-M13; Say: "___ out of ___ is ___."; vocab: out of, numerator, denominator |
| `fraction_of_set_nv` | 3 | equation-drill | schema-story | fix | 25% multi-select branch (:1904) mixed with the computation; story and bare items on one page; `range` ignored (wholes come from the denominator pool only) | W; FR-M11, FR-M13; Say: "___ divided by ___ is ___. ___ times ___ is ___."; vocab: of, divide, group |
| `fraction_of_set_hard_nv` | 4 | equation-drill | schema-story | merge → `fractions:fraction_of_set_nv` | twin (:1996 / :2045); the only real differences are the number pool and the "3/5 of a number is 9" type | alias option `practiceLevel=3`; the find-the-whole type becomes NEW `frac_of_set_whole` |
| `order_fractions` | 4 | equation-drill | hands-order | fix | two widgets for one task (30% drag tiles :4377, 70% click-to-order :4410) — the unified ordering widget already exists; count 4-5 at random; direction least→greatest or greatest→least at random; no common-denominator support | W; FR-M3, FR-M4, "orders by denominator"; Say: "___ is the smallest because ___."; vocab: order, least, greatest |
| `order_frac_numline` | 4 | visual-grid | hands-order | split | two unrelated tasks (:4458 drag-order, :4501 "Which letter shows 1/5?"); the letter type is multiple choice on screen and on paper, which is acceptable, but it sits beside a drag task; ticks always pre-drawn and always 0-1 | variants `name_point` (stays), `order_on_line`; W; FR-M5, FR-M3, "reads the label, not the position"; Say: "Point ___ is at ___."; vocab: number line, tick, between |
| `benchmark_fractions` | 4 | visual-grid | hands-sort | split | 4 branches (:4567, :4599, :4667, :4738) covering sort-to-bins, choose-one, select-all and order; prompt to 13 words listing all five benchmarks; benchmarks 0, ¼, ½, ¾, 1 introduced together | variants `choose` (stays), `sort` → hands-sort page; W; FR-M3, "rounds to the nearest whole instead of the nearest benchmark", "judges by the numerator alone"; Say: "___ is closest to ___."; vocab: benchmark, closest, about |
| `compare_frac_lcd` | 4 | equation-drill | sub-decide, sub-notate | split | 30% branch is an ordering task, not a comparison (:4787); the cell prints an "LCD = ___" frame plus two blank fractions, which is the method on the practice item (:4848-4855); denominators to 12 give LCDs to 120; like-denominator pairs excluded (:4825), so the discrimination step is impossible | variants `compare` (stays), ordering → `order_fractions`; W (existing hint is the key line); FR-M4, FR-M7, "multiplies only one fraction"; decision line: "Are the bottom numbers the same?"; notate line: "Write the common bottom number."; Say: "___ is ___ over ___. ___ is ___ over ___."; vocab: common denominator, convert |
| `graph_fractions` | 3 | visual-grid | sub-notate | fix | the hint ends "…is at position 2" — the answer (:4871); the visual repeats the prompt in a coloured line (:4896) and carries a Check Placement button; the prompt names the *simplified* fraction while the line is cut into the unsimplified denominator (good, but never taught); 0-1 only; distinct 8 of 12 | W; FR-M5, "counts the first tick as 1", FR-M3; notate lines: "How many parts?", "How many hops?"; Say: "___ hops of one ___ is ___."; vocab: tick, space, hop |
| `round_fractions` | 4 | visual-grid | sub-decide | split | whole / half chosen at random per item (:4906); multiple choice on screen with 4 options while the paper cell is a write-in (`fraction-round`) — P-29 break; the dot on the mini line is placed at the exact value, so the decision is read off the picture; `wholeNum` 1-9 ignores `range` | variants `to_whole`, `to_half`; W; FR-M12, "rounds up whenever there is a fraction", "rounds the fraction part instead of the number"; decision line: "Is the fraction part more than a half?"; Say: "___ is closer to ___."; vocab: round, nearest, half |
| `fraction_bar_ops` | 3 | visual-grid | sub-decide | split | like (60%) and unlike (40%) denominators mixed silently (:5567); add and subtract mixed (:5563); answers can be mixed numbers at grade 3 (`_fracStr`, :5600); operands are swapped silently when the difference would be negative (:5591); grade tag 3 for unlike denominators (4.NF / 5.NF) | variants `add_like`, `sub_like`, `add_unlike`, `sub_unlike` — these are FO-01 / FO-04 steps owned by the fraction-operations family (owner question 4); W; "adds the denominators", FR-M6, "subtracts the smaller from the larger numerator"; decision line: "Can you add these as they are?"; Say: "___ ___ plus ___ ___ is ___ ___."; vocab: same bottom number, add, difference |
| `fraction_nl_drag` | 3 | visual-grid | sub-notate | fix | single vs multi target at random (35%, :5671); denominators 3-8 only, 0-1 only; answers stored as raw floats (0.3333333333333333) so the key prints a repeating decimal; distinct 9 of 12; print rewrite gives "Write each value on the correct tick" while the screen drags | W; FR-M5, "places by the numerator alone", FR-M3; Say: "___ is ___ hops from zero."; vocab: tick, hop, between |
| `mixed_nl_drag` | 4 | visual-grid | sub-notate | redo | **never generates its own item** (`generate-question.js:206`); the baseline print is a page of fraction-of-set and compare items with the title clipped behind the toolbar and three cells rendering empty; when it is reached through `mixed_fractions`, its block (:5698) alternates improper and mixed labels *inside one item* (:5714), which is two notations on one line (P-28) | rebuild as FR-B6: one notation per page, range 0-2 then 0-3, whole ticks labelled; W; FR-M5, FR-M9, "puts 5/4 between 4 and 5"; Say: "___ is between ___ and ___."; vocab: mixed number, between, whole |
| `add_decimal` | 5 | computation-grid | sub-setup, sub-notate, sub-decide, schema-story | fix | both operands always have the same number of places (:7365-7367), so the ragged case (2.5 + 1.25) and DE-M5 never appear; no zero in the tenths or hundredths place; whole part 0-9 unless `range` > 100 (:7366) — Max Number is otherwise ignored; no set-up-only step; the `col-arith` regroup boxes are on every item with no fade | W (existing 6-step text is a usable start); DE-M5, DE-M4, "adds the points as digits"; setup line: "Write the numbers in the grid. Line up the points."; notate line: "Fill the empty places with 0."; decision line: "Will this column need regrouping?"; Say: "___ tenths plus ___ tenths is ___ tenths."; vocab: line up, tenths, hundredths |
| `sub_decimal` | 5 | computation-grid | sub-setup, sub-notate, sub-decide, schema-story | fix | same place-matching defect (:7381-7384); the fractional part is `rng(1, 10^p − 1)`, so no zeros and never a subtraction across zeros (5.00 − 2.34) — the owner's own sub-ladder cannot be built; operands silently swapped when b > a (:7384), so "can I take the bigger from the smaller?" never arises; hint says "borrow", against the US ruling ("regroup", `:7387`) | W; DE-M5, DE-M4, "subtracts the smaller digit from the bigger in each column"; setup / notate / decision lines as `add_decimal`; Say: "Regroup one tenth into ten hundredths."; vocab: regroup, line up, difference |
| `mult_decimal` | 5 | computation-grid | sub-setup, sub-notate, schema-story | redo | the on-screen visual **computes the product for the pupil**: "1️⃣ Multiply: 908 × 5 = 4540" (:7410); emoji header 🔢 (:7406); the printed cell is a three-line method box on every item with no grid to work in (`print/decimals__mult_decimal.png`) and no answer space beyond one rule; multiplier always 2-9, multiplicand 0-9.99, `range` ignored; no ×10 / ×100 step; no decimal × decimal | rebuild as DE-12: digit grid, count-places box, method only in the Opener; W; DE-M7, "moves the point the wrong way", "counts the whole-number digits"; notate line: "Write how many decimal places."; Say: "___ places in all, so the point goes here."; vocab: decimal place, product |
| `div_decimal` | 6 | long-division | sub-setup, sub-notate, sub-decide, schema-story | fix | emoji header 🔢 (:7466); the bracket is built from CSS borders in a monospace span, not the US long-division bracket, and there is no work space; three forms rotate through `pickVariant` (:7424) — good rotation, wrong granularity: "whole ÷ decimal" and "decimal ÷ decimal" are separate ladder steps; answers accepted as free text; `range` only caps the quotient | variants `dec_by_whole` (stays), NEW `div_decimal_by_decimal`; W; DE-M7, "moves only one point", "drops the remainder"; setup line: "Move both points the same number of places."; decision line: "Is the divisor a whole number?"; Say: "___ goes into ___ ___ times."; vocab: divisor, dividend, quotient |
| `compare_decimal` | 4 | equation-drill | sub-setup, sub-notate, sub-decide, hands-order | split | 3 types at random (:7478 order, :7505 select-all, :7549 compare); both numbers always have the same number of places (:7551-7554), so DE-M1 and DE-M4 — the two misconceptions this skill exists to attack — can never be shown; first number green, second orange (:7568-7570); emoji header; the three symbols are drawn as decorative tiles below the item, which is neither an answer slot nor a legend | variants `compare` (stays), ordering → `order_decimals`, select-all → hands-sort page; W; DE-M1, DE-M2, DE-M4; setup line: "Write both numbers in the grid."; notate line: "Fill the empty places with 0."; decision line: "Do they have the same number of places?"; Say: "___ tenths is more than ___ tenths."; vocab: tenths, hundredths, line up |
| `compare_thousandths` | 5 | equation-drill | sub-setup, sub-notate | fix | the prompt is broken on paper: `(use <, >, or =)` at :31 is inserted as raw HTML by the print path, so the sheet reads "(use , or =)"; no place grid or rewrite step; no picture check; the 25% equal-pair edge case is good but never announced; `range` and the 4-vs-5 grade boundary unused | W; DE-M1, DE-M4, "pads on the left"; Say: "Same tenths, so look at the hundredths."; vocab: thousandths, place, compare |
| `round_decimals` | 5 | visual-grid | todays-number, sub-decide, sub-notate | fix | the "number line" is a CSS gradient bar with an absolutely-positioned dot (`gen-algebraic.js:2749-2765`), which has no print format at all (`printFormats: (none)`) — on paper the item loses its representation; the dot sits at the exact value, so the decision is read off, not made; tenth / hundredth at random per item; a coloured scale carries the meaning | W; DE-M6, "rounds every digit after the cut", "rounds down always"; notate line: "Draw the cut line after the ___ place."; decision line: "Is the next digit 5 or more?"; Say: "___ is closer to ___."; vocab: round, nearest, cut line |
| `round_thousandths` | 5 | equation-drill | todays-number, sub-decide, sub-notate | merge → `decimals:round_decimals` | twin of `round_decimals` with the source place fixed at thousandths and no representation (:44-56); `0.972 → nearest tenth` gives the string "1.0", which the key prints as 1.0 while a pupil writing 1 is marked wrong | alias option `from=thousandths`; the trailing-zero acceptance rule must be written down (owner question 6) |
| `order_decimals` | 5 | equation-drill | hands-order, sub-setup | fix | two widgets for one task (30% drag :7612, 70% click :7640); count 3-6 at random and places 1-3 at random inside one page; the visual repeats the numbers that the ordering widget already shows; no stacking grid | W; DE-M1, DE-M2, "orders by length"; setup line: "Write the numbers in the grid, one under the other."; Say: "___ is the smallest because ___."; vocab: least, greatest, order |
| `decimal_nl_drag` | 4 | visual-grid | sub-notate | fix | tenths on 0-1 only; `labelStep 0.5` labels just 0, 0.5, 1 (:7701); single vs multi at random (30%, :7684); no fraction row above the line (DE-05 asks for a dual-labelled line); distinct 7 of 12 | W; DE-M8, DE-M3, "reads 0.7 as seven"; notate line: "Label each tick."; Say: "___ tenths is ___."; vocab: tenths, tick, halfway |
| `mixed_decimals` | M | computation-grid | (none) | keep | review pool; its pool (:7350) lists `order_decimal` and `number_line_decimal`, which are not skills in `data.js`, and omits `round_decimals`, `round_thousandths`, `compare_thousandths` and `decimal_nl_drag`, so the "mixed" page under-samples the ladder | section instruction that says "mixed"; correct the pool to the eleven real ids |
| `f_to_d` | 4 | visual-grid | hands-sort, hands-match, flashcards, sub-notate | split | 30% drag-to-bin branch shared with three other ids (:6628) and its answer object prints as "[object Object]" in the catalogue; the cell carries the instruction "Convert to tenths or hundredths first!" (:6711); `answerType` left unset so the item defaults to a numeric input with distractor options attached; denominators 2-100 in one pool at grade 4; no grid or strip representation (DE-1 to DE-3 have no skill) | variants `convert` (stays), sort → hands-sort page; W; DE-M3, DE-M4, "reads 3/5 as 0.35"; notate line: "Write it over 10 or over 100."; Say: "___ over ___ is ___ tenths."; vocab: tenths, hundredths, equivalent |
| `d_to_f` | 4 | visual-grid | hands-sort, hands-match, flashcards, sub-decide | split | the answer is silently the *simplest* form (`simplifyFraction`, :6725) although the prompt only says "Convert 0.2 to a fraction", so 2/10 is marked wrong; the hint is built by string surgery on the decimal (:6733) and reads "0.2 means \"2\" out of \"10\""; same shared drag branch; no hundredths with a zero (0.05) | variants `convert` (stays), sort → hands-sort page; W; DE-M4, FR-M8, "writes 0.25 as 1/25"; decision line: "How many places? Tenths or hundredths?"; Say: "___ hundredths is ___ over 100."; vocab: tenths, hundredths, simplest form |
| `f_to_p` | 6 | equation-drill | hands-sort, hands-match, flashcards | split | shared drag branch; four distractor options attached to a free-text answer, so the screen shows choices the paper cell does not (P-29); denominators 2-100 including twentieths in one pool; grade 6 tag for a grade 5-6 skill; no hundred grid | variants `convert` (stays), sort → hands-sort page; W; PC-M4, "writes 3/4 as 34%", "divides by 100 instead of multiplying"; Say: "___ over 100 is ___ percent."; vocab: percent, out of 100 |
| `p_to_f` | 6 | equation-drill | hands-sort, hands-match, flashcards | split | only five percents are ever used (10, 20, 25, 50, 75 at :6774) — distinct 5 of 12, so a 12-item page repeats; distractors drawn from a fixed non-overlapping list; the cell shows the whole method (`50% → 50/100 → ?/?`, :6789) | variants `convert` (stays), sort → hands-sort page; W; PC-M4, FR-M8; Say: "___ percent is ___ over 100."; vocab: percent, simplest form |
| `d_to_p` | 6 | equation-drill | hands-match, flashcards | fix | fixed table of 21 pairs including 12.5%, 150% and 200% at the same difficulty as 10% (:6890-6898); the hint states the answer ("0.75 × 100 = 75%", :6903); no grid check; distinct 9 of 12 | W; PC-M4, DE-M4, "moves the point one place"; Say: "___ is ___ percent."; vocab: percent, hundredths |
| `p_to_d` | 6 | equation-drill | hands-match, flashcards | fix | same fixed table (:6909-6916); hint states the answer (:6921); percents over 100 mixed with single digits; distinct 8 of 12 | W; PC-M4, "5% written 0.5", "drops the placeholder zero"; Say: "___ percent is ___ hundredths."; vocab: percent, hundredths, placeholder |
| `percent_visual` | 6 | visual-grid | hands-match | split | 4 types (:6794 select-all, then identify / fraction / shade at :6842); the `shade` type **prints the grid already shaded to the target percent** and then asks for the count, so the answer is on the page and equals the number in the prompt (`print/conversions__percent_visual.png` item 3); grids shade teal on paper; full columns are ruled cell by cell instead of reading as one tenth-strip | variants `read_percent` (stays), `ask=fraction`, NEW `shade_percent_grid`; W; PC-M4, "counts rows as ones", DE-M3; Say: "___ squares of 100 is ___ percent."; vocab: percent, hundred grid, out of 100 |
| `percent_of_number` | 6 | visual-grid | sub-decide, schema-story | split | 25% multi-select branch (:6925) mixed with the computation; 21 hard-coded combos including 33% (:6984), which is not 1/3 of the base and teaches a false benchmark; the bar model is filled to the exact percent and labelled with it (:6995), so the answer can be read off the picture; no predict step, no step columns | variants `benchmark` (10/25/50), `any_percent` (step columns), select-all → Reason It page; W; PC-M5, PC-M7, "finds the percent of the percent"; decision line: "More or less than half?"; Say: "___ percent of ___ is ___."; vocab: percent, of, whole |
| `find_whole_from_pct` | 6 | visual-grid | sub-decide, schema-story | split | 50% of items are a multi-select "Click ALL values that satisfy: 10% of __ = 5." (:7071) — an equation-solving item inside a percent skill; the other half is bare arithmetic with no bar model; prompt "21 is 30% of what number?" is an unknown-position phrasing with no frame | variants `find_whole` (stays), select-all → Reason It page; W; PC-M7, PC-M5, "divides by the percent as a whole number"; decision line: "Is the answer bigger or smaller than the number given?"; Say: "If ___ percent is ___, then 100 percent is ___."; vocab: whole, part, percent |
| `order_fdp` | 6 | equation-drill | hands-order | fix | count 3-6 at random (:7016); the pool mixes thirds (0.333) with exact values, so "convert all to decimals" gives a rounded comparison; the three forms arrive together with no single-form step before; no conversion work space in the cell | W; PC-M4, FR-M3, "orders by the digits ignoring the form"; Say: "I change them all to ___ first."; vocab: form, convert, order |
| `ratio_intro` | 6 | visual-grid | sub-decide, schema-story | split | 3 types at random (:6288): write a ratio, part-to-part vs part-to-whole, and equivalent ratios (which is `equiv_ratios`' job); prompts to 24 words — the longest in the family — with the answer format tacked on ("(a:b format)"); half the items silently demand simplest form and half do not (:6368) — ruled 2026-09-19: none of them may, unless the instruction says so, and "write a ratio in simplest form" is PC-R5c's own step; no token picture and no ratio frame, so nothing is pictorial | variants `write_ratio` (stays), decide (PC-R3), equivalent → `equiv_ratios`; NEW `ratio_for_every` before it; W; PC-M1, PC-M2, PC-M3; decision line: "Is it part to part or part to whole?"; Say: "For every ___ there are ___."; vocab: ratio, for every, to |
| `unit_rate_intro` | 6 | word-problems | sub-decide, schema-story | fix | seven story templates with named people and $ amounts; no "per 1" table and no diagram, so the schema is invisible; the numbers are always exact multiples, so no remainder or decimal rate ever appears; `range` unused; two of the seven templates ask the same question shape | W; PC-M6, "multiplies instead of dividing", "answers with the total"; decision line: "Which number do you divide by?"; Say: "___ for ___ is ___ for one."; vocab: rate, per, each |
| `double_num_line` | 6 | visual-grid | schema-story | fix | both lines are coloured (blue top, purple bottom, :6576-6580) and the marker is orange, so the pairing is carried by colour; the marker sits on the line with a "?" inside it rather than a blank under the line; 60% of targets are half-steps (:6542), which is a later step, mixed with whole steps; unit pairs include "cups / pancakes" reversed against normal usage | W; PC-M3, PC-M6, "reads the tick number instead of the scale value"; Say: "___ ___ go with ___ ___."; vocab: double number line, matches, per |
| `mixed_conversions` | M | visual-grid | (none) | fix | the pool (:6625) pulls `length_metric`, `mass_metric` and `time` out of the measurement family, so "Mixed Conversions" prints measurement items the teacher never selected and the footer's CCSS list is wrong | correct the pool to the sixteen `conversions` ids; section instruction that says "mixed" |
| `equiv_ratios` | 6 | equation-drill | sub-notate | split | 3 types through `pickVariant` (:6430): find the missing value, yes/no, simplify — the third is a different skill; the yes/no type builds its near-miss by ±1 on one term only (:6448), so "is it equivalent" is answerable by parity; no table, no ×n arcs | variants `find_missing` (stays), `judge`, NEW `ratio_simplify`; W; PC-M3, PC-M1, "adds the same number to both terms"; notate line: "Write the number you multiply by."; Say: "Multiply both parts by ___."; vocab: equivalent ratio, multiply |
| `ratio_tables` | 6 | chart-table | sub-notate, schema-story | fix | the table has no story and no row names — the rows are literally "x" and "y" (:6494-6499) with a lilac header fill, so the ratio has no referent; the prompt explains the table instead of asking the question (20 words); the missing cell is always in the x row; the third column jumps by 5-8, so no ×2 / ×3 step exists; catalogue flag `V` only (no colour) because the fill is inline hex | W; PC-M3, PC-M1, "adds the difference down the row"; notate line: "Write the × n above each column."; Say: "For every ___ there are ___."; vocab: ratio table, column, multiply |
| `fractions_all` | M | visual-grid | (none) | keep | review pool; inherits the emoji fraction-of-set items and the blank-print `identify` items | section instruction that says "mixed" |
| `decimals_all` | M | computation-grid | (none) | keep | review pool; inherits the emoji headers and the same-places defect; catalogue host `long-division` is wrong (one of eleven members is division) | section instruction that says "mixed" |
| `conversions_all` | M | visual-grid | (none) | keep | review pool; same measurement leak as `mixed_conversions` | section instruction that says "mixed" |
| `fdp_all` | M | visual-grid | (none) | keep | review pool; draws from `fraction_operations` too, so a 37-word item can appear (`maxWords` 37) | section instruction that says "mixed" |

Host notes: nothing in this family is fact-like, so neither the `fact-layouts` roles nor the `fact-family` pages are offered. `flashcards` is proposed for the six notation-conversion skills only (owner question 5). `k-one-page` and `hands-strips` apply to no skill here. `sub-setup` is given only where a genuine horizontal-to-vertical rewrite exists: the four decimal computations and the two decimal comparisons (both stack into the place grid).

## Details (every verdict other than keep)

**`identify` (split).** Three unrelated items share the id, and two of the three are unusable. "Pick the model showing 1/2." prints as a bare sentence because the option SVGs never reach the print payload, so neither the page nor its facsimile key can be made. The shaded-model type is the right FR-04 cell, but its answer is passed through `simplifyFraction` while its distractor list is built from the raw counts, so a 2-of-4 picture has answer "1/2" and offers "2/4" as a wrong option. Rebuild as the shaded-model cell with the counted fraction as the answer; move "Pick the model" to the matching page (FR-A10) and the numerator / denominator question to FR-A9. Fix the skill-label collision with `placevalue:identify` at the same time — today the printed label on a fractions page reads "Name the Place".

**`write_fraction` (fix).** The cell is right and `noSimplify` is already set. Add the two notate-only steps (denominator, then numerator) that GAP-5-02 asks for, fix one representation per section instead of a per-item coin flip, add values over 1, and replace the cyan fill with the single grey.

**`shade_fraction` (fix).** Strip the purple "Shade 3/4" heading and the mouse instructions from the visual — the prompt already says it. One shape family per section. Add the partition-then-shade step (FR-A7) as a separate id.

**`equiv_frac_visual` (fix).** Split the 15-word double question into the judge step (FR-C1) and the write step (FR-C2). Both models must be the same size and the same grey; today colour tells them apart.

**`equiv_frac_nv` (split).** Keep the missing-number cell, add the yes/no judge, and let the bin-sort live only as the cut-and-glue page. Add the multiplier-notation step.

**`select_equiv_frac` (fix).** The best-built skill in the family: keep the cell and reuse the six tagged misconception messages as `wrongAnswer.explain`. Cap the denominators to the grade, vary the number of correct tiles from 1 to 4, and add a picture check on the first row of the Model.

**`equivalent` (split).** Four types and a method line printed under every item. Separate the two unknown positions into their own steps, move the yes/no to the judge step already held by `equiv_frac_nv`, and take "Multiply top and bottom by 3" out of the practice cell into the Steps band.

**`fraction_of_set`, `fraction_of_set_hard` (split, merge).** One id with a picture and one without is the right pair; a second pair that differs only in number size is not. `fraction_of_set_hard` becomes `practiceLevel=3` on `fraction_of_set`, and the same for the two `_nv` ids. Drop the emoji objects for the plain counters the print path already draws, remove the "5 equal groups of 6 · 30 objects total" caption (it is the working), and add the ring-the-groups notate step. The missing-numerator and find-the-whole branches become their own late steps.

**`compare` (split).** Four comparison strategies (unit fractions, same denominator, same numerator, benchmark) arrive at once and in two response modes. One strategy per step (P-2), a symbol box on every cell, and the screen wording removed from the paper prompt.

**`simplify` (split).** Keep simplifying here. The GCF-only question becomes the notate step, the yes/no becomes the decide step, and the select-all becomes the sort page. Add the paired ÷ arrows (GAP-5-06); today the cell is bare.

**`improper_mixed` (split), `mixed_improper_visual` (merge).** These two ids are one skill. Give `improper_mixed` a `task` option covering the five real steps and alias `mixed_improper_visual` to `task=both`, which also removes it from the `mixed_` hijack. Take the method lines out of the cells.

**`compose_target_frac` (fix).** The paper task must be the same task as the screen task: print the bar with the tile bank beside it and have the pupil write the tiles into the bar, not "write the fractions that add up to". Reduce the targets or state that the tiles must be unit fractions.

**`identify_nv` (split).** Three types, one of which quietly demands simplest form. Split into "write the fraction from the two words", "write the fraction from a sentence" and a story step; none of them constrains the form, because the instruction does not ask for it (ruled 2026-09-19, P-LG-15).

**`order_fractions`, `order_decimals` (fix).** One ordering widget, one direction per section, one count per section. The unified ordering widget already exists; these two still ship the old 30 / 70 split.

**`order_frac_numline` (split).** "Which letter shows 1/5?" and "drag these into order" are different steps of FR-B. Keep the letter type here, move the ordering to an option, and vary the range beyond 0-1.

**`benchmark_fractions` (split).** Four branches; the sort belongs to the hands-on page, the choose-one is the practice cell. Introduce 0, ½ and 1 first and add ¼ and ¾ as a later range step.

**`compare_frac_lcd` (split).** Keep comparison, send the drag-order branch to `order_fractions`, and move the "LCD = ___" frame from the practice cell into the decide and notate steps. Allow like-denominator pairs so the discrimination step (P-11) is possible.

**`graph_fractions` (fix).** Remove the position from the hint; remove the Check button and the restated prompt from the visual. Add the two notate steps (count the parts, count the hops).

**`round_fractions` (split).** Whole and half are two steps. Make the paper and screen responses the same (write-in on both). The dot must be at the value but the benchmark tick must be the thing the pupil judges against, not a pre-read position.

**`fraction_bar_ops` (split).** Four operations behind one id at grade 3. These are fraction-operation ladder steps; the id stays where it is but its variants map onto FO-01 / FO-04 (owner question 4).

**`fraction_nl_drag` (fix), `mixed_nl_drag` (redo).** Both need the `mixed_` routing fix before anything else can be judged on `mixed_nl_drag`. Store the answer as a tick index, not a float, so the key prints "2/6" rather than 0.3333333333333333. One target count per section.

**`add_decimal`, `sub_decimal` (fix).** The single change that matters is generating the two operands independently, so that ragged pairs, placeholder zeros and subtraction across zeros can be seeded. Add the set-up-only step (DE-10), fade the regroup boxes, and replace "borrow" with "regroup".

**`mult_decimal` (redo).** The screen visual hands over the whole-number product, and the printed cell has no grid. Rebuild as the DE-12 cell: a digit grid, the count-places box, and the method only in the Opener. Add ×10 / ×100 as its own step.

**`div_decimal` (fix).** Use the US bracket and give the cell work space. Split "decimal ÷ decimal" out as its own step with a rewrite-only predecessor.

**`compare_decimal` (split), `compare_thousandths` (fix).** Same place counts on both operands is the defect that empties this pair of skills; fix `genDecimal` first. Then add the place grid, the zero-filling notate step and the same/different-places decide step, and delete the colour coding. Fix the `<, >` loss in `compare_thousandths`'s prompt (either escape `problem.text` in `print-generate.js` or write "use the symbols >, < or =" without the leading `<`).

**`round_decimals` (fix), `round_thousandths` (merge).** One rounding skill with a `from` option and a real printable number line. The CSS gradient bar has no print format at all, so today the paper item loses its representation.

**`decimal_nl_drag` (fix).** Label every tick, add the fraction row above the line (DE-05), extend past 1, and fix the count per section.

**`f_to_d`, `d_to_f`, `f_to_p`, `p_to_f` (split).** All four share a 30% drag-to-bin branch that is a sort page, not a practice item, and all four print their method inside the cell. `d_to_f` accepts 2/10, because the instruction does not ask for simplest form (ruled 2026-09-19); a separate step may ask for it with the `simplest-form` string. `p_to_f` draws from five percents only and repeats within one page.

**`d_to_p`, `p_to_d` (fix).** Hints state the answer. Split the fixed table into a benchmark set (grade 5) and an over-100 / decimal-percent set (grade 6), and add a hundred-grid check on the first row.

**`percent_visual` (split).** The `shade` type is the worst item in the family: it prints a grid already shaded to the target and asks for a number that is written in the prompt. Make it a real shading task (`shade_percent_grid`), keep reading the grid here, and make the fraction question an option. Draw full columns as one block so a tenth reads as a strip.

**`percent_of_number` (split), `find_whole_from_pct` (split).** Both hide a select-all reasoning item behind a computation id; both lack the bar model the playbook specifies. Add the predict step and the step columns to `percent_of_number`, and the "if 25% is 8, find 100%" bar to `find_whole_from_pct`. Drop 33% from the benchmark set.

**`order_fdp` (fix).** Fix the count per section, drop thirds from a skill whose method is exact conversion, and give the cell a conversion row under each value.

**`ratio_intro` (split), `equiv_ratios` (split), `ratio_tables` (fix), `unit_rate_intro` (fix), `double_num_line` (fix).** The ratio cluster has no pictures at all: no token rows, no ratio frame, no row names on the table, no bar. That is the whole of PC-R1 to PC-R5 missing. Give the table the story's own nouns as row heads, add the ×n arcs as a hint, put the "for every" sentence frame in front of the notation step, and take the answer-format instructions out of the prompts.

**`mixed_conversions` (fix).** Correct the pool so the review page stays inside the family.

## New skills needed

Append only; never reorder existing ids (share codes are positional).

| Id | Category | Ladder step | Note |
|---|---|---|---|
| `partition_then_shade` | fractions | FR-A7 | GAP-5-03 / FR-06; blank shape with guide dots |
| `fractions_and_one` | fractions | FR-A8 | GAP-5-04 / FR-08; =1, <1, >1 sort and write |
| `match_frac_word` | fractions | FR-A10 | FR-10 / GAP-5-12; picture, fraction, word (and decimal) |
| `read_frac_numline` | fractions | FR-B3 | L-10 step 3; write the fraction at the dot |
| `partition_numberline` | fractions | FR-B follow-on | GAP-5-03; cut a blank line into equal parts |
| `equiv_missing_multiplier` | fractions | FR-C5 | FR-15 / GAP-5-05 |
| `frac_of_set_missing` | fractions | FR-F6 | split of `fraction_of_set_hard` |
| `frac_of_set_whole` | fractions | FR-F7 | split of `fraction_of_set_hard_nv` |
| `frac_of_set_word` | fractions | FR-F8 | story step after the computation (P-21) |
| `decimal_models` | decimals | DE-1 to DE-3 | GAP-5-09; tenths strip and hundred grid |
| `decimal_read_write` | decimals | DE-4 | GAP-5-09; word form and the placeholder zero |
| `decimal_lookalikes` | decimals | DE-5 | DE-03; 0.3 / 0.03 / 0.30 |
| `sub_decimal_zeros` | decimals | DE-11z | owner ruling: its own sub-ladder |
| `div_decimal_by_decimal` | decimals | DE-13b | split of `div_decimal` |
| `ratio_for_every` | conversions | PC-R1 | token picture to sentence frame |
| `ratio_simplify` | conversions | PC-R5c | split of `equiv_ratios` |
| `shade_percent_grid` | conversions | PC-P1b | split of `percent_visual`'s broken `shade` type |

## Questions the missing reference-site research must answer

There is no research file for this family yet. It must settle: (1) how the instruction is worded when simplest form is wanted (whether the counted fraction is accepted is ruled: it is, unless the instruction asks otherwise); (2) how a printed hundred grid marks full tenth-columns (one block or ten cells) and how "shade the grid" items are laid out; (3) the standard printed place-value grid for comparing and adding decimals — column heads, point column, whether the filler zeros are pre-printed; (4) how dual-labelled fraction / decimal number lines are drawn at grades 4-5; (5) the usual distractor set for equivalent-fraction select-all items; (6) how ratio tables are presented at grade 6 (row names, ×n arcs, where the missing cell sits); (7) whether percent-of-a-number pages use a ten-part bar, a double number line, or both, and at which step; (8) the standard order of the four comparison strategies for fractions (unit, same denominator, same numerator, benchmark); (9) how mixed-number and improper-fraction pages present the two forms without printing both frames on a practice item; (10) print conventions for a unit rate answer (does the unit word print, or is it written?).

## Questions for the owner

1. **The `mixed_` prefix hijack.** `generate-question.js:206` turns any id beginning with `mixed_` into a category-wide random pool, which silently disables `fractions:mixed_improper_visual` and `fractions:mixed_nl_drag`. Recommendation: add a `_realMixedSkills` exception set beside the existing `_realAllSkills` set at :226 and list those two ids. Ids and positions are untouched, so share codes are safe; what changes is that the two codes finally produce their own items. Other families may hold more `mixed_*` casualties and should check.
2. **RULED (owner, 2026-09-19): any equivalent fraction is accepted unless the instruction asks for simplest form.** The model answer is always the counted or converted fraction; simplest form is required only where the instruction string is `simplest-form`, and every equivalent is marked right everywhere else (`PEDAGOGY_STANDARD.md` P-LG-15). So the silent requirement goes from `identify`, `identify_nv`, `d_to_f` and `percent_visual`, the silent prohibition goes from `write_fraction`, and `identify` may no longer offer the equivalent unsimplified fraction as a wrong option — a distractor is never an equivalent of the key.
3. **Denominator caps.** `maxDenominatorForGrade` exists (`gen-fractions.js:65-71`) but most blocks pick from hard-coded pools and bypass it: `compare` reaches 12 at grade 4, `select_equiv_frac` reaches 40, `f_to_p` mixes twentieths and hundredths. Recommendation: route every denominator through `_capDen` and expose "largest denominator" as a section option, separate from Max Number.
4. **`fraction_bar_ops`.** It sits in `fractions` but adds and subtracts like and unlike fractions, which is the fraction-operations family's FO-01 / FO-04. Recommendation: keep the id where it is (share codes), list it under `fraction_operations` in the navigator and ladders, and let that family's review own its variants.
5. **Flashcards for conversions.** The six notation-conversion skills (`f_to_d`, `d_to_f`, `f_to_p`, `p_to_f`, `d_to_p`, `p_to_d`) are recall pairs and a cut-out flashcard set is standard classroom practice, but nothing in this family is fact-like in the `footprint.factLike` sense. Recommendation: grant the `flashcards` tag to those six (as in the overrides file) and leave the fact-layout roles closed to the whole family.
6. **Trailing zeros in decimal answers.** `round_thousandths` answers "1.0" where a pupil writes "1"; `div_decimal` strips trailing zeros from its own answer (:7459) while `round_decimals` keeps them. Recommendation: accept both forms everywhere, print the key with the trailing zero when the target place demands it ("1.0" to the nearest tenth), and say so in the answer-key rules.
7. **Max Number and decimals.** `state.range` only switches the whole part between 0-9 and 0-99, and is ignored entirely by fractions and conversions. Recommendation: let Max Number drive the whole-number part of every decimal skill and the set size in `fraction_of_set`, and leave denominators to the new per-section option from question 3.
8. **Story names and money.** Ratio and unit-rate stories use first names and `$` amounts. The design standard's generic-coin rule is about money art, not written amounts. Recommendation: keep first names (one per story, from `pickName`), keep written dollar amounts, and hold one story shape per section so the reading load is fixed.
9. **Grade tags to correct.** `fraction_bar_ops` is tagged 3 but generates unlike denominators (4.NF / 5.NF); `f_to_p` and `p_to_f` are tagged 6 but are 5-6 content; `compare_decimal` is tagged 4 and `compare_thousandths` 5, which is right, but they share one generator path. Recommendation: correct them in this family's migration; grade tags drive filters and the footer only, so share codes are unaffected.
