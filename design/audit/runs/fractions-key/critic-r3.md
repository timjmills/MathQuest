# Critic round 3: Fraction key (option ids, Check-ALL, whole sums), lane adbb61b8450078736 @ dc1f857d

Independent critic, 2026-10-09. I graded fresh renders and runs only, against RUBRIC.md, WORKSHEET_DESIGN_STANDARD.md,
PEDAGOGY_STANDARD.md, LESSONS_LEARNED.md and the owner rulings ("a sum of 1 accepts 1, 9/9, 8/8, 1 0/n, mixed and
improper"; Chromebooks first; no Stretch or thinking pages). I did not grade true-false, reason-it, error-analysis or
stretch. No code was changed.

## Verdict: FAIL

The main critic-r2 blockers are closed:
- **N1.** The online worksheet now marks 9/9, 8/8, 1 and 1 0/9 right when a pupil types them with the keyboard and
  clicks CHECK ALL, and it marks 8/9 and 3/4 wrong.
- **N2.** Test and mixed-practice pages deal production items only, at the base counts, under one instruction.
- **N3 (generator).** Every sub list has 1 to 3 correct options.
- **N4.** The feedback tags sit under the options and no numeral is covered.
- **N7.** The model and opener pages now model a production item.

Three lane problems still keep versions below 8:

1. **R1. The one-list cap leaks.** A page that opens with two lists keeps both. In 30 seeds, sub_fractions_like
   more-practice L dealt 3 pages with no subtraction on them, and 2–4 pages out of 30 per role carry two lists. The
   proof r2 asked for ("more-practice L holds production items") fails at seed 1.
2. **R2. The D9 band moved to the middle of the page.** It is no longer inside the cells. Independent and more-practice
   L now keep a blank strip of 21–23 % of the page between the parts (pre-flight limit: 20 %), and those pages still
   hold 3 items.
3. **R3. The choose-all options on screen are too small at Chromebook size.** This applies to the card, the online
   worksheet and the quiz. The options are about 55 x 43 px with digits about 11 px. Production digits are about
   45 px. In r2 at 1280 x 900 they were about twice this size.

N6 is still partly open (slashed fractions in the guided and model step text and in the worksheet and quiz prompt
lines). The scripted-model page splits a 4-step model over 2 pages, and page 2 is 59 % blank at S. That is a
role-level problem.

Merge check: `git merge-tree --write-tree claude/sweet-newton-c8wrv1 HEAD` → **clean** (tree cd21ee8; main was
8ce4c20d at the time of the check).

## What was run

Probes, logs and PNGs: `/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/frac-critic-r3/`

| Gate / probe | Result |
|---|---|
| `ws-boot-smoke` | OK |
| `ws-code-snapshot` | OK (608 codes, 35 categories, nothing moved, 1870 option round trips) |
| `ws-screen-answer --skills` add_fractions_like, sub_fractions_like, add_frac_unlike, mixed_composing, fraction_of_set | OK. Card, worksheet 3/3, quiz 3/3–4/4, live green. Worksheet by-value: 2/4, 8/10, 18/16, 6/10, 2/14, 10/18, 22/24 and 62/60 all marked right. |
| `ws-share-options` | OK |
| `ws-chromebook-fit --skills` (the three skills + fraction_of_set + mixed_composing, every host, 1366x650 and 1280x600) | OK. fraction_of_set is listed as genuinely tall, and its box comes into view on load. |
| `ws-print-lint --source kit` | 439 findings in 32 documents (baseline ≤ 463/33; matches the lane's claim) |
| `node --input-type=module --check` on every changed JS file | all pass |
| `accept-ws.cjs` → `acc/`, `acceptws.log` | N1 keyboard proof at 1366x650 using the real CHECK ALL button (table below) |
| `print-r2.cjs` → `print/`, `print2/`, `print-main/` | Every non-thinking role at S and L, pupil and key, for the three skills; fraction_of_set, mixed_composing and odd_even independent, more-practice and test; the base (main) render for comparison |
| `deal.cjs` → `deal.log` | Page deal over 30 seeds (independent, more-practice) and 8 seeds (test, mixed-practice): items, lists, pages with no production item, pages with more than one list |
| `stats.cjs` → `stats.log` | Over 600 seeds per skill: how many list options are correct |
| `screens-r3.cjs` → `scr/` (lane), `scr-main/` (main) | Card (list, whole, mixed, plain), worksheet and quiz at 1366x650 and 1280x600 with the compact play bar; N4 at 3x |
| `wsopt.cjs` → `wsopt.log` | Rendered size of the worksheet choose-all options |

## Critic-r2 defects re-proved

| Id | Status | Evidence |
|---|---|---|
| **N1** worksheet by value | **Fixed** | `acceptws.log`, 1366x650, keyboard into the three boxes, then the CHECK ALL button. add like 1/9 + 8/9: `9/9` CORRECT, `1` CORRECT, `1 0/9` CORRECT, `8/9` WRONG. Unlike 4/8 + 3/6: `8/8` CORRECT, `1` CORRECT, `3/4` WRONG (`acc/acceptws-*.png`). The ws-screen-answer by-value pass checks mixed and improper forms (18/16 for 1 1/8, 62/60). |
| **N2** test / mixed-practice | **Fixed** | `deal.log`: 0 lists in 8 seeds on test and mixed-practice for all three skills. Every page holds the base count: test S 9, test L 4, mixed S 6, mixed L 4. One section line ("Add." / "Subtract."), with no cell verb (`print/*/test-*`, `mixed-practice-*`). Following the lead's decision, test pages deal no choose-all items. |
| **D9** in-cell bands at L | **Moved, not fixed** (see R2) | The cells are sized to their content now. The spare height becomes one gap between the production row and the list row: the largest blank strip is 23.2 % (add like ind. L, more-practice L; unlike more-practice L) and 21.0 % (sub ind. L). The pages still hold 3 items (`deal.log`: 25 of 30 L pages hold 3). |
| **N3** sub list 1–3 correct | **Generator fixed; page cap leaks** (R1) | `stats.log`: 137 sub lists, with 1 / 2 / 3 correct in 17 / 69 / 51 lists; none has 0, 4 or 5. Each list has a near miss equal to ½. `print/sub_fractions_like/more-practice-L-*` (seed 1) is still **two lists and no subtraction**. |
| **N4** feedback tag over the numeral | **Fixed** | `scr/*-N4-feedback-3x.png`: "missed" (dashed amber ring) and "not this" (red ring) sit under their options, and every numeral is clear. A tap on the wrong option removes its mark. Minor: the grey ✓ badge on a locked option sits on the ring's top-right, just above the numerator, and does not cover it. |
| **N5** key rings clear of numerals | **Fixed** | `print/add_frac_unlike/independent-L-key-p1.png` and `print/sub_fractions_like/independent-L-key-p1.png`: the rings pass about 2 mm outside the stacked fractions. |
| **N6** slashes / "Click" | **Partly fixed** | Fixed: the card prompt line is stacked; list prompts say "Tap" on screen and "Circle" on paper; the true-false key line is stacked; the quiz results line was fixed in the code (`resultLine`, read but not rendered). **Open:** the guided worked steps still read "That is 7/5. 7/5 = 1 2/5." and "That is 2/4. 2/4 = 1/2." (`print/*/guided-*`). The scripted-model steps and Say line read "4/4 = 1.", "2/3 = 20/30 and 1/10 = 3/30.", "Say: 1/4 plus 3/4 is 1.". The online worksheet and the quiz print "Calculate: 1/2 + 1/2 = ?" slashed above the stacked cell, which shows the item twice (`scr/*-worksheet-*`, `scr/*-quiz-q2-*`). |
| **D1** mixed_composing odd/even | **Fixed** | `print2/mixed_composing/*-key-*`: a ring / cross list under "Circle the even numbers. Cross out the odd numbers.", with no "Answer:" line. The key is a facsimile: rings on the evens, crosses on the odds. See R7 for the page count. |
| fraction_of_set B&W, one instruction | **Fixed** | The shapes are black glyphs (■ ▲ ★ …), with no emoji. The section line is "Circle the fraction of the set." and the cell keeps "½ of the squares.". The key rings the right count. See R8 for the page. |
| **N7** model / opener | **Lane part fixed** | `deal.log`: 0 lists on opener and scripted-model. The model is a production item (`print/*/scripted-model-*`, `opener-*`). The opener passes. The scripted-model role still fails on layout (R5). |

## New or remaining defects

**R1 · major · C2 −2 / C3 −1 (practice L) · the one-list cap lets a page open with two lists**
- Where: `js/modules/print-sheet.js` generateRun. The cap skips a list only once a production candidate has been seen
  (`seen.has('prod:'+key)`). When the first two deals are lists, both are kept. More-practice also keeps two lists on
  S pages (`print/add_fractions_like/more-practice-S-*`, items g and h).
- Measured (`deal.log`, 30 seeds): sub more-practice L has **no subtraction item on 3 of 30 pages** (seeds 1, 24, 27).
  sub independent L has none on 2 pages (6, 22). add like and unlike more-practice L have none on 1 page (24). Every
  independent and more-practice role has 2–4 pages out of 30 with two lists.
- Fix: count lists per section without the production precondition. Allow at most one list when the skill deals
  production items. When a list would be the first item, deal a production item first.
- Proof: deal.log shows noProd 0 and multiList 0 over 30 seeds for every independent and more-practice role at S and L.

**R2 · major · C3 → 6 (independent / more-practice L) · the spare height is a mid-page strip**
- Where: `print/add_fractions_like/independent-L-*.png`, `more-practice-L-*`, `print/sub_fractions_like/independent-L-*`,
  `print/add_frac_unlike/more-practice-L-*`. The largest blank strip is 21–23 % of the page (the pre-flight limit is
  20 %; LESSONS_LEARNED L2). mixed_composing more-practice S has a 30 % strip (`print2/mixed_composing/more-practice-S-*`).
- Fix: re-deal so the page is full (a 4th item, or a second production row with the list row beside it), or share
  the gap evenly between rows. Do not put it all in one place.
- Proof: the largest blank strip is < 20 % on every L practice page; ws-print-lint PAGEFILL is clean.

**R3 · major · C1 → 6 on card, worksheet and quiz (Chromebook) · choose-all options too small**
- Where: `scr/*-card-ms-1366x650.png`, `scr/*-quiz-q1-*`, `scr/*-worksheet-*`; crop `crop-ws-ms.png`.
  `wsopt.log`: each option is 55 x 43 px (69 x 43 with two-digit denominators); the digit line box is 19 px (font
  about 11 px, glyphs about 7–8 px). Production digits in the same host are about 45 px. The r2 card at 1280 x 900
  (`frac-critic-r2/scr/add_frac_unlike-ms-card-1280.png`) drew the same options about twice as large. Main's checkbox
  list (`scr-main/*-card-ms-*`) has 15 px labels in 230 x 36 targets. The tap targets are under 44 px tall (H6
  borderline for Chromebook touch). Cause not isolated.
- Fix: give the ring list its own type size (at least the cell's answer-digit token, as on paper, where the options
  are printed at body size) and a ≥ 44 px target.
- Proof: at 1366x650 and 1280x600 the option glyphs are ≥ 20 px and each target is ≥ 44 x 44.

**R4 · minor · C4 −1 · N6 remnant** (see the table): stack the fractions in the guided and scripted-model step text and
Say lines. On the worksheet and quiz, either drop the generator prompt "Calculate: a/b + c/d = ?" above a frac-model
cell, or stack it as the card now does.

**R5 · major (role-level) · scripted-model C3 → 5 (H5) · the 4-step model spans two pages**
- `print/*/scripted-model-S-*`: page 2 holds one panel and the Say line and is 59 % blank (sub L page 2: 51 %). Each
  panel repeats the whole cell beside a step column that is mostly empty. The model never draws the renamed fractions
  that step 2 names ("2/3 = 20/30"). The countby critic recorded this role failing on main too (P1–P3). It is not new
  in this lane, but it keeps the scripted-model version below 8.

**R6 · minor · C4 −1 · review: two "Circle all" lines**
- `print/add_frac_unlike/review-*`, `print/sub_fractions_like/review-*`: the Mixed Review section line says "Circle all
  the correct answers." and the cell repeats "Circle all fractions equivalent to 0.05." (and "Circle all sums that equal
  1."). This is the D3 rule (one instruction) not yet applied in review.js.

**R7 · minor · mixed_composing independent S drops from 5 items to 3**
- `print2/mixed_composing/independent-S-*`: all 3 items are odd/even lists, each a full-width row with bands of 30 % or
  more. Main deals 5 (`print-main/mixed_composing/independent-S-*`). The pool's odd/even skew is pre-existing, but the
  full-width list rows are this lane's change.

**R8 · note, pre-existing · fraction_of_set independent S is a lone item**
- On main it is a single small cell with 59 % of the page blank (`print-main/fraction_of_set/*`). In the lane it is
  one cell filling the page, mostly empty (H5/H13 either way). The B&W and instruction fixes hold.

**R9 · minor · add_frac_unlike "Sums greater than 1" can be all-correct**
- `stats.log`: 4 of 137 lists have all 5 options correct and 18 have 4 correct (the N3 class, on the unlike list).

**Not this lane (recorded for the lead):** at 1280x600 the quiz frac-model denominator box sits under the pinned nav
bar (`scr/*-quiz-q2-1280x600.png`). Main does the same (`scr-main/add_fractions_like-quiz-q2-1280x600.png`).
ws-chromebook-fit passes because it measures the first (whole) box.

## Scores

`ms` = the version deals a choose-all item. Caps are shown in brackets. Thinking pages are not graded.

| Skill | Version | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|---|
| add_fractions_like | independent S + key | 8 | 8 | 8 | 8 | yes |
| add_fractions_like | independent L + key | 8 | 8 | 6 (R2) | 8 | no |
| add_fractions_like | more-practice S + key (two lists) | 8 | 7 (R1) | 8 | 8 | no |
| add_fractions_like | more-practice L + key | 8 | 7 (R1) | 6 (R2) | 8 | no |
| add_fractions_like | guided S / L | 8 | 8 | 8 | 7 (R4) | no |
| add_fractions_like | review S / L | 8 | 8 | 8 | 8 | yes |
| add_fractions_like | test S / L + key | 8 | 8 | 8 | 8 | yes |
| add_fractions_like | mixed-practice S / L | 8 | 8 | 8 | 8 | yes |
| add_fractions_like | opener S / L | 8 | 8 | 8 | 8 | yes |
| add_fractions_like | scripted-model S / L | 7 | 7 | 5 [H5] | 7 | no (R5, R4) |
| add_fractions_like | card 1366x650 / 1280x600 | 6 (R3, ms) | 8 | 8 | 8 | no |
| add_fractions_like | online worksheet | 6 (R3) | 8 | 8 | 7 (R4) | no |
| add_fractions_like | quiz | 6 (R3) | 8 | 8 | 7 (R4) | no |
| sub_fractions_like | independent S + key | 8 | 8 | 8 | 8 | yes |
| sub_fractions_like | independent L + key | 8 | 7 (R1) | 6 (R2) | 8 | no |
| sub_fractions_like | more-practice L (seed 1: two lists, no subtraction) | 7 | 4 | 6 | 8 | no (R1) |
| sub_fractions_like | guided, review | 8 | 8 | 8 | 7 (R4 guided; R6 review) | no |
| sub_fractions_like | test, mixed-practice, opener | 8 | 8 | 8 | 8 | yes |
| sub_fractions_like | scripted-model | 7 | 7 | 5 [H5] | 7 | no (R5) |
| sub_fractions_like | card / worksheet / quiz | 6 (R3) | 8 | 8 | 7 | no |
| add_frac_unlike | independent S + key | 8 | 8 | 8 | 8 | yes |
| add_frac_unlike | independent L + key (two lists of 4) | 8 | 7 (R1) | 8 | 8 | no |
| add_frac_unlike | more-practice L | 8 | 8 | 6 (R2) | 8 | no |
| add_frac_unlike | guided | 8 | 8 | 8 | 7 (R4) | no |
| add_frac_unlike | review | 8 | 8 | 8 | 7 (R6) | no |
| add_frac_unlike | test, mixed-practice, opener | 8 | 8 | 8 | 8 | yes |
| add_frac_unlike | scripted-model | 7 | 6 | 5 [H5] | 7 | no (R5) |
| add_frac_unlike | card / worksheet / quiz | 6 (R3) | 8 | 8 | 7 | no |

## What blocks the pass, in order

1. R3: draw the choose-all options on screen at answer-digit size with ≥ 44 px targets (every host, at Chromebook
   size).
2. R1: make the list cap hold from the first deal. Allow at most one list per section of a production skill, and
   never let a page carry no production item.
3. R2: fill the L practice pages instead of leaving a mid-page strip over 20 %.
4. R4 and R6: stack the fractions in the step, Say and prompt lines. Print one "Circle all" line on review pages.
5. R5 (role-level, also on main): the scripted-model page layout. The lead decides whether it belongs to this lane or
   to the model-role lane (P1–P3).
