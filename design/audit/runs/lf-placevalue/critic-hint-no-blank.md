# Critic: HINT-NO-BLANK option 3 (lf-placevalue), narrow critic

- Branch `claude/lf-placevalue-hint-no-blank` @ 5c76b9458 (worktree /home/user/mq-hint), compared with master 65c28ccdf (scratch worktree).
- Critic: independent, Opus medium, 2026-11-20. Screen help only: the practice card after 3 wrong answers, the hint, Show Solution.
- Evidence: `ws-hint-shots --dump` on both trees, seeds 3, 7, 11 for the 8 skills; the lane's PNGs at 1280 and 820 (spot-checked:
  identify-820 card, div_facts-820 card, sub_facts-1280 hint, area_triangle-820 hint, teen_compose-820 card); a DOM measure at
  820 and 1280 (box size, overflow, overlap with inputs, target sizes, horizontal scroll); 15 sampled skills x 2 seeds on both
  trees; the full `ws-hint-no-blank` sweep (OK: 734 skills, 2936 items, 0 blanks, pins 28 / 131, 0 boxes shown on empty help).

## Verdict: FAIL

Three of the eight skills have help that still shows a gap or gives the answer: sub_facts, div_facts and area_triangle. A fourth,
placevalue:identify, now has help that does not teach. Two regressions turned up in the random sample: factors_identify steps now
give the answer, and sub_frac_unlike has a nonsense Say line. The gate reports OK on every one of these, because of the blind
spots listed under "Automatic checks".

## Scores (C1 ease of use, C2 educational value, C3 spacing and layout, C4 standard fidelity)

| Skill | C1 | C2 | C3 | C4 | Evidence |
|---|---|---|---|---|---|
| addition:add_facts | 8 | 8 | 9 | 8 | No gaps. Steps "Start with 8. / Make 10: 8 + 2 = 10. / 7 is 2 and 5. / 10 + 5." lead to the answer without stating it. "Count on 3: 8, 9, …" is a clean cut. The bare "10 + 5." step is weak (F9). The Say line is filled with the given numbers. |
| subtraction:sub_facts | 7 | 4 | 9 | 7 | Step 1 "Think addition: 7 + ? = 10." keeps a "?" gap that nothing on screen fills (F1). The hint "Or think: 3 + 7 = 10" states the answer 3 (F3). "So 10 − 7." just repeats the question. |
| division:div_facts | 7 | 4 | 9 | 7 | Step 2 "Write the times fact with a gap: 9 × __ = 99." shows a "__" blank (F2). The hint "Think: 9 × ? = 99. Use the multiplication fact: 9 × 11 = 99" has a "?" gap and states the answer 11 (F3). |
| addition:add_wp_20 | 7 | 8 | 8 | 8 | No gaps and no answer. The Say line got better: "The answer is ___ books." (master: "___ ___"). The last step "16 + 2." repeats step 3, "Write 16 + 2 in the boxes." (F9). At 820 px the answer boxes are 77×46, under 48 (F12, not from this lane). |
| placevalue:identify | 7 | 5 | 9 | 8 | Steps end at "The letter above it is H." Master's "H means ___" was the teaching step, and it was cut. Nothing now tells the pupil how to read the letter, so the help points but does not teach (F5). The Say line is gone: master had "The ___ is in the ___ place.", and option 3 could have filled it as "The 8 is in the ___ place." With no Say line the box loses its Listen button, so the steps cannot be heard (F6). |
| placevalue:digit_value_unit_form | 9 | 8* | 9 | 9 | Byte-identical to master (dumps match). *Scored under the lead ruling. The help states the answer: "It is in the hundreds place. 8 hundreds is 800." and Say "The 8 is worth 8 hundreds." for the answer "8 hundreds" (F-R). |
| area_perimeter:area_triangle | 6 | 3 | 8 | 7 | The box is hidden. The hint, which is now the only help, reads "… = (9 × 4) ÷ 2 = 36 ÷ 2 = 18 square units." and gives the answer (F3). The box is hidden only because of a cutter bug: the step could be cut to "(9 × 4) ÷ 2 = 36 ÷ 2." (F7). The status line still says "Here is how. Finish it, then try again." with no box on the card (F8). |
| composing:teen_compose | 9 | 9 | 8 | 9 | Say is filled: "10 and ___ make 18." / "10 and 2 make ___." (master: "10 and ___ make ___."). Steps "Count the ones: 1, 2." and "Count the ones: say one number for each one." are sensible. At 820 the box sits about 2 px under the equation row: tight, but no overlap. |

