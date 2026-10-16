# Critic round 4: Fraction key (option ids, Check-ALL, whole sums), lane adbb61b8450078736 @ 55a5d3a

Independent critic, 2026-10-16. Opus 5.5, medium. I graded fresh renders and runs of head 55a5d3a, which includes
the merged main with the answer-key options lane (key ink #C2410C, short keys, key placement). I graded against
RUBRIC.md, WORKSHEET_DESIGN_STANDARD.md, LESSONS_LEARNED.md and the owner rulings:
- Every fraction sum uses the same whole + fraction boxes, and an answer of 1 or n/n is accepted.
- Key answers are orange (#C2410C) on black structure.
- Stretch and thinking pages are out of scope.

Per the RUBRIC scope note (2026-09-26), Guided, Review, Opener and Scripted Model are not graded as separate pages.
I rendered them only to re-check the r3 items R4, R5 and R6, and I list what I found there as notes. No code was
changed.

## Verdict: FAIL

The three core fraction skills now pass on every graded version: add_fractions_like, sub_fractions_like and
add_frac_unlike. All four criteria score at least 8 on Independent, More Practice and Mixed Practice at S, M and L,
on Test (the quiz paper) at S and L, on the copy and short keys, and on the card, online worksheet and quiz at
1366x650, 1280x600, 820 and 390.

Every r3 lane defect is closed (table below).

The lane still fails because of **fraction_of_set**, one of its circle-all skills (r3 recorded "fraction_of_set B&W,
one instruction: Fixed"). The r4 list cap stops a run from opening with a list. fraction_of_set prints one item per
page, so its list never prints on paper now. But the section line still comes from the list:
- **"Circle all the correct answers."** prints above a "Find the missing numerator / Answer: ___" item on most pages:
  25 of 30 independent S, 26 of 30 independent L, 21 of 30 more-practice S and 21 of 30 more-practice L, plus the test.
- Main does not do this. This is **R4-1**, a lane regression.

The other fraction_of_set problems are pre-existing but still keep it below 8: a lone item per page, and a picture
that shows the answer.

mixed_composing has its own pre-existing capacity strips, already recorded in STATUS.

## What was run

Probe scripts and logs are in `design/audit/runs/fractions-key/r4/`. The PNGs cited below are in `r4/print/`,
`r4/screen/` and `r4/main/`.

| Gate / probe | Result |
|---|---|
| `ws-boot-smoke` | **OK** |
| `ws-code-snapshot` | **OK** (608 codes, 35 categories, +36 appended, nothing moved, 1870 option round trips) |
| `ws-content-audit --skill mixed_composing,add_fractions_like,sub_fractions_like,add_frac_unlike,fraction_of_set` | **OK**. Only mixed_composing is in the audit's category scope; the fraction categories are outside its CATS, as in r3. 0 failing, 4 notes. |
| `ws-screen-answer --skills` (the 3 fraction skills, mixed_composing, fraction_of_set) | **OK**. Card ok; worksheet 3/3; by-value ok (2/4, 8/10, 18/16, 6/10, 2/14, 10/18, 22/24, 62/60); quiz 3/3 to 4/4; live green ok. |
| `ws-chromebook-fit --skills` (same 5 skills, card / worksheet / quiz, 1366x650 and 1280x600) | **OK**. fraction_of_set card is listed as genuinely tall; its box is in view on load. |
| `ws-print-lint --source kit`, size L, roles independent, more-practice, guided, review, test, mixed-practice, opener | The 3 fraction skills have **0 findings** on every role except review: sub review has H13 x2 (same as main); unlike review has TY-2 x8 and TY-7 x4 from the Mixed Review conversion item. fraction_of_set has INK-2, LS-4 and TY-7 findings, and the opener overflows (PG-12, PG-21). mixed_composing has TY-2, H13 and PAGEFILL. |
| `ws-print-lint --source kit`, size S, roles independent, more-practice, test, mixed-practice | The 3 fraction skills have **0 findings**. fraction_of_set: INK-2, TY-2, H13. mixed_composing: TY-2, H13 / PAGEFILL. |
| `ws-print-lint --source kit --key-style short`, size L | The 3 fraction skills have **0 findings**. |
| The same lint against main (e53677e, via `MQ_ROOT`) | Main is worse on every fraction document: unlike independent TY-7 x10; sub more-practice INK x20 and TY-7 x26. |
| `node --input-type=module --check` on the 25 lane-changed JS files | All pass. |
| `probes/deal.cjs`: 30 seeds × independent / more-practice × S / M / L × 5 skills (lane and main) | `deal.log` and `deal-main.log` |
| `probes/deal2.cjs`: section line against the items on the page | `deal-instructions.log` |
| `probes/render.cjs`: 113 pupil + key renders (PDF → PNG), including short keys, test, mixed, guided, review, opener, lesson and model | `render.log` (largest blank page strip per page) |
| `probes/screens.cjs`: card (list and production), quiz q1 (list) and q2 (production), and the online worksheet with a list card, at 1366x650, 1280x600, 1280x900, 820x1180 and 390x844 | `screens.log` |
| `probes/tap.cjs`: tap one right and one wrong option, then Check | `screen/sub_fractions_like-tap-checked.png` |
| `probes/stats.cjs`: how many options are correct per list, over 600 seeds | add like 1/2/3 correct = 98/34/5. sub = 17/69/51. unlike = 26/61/50. No list has 0, 4 or 5 correct. |

## r3 defects re-proved

| Id | Status | Evidence |
|---|---|---|
| **R1** one-list cap leaks | **Fixed** | `deal.log`: noProd 0 and multiList 0 for every independent and more-practice role, at S, M and L, over 30 seeds, for the 3 fraction skills. Main over the same seeds has 9–13 two-list L pages per role (`deal-main.log`). Test and mixed-practice deal no lists. |
| **R2** mid-page strip at L | **Fixed** | Every L practice page now holds **4 items** in a 2 × 2 grid (30/30 seeds). The largest blank page strip is 1.6 % on independent and more-practice L (`render.log`). PAGEFILL is clean for the 3 skills. See `print/add_fractions_like-independent-L-s1-pupil-p1.png`. |
| **R3** choose-all options small on Chromebook | **Fixed** | `screens.log`. Each option measures 151 × 101 px with 41.4 px digits on the card and quiz at 1366x650, 1280x600, 1280x900 and 820. Worksheet options are 126 × 82 px with 32.4 px digits. Phone (390) options are 136 × 90 px with 36 px digits. All targets are ≥ 44 px. See `screen/add_fractions_like-1366x650-card-list.png` and `screen/sub_fractions_like-1280x600-quiz-q1.png`. |
| **R4** slashes in step / Say / prompt lines | **Fixed** | Guided steps are stacked ("3/4 = 9/12 and 2/3 = 8/12" printed as stacked fractions; `print/add_frac_unlike-guided-L-s7-pupil-p1.png`). The scripted-model Say line is stacked (`print/add_fractions_like-scripted-model-S-s7-pupil-p2.png`). The worksheet and quiz prompts say the verb once ("Subtract."), with no slashed "Calculate:" twin (`screen/sub_fractions_like-1280x600-quiz-q2.png`). |
| **R5** scripted-model 2 pages | **Open, routed to the model-role lane** (STATUS) | Page 2 still holds one panel and the Say line, about 59 % blank (`render.log`: add like and unlike S). Not graded here (RUBRIC scope note). |
| **R6** review: two "Circle all" lines | **Fixed** for the list cell | The review cell keeps only its criterion. A different review defect remains (note N-a). |
| **R7** mixed_composing odd/even list rows | **Fixed (the lane's part)** | The odd/even sort sits in a half-width cell, and its key rings the evens and crosses the odds in key ink (`print/mixed_composing-independent-S-s2-key-p1.png`, item b). The capacity strips are pre-existing (R4-4). |
| **R8** fraction_of_set lone item | **Open, and slightly worse** | Lane: 29/30 seeds print 1 item per page. Main: 22/30, with 8 two-item pages (`deal.log` against `deal-main.log`). See R4-2. |
| **R9** unlike list all-correct | **Fixed** | `stats.cjs`: no list has 4 or 5 correct options. |
| N4 feedback tags | Holds | After Check: "not this" (red ring) and "missed" (dashed amber) sit under their options, the kept right option has a small ✓ badge, and no numeral is covered (`screen/sub_fractions_like-tap-checked.png`). |
| Key ink (answer-key options merge) | Holds | Copy keys: answers, unused-box dashes and list rings are #C2410C. Cell borders, fraction bars, given digits and the option numerals are black (`print/sub_fractions_like-more-practice-L-s24-key-p1.png`, `print/add_frac_unlike-more-practice-S-s1-key-p1.png`). Short key: lettered answers in key ink, stacked, and the list answers named by their options (`print/add_frac_unlike-independent-L-s1-short-key-p1.png`). Every key value on the 6 key pages I worked by hand is right. |
| Whole-sum boxes (owner ruling) | Holds | Every add_fractions_like and add_frac_unlike production cell, on every role and size, prints the whole box + fraction bar. The key writes "1" with dashes in the fraction boxes for n/n sums (`print/add_fractions_like-independent-L-s1-key-p1.png`, item a). The screen accepts 1 and n/n (ws-screen-answer by-value). |

## Defects (R4-n)

**R4-1 · critical (C1) · lane regression · fraction_of_set: the section line says "Circle all the correct answers." above a write-the-number item**
- What I saw:
  - `print/fraction_of_set-independent-L-s5-key-p1.png` prints "Circle all the correct answers." above "?/3 of 21 = 7.
    Find the missing numerator." and an "Answer: ___" line. There is no list on the page.
  - `print/fraction_of_set-test-L-s7-pupil-p1.png` shows the same on the test.
  - `deal-instructions.log` shows it happens on 25/30 independent S pages, 26/30 independent L pages and 21/30
    more-practice S and L pages.
  - Main prints "Solve. Write the answer." (`main/fraction_of_set-independent-L-s5-pupil-p1.png`).
- Where in the code:
  - In `js/modules/print-sheet.js`, `metaOf()` (around line 1343, `meta.instructionKey = q ? instructionKeyFor(q, words) : …`)
    takes the skill's key from the first generated q, which is a choose-all list. `skillWords` turns that into
    `default-circle-all`.
  - `settlePrompts(…, metaOf(g.skill).instructionKey)` then stamps that key on every item.
  - In `js/modules/sheet/roles/practice.js`, `itemInstructionKey()` (around line 803) falls back to `it.instructionKey`
    for a production item that has no provider strings, so both `hostKeys` and `ownKeys` read `default-circle-all`.
  - Since r4, `generateRun` never opens a run with a list. A one-item page therefore never holds the list its
    line describes.
- Fix: never let a paper-task key (`PAPER_TASK_KEYS`: default-circle-all, circle-part-of-set, sort-even-odd) reach a
  non-list item. Either of these works:
  - In `itemInstructionKey`, when `q.printFormat !== 'multi-select'`, ignore a host key in PAPER_TASK_KEYS and
    return `instructionKeyFor(q)` (or `default-write`).
  - Or have `metaOf` take its key from the first production item.
- Proof: `probes/deal2.cjs` shows circleAllNoList 0 over 30 seeds for every role and size. The fraction_of_set pages
  print "Write the answer." / "Solve. Write the answer.". Re-render test L seed 7.

**R4-2 · major (C3, H5) · pre-existing, slightly worsened · fraction_of_set prints a lone item per page**
- What I saw:
  - `deal.log`: 1 item per page on 29/30 seeds for independent S, M and L and on 30/30 seeds for more-practice.
    Main is 22/30.
  - The cell fills the page, with the drawing in its lower two-thirds. Test L seed 7 has an empty top band of
    about 29 % (`print/fraction_of_set-test-L-s7-pupil-p1.png`). Independent L seed 5 has about 13 % blank above and
    25 % below (`print/fraction_of_set-independent-L-s5-key-p1.png`).
- Fix (practice capacity / the fos cell):
  - Size the fraction-of-set cell to its content: the group rows plus the answer line, about 95 mm at L.
  - Hold 2 per page at L and 3–4 at S, with rows scaled from `ctx.metrics`.
  - Drop the empty top band.
- Proof: deal.log shows ≥ 2 items per page at L and ≥ 3 at S. ws-print-lint H13 and PAGEFILL are clean.

**R4-3 · major (C2, L3) + minor (C4, TY-7, INK-2) · pre-existing generator and visual · fraction_of_set draws the answer it asks for**
- What I saw:
  - "?/3 of 33 = 22. Find the missing numerator." shades 2 of the 3 group rows; the answer is 2
    (`print/fraction_of_set-independent-S-s2-pupil-p1.png`, item a).
  - "?/2 of 14 = 7" shades 1 of 2 rows.
  - The prompt and title print slashed "?/3" and "3/5".
  - Lint finds faded ink in the visual: a shade band at opacity 0.07 and labels at 0.6 (INK-2), plus dashed
    separators (LS-4).
  - Word items say "3/5 are purple" over grey circles on a black-and-white page.
- Where: `js/modules/gen-fractions.js` around lines 3953–3966 (variants 2 and 3) and the fos visual (`fos-shade-band`,
  `fos-label`).
- Fix:
  - Variant 2: draw the groups unshaded, so the pupil shades the 22.
  - Stack the fractions with the kit's fraction markup.
  - Draw labels at full ink. Use the single grey only as the shade, with solid separators.
  - Say "shaded" instead of a colour word.
- Proof: no fraction_of_set lint findings, and the pupil PNG shows no shaded group on a missing-numerator item.

**R4-4 · major (C3, H5) · pre-existing (recorded in STATUS; identical on main) · mixed_composing practice capacity**
- What I saw:
  - Independent S seed 2: page 1 has 4 items and a 27 % strip; page 2 has one item and is 57 % blank, and that
    cell has no bottom border (`print/mixed_composing-independent-S-s2-key-p1.png`, `…-p2.png`).
  - Seed 3: 52.8 % and 32.1 % blank.
  - More-practice S seed 3: one item, 60 % blank.
  - Main has the same distribution (`deal-main.log`).
- Fix (practice capacity lane, as STATUS says): skip an item the remaining page cannot hold, and rebalance the last
  page.
- Not caused by this lane.

**R4-5 · minor (C4 −0, cosmetic) · online worksheet: the prompt's final "." wraps alone**
- What I saw: "Tap ALL differences that are less than ½" ends its line at the stacked ½, and the "." sits alone on
  the next line (`screen/sub_fractions_like-1280x600-worksheet.png`, card 4).
- Fix: in `screen-cell.js`, wrap the stacked fraction and the punctuation after it in one `white-space:nowrap` span.
- This does not lower the score (the worksheet stays at 8). It would raise C4 to 9.

## Notes (not graded on this lane, or owned elsewhere)

- **N-a Review: the Mixed Review line does not fit the item (same on main).**
  - `print/add_frac_unlike-review-L-s7-pupil-p1.png` prints "Mixed Review: Circle all the correct answers." above
    "Write 9/10 as a fraction with denominator 100." and an Answer line. Main does the same
    (`main/add_frac_unlike-review-L-s7-pupil-p1.png`).
  - Cause: `review.js` `instructionKeyOf(useE, …)` takes the earlier skill's key, not the dealt item's. This is the
    same class as R4-1, so the same fix should cover it.
  - Review is not graded as a separate page.
- **N-b fraction_of_set opener L overflows the page (lane and main).**
  - The page content is 186 mm taller than the page box (PG-12, PG-21; `print/fraction_of_set-opener-L-s7-pupil-p1.png`).
  - Main overflows the same way, and also prints emoji and option ids.
  - The opener is not graded as a separate page.
- **N-c Lesson anchor chart (Wave 8, lessons lane; identical on main).**
  - The cells run past the page bottom, and the third panel's box is clipped.
  - The steps print slashed "11/12" (`print/add_fractions_like-lesson-L-s7-pupil-p1.png`).
  - This is the "anchor-chart cell overflows" item already listed in STATUS.
- **N-d Keys print the simplest form.**
  - Examples: 6/8 − 4/8 is keyed 1/4, 3/10 − 1/10 is keyed 1/5, and 1/4 + 1/4 is keyed 1/2
    (`print/sub_fractions_like-independent-S-s1-key-p1.png`, `print/sub_fractions_like-more-practice-L-s24-key-p1.png`).
  - The screen accepts 2/8, but a Grade 4 (4.NF.3) pupil is not taught to simplify.
  - The owner should decide whether a like-denominator key also shows the direct form ("2/8 = 1/4").
  - Earlier rounds accepted this, and it does not cap a score.
- **N-e Quiz denominator box at 1280x600 (main-wide, as r3 said).**
  - The fraction answer box sits partly under the pinned Previous / Review & Submit bar (bottom 554 px, fold 537;
    `screen/sub_fractions_like-1280x600-quiz-q2.png`).
  - ws-chromebook-fit measures only the first box.
- **N-f Card feedback counts untapped options.** "2 correct, 3 to fix" counts an option left untapped as "correct"
  (`screen/sub_fractions_like-tap-checked.png`). This is a wording nit for the multi-select widget.

## Scores

`list` means the version can deal a choose-all item. M was checked on independent and more-practice and matches S
(6 items, 22 pt digits). Thinking pages are not graded.

| Skill | Version | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|---|
| add_fractions_like | independent S / M + copy key | 9 | 8 | 9 | 9 | yes |
| add_fractions_like | independent L + copy key (4 items, 2 × 2, list) | 8 | 8 | 8 | 9 | yes |
| add_fractions_like | more-practice S / M / L + copy key | 8 | 8 | 8 | 9 | yes |
| add_fractions_like | short key S / L | 8 | 8 | 8 | 8 | yes |
| add_fractions_like | mixed-practice S / L + key | 9 | 8 | 8 | 9 | yes |
| add_fractions_like | test (quiz paper) S / L + key | 9 | 8 | 9 | 9 | yes |
| add_fractions_like | card 1366x650 / 1280x600 / 820 / 390 (list and production) | 9 | 8 | 9 | 9 | yes |
| add_fractions_like | online worksheet 1366x650 / 1280x600 / 390 | 8 | 8 | 8 | 8 | yes |
| add_fractions_like | quiz 1366x650 / 1280x600 / 390 | 8 | 8 | 8 | 9 | yes |
| sub_fractions_like | independent S / M / L + copy key | 8 | 8 | 8 | 9 | yes |
| sub_fractions_like | more-practice S / M / L + copy key | 8 | 8 | 8 | 9 | yes |
| sub_fractions_like | short key S / L | 8 | 8 | 8 | 8 | yes |
| sub_fractions_like | mixed-practice, test S / L + key | 9 | 8 | 9 | 9 | yes |
| sub_fractions_like | card / worksheet / quiz (all widths) | 8 | 8 | 8 | 8 (R4-5 nit) | yes |
| add_frac_unlike | independent S / M / L + copy key | 8 | 8 | 8 | 9 | yes |
| add_frac_unlike | more-practice S / M / L + copy key | 8 | 8 | 8 | 9 | yes |
| add_frac_unlike | short key S / L | 8 | 8 | 8 | 8 | yes |
| add_frac_unlike | mixed-practice, test S / L + key | 9 | 8 | 9 | 9 | yes |
| add_frac_unlike | card / worksheet / quiz (all widths) | 9 | 8 | 9 | 9 | yes |
| fraction_of_set | independent S / L + key | 5 (R4-1) | 5 (R4-3, L3) | 5 [H5] (R4-2) | 7 (R4-3, TY-7 / INK-2) | **no** |
| fraction_of_set | more-practice S / L + key | 5 (R4-1) | 5 | 5 [H5] | 7 | **no** |
| fraction_of_set | test L + key | 5 (R4-1) | 5 | 5 [H5] | 7 | **no** |
| fraction_of_set | card / worksheet / quiz | 8 | 6 (R4-3 shaded answer) | 8 | 8 | **no** |
| mixed_composing | independent / more-practice S | 8 | 8 | 5 [H5] (R4-4, pre-existing) | 8 | no (not this lane) |
| mixed_composing | independent / more-practice L | 8 | 8 | 7 (27 % strip, seed 2; pre-existing) | 8 | no (not this lane) |
| mixed_composing | card / worksheet / quiz | 8 | 8 | 8 | 8 | yes (ws-screen-answer, ws-chromebook-fit) |

Why the core three are not 10:
- C2 is 8 because the keys write the simplest form for like denominators (N-d).
- C3 is 8 at L because the list cell's options fill about 60 % of its width.
- C4 is 8 on the short keys because they are lists by design (owner option), and on the worksheet because of R4-5.

## What blocks the pass, in order

1. **R4-1** (lane regression): no paper-task section line above a non-list item. Fix in `itemInstructionKey` / `metaOf`.
   Prove with `probes/deal2.cjs`.
2. **R4-2 + R4-3** (fraction_of_set, pre-existing): if the lead keeps fraction_of_set in this lane, size its cell to
   content (≥ 2 per page at L), stop shading the answer on missing-numerator items, stack its fractions, and draw its
   ink unfaded. Otherwise route it to a fraction-of-set lane and close this lane on the three core skills plus R4-1.
3. **R4-4** stays with the practice-capacity lane (STATUS).

Merge check: `git merge-tree --write-tree origin/claude/sweet-newton-c8wrv1 HEAD` (main at d2c76ff5) → **clean**.
