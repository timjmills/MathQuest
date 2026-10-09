# Wave 1 lane "Place-value disks / unit_form": independent critic, round 3

Tree `worktree-agent-a5e11bcf3d1414886` @ c2c32fd (main 0f82edf merged). The round-3 work is all in c2c32fd:
`quiz-take.js` (partial rule), `question-render.js` (card slot maxlength), `sheet/cells/pv.js` (`frameHTML`), STATUS.

Graded at Chromebook size first (owner, 2026-10-09): 1366 x 650 visible and 1280 x 602 visible, mouse and touch.
Phones (390) had the basic check only. Following the owner ruling relayed by the lead, Stretch and thinking pages
(Stretch, Reason It, True or False?, Error analysis) were not graded.

## Verdict: PASS

N1, N2 and N3 are fixed at Chromebook size on every host. No criterion is below 8 on any graded page type or host.
One minor defect remains in the lane's code (M1). It leaves the behaviour the same as main, so it does not block.

| Host (Chromebook) | C1 Ease | C2 Teach | C3 Layout | C4 Standard | Note |
|---|---|---|---|---|---|
| Print: independent, more practice, guided, review, test (S and L) | 9 | 8 | 8 | 9 | The lane's two skills have 0 lint findings. The pv family is unchanged from main (498 findings in 10 documents on both trees, none of them in unit_form or place_value_disks). |
| Practice card 1366 / 1280 | 9 | 8 | 8 | 8 | N2 is fixed: each place box takes 1 digit, and a wrong digit fills its box and hands the caret on. |
| Online worksheet 1366 / 1280 (3 columns) | 8 | 8 | 8 | 8 | Rename frames break correctly. "4,884 = [ ] tens 4 ones" fits inside the cell border. |
| Quiz 1366 / 1280 | 8 | 8 | 8 | 8 | N1 is fixed: right word-problem answers count as answered. M1 is minor and matches main. |

## Round-2 defects, re-proven

| r2 | Status | Evidence |
|---|---|---|
| N1 quiz partial (word-problem rows) | **Fixed** | `r3-quiz-partial-probe.cjs` at 1366 x 650 (mouse and touch) and 1280 x 602 covers 9 skills: add_wp_100, sub_wp_100, add_wp_1k, mult_word_problems, div_word_problems, multi_step_word, tape_diagram, share_into_groups and add_word_problems. Every one shows review "4 / 0 / 0", a score of 4/4 and `partial: false`. |
| N2 card unit-form box takes 4 digits | **Fixed** | `r3-card-uf-repro.cjs` at 1366 (mouse and touch), 1280 and 390. Typing 830 for 730 gives `[8 red \| 3 \| 0]`, 7126 for 7026 gives `[7 \| 1 red \| 2 \| 6]`, and 415 for 405 gives `[4 \| 1 red \| 5]`. maxlength is 1 on every box. |
| N3 rename frame breaks before "=" or splits a number from its unit | **Fixed at Chromebook size** | `r3-frame-fit-probe.cjs`: on the card, the worksheet and the quiz at 1366 and 1280, no line starts with "=", no number is parted from its unit, and "=" stays with its box. Examples: "8 thousands / 12 hundreds = [ ]" and "8 hundreds 19 tens = [ ]" (see `r3-*-1366x650-*.png`). Phone wrap: see P1. |

What the probe also printed, and why none of it is a defect:

- **"= split from its box" on `uf-std-9999`.** This is the standard 4-place blanks layout, "6,159 =" over the place
  pairs. It is drawn that way on purpose, the frame is not used, and it reads clearly
  (`r3-worksheet-1366x650-uf-std-9999.png`, `r3-card-1366x650-uf-std-9999-scrolled.png`).
  - Nit: on the 720 px card, "ones" falls alone onto a third line. A 2 + 2 layout would look calmer. This is not a defect.
- **"frame scrolls (313 > 310)" in the 3-column worksheet.** This is 3 to 4 px of padding overflow. Every token stays
  inside the cell border (`r3-worksheet-1366x650-uf-rename-sum-9999.png`).

## Remaining defects (none blocking)

1. **M1: C1, minor, lane code (quiz).** The new row-partial rule never fires.
   - **Cause:** `recordAnswer` groups boxes by `b.closest('.mq-wwans')`. But `.mq-wwans` is each digit's own slot span
     (`sheet/cells/word-work.js:615`), not the row. So every "row" holds 1 box and is never partial.
   - **Effect:** the answer `[ _ | 8 | 1 | _ ]`, with the ones box left empty, records as "81" and counts as answered
     (`r3-quiz-counts.out.txt`, `add_wp_1k` Q2).
   - **Compared with main:** main does the same, so this is not a regression, and the comment's promise is simply not
     kept. Unit-form partials are detected correctly: 3 of 4 boxes filled gives `partial: true`, and the dot and the
     topbar both read 2/4.
   - **Fix:** group by the row, for example `b.parentElement.parentElement` or `.closest('.mq-wwanswer')`. Alternatively,
     key the row on the shared slot parent.
2. **P1: phone only, deferred (owner ruling).** At 390, the tens rename of a 4-digit number does not fit.
   - "7,330 = [ ] tens 0 ones" (and "730 = …" on the card) is one unbreakable group, wider than the cell.
   - On the quiz it is clipped at both edges: "7," and "ones" are cut off (`r3-quiz-390x780m-uf-rename-tens-9999.png`).
     The page itself does not scroll sideways, and the box can still be tapped.
   - This is worse than a wrap, because part of the given number is hidden. The STATUS "Phone pass (deferred)" list
     should name it as "clipped", not only "wrapping".