Layout, every skill (DOM, 820 and 1280): the box is 560 px wide, no horizontal overflow, no overlap with any input or choice, and
no horizontal page scroll. Listen is 67×44, Hint 83×44, Read 89×44: these meet SP-10's 44 for chrome but not the 48 the brief
asks for (F12). Answer boxes are 58–75 px tall except add_wp_20 at 820 (46 px).

## Findings

| Id | Skill | Exact string | Why it fails | Lane-caused? |
|---|---|---|---|---|
| F1 | subtraction:sub_facts | STEPS 1: "Think addition: 7 + ? = 10." | A "?" gap stays on screen. The line that filled it ("7 + ___ = 15." and then "So 15 − 7 = ___.") is now left out, so nothing in the help fills it. Judging point 1. | Yes. The gap was filled in the cut text, and the cut makes it permanent. |
| F2 | division:div_facts | STEPS 2: "Write the times fact with a gap: 9 × __ = 99." | A "__" blank is visible in the help. Judging point 1. | Yes, same cause as F1. |
| F3 | sub_facts, div_facts, area_triangle | HINT "Start at 10 and count back 7. Or think: 3 + 7 = 10" · "Use the multiplication fact: 9 × 11 = 99" · "= 36 ÷ 2 = 18 square units." | The hint states the answer. Judging point 2 and PAGE_TYPES §2.3. The lane rewrote about 40 hints and left these. | Not new, but in scope (the hint is help). On area_triangle it is now the ONLY help. |
| F4 | number_theory:factors_identify (sample) | STEPS "Factor pairs: / 1 × 40 = 40 / 2 × 20 = 40 / 4 × 10 = 40 / 5 × 8 = 40" for the answer "40, 2, 10, 8" | Every missing factor is in "Here is how". Master showed only the hint. The Show Solution fix made `generateSolutionSteps` return steps, and `workedStepsFor` falls back to them (raw.length < 2). `answerTokens` does not split a list answer, so nothing is cut. | Yes (regression) |
| F5 | placevalue:identify | STEPS end "The letter above it is H." | Correct under S8, but it stops before any teaching. A pupil who does not know H gets no route to it. A non-giving step exists, for example "Each letter is the first letter of a place name. Find the place name that starts with H." | Yes (the cut) |
| F6 | placevalue:identify (on the SAYLESS pin) | Say: (none); master "The ___ is in the ___ place." | Option 3 says to fill the given numbers. The digit (8) is given, so "The 8 is in the ___ place." was possible. Dropping the Say line also drops the Listen button, so an ELL pupil cannot hear the steps. | Yes |
| F7 | area_perimeter:area_triangle (and probably other EMPTY_PIN area and measurement skills) | master step "… = 36 ÷ 2 = ___ square units." | `cutAtAnswer` allows only ONE unit word after the answer (`[A-Za-z°%¢$]*`). "18 square units." does not match, so the whole sentence is dropped and the box is empty, then hidden. With a two-word unit the cut gives "Area of a triangle = (base × height) ÷ 2 = (9 × 4) ÷ 2 = 36 ÷ 2." This is a good step. The hidden box is therefore not "nothing to teach". It is a cutter bug. | Yes |
| F8 | area_perimeter:area_triangle | Status line "Here is how. Finish it, then try again." | It points to a box that is hidden. | Yes (hiding the box did not change the status line) |
| F9 | add_facts, add_wp_20 | "10 + 5." · "16 + 2." (after "Write 16 + 2 in the boxes.") | A cut step left as a bare expression with no verb. In add_wp_20 it repeats the step before. Better: "Now add 10 + 5." or drop it when it duplicates a step. Judging point 4. | Yes (the cut) |
| F10 | fraction_operations:sub_frac_unlike s29 (sample) | Say "1 minus 4 is ___." for "Click ALL differences greater than 1/4." | Nonsense. The fraction 1/4 is split into the "given numbers" 1 and 4. Master showed "___ minus ___ is ___.". | Yes (regression) |
| F11 | number_sense:place_on_number_line (sample) | Say "___ is here." for "Tap 55 on the number line." | The gap is a given value (55), not something the pupil works out. Option 3 says to fill it: "55 is here." | Partly (the Say rule not applied) |
| F12 | all, add_wp_20 at 820 | Listen 67×44, Hint 83×44, Read 89×44; add_wp_20 answer boxes 77×46 at 820 | Under the 48 px the brief asks for. The chrome meets SP-10's 44, but the answer boxes miss RUBRIC's 48. | No (from before this lane). Recorded, not counted in this lane's verdict. |
| F13 | vocabulary:vocab_grade_6_measurement, vocab_grade_4/6 match (sample) | STEPS "Answer: Scale Drawing" · "Answer: [object Object]" | A multi-word answer is not cut, and an object answer prints "[object Object]". | No (master identical). The gate should catch it. |
| F14 | number_sense:round_sort_10 (sample) | STEPS "Rounds to 50: 53, 52. / Rounds to 60: 55, 59, 58, 57." | The step is the full sort, which is the answer. | No (master identical) |
| F-R | placevalue:digit_value_unit_form | "8 hundreds is 800." · Say "The 8 is worth 8 hundreds." | States the answer "8 hundreds". Kept byte-identical under the lead ruling and the owner fix of 2026-11-15. Not counted. The owner should confirm this skill is meant to be the one S8 exception. | Ruled |

