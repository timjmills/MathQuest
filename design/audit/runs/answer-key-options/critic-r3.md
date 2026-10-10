# Critic round 3: Wave 1 lane "Answer-key options" (MASTER_PLAN 4.4, INK-31)

Lane tree `agent-a4ebafe2c94eb1dcd`, head `b94a1662`. This is an independent critic run: the critic read and tested only, and changed no code.
Graded against `design/audit/RUBRIC.md`, which needs 8 or more on all four criteria. Chromebook first (1366x768, 1280x720).
Stretch, Reason It, True or False? and Error analysis were not graded (owner ruling 2026-10-09).

## Verdict: FAIL (blocking R3-1, R3-2, R3-3)

Round 2's two blockers are mostly closed. Drawn answers are now orange: across all 576 skills on Independent, no added SVG mark is left black. The short key now lists Guided Practice on Opener and Lesson pages. The new-sheet option works.
But the new pupil-twin alignment in `tagKeyAnswers` has a side effect: it now paints **given** lines and box borders orange on 215 of 576 skills. Two skills still print a fully black key, and the disk numerals on `pv_disks_build` print smeared.

| Criterion | Score | Why |
|---|---|---|
| 1. Correct and complete content | **8** | The copy key and the short key both carry every answer. Guided Practice is listed on Opener and Lesson ("Guided Practice 1. 9:00 2. 11:00 3. 8:00"). The short key gives final answers only, not carries or jump labels; that is by design for "labels and answers only". |
| 2. Design contract (B&W + INK-31, owner rulings) | **6** | Given content turns orange on 215 skills (R3-1). Two keys are still all black (R3-2). The disk numerals are illegible (R3-3). Counters, blocks, disks, arcs, rings, ticks and dots are now fully orange where the pupil draws them, which is correct. |
| 3. Fit to the owner's request / usability | **9** | Both placements and both styles work. "Start each key on a new sheet" builds P B K B, is off by default, shows only for After each page, is saved as a default, and is ignored for At the end. The "After each page" label now wraps inside its pill at 1366. |
| 4. Engineering / regressions | **8** | Pupil pages are byte-identical to main in every one of 756 builds. Key pages are identical to main once the tag attributes are removed. `key: false` output is identical to main's. The merge into current main is clean and every gate is green or at baseline. However, the lane's own alignment sweep does not catch R3-1 or R3-3, because it checks text and SVG marks but not borders or stroke on text. |

## Round 2 defects re-proved

| r2 | Status | Evidence |
|---|---|---|
| R2-1: drawn answers black (~50 skills) | **Fixed for drawn marks; 2 skills still black (R3-2)** | Critic sweep over all 576 skills on Independent (`r3/critic-r3-attack.cjs`): **0** added SVG marks are black, and **0** given SVG marks are orange. The images confirm it: ten-frame counters (`r3/indep-ten_frame_build-p2.png`), base-10 sticks and ones (`indep-base10_build`), disks (`indep-pv_disks_build`, see R3-3), coin rings (`indep-coin_value`), check ticks, elapsed arcs with their labels and end dots (`indep-elapsed_30min`), number-line dots with orange centres (R2-6 closed), round_sort numbers, place_value_10x digits, and the shaded parts in `shade_fraction` (the fill is orange and the printed outline stays black, which is correct). Across 12 roles × 46 template skills, the only black added marks are on Guided and Opener cells whose pupil page traces the mark (the worked example and the traced hops in Guided Practice). These count as given, so black is correct; see owner question Q1. |
| R2-2: short key omits Guided Practice | **Fixed** | Opener `time_hour`: "Lesson 1 / Guided Practice 1. 9:00 2. 11:00 3. 8:00" (`r3/opener-time_hour-short-p2.png`). Lesson `count_objects`: "Guided Practice 1. 3 2. 9 / Practice a. 5 b. 4 c. 13" (`r3/lesson-count_objects-short-p4.png`). Per-cell comparison of the short key against the copy key on 12 roles finds no cell left out. The only gap is Opener `area`, Model cell 1, which is the traced worked example; leaving it out is correct. |
| R2-5: "After each page" label overflow at 1366 | **Fixed** | At 1366x768 the segment is 99 x 44 px and the label wraps onto two lines inside the pill, with no overflow (`r3/ui-1366-newsheet.png`). At 1280x720 the segment is 201 px wide and the label fits on one line. All controls are 44 px high and the new-sheet checkbox is on screen. |
| R2-6: number-line dot half orange | **Fixed** | The whole dot is orange (`place_on_number_line`, `rounding_visual`). |

