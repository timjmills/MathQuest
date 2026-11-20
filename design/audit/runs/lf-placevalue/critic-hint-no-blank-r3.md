# Critic r3: HINT-NO-BLANK (lf-placevalue) + expand online worksheet at 1024, narrow critic

- Critic: independent, Opus medium, 2026-11-20. Screen only (print is proven identical).
- Change 1: `claude/lf-placevalue-hint-r3` @ 4fadf6e5b (worktree /home/user/mq-hint3), with lead ruling A12. Skills that have
  screenHelp, and every placevalue skill, use the r3 choice rule. Every other skill keeps master's r2 help.
- Change 2: `claude/lf-placevalue-expand-2col` @ 3aae740fb (worktree /home/user/mq-exp2).
- Evidence:
  - fresh `ws-hint-shots` renders at 1280 and 820, seeds 3 and 29, for the 10 graded skills; seed 3 for the 5 random screenHelp
    skills. Each render has card, hint and solution PNGs plus a text dump, and both widths now show the same item (R2-9 closed);
  - a fill test of the expand worksheet at 960, 1024 and 1280 (parts typed in, input scroll width measured);
  - a pixel diff of the builder's before and after PNGs.
- Renders are in the session scratchpad and were not committed. I made no worktree.
- Random sample: 5 of the 28 screenHelp skills, drawn with Python `random.seed(20261120)`:
  - round_sort_10, round_sort_100000, round_sort_1000;
  - round_nl_thousands;
  - nearest_10000.
- My extra pick: number_sense:compensation.

## Verdict: FAIL (change 1) · PASS (change 2)

**The r3 choice rule works.** Every placevalue and screenHelp help box I saw has no blank and states no answer, and almost
all of them teach.

- R2-3 (expanded_notation leak) is closed.
- R2-6 (round_nl orphan) is closed.
- R2-9 (the tool dealt a different item per width) is closed.
- add_facts and sub_facts keep their r2 steps word for word.

**What fails change 1:**
1. **R3-1, factors_identify:** R2-1 is still open. "1 × 30 = 30" fills the blank beside 1. Under A12 this skill keeps master's
   leaking r2 help, so the S8 leak ships.
2. **R3-3 and R3-4, Show Solution on the lane's own skills:**
   - round_sort_* shows "Answer: [object Object]".
   - expand, expanded_notation and round_nl_* show a garbled "Problem:" line.

   Show Solution may give the answer, but it may not misstate the problem or print nonsense.
3. **R3-2, compensation:** the help ends without telling the pupil what to do. It falls below the "teaches" bar (C2 7).

## Scores, change 1 (C1 ease of use, C2 educational value, C3 spacing and layout, C4 standard fidelity, S8 included)

Help = the card box after 3 wrong answers + Say + hint popup. Sol = Show Solution. Both widths gave the same item, and the layout
was the same at 1280 and 820 unless noted.

