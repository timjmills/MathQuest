# Critic r2: HINT-NO-BLANK (lf-placevalue), narrow critic

- Branch `claude/lf-placevalue-hint-no-blank` @ e5b588f12 (worktree /home/user/mq-hint). Master e487f8f9a was in a scratch worktree, now removed.
- Critic: independent, Opus medium, 2026-11-20. Screen help only: the "Here is how" box after 3 wrong answers, the Say line, the hint
  popup and the status line. Show Solution may give the answer.
- Evidence:
  - fresh `ws-hint-shots` renders of the 14 graded skills at 1280 and 820, seeds 3 and 29 (card, hint and solution PNGs, plus a text dump);
  - a master dump of 7 of those skills for comparison;
  - 10 random skills (deterministic LCG pick from `SKILLS`) plus `measurement:capacity`, through `ws-hint-no-blank --verbose`
    and `ws-hint-shots` (1280 and 820).
- Renders are in the session scratchpad and were not committed.
- `ws-hint-shots` deals a different item per width. For example, round_nl_ten_thousands showed 67,023 at 1280 and 86,068 at 820.
  The items graded are named below; "s3" or "s29" is the shots seed at 1280.

## Verdict: FAIL

Of the 8 round-1 skills, 7 now pass. digit_value_unit_form passes as the named exception. Six of the round-1 findings are closed:
F1, F2, F3 (on the 3 skills), F5, F6, F7 and F8.

Three graded skills still give the answer on screen:
- placevalue:expanded_notation: every part of the answer is written out.
- number_theory:factors_identify: a missing factor is shown.
- fraction_operations:sub_frac_unlike: the hint popup states the answer.

vocabulary:vocab_grade_6_measurement has help that does not teach.

The random sample found one lane regression (a fractions:compare Say line in the wrong order) and two more skills with the same leak or
orphan steps. Four findings are in the SAME CLASS as round-1 findings (F3, F4, F9, F10). This is round 2 of the cap, so rule 4 applies:
stop, root-cause, add a machine check, then one more round.

## Scores (C1 ease of use, C2 educational value, C3 spacing and layout, C4 standard fidelity, S8 included)

| Skill (item graded) | R1 finding | C1 | C2 | C3 | C4 | Evidence |
|---|---|---|---|---|---|---|
| addition:add_facts (7+3, 4+7) | F9 closed | 9 | 9 | 9 | 9 | "Start with 7. / Make 10: 7 + 3 = 10. / 4 is 3 and 1. / Now work out 10 + 1." No gap and no answer. Say "4 plus 7 equals ___." with Listen. |
| subtraction:sub_facts (10−7, 11−7) | F1, F3 closed | 8 | 8 | 9 | 8 | "Think addition: 7 plus what number makes 10?" asks the gap in words. The hint is now "which number plus 7 makes 10?", with no answer. The step "So 10 − 7." is still a bare repeat (R2-8, minor). |
| division:div_facts (99÷9, 108÷9) | F2, F3 closed | 9 | 8 | 9 | 9 | "Read the division: 99 ÷ 9. / Think: 9 times what number makes 99?" No blank. The hint no longer states 11. The help is short but correct. |
| addition:add_wp_20 (13+6, 4+1) | F9 closed | 9 | 8 | 8 | 8 | The repeated "16 + 2." step is gone, and the help ends "Write 13 + 6 in the boxes." F12 (46 px boxes at 820) is not this lane's. |
| placevalue:identify (8→H, 2→T) | F5, F6 closed | 9 | 8 | 9 | 9 | "Read the letter above it: H. / Find the place name that starts with H." Say "The 8 is in the ___ place." with Listen. |
| placevalue:digit_value_unit_form | F-R ruled | 9 | 8 | 9 | 9 | The named S8 exception. "8 hundreds is 800." and Say "The 8 is worth 8 hundreds." are not marked down. |
| area_perimeter:area_triangle (b9 h4; s29) | F3, F7, F8 closed | 8 | 8 | 8 | 8 | The box is shown: "Area of a triangle = (base × height) ÷ 2 = (9 × 4) ÷ 2. Multiply 9 × 4, then halve it." The hint is the same and has no answer. There is no Say line, but Listen is there. The status line matches. The box repeats the hint word for word. |
| composing:teen_compose (18, 11) | — | 9 | 9 | 8 | 9 | "The full frame is 10. / Now: write the missing number." Say "10 and ___ make 11." |
| **number_theory:factors_identify** (80; 56; 12) | F4 partly | 6 | 5 | 8 | 5 | For 80, the box beside 1 is blank and the help shows "1 × 80 = 80": it gives that missing factor (R2-1). For 12 the help shows "1 × 12 = 12", the same leak. For 56 the help starts with a lone "Factor pairs:" heading with nothing under it (R2-2). |
| **fraction_operations:sub_frac_unlike** (s29 7/12 − 1/2; s3 multi-select) | F10 closed | 7 | 6 | 8 | 5 | The steps and Say are good: "Now: subtract the numerators. Simplify." and Say "7/12 minus 1/2 is ___.". The HINT popup says "Subtract: 7/12 − 6/12 = 1/12. Simplify." and gives the answer (R2-4). It is pinned, not fixed. |
| number_sense:place_on_number_line (83, 13) | F11 closed | 9 | 9 | 9 | 9 | Say "83 is here."; the steps "83 is 3 jumps from 80. / Mark 83." name only the given value. |
| **vocabulary:vocab_grade_6_measurement** (MC "Unit Conversion"; match) | F13 closed | 8 | 6 | 8 | 7 | "Answer: …" and "[object Object]" are gone. What is left is the generic hint as the only step: "Think about how "Unit Conversion" is used in math." / "Read each carefully and find what fits." (a noun is missing). It does not teach (R2-7). |
| number_sense:round_sort_10 | F14 closed | 9 | 8 | 9 | 9 | "Halfway between 80 and 90 is 85. Halfway rounds up. / Write each number in its column." |
| **placevalue:expanded_notation** (741, 570) | new (brief b) | 6 | 3 | 8 | 3 | "The 7 is in the hundreds place: 7 × 100. / … 4 × 10. / … 1 × 1. / So 741." Every box's value is written out, and the status line says "Finish it". This is a leak, and "So 741." is a stub (R2-3). |