## Blocking defects

**R3-1. Given lines and box borders print orange on 215 of 576 skills (new in r3).**
`tagKeyAnswers` aligns each key cell with its pupil twin. For an element that is not a shape, the loose signature is `tag|data-ws-slot|text`. So a legacy write-on line (`<span>` with a bottom border) that holds the answer text on the key has no twin. It gets tagged `data-ws-key-add`, and the new CSS rule `[data-ws-key-add] { border-color: key-ink }` paints the **printed line** orange. Round 2 printed that line black (`r3/r2-indep-make_ten-p2.png` against `r3/indep-make_ten-p2.png`).
- `make_ten`: every "Answer: ___" underline is orange.
- `round_sort_*`: the filled lines are orange and the empty ones are black, so the same printed line has two colours (`indep-round_sort_10-p2.png`).
- `place_value_10x`: the answer row's chart cells have orange borders while the given row is black (`indep-place_value_10x-p2.png`).
- Lesson `nl_add` warm-up: the sign box holding "+" has an orange border while the digit boxes are black, and the unit line under "crayons" is orange (`lesson-nl_add-copy-p4.png`).
- The sweep found the class on 215 skills on Independent. It covers word problems (all `*_wp_*`), fractions, decimals, geometry, measurement, rounding and all 49 vocabulary skills, and it appears on every role.

The owner ruling is that only the answer is orange and the rest stays black and white. The printed line or box is given content. The fix belongs in the kit:
- A key element whose only difference from its twin is its text should be matched to that twin, with only its text coloured (for example a `data-ws-key-text` verdict that sets `color` and never `border-color` or `outline-color`).
- Alternatively, drop the text from the loose signature of an element that carries a border.
- Then add a border check to `key-options.cjs`. It should flag a key element that is matched to a pupil element and has an orange border without `data-ws-key-mark`. The `r3/critic-r3-attack.cjs` "border" rule is one way to do it.

**R3-2. Two keys are still entirely black (R2-1 remnant).**
`placevalue:identify` ("Circle the place of the underlined digit") and `number_word_names` ("Circle the word name") tag nothing on the key: `tagged 0`, no orange anywhere. The answer ring is black (`r3/indep-identify-p2.png`, and the bottom-right panel of `number_word_names`). These rings are drawn with a class or border that the `ring()` test in `tagKeyAnswers` does not see: it looks for an inline `border|outline ... solid` style or `data-ws-chosen`. Any other legacy "circle the answer" skill that draws its ring the same way has the same problem.

The critic's ring check (`r3/critic-r3-attack-rings.cjs`) also reports black borders that the key adds on `base10_build` (6 divs), `area_model_mult` (partial-product boxes "50", "150") and `long_div_2digit` (14 spans). Check each of these against its pupil twin, and colour it if it is an answer.

**R3-3. The disk numerals on `pv_disks_build` are illegible, and number-line labels are stroked.**
The rule `.ws-page.ws-key svg [data-ws-key-add]:not([stroke="none"]):not(text):not(tspan) { stroke: key-ink }` sets stroke on the added `<g>`. SVG `stroke` is inherited, so the `<text>` inside the group is also stroked at 1 px, and "100", "10" and "1" print as orange blobs (`r3/indep-pv_disks_build-p2.png`).
The same 1 px orange text stroke appears on `integer_nl_drag`, `fraction_nl_drag`, `decimal_nl_drag` and `grade_3_mixed`, on the label text of added marks.
Fix: inside an added group, give `text, tspan` the rule `stroke: none` (or `paint-order` with a zero stroke width), and add a stroke-on-text check to the sweep.

## Non-blocking

- **N-1.** On Opener `area`, the legacy cell adds "Answer: 20" in orange under the Model. The pupil page traces 20 in grey, so this is the worked example's given answer printed in key ink. The short key correctly leaves it out. Suggestion: print it black, or not at all, on Model cells.
- **N-2.** With "Start each key on a new sheet" on, the print button still says "Print 2 pupil pages + key" while the run is 8 pages (P B K B P B K B). Suggest naming the sheet count, for example "… on 4 sheets, double-sided".
- **N-3.** "After each page" with keys that run to more than one page per pupil page falls back to At the end (the existing note). In a multi-section printout with new-sheet on, a section that falls back is not padded, so the next section could start on a back. This was not reproduced, because every tested role produced one key page per pupil page. Worth a guard: pad after any part that falls back.
- **N-4 (out of scope, pre-existing, not this lane).** Lesson `nl_add` Guided Practice: the number line runs past the left edge of its cell ("2" outside the border) and into the Steps panel, on the pupil page as well (`r3/lesson-nl_add-copy-p3.png`). This belongs to lesson.js / hop-line layout, not to the key; pass it to the lesson lane.