3. **Housekeeping (merge).** The lane adds a new `## Phone pass (deferred)` section at the end of STATUS.md, but main
   (4970e4b) already has `### Phone pass (deferred)` under section 00. The lane's bullet belongs in main's list, so the
   person merging should fold it in.

## App-wide findings (not from this lane: the same on main 625dcb2)

- **A1: Chromebook reach (owner priority).**
  - **The practice card at 1366 x 650:** the page chrome (header, stats, game bar) puts the problem at y = 484. On first
    render the answer box sits at about 680 to 760 and Check at 768 to 906, so both are below the fold. This is true of
    every skill: `add_2digit` on main has Check at 906.
  - **The cause:** active-box does not scroll a box into view while it is only partly visible.
  - **The quiz:** Next or the box sits at 654 to 809 against 650.
  - **Once scrolled:** each lane item, problem plus Check, is 280 to 410 px tall, so it fits in one view.
  - This needs a lead or owner decision: compact the chrome at heights of 768 px and below, or scroll the problem card to
    the top on render.
- **A2: the quiz scrambles word-problem answers on return.** Go back to a word problem and the joined answer "816" is
  written into the first box, `[816 | _ | _ | _]`, with the digits overflowing it (`r3-quiz-1366-wordrow-restore.png`,
  `r3-wordrow-restore.cjs`). Main does the same.
  - **Cause:** `wireCellSlots` splits the saved value on `join.trim() || ','`, so a digit row (`data-mq-join=""`) restores
    as one piece.
- **A3: estimate error-analysis does not render** ("commas is not a function"). In `sheet/roles/error-analysis.js`
  `prepare()`, `const commas` at line 556 shadows the helper at line 110 that lines 638 to 639 call. Main does the same.
  This was not graded, per the owner ruling.

## The app-wide caret move (`advanceIfFull`), re-checked

`r3-caret-spread.cjs` was run at 1366 x 650 with mouse and with touch, on the card, the worksheet and the quiz, over 27
multi-box skills:

- column add and subtract with regrouping (`add_100_regroup`, `add_1k_regroup`, `sub_100_regroup`, `sub_1k_regroup`);
- `area_model_mult`, `add_sub_fact_family`, `number_families_add` and `count_by_tables`;
- `long_div_2digit`, `div_remainders` and `box_division_easy`;
- `add_mixed_like`, `add_decimal`, `coordinate_q1` and `elapsed_find_duration`;
- `unit_form`, `cloze_addition`, `add_wp_100`, `sub_wp_100`, `multi_step_word`, `function_table_easy` and `hundreds_chart_fill`;
- 5 more skills that turned out to be single-box (skipped).

For each, the probe types one non-answer digit per box plus one, then Backspace and a correction. The result was
`caret-spread: OK` (`r3-caret-spread.out.txt`). What it shows:

- The caret never entered a filled box and never left the problem. On the worksheet it moves to the next card only once
  the current card is full.
- Carry and regroup boxes stayed empty.
- No digit was lost while a fillable empty box remained, with two exceptions, both by design:
  - a count-by row keeps its own rule: the box takes "1111" and the caret stays;
  - a word-work box hands on to the sign box, which refuses digits.
- Backspace removed one character in place, and the corrected digit landed in the same box.
- Right digits were exercised by ws-screen-answer, wave1-a2 and wave1-a3 (all OK).

## Quiz answered counts

`r3-quiz-counts.cjs` was run at 1366 (mouse and touch) and 1280. On each question the quiz shows two counts: the dots
in the dot grid and the topbar "N/4 answered".

- The review, the dots and the topbar agree on every run.
- **unit_form 9999:** right, partial, right and blank give 2 answered (`A-A-`), and partial is flagged.
- **unit_form rename, place_value_disks (count, and read 9999):** a right answer, a wrong answer and a blank give 3
  answered.
- **add_wp_1k:** see M1.

## Gates (this tree)

| Gate | Result |
|---|---|
| `ws-boot-smoke` | OK |
| `ws-screen-answer`, default list | OK |
| `ws-screen-answer --family pv` | OK |
| `ws-screen-answer` on the word-problem skills + place_value_disks | OK |
| `ws-screen-slots` | OK: 609 skills, 2,436 renders, 0 doubled |
| `wave1-a-probe`, `wave1-a2-perbox`, `wave1-a3-wrongdigits` | OK |
| `ws-print-lint --source kit`, full run | 463 findings in 33 of 191 documents, the same as the baseline (no rise) |
| `ws-print-lint --source kit`, pv skills × independent / more-practice / guided / review / test, size S | 498 findings in 10 documents, identical to main. unit_form and place_value_disks have 0. |

- `estimate_*#error-analysis` fails with RENDER (A3). This is pre-existing and the page type is excluded by the ruling.
- Syntax check: `quiz-take.js`, `question-render.js` and `sheet/cells/pv.js` are OK.

## Merge

- Against `4970e4b`, `git merge-tree` is clean.
- `claude/sweet-newton-c8wrv1` has since moved to `625dcb2`. Against it there is one conflict, in `design/STATUS.md`:
  both sides append at the end of the file. Keep both, and fold the lane's bullet into main's Phone pass list (see the
  housekeeping item above).
- No code file conflicts.
