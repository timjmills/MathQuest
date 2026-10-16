# Critic round 6: Fraction key, lane adbb61b8450078736 @ d45b3e22

I am the independent critic for this round (2026-10-16, Opus 5.5). I graded fresh renders, screens and runs of
head d45b3e22 against RUBRIC.md, WORKSHEET_DESIGN_STANDARD.md, LESSONS_LEARNED.md and the owner rulings:
- Every fraction sum uses whole + fraction boxes.
- Key answers are #C2410C on black structure.
- Stretch and thinking pages are out of scope.
- mixed_composing capacity (R4-4) belongs to another lane.

I changed no code. All probes are in `r6/probes/`, all logs in `r6/`, and every PNG I cite is in `r6/print/` or
`r6/screen/`.

## Verdict: FAIL

**What passes:**
- All five r5 defects are closed: R5-1 through R5-5. I re-proved each one myself (see the table below).
- The core three skills still pass everywhere: add_fractions_like, sub_fractions_like and add_frac_unlike.
- fraction_of_set and fraction_of_set_hard pass on Independent, test, the copy and short keys, and all three
  screen hosts.

**What fails:** More Practice for both fraction_of_set skills, as the teacher actually prints it.

- **The cause (R6-1).** The builder's new "letters grow to the measured page" loop in `print-sheet.js` runs only
  when the request names **no** letters. The teacher print screen always sends `letters: ['A','B']`
  (`teacher-print.js:802`), so on the real path the loop never runs.
  - ws-print-lint sends no letters, so it lints only a grown Practice A and never sees Practice B.
  - The gate is green, but the page teachers print is not.
- **What it does to the page.** Now that kinds are dealt from the seed (R5-2), letter A's probe can be taller than
  the items a letter is dealt. So fraction_of_set Practice A and Practice B at size S:
  - leave a blank strip of 22–24 % under the grid on 3 of 15 seeds;
  - keep 6 problems where the same request without letters fits 8;
  - lay out rows of uneven height.
- **The same fault on the no-letters path.** fraction_of_set_hard at M, seed 756117108, holds 4 problems over a 23 %
  strip, so the grow loop does not catch every case even when it runs.
- This is RUBRIC H13 / lint L-DENSITY PAGEFILL, which caps C3 at 6.

**The builder's two extra changes:**
1. **fraction_of_set pictures capped at 48 counters.** Correct and harmless. The largest picture on any page I
   rendered is 8 × 6, and the keys are right.
2. **More Practice letters grow to the measured page.** This does **not** regress other skills. I checked 8 other
   skills at S, M and L, on 3 seeds each, both with and without letters:
   - add_column_multi, add_facts, number_families_add, dot_array_mult, mixed_addition, mixed_composing,
     number_families_mixed and add_fractions_like.
   - Every one gives byte-identical item counts, page counts and row heights to the parent commit f5789095
     (`r6/mp-head.log` vs `r6/mp-base.log`: the only differing lines are the two fraction_of_set skills).
   - But the loop also fixes nothing on the teacher path (R6-1).

**stackProseFractions.**
- **No false stacking.** I swept every non-mixed skill, 12 seeds each, through the function (`r6/falsestack.log`:
  662 prompts with `n/d`), and sampled time, elapsed time, money, ratio, unit-rate, percent, line-plot and
  probability skills on the live card (`r6/card-stack.log`). Every stacked token is a real fraction. No date, score,
  ratio, time or money string is touched.
- **But one new inconsistency (R6-2, minor, outside the lane skills).** On a plain prompt only an "n/d of" phrase
  stacks, so a story with two fractions shows one stacked and one slashed: "Amari ate ³⁄₁₀ of a cake. Kai ate 2/10."
  (`r6/screen/frac_word_problems-card-1280-s1954.png`).

## Gates