| Skill (items) | Host | C1 | C2 | C3 | C4 | Evidence |
|---|---|---|---|---|---|---|
| placevalue:expanded_notation (673, 510) | Help | 9 | 9 | 8 | 9 | "Read 673 from the left: hundreds, tens and ones. / The hundreds digit goes in the box before × 100. / Do the same for each place. Type each digit in its box." No part of the answer is written (R2-3 closed). Say "I read 673 from the left: hundreds, tens, ones." with Listen. At 1280 the box sits close under the second row of boxes but does not overlap. |
| | **Sol** | 7 | 7 | 8 | 6 | "Problem: 510 × 100 + ? × 10 + ___ × 1". The "=" and the first box are lost, so it is a different expression (R3-4). |
| placevalue:identify (1→tens) | Help + Sol | 9 | 9 | 9 | 9 | "Find the underlined digit: 1. / Read the letter above it: T. / Find the place name that starts with T." Say "The 1 is in the ___ place." |
| placevalue:expand (673, 510) | Help | 9 | 9 | 9 | 9 | "The hundreds digit is worth hundreds: write it with two zeros after it. / Do the same for each digit. A 0 digit makes a part of 0. Write the parts, biggest first." It teaches the 0-part edge case. |
| | **Sol** | 7 | 7 | 8 | 6 | "Problem: 673 + ? + ___" (R3-4). |
| placevalue:compare (707 < 886, 194 < 402) | Help + Sol | 9 | 9 | 9 | 9 | "Count the digits … More digits is bigger. / Same number of digits: look from the left for the first digit that is different. / The bigger digit makes the bigger number. Now write the sign in the box." Say "707 is ___ 886." (correct order). The hint popup has no answer. Sol "Compare: 707 ? 886" is acceptable. |
| number_sense:make_a_ten (9+6, 7+4) | Help + Sol | 9 | 9 | 9 | 9 | "Start with 9. 9 + 1 = 10. / Take 1 from 6: 6 − 1 = 5. / Now add 10 + 5." The answer 15 is not stated, and the box agrees with the card's split. Sol gives 15 (allowed). |
| number_sense:round_nl_ten_thousands (81,559; 44,394) | Help | 9 | 9 | 9 | 9 | "Put a dot for 81,559 on the line. / Find the halfway point between the two ends. / Is 81,559 before or after halfway? Before: round down. Halfway or after: round up." No orphan "it", and nothing names the answer end (R2-6 closed). |
| | **Sol** | 7 | 8 | 8 | 7 | "Problem: Tap the line to mark 81,559: ? Round it to the nearest 10,000: ___". A "?" and a "___" are mixed in one line (R3-4). |
| **number_theory:factors_identify** (72; 30) | Help | 6 | 5 | 8 | 5 | For 30 (answer "30, 15, 3, 5"): "1. Factor pairs: / 2. 1 × 30 = 30 / 3. Each row is a factor pair …", and the card's box beside 1 is empty. This is R2-1 unchanged. "Factor pairs:" is a heading with one row under it, a leftover of the cut (the R2-2 class). |
| addition:add_facts (9+7, 2+7) | Help | 9 | 9 | 9 | 9 | Its own r2 steps are kept: "Start with 9. / Make 10: 9 + 1 = 10. / 7 is 1 and 6. / Now work out 10 + 6."; "Start with 7. / Count on 2: 8, …". |
| subtraction:sub_facts (16−7, 9−7) | Help | 8 | 8 | 9 | 8 | Its r2 steps are kept: "Think addition: 7 plus what number makes 16? / So 16 − 7. / Now: type how many are left." R2-8 "So 16 − 7." remains (minor; not a fail). Sol shows the column method ("Borrow from next column when top < bottom") for a fact. This is on master and is noted, not scored (R3-6). |
| number_sense:compensation (47+6, 29+14) | Help | 8 | 7 | 9 | 8 | **R3-2**: the box shows the skill's own steps with the final sentence cut: "1. Add 3 to 47 to make 50. Subtract 3 from 6 to get 3." There is no step that says what to do next. The good screenHelp route ("… Now add 50 + 3.") is not used, and the hint popup ("Make 47 into 50 … Then add.") differs from the box. |

### Random sample (screenHelp skills, seed 3, 1280 and 820)

| Skill | Host | C1 | C2 | C3 | C4 | Evidence |
|---|---|---|---|---|---|---|
| round_sort_10 / _1000 / _100000 | Help | 9 | 8 | 9 | 9 | "Halfway between 800,000 and 900,000 is 850,000. / Less than 850,000: it rounds down. 850,000 or more: it rounds up. / Drag each number to the column it rounds to." It teaches the halfway tile 850,000 by the rule. There is no Say line, but Listen is present. |
| | **Sol** | 4 | 3 | 8 | 3 | **R3-3**: "Answer: [object Object]" on all three. |
| round_nl_thousands (8,155) | Help | 9 | 9 | 9 | 9 | The same route as ten_thousands. Sol has the same mixed "?" and "___" line (R3-4). |
| nearest_10000 (73,609) | Help + Sol | 8 | 9 | 9 | 8 | "Find the ten thousands digit of 73,609. / Look at the digit just after it: 3. / Five or more: round up. Four or less: round down. Now write the rounded number." **R3-5 (minor)**: the card's scaffold in the same view says "4 or less → keep it", but the box says "round down", so the card uses two rules for one idea. The hint says "the cut line", which the card does not draw. |

Layout, every card seen at 1280 and 820:
- no overflow;
- every box has Listen;
- the status line "Here is how. Finish it, then try again." always sits over a shown box.

## Change 2: expand online worksheet at 1024

| Host | C1 | C2 | C3 | C4 | Evidence |
|---|---|---|---|---|---|
| Expand worksheet @1024 | 9 | 9 | 8 | 9 | There are 2 columns (before: 1 column with a wide empty band). Each sentence is on one line. Boxes are 78 × 74 (touch ≥ 48). The input font is 29 px at 1024 and at 1280, and the bold sentence numeral looks the same size before and after. Fill test: 100, 300, 70, 0 and 932 typed in at 1024 all fit with no clipping (`scrollWidth ≤ clientWidth`). With the focus ring on, "100" sits close to the left border, which is tight but readable. |
| 820 / 1280 / 1366 | 9 | 9 | 9 | 9 | Unchanged. The rule is scoped `@media (min-width:960px) and (max-width:1279px)`. A side-by-side look at the before and after PNGs is identical (the pixel diffs are the animated background). The fill test at 1280 gives 101 px boxes, as before. |