Layout, every card seen (1280 and 820):
- No help box is shown without Listen.
- No status line says "Here is how" over a hidden box. `messageFor` gives "Not yet. Try again." when there are no steps, and the
  gate's HELP-EMPTY-HIDDEN found no box on 1 hidden-box card (capacity).
- expanded_notation at 1280: the box sits about 5 px under the bottom row of answer boxes. It is tight but does not overlap.

## Judging points

- **(a) factors_identify:** Yes, this gives part of the answer away. "1 × 80 = 80" fills the blank beside 1. The gate misses it
  because 80 is in the question text ("factors of 80"), and the given-value exemption removes it from the answer tokens. The row
  "2 × 40 = 80" only repeats a row the card already shows, so it adds nothing. The help is a leak, and what is left is noise. Master
  showed only the hint ("divide 80 by it to find the other"), which teaches. That hint should be the help.
- **(b) expanded_notation:** This is a leak, not a stub. Steps 1–3 write each part of the answer ("7 × 100", "4 × 10", "1 × 1"), and
  each of the three boxes takes the digit shown there. "So 741." then teaches nothing: it restates the question. Master leaked the
  same way, so the leak is not new, but this is lf-placevalue's own skill and S8 applies. A non-giving form: "Read the letters above
  the digits: H T O. / The hundreds digit goes in the box before × 100. / Do the same for tens and ones."
- **(c) closing steps:**
  - "Now: write the missing number." (teen_compose) is understandable.
  - "Now: subtract the numerators. Simplify." (sub_frac_unlike) is understandable.
  - "Now: write how many are left." (sub_facts) is understandable.
  - "Now work out 10 + 1." (add_facts) reads naturally.
  - The "Now: x" colon form is stilted. "Now write the missing number." is plainer for ELL readers. This is cosmetic and not scored.
  - sub_facts still keeps "So 10 − 7." just before the closing step. It is a bare repeat of the question (R2-8).

## Findings