| Gate | Result |
|---|---|
| `ws-boot-smoke` | **OK** |
| `ws-code-snapshot` | **OK**: 608 codes, 35 categories, +36 appended, nothing moved, 1870 option round trips |
| `ws-content-audit --skill mixed_composing,add_fractions_like,sub_fractions_like,add_frac_unlike,fraction_of_set,fraction_of_set_hard` | **OK**: 0 failing, 4 notes |
| `ws-print-lint --source kit`, 5 lane skills × independent, more-practice, test and mixed-practice × `--seeds 3`, at S, M and L | **OK**: 60 + 60 + 60 documents, **0 findings**. Blind to R6-1, because it sends no letters. |
| `ws-print-lint --source kit --key-style short`, independent, more-practice and test, at S and L | **OK**: 15 + 15 documents, 0 findings |
| `ws-screen-answer --skills` (5 lane skills) | **OK**. New count-list rows: "count-list ok (3 of 6)" and "(14 of 16)". |
| `ws-chromebook-fit --skills` (5 lane skills; card, boss, race, worksheet, quiz; 1366x650 and 1280x600) | **OK** |

I ran every browser gate one at a time, in one sequential chain (`r6/gates-exit.log`: every exit code is 0).

## r5 defects re-proved

| Id | Status | Evidence |
|---|---|---|
| **R5-1**: a right but non-keyed selection is marked wrong | **Closed** | Card (`r6/tap.log`, `probes/fos-tap6.cjs`). On "Tap 2/4 of the circles" (6 of 12):<br>• Tapping the last 5 gives "Tap 6. You tapped 5." with 0 shapes tagged missed or wrong (`screen/fraction_of_set_hard-card-tap-short-checked.png`).<br>• Adding one more (the last 6, not the keyed ids) gives "Correct!" and moves on.<br>• Tapping 7 gives "Tap 6. You tapped 7."<br>Quiz, three copies of the same item:<br>• the last 6: right<br>• the last 5: wrong<br>• the middle 6: right<br>The score is 2/3, and the breakdown says "Answer: any 6 of 12" (`screen/fraction_of_set-quiz-results.png`). The worksheet is covered by the builder's ws-count probe and the new gate row. |
| **R5-2**: the kind comes from a global counter | **Closed** | The counter is gone. The kind comes from the seeded `Math.random` and `pickVariant` (page deck, reset at item 0). The builder's `determinism.log` reports 30/30 rows byte-identical, and the kind strings over 30 items do not cycle. I re-ran the r5 `twice.cjs`: 4 identical builds give **1** distinct sheet for every row, where r5 gave 2 (`r6/twice.log`). |
| **R5-3**: slashed story fraction on screen | **Closed** | The card, quiz and worksheet word prompts stack their fraction: "Ben takes ⅔ of them" (`screen/fraction_of_set_hard-390x844-quiz-word.png`) and worksheet cards 1, 4 and 6 (`screen/fraction_of_set-1366x650-worksheet-full.png`). |
| **R5-4**: short key names letters the page does not print | **Closed** | The short key reads "b. any 6 circled" (builder's PNG). The copy key rings one valid set and adds "(any 6)" in key ink. The short key at `print/fraction_of_set-independent-S-s29-short-key-p1.png` is right on all 8 items (22, 6, 25, 14, 25, 1, 1, 2). |
| **R5-5**: the list-prompt fraction sits low | **Closed** (cosmetic) | `.ms-prompt .mq-frac{vertical-align:middle}`. "less than ½." sits on its line (`print/sub_fractions_like-independent-S-s4-pupil-p1.png`, item c). |

## Defects (R6-n)

**R6-1 · major (C3 ≤ 6, H13 / PAGEFILL) · fraction_of_set and fraction_of_set_hard · More Practice · the page is
not filled on the teacher's request (letters A and B)**

- **What I saw** (`r6/mp-fos-seeds.log`: 15 seeds × S, M, L × both request shapes, from
  `probes/mp-regress.cjs`; the strip is measured from the bottom of the last cell to the top of the footer, as a
  share of the page):

  | Skill | Size | Seed | Letters | Result |
  |---|---|---|---|---|
  | fraction_of_set | S | 3084282476 | A,B | Practice A and B hold 6 each, with strips of 23.5 % and 22.1 % and rows of 202/195/213 px (`print/fraction_of_set-more-practice-S-s3084282476-AB-pupil-p1.png`). The same request with no letters holds **8**, with a 4 % strip. |
  | fraction_of_set | S | 3084282472 | A,B | Practice B holds 6, with a 23.8 % strip and rows of 223/195/190 px. The page's own fit line says "Tall problems: 4 rows per page" (`print/fraction_of_set-more-practice-S-s3084282472-AB-pupil-p2.png`). |
  | fraction_of_set_hard | M | 756117108 | none | 4 problems over a 22.9 % strip, on the grow path itself (`print/fraction_of_set_hard-more-practice-M-s756117108-pupil-p1.png`). |
  | fraction_of_set | L | 3084282484 | A,B | Strips of 17 % and 17.7 %, rows of 286/394 px (just under the 20 % line). |

  - Over 15 seeds at S, 3 of 15 Practice A pages and 3 of 15 Practice B pages are over 20 %.
  - In r5, with the old generator, Practice B was 285/285/285 with a 1 % strip. This is a regression in what
    teachers receive.
- **Where:** `js/modules/print-sheet.js`, More Practice branch, around line 1836:
  `if (!(n.letters && n.letters.length) && !sec.count && shared[si] === null)`.
  - `teacher-print.js:802` always sends `letters`.
  - `tests/scripts/ws-print-lint.cjs` (around line 1735) never sends letters, so the gate lints only a grown
    Practice A.
  - The fit is also measured over all letters' items together (`withTwins(si, byLetter.flat())`), so one tall
    item in any letter holds every letter back.
- **Fix:**
  - Run the grow step for explicit letters too. It must stay off only when `sec.count` is set or rows are shared.
  - Size each letter from **its own** items: each letter is its own page, so `capFromL(layoutOf(..., byLetter[k]))`
    per letter, re-dealt under its own seed. Grow a letter while that page still holds it, with no second side.
  - Find out why fraction_of_set_hard M seed 756117108 does not grow on the no-letters path. It keeps 4 where a
    6-up grid fits the deal.
  - Make the gate see what teachers print: ws-print-lint `more-practice` sends `letters: ['A','B']`, as
    teacher-print does.
- **Proof:**
  - Re-run `probes/mp-regress.cjs` with skills `fractions:fraction_of_set,fractions:fraction_of_set_hard`, sizes
    S, M, L and seeds 3–17. No page should have a strip over 20 %, and the AB counts should match the no-letters
    counts.
  - Re-run it on the other 8 skills and compare with `r6/mp-head.log`: no letter may spill onto a third page.

**R6-2 · minor (C4 on other skills' cards; a regression from this lane's change) · fraction_operations:frac_word_problems
(and every plain-prompt story with two fractions) · practice card, worksheet, quiz · one fraction stacked, the next
slashed in the same sentence**

- **What I saw:** "Amari ate ³⁄₁₀ of a cake. Kai ate 2/10. How much did they eat in total?" at 1280
  (`screen/frac_word_problems-card-1280-s1954.png`).
  - The same happens on fraction_of_set_nv ("2/3 are green" stays slashed, while "1/3 of 12" stacks) and on
    frac_word_mixed_plain (`r6/card-stack.log`).
  - Before r6 the whole line was slashed, so it was at least consistent.
- **Where:**
  - `js/modules/utils.js` `stackProseFractions`, in `all: false` mode (only an `n/d` followed by "of" stacks).
  - It is called from `screen-cell.js` `screenTextLine` when the line is not over a kit cell.
- **Fix:** decide per line, not per token. If any fraction in a line stacks (an "n/d of" phrase), stack every other
  `n/d` in that line, keeping the date and score guards. Otherwise leave the line as it was.
- **Proof:** re-run `probes/card-stack.cjs`. In the `shown` text of frac_word_problems and fraction_of_set_nv, no
  `\d+/\d+` remains in any line that holds a `.msc-frac`.

## Notes (not graded down)

- **N-1.** The word kind has three story frames (`gen-fractions.js` around line 3990), so two items on one page
  often share one: "Ana has … She gives away" appears twice on
  `r6-build/png/fraction_of_set-independent-S-s5-pupil-p1.png`, and "A jar holds … Ben takes" appears twice on
  `print/fraction_of_set-more-practice-S-s3084282472-AB-pupil-p2.png`. Each item is correct, but more frames or names
  would read less repetitive. This is pre-existing.
- **N-2.** The quiz results breakdown prints the raw text "Click 2/4 of the circles.", which is slashed and uses
  "Click" where the question said "Tap" (`screen/fraction_of_set-quiz-results.png`). The results page is not a
  graded host.
- **N-3.** Out of lane, and identical on f5789095: on More Practice with letters A and B, mixed pools spill letter B
  onto a third page of one problem (mixed_addition seed+2 at S, M and L; mixed_composing seed+1 at S, M and L; a
  page of 1 with a strip of about 50 %, `r6/mp-head.log`). This is the practice-capacity lane's.
- **N-4.** The Practice B footer reads "Form A · seed N" while the header says "Practice B". This is pre-existing and
  belongs to the frame.
- **N-5.** The r5 N-c (n/n items about 15 % of the time, now seen on test pages) still holds: for example
  `print/fraction_of_set_hard-test-S-s17-key-p1.png`, items a and h.

## Scores

Print at S, M and L over seeds 3, 4, 17, 29 and the hashed lint seeds. Screen at 1366x650, 1280x600 and 390x844.

| Skill | Version | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|---|
| add_fractions_like | all print and screen versions (MP A+B 1.6 %) | 8–9 | 8 | 8–9 | 8–9 | yes |
| sub_fractions_like | all print and screen versions | 8 | 8 | 8 | 8 | yes |
| add_frac_unlike | all print and screen versions (`print/add_frac_unlike-more-practice-L-s4-AB-key-p2.png`) | 8–9 | 8 | 8–9 | 8–9 | yes |
| fraction_of_set | independent S / M / L + copy key | 8 | 8 | 8 | 8 | yes |
| fraction_of_set | more-practice S (teacher path, A+B) + copy key | 8 | 8 | **6** (R6-1) | 8 | **no** |
| fraction_of_set | more-practice M / L + copy key | 8 | 8 | 8 (strips ≤ 17 %; L rows uneven) | 8 | yes |
| fraction_of_set | test S / L + copy key | 9 | 8 | 8 | 9 | yes |
| fraction_of_set | short key S / L | 8 | 8 | 8 | 8 | yes |
| fraction_of_set | practice card, all widths | 8 | 8 | 8 | 8 | yes |
| fraction_of_set | online worksheet, all widths | 8 | 8 | 8 | 8 | yes |
| fraction_of_set | quiz, all widths | 8 | 8 | 8 | 8 | yes |
| fraction_of_set_hard | independent S / M / L + copy key | 8 | 8 | 8 | 8 | yes |
| fraction_of_set_hard | more-practice M + copy key | 8 | 8 | **6** (R6-1, seed 756117108) | 8 | **no** |
| fraction_of_set_hard | more-practice S / L + copy key | 8 | 8 | 8 | 8 | yes |
| fraction_of_set_hard | test S / L + copy key | 9 | 8 | 8 | 9 | yes |
| fraction_of_set_hard | short key S / L | 8 | 8 | 8 | 8 | yes |
| fraction_of_set_hard | practice card, worksheet, quiz, all widths | 8 | 8 | 8 | 8 | yes |

One fix closes the lane: R6-1. R6-2 should land in the same change, because this lane introduced it.