Note: at 960 to about 1000 px the grid is still 1 column, but the boxes narrow to 78 px. This is harmless, but the narrowing does
nothing there. If you want, start the media query at about 1000 px. Not scored.

## Findings

| Id | Skill | Exact string | Why | Automatic check | Class |
|---|---|---|---|---|---|
| R3-1 | number_theory:factors_identify | "1 × 30 = 30" (answer "30, 15, 3, 5", box beside 1 empty); "Factor pairs:" heading | S8 leak: a missing factor is shown. A12 keeps master's r2 help for skills without screenHelp, so this pinned STEPS-LEAK ships. The skill is on the "107 routed" list in spirit, but it is not on that list as printed. | The R2-1 check (no given-value exemption for a list-answer element) run **unpinned** on any skill named in a critic brief: `ws-hint-no-blank --skills <graded> --strict-pins`. Or: A12 sends a skill with a pinned STEPS-LEAK to "clean hint" rather than "keep r2". | SAME as R2-1 (and R2-2) |
| R3-2 | number_sense:compensation | "1. Add 3 to 47 to make 50. Subtract 3 from 6 to get 3." (no further step) | The choice rule's first branch, "own steps if only the final sentence is cut", won over the skill's better screenHelp. The cut left help whose last step does not say what to do. | ENDS-WITH-ACTION: the last shown step must contain an imperative from the action list (add, write, type, drag, find, now …). Prefer screenHelp whenever the skill has it and the cut steps fail ENDS-WITH-ACTION. Backtest: compensation 47+6. | SAME class as F9 / R2-6 (remains of a cut that do not teach) |
| R3-3 | number_sense:round_sort_10, _1000, _100000 (likely every round_sort_*) | Show Solution "Answer: [object Object]" | Nonsense on screen. The sort answer is an object `{t0: 'bin_1', …}`, and `generateSolutionSteps` prints it raw. | SOL-OBJECT: scan `generateSolutionSteps(q)` text for `[object ` on every skill and seed (ws-hint-no-blank already calls it). | SAME as r1 F13 ("[object Object]"), on a new host |
| R3-4 | placevalue:expand, placevalue:expanded_notation, number_sense:round_nl_* | "Problem: 673 + ? + ___"; "Problem: 510 × 100 + ? × 10 + ___ × 1"; "… mark 81,559: ? Round it … 10,000: ___" | Show Solution misstates the problem. The generic fallback (`solution-display.js:894`, `q.text.replace(' = ___','').replace('___','?')`) cuts "= ___" and only the first blank. It is on master, not caused by r3, but these are lane skills. The gate's named exemption for the SOL "Problem:" line lets it through. | SOL-PROBLEM: the Problem line must equal the question with every blank shown the same way (all "?" or the "___" glyph), and it may not lose the "=" (count "=" in q.text vs the line). Drop the Problem-line exemption. | NEW (a blind spot of the r1 gate's exemption) |
| R3-5 | number_sense:nearest_10000 (likely nearest_*) | box "Four or less: round down." vs card scaffold "4 or less → keep it."; hint "the cut line" | Two words for one rule on one card. "Cut line" names nothing drawn. ELL load; minor, not failing. | TERM-MATCH: the help's rounding rule wording must match the card's scaffold strings from the same provider. | NEW (minor) |
| R3-6 | subtraction:sub_facts | Sol "Line up by place value / … Borrow from next column when top < bottom" for 16 − 7 | The column method shown for a single fact. Pre-existing on master, outside A12's lane scope. Noted for lf-ops. | SOL-FIT: no column-method steps when both operands are below 20. | Out of scope |
| R2-8 | subtraction:sub_facts | "2. So 16 − 7." | Still a bare repeat. Kept on purpose by the r2-keep ruling; minor. | BARE-STEP with leading connective (r2 table). | SAME as R2-8 |

## Speed notes (reflection cycle)

- The A12 guard did what it was for: no regression on add_facts or sub_facts. But it moved the R2-1 leak from "to fix" to
  "kept". A ruling that keeps old help should still exclude help that a check already flags as a leak. Otherwise round 4 finds
  the same item again.
- Show Solution was in the r2 brief but was not graded in r2. Both new Show Solution findings (R3-3, R3-4) are cheap string scans
  over `generateSolutionSteps` that the existing sweep already calls. Add them, and drop the Problem-line exemption, before the
  next critic.
- Branch order in the choice rule: when a skill has screenHelp, prefer it over "own steps minus the final sentence" unless the
  own steps pass an ENDS-WITH-ACTION check. compensation is the backtest.