| Id | Skill | Exact string | Why | Class |
|---|---|---|---|---|
| R2-1 | number_theory:factors_identify | "Factor pairs: / 1 × 80 = 80 / 2 × 40 = 80" (answer "80, 4, 5, 8"); "1 × 12 = 12" (answer "12, 6, 3") | A missing factor is shown. `workedStepsFor` removes every token found in the question text from the answer tokens. For a list answer, an element that equals the given number (n itself, the partner of 1) is then never cut. | NEW CLASS: the given-value exemption hides an answer element (F4 was about list splitting) |
| R2-2 | number_theory:factors_identify (56) | "1. Factor pairs:" followed directly by the hint | A heading left with no rows under it after the cut. Nonsense after a cut. | SAME CLASS as F9 |
| R2-3 | placevalue:expanded_notation; also algebra:combine_like_terms (sample) | "The 7 is in the hundreds place: 7 × 100." … "So 741."; "Combine the x-terms: 3x + 9x = 12x. The constant 8 stays." (answer "12x + 8") | An expression answer is cut only when it appears whole. Its terms, which are what the boxes ask for, pass through. Both skills were the same on master; neither is lane-caused, but expanded_notation is this lane's skill. | SAME CLASS as F4 (an element of a compound answer is stated) |
| R2-4 | fraction_operations:sub_frac_unlike (and the 168 HINT-LEAK pins) | HINT "Find LCD = 12. Convert: … Subtract: 7/12 − 6/12 = 1/12. Simplify." | The hint popup states the answer, which owner rule S8 forbids. The lane pinned 168 skills to other lanes instead of fixing them, and one of them is a graded skill. | SAME CLASS as F3 |
| R2-5 | fractions:compare (sample) | Say "1/4 is 1/2 ___." (master "___ is ___ ___.") | Nonsense, caused by this lane. The option-3 fallback in `sayFor` puts the given values into the first gaps in order. That works only when the answer is the LAST gap, and here the answer (the comparison) is the middle gap. It should read "1/4 is ___ 1/2." | SAME CLASS as F10 |
| R2-6 | area_perimeter:volume_missing_edge; number_sense:round_nl_ten_thousands (sample) | "How many times does 10 go into 40? / Subtract: 40 - 40 = 0"; "Is it before or after the halfway point, 85,000? Halfway rounds up." | Orphan steps left after the cut. "10" is never explained (5 × 2), and "40 − 40 = 0" means nothing to a pupil. "it" has nothing to refer to, because the step "86,068 is between 80,000 and 90,000" was cut whole for naming 90,000. HELP-THIN passes the volume help because "Subtract" counts as an action verb. | SAME CLASS as F9 / F5 |
| R2-7 | vocabulary:vocab_grade_6_measurement | "Think about how "Unit Conversion" is used in math." · "Read each carefully and find what fits." | Help that does not teach: the generic hint is the only step. Owner lf-vocab. Before this change it showed "Answer: …". | SAME CLASS as F5 |
| R2-8 | subtraction:sub_facts | "2. So 10 − 7." | A bare repeat of the question. BARE-STEP misses it because of the leading "So". Minor, and not what fails the verdict. | SAME CLASS as F9 |
| R2-9 | ws-hint-shots (tool) | round_nl_ten_thousands s3: 67,023 at 1280, 86,068 at 820 | The dump is taken at the first width only, so the PNG at the other width can show a different item. A critic can grade text that the image does not show. | Tool |

Out of scope, noted for the owner lanes:
- vocab tiles at 1280: "measurement" spills out of its tile.
- vocab match at 820: the word cards break mid-word ("Conver / sion", "Formul / a").
- F12, the 44 px chrome buttons (lf-hosts).

## Automatic checks that would catch each finding

| Finding | Check |
|---|---|
| R2-1 | STEPS-LEAK on list answers: do not apply the given-value exemption to an element of `q.ans`. Also, if a shown step "a × b = n" has a or b equal to a missing list element, FAIL. Backtest: factors_identify 80, 12. |
| R2-2 | DANGLING-HEAD: a shown step that ends with ":" and is not followed by a step that continues it FAILS. |
| R2-3 | `answerTokens`: split an expression answer into its top-level terms ("7 × 100", "4 × 10", "12x", "8"). For expanded form, also add each "d × place" and each digit next to its place. STEPS-LEAK then FAILS expanded_notation and combine_like_terms. |
| R2-4 | A skill under critic may not be on the HINT-LEAK pin, and a graded-skill list run with `--strict-pins` FAILS any pinned skill. The pin list also needs an owner date (it is 168 skills wide). |
| R2-5 | SAY-ORDER: fill the frame by position only when the provider marks the last gap as the answer. Otherwise the fill must equal `sayFill(q)` with only the answer gapped, or no Say line is shown. Backtest: fractions:compare "1/4 is 1/2 ___.". |
| R2-6 | ORPHAN: a shown step may not name a number that is in neither the question nor an earlier shown step ("10" in volume_missing_edge). The first shown step may not open with a pronoun ("It", "Is it"). A step whose only content is "x − x = 0" FAILS. |
| R2-7 | HELP-GENERIC: the only shown step equals q.hint, and q.hint is the same string for every item of the skill ("Read each carefully …"). Pin it to its owner lane. |
| R2-8 | BARE-STEP: allow a leading connective: `^(So|Then|Now)?\s*[\d\s+−×÷().=]+\.$`. |
| R2-9 | ws-hint-shots: dump at every width, and shoot from the same dealt item (re-use `q` across widths), or log the item per PNG. |

## Speed notes (reflection cycle)

- Four of the round-2 findings are in classes round 1 already named (F3, F4, F9, F10). The same root cause sits under all of them.
  "No answer" help is made by CUTTING the answer out of steps that were written to state it, and the cut is driven by answer tokens
  that cannot see compound answers, given-equal answers, or the order of a sentence. Each fix adds another token rule, and the next
  sample finds the next shape.
  - Root-cause recommendation: help that has been cut must earn its place. Where the cut changes a provider's steps by more than
    dropping the final answer sentence, show the skill's own non-giving `screenHelp` (written once per skill) or the clean hint.
    Never show the remains of a cut. This is the round-cap stop, before round 3.
- 168 HINT-LEAK pins mean that S8 on the hint popup is unmet across a quarter of the app. One of the graded skills was among them.
  The lead should decide whether pinned leaks may ship.