Also seen, cosmetic: order_of_operations:cube_numbers shows "Hint: The small 3 means …" inside "Here is how". The "Hint:" label
should be stripped from a fallback step.

## Automatic checks that would have caught each finding

| Finding | Check |
|---|---|
| F1, F2 | `ws-hint-no-blank` worked-gap exemption on STEPS: accept a filling line only if the pupil SEES it (in `workedStepsFor` output). The `rawSteps` (fullWorked) clause is the hole: it accepts a fill that S8 then removes. |
| F3 | New `HINT-LEAK` / `SAY-LEAK` in ws-hint-no-blank: `statesAnswer(plain(q.hint), answerTokens(q))` (and the same for the Say line) fails unless the token is a given value. |
| F4, F13, F14 | `STEPS-LEAK`: split list and object answers into their elements (comma lists, bin maps, multi-word strings, case-insensitive) and fail if any shown step contains every element, or contains "Answer:" or "[object". |
| F5 | `HELP-THIN`: fail (or pin) when a provider skill's shown steps lose more than half of the raw steps and the remaining steps contain no instruction verb toward the answer. |
| F6 | `SAYLESS` pin entries must be re-checked against option 3: a frame whose gaps the question's `q.pv` digit fills is not "unfillable". Also assert that a shown box always has Listen. |
| F7 | Unit test of `withoutAnswer`: "= 36 ÷ 2 = 18 square units." under ['18'] gives "… = 36 ÷ 2."; also "cm²", "square feet", "cubic units". Then re-run the EMPTY_PIN list; it should shrink. |
| F8 | In HELP-EMPTY-HIDDEN, also assert that the feedback text does not say "Here is how" when no box is shown. |
| F9 | Step lint: a step that is only an expression (`^[\d\s+−×÷().]+\.$`), or that repeats an earlier step's expression, is flagged. |
| F10, F11 | Say check: every number filled into the Say line must be a whole token of `q.text` (not part of "1/4"), and a value the question gives must never be the gap. |
| F12 | ws-hint-shots DOM measure: every button in `.mq-ladder-worked` ≥ 48×48 and every answer input ≥ 48 px tall at 820. |

## Speed notes (for the reflection cycle)

- The gate's own exemptions (worked gap via `rawSteps`, the SAYLESS pin) hid F1, F2 and F6. A gate's exemption needs a backtest
  that shows it does not pass a visible gap.
- "No blank" was checked, but "no answer" was checked only on STEPS. The hint is help too: S8 must run on every help path.