## Blank back page (owner decision: a very small "This page is intentionally blank" line will be added)

Today the blank back is an empty `<section class="ws-page ws-blank-back" data-ws-mode="blank">` with no header and no footer. It is a full A4 page in the PDF (`r3/newsheet-mp-add_facts-PBKB.png`, panels 2 and 4). This is not failed, because the line is not built yet.

Where the line should sit so that it matches the page footers:
- Use the kit's own footer, `frame.js` → `<footer class="ws-foot">`, with empty left and right spans and the text in the **centre** cell. That cell is where "1/1" / "Key 1/2" sits on every other page.
- That puts it in the same band as the footers: `.ws-foot` is 6 mm high, 3 mm below the content, aligned to the bottom, 7 pt, line-height 1.
- Use **regular weight** (not the bold page number), black, with no copyright line under it. The © line belongs to content pages.
- Use no header, tab or border, so a pupil never mistakes the page for a worksheet.
- Keep it on the page's existing `mq-paper-letter` / A4 geometry, so the line lands at the same height as the facing pages' footers when the sheet is held to the light.

## Correct as built

- **New-sheet option.** The real UI at 1366x768 and 1280x720 was used. Clicking After each page shows the checkbox. Checking it writes `{"keyPlace":"after-page","keyStyle":"copy","keyNewSheet":true}` to `mq_teacher_print_defaults`. After a reload it comes back checked. Switching to At the end hides it and keeps it saved. No console errors.
- **Page orders** from `buildSheet` on 12 roles × 8 skills:
  - New-sheet on gives `PBKB`, `PBKBPBKB` and so on, 168 of 168 builds. Every pupil page and every key starts on an odd page (the front), the length is always even, and short keys get a whole sheet each.
  - Off (unset, or `newSheet:false`) is byte-identical to round 2's `PKPK` (84 of 84).
  - At the end with `newSheet:true` is byte-identical to At the end (84 of 84).
- **Byte identity against current main (`df70e204`):**
  - Pupil pages are byte-identical in 756 of 756 builds (12 roles × 8 skills × 9 key settings: `true`, missing, `{}`, `false`, both placements × both styles, and `newSheet` true and false).
  - Default keys (`true`, missing, `{}`) match main's once `data-ws-key-*` tags are removed.
  - `key:false` matches main exactly.
- **Share codes.** No share or settings code changed: `ws-code-snapshot` gives 608 codes with nothing moved, `ws-share-options` is OK, and `skill-codes.js` carries no key fields.
- **Merge.** The lane merges into current `claude/sweet-newton-c8wrv1` (`df70e204`, which includes Chromebook fit) with **no conflicts**. All 8 lane JS files pass the syntax check in the merged tree.

## Gates run (one at a time)

| Gate | Result |
|---|---|
| `key-options.cjs`, lane tree | OK |
| `key-options.cjs`, merged tree (lane + df70e204) | OK |
| `ws-print-lint --self-test` (lane, merged) | OK (48 assertions, 36 planted defects) |
| `ws-print-lint --source kit` (lane, merged) | 463 findings in 33 of 191 documents, equal to the baseline |
| `ws-share-options` | OK |
| `ws-teacher-preview` | OK |
| `ws-boot-smoke` (lane, merged) | OK |
| `ws-code-snapshot.mjs` (lane, merged) | OK (608 codes, nothing moved) |
| Critic alignment sweep, all 576 skills on Independent (`r3/critic-r3-attack.cjs`) | 0 added SVG marks black, 0 given SVG marks orange; R3-1 borders on 215 skills |
| Critic sweep, 12 roles × 46 template skills | R3-1 on every role; short key complete; black marks only on traced (given) cells |
| Critic ring and text-stroke sweep (`r3/critic-r3-attack-rings.cjs`) | R3-3 on 5 skills; added black borders on 3 skills to check |
| UI at 1366x768 and 1280x720 (`r3/critic-r3-ui.cjs`) | R2-5 fixed; new-sheet toggle, saved default and reload OK |

## Owner questions

- **Q1.** On Guided Practice, the pupil page traces the answer (grey hops on `nl_add`, the grey time on the first Model) and the pupil goes over it. Should the key show a traced answer **black**, as a given (today), or **orange**, as the answer the pupil writes? Suggested answer: black on the Model, orange on Guided Practice items.
