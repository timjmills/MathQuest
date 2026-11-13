# lf-placevalue critic nwf r1: composing:number_word_form (independent critic, Opus medium)

Branch `claude/lf-placevalue-w2` at 2ccd5b21. Renders are under
`/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-nwf1/` (root R). Browser commands were run one at a time:

- `R/main`: every brief role at S/M/L, plus the card at 390/820/1280, the worksheet and the quiz.
- `R/opt-{tw,b20,b100,b1000,zs,za,hto}`: independent S and L for each option value. `zs`/`za` are band 1000 with zeroPlace some/always. `hto` is band 1000 + some + answerSlot hto.
- `R/lesson-opts`: lesson, true-false and scripted-model at M, with the LESSONS entry's practice options (to_number, band 1000, zeroPlace some, hto).
- `ws-empty-band --skill composing:number_word_form` (all rules), plus a `--hosts none --json` rerun (`R/eb.json`) for the full per-role list.

Numbers marked "px" are pixel rows at 96 dpi (1 px = 0.265 mm). All other numbers are ws-empty-band DOM mm.

## Grade table (C1-C2-C3-C4)

| Page | S | M | L | Measured / note |
|---|---|---|---|---|
| independent + key | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | 28 / 21 / 15 a page (4x7, 3x7, 3x5). No EB finding. The room above the line is about 12 mm (px). The key is a facsimile and right on all 28 S items (23, 17, 50, 86 ... 73). The default deal mixes teens, decades and 2-digit names; "one hundred" turns up only now and then (see N4) |
| more-practice + key | 8-8-8-8 | 8-8-8-8 | 8-8-8-8 | Same geometry as independent (4x7 / 3x7 / 3x5). No EB finding |
| test + key | 8-8-**6**-8 ENGINE | 8-8-8-8 | 8-8-8-8 | S: 20 items in 4x5, about 21 % of the body empty at the foot. EB-BAND 20 cells, max 31.4 %: test.js row band (D3). S item 18 "one hundred": its line sits about 20 px (5 mm) below the row's other lines (N4, pv) |
| review + key | 8-8-**6**-8 ENGINE | 8-8-**6**-8 ENGINE | 8-8-**6**-8 ENGINE | EB-BAND 12/9/6 cells, max 31.7 / 32.5 / 32.9 %: review.js row bands (D3). The Mixed Review (odd/even) is fine |
| true-false + key (default) | 8-**3**-8-8 | 8-**2**-8-8 | 8-**3**-8-8 | **N1.** M: all 6 items are True (83, 94, 25, 17, 48, 82). S: 7 of 8 are True; the one False is "seventeen 70". Ticking True every time scores 100 %. pv-owned |
| true-false (hto, lesson options) | **2-2**-8-8 | - | - | **N2.** The claim is never printed. Every item shows EMPTY H T O boxes, yet the key marks 825, 941 and 202 "False". There is nothing on the page to judge. pv-owned |
| error-analysis + key | 8-7-7-8 | 8-7-8-8 | 8-7-8-8 | Only the teens get a wrong answer (16 -> 60, 17 -> 70), so the page judges just one misconception (N1 root). S EB-BAND 6 cells, max 39.9 % (ENGINE D3). Out of the pass bar (RUBRIC scope note) |
| reason-it + key | 8-7-**3**-8 | 8-7-**3**-8 | 8-7-**3**-8 | M: ONE item on the page (nineteen: 90 vs 19), and about 70 % of the page is blank. The provider can make a wrong answer only for teens (N1 root), so the role cannot fill the page. pv-owned cause; the layout is under D3 |
| scripted-model | **5-3**-**5**-8 | **5-3**-**5**-8 | **5-3**-**5**-8 | **N3.** Step 1 reads `"thirty-five hundred": 0 in the hundreds.`, which is false (thirty-five hundred is 3,500). **N5.** Row 3 "Write 35." leaves the answer line EMPTY: the model never shows its answer. EB-SIDE 62-69 %, EB-BAND 46.5-56.9 %: the row layout is D3 ENGINE |
| guided | 7-**3**-**5**-8 | 7-**3**-**5**-8 | 7-**3**-**5**-8 | The faded hints say "twenty-six hundred": 0 in the hundreds (N3). The Model cell has no answer (N5). "one hundred" sits lower than its row (N4). EB-BAND to 62 %: D3 |
| opener | 7-6-**6**-8 | 7-6-**6**-8 | 7-6-**6**-8 | The Model cells have blank answers (N5). The steps "Read the hundreds word" sit beside 2-digit items. EB-BAND 39-50 %: D3 |
| lesson p1-p3 + keys (skill default options) | 8-**3**-8-8 | 8-**3**-8-8 | 8-**3**-8-8 | p1 model step 1, and the Steps strip on p2/p3: `"thirty-nine hundred": 0 in the hundreds.` (N3). The Rule "Three boxes, three digits." is printed over 2-digit items that have no boxes (N6). p2 warm-up EB-BAND 40.4 % / EB-SIDE 35 %: lesson.js (D3) |
| lesson, LESSONS options (R/lesson-opts, M) | 7-7-8-8 | - | - | The model (four hundred thirty-one in H T O) is right and the steps are right. p2 Guided model reads **"one hundredthirteen"**, with the space dropped where the highlight split the words (N7). On p3, "one thousand" has four boxes (Th H T O) under "Three boxes, three digits." (N6) |
| opt to_words | 8-8-**6**-8 | - | 8-8-**6**-8 | Known red. 9 items a page (S) and 6 (L), one across. The 70 mm write line leaves about 31 % beside it on each side (px). It holds pv |
| opt band 20 | 8-8-**5**-8 | - | 8-8-**6**-8 | Known red. S: 10 items in 2x5 (only ten names exist). In each cell the band under the line is 87 px of 169 px = **51 %** (px), and the word "twelve" fills about 17 % of the cell width. It holds pv |
| opt band 100 | 8-8-8-8 | - | 8-8-8-8 | 21-100 dealt, 3x5 at L |
| opt band 1000 | **7**-8-8-8 | - | **7**-8-8-8 | Rows align. The key is right (L: 232, 176, 497, 852, 757, 491, 783, 401, 432, 522, 278, 171). S item 14 breaks as **"seven / hundred eight"** (N8) |
| opt zeroPlace some / always | **7**-8-8-8 | - | **7**-8-8-8 | za L: 207, 105, 407, 1000, 720, 450, 709, 907, 409, 570, 290, 120, all right. Item 7 breaks as **"seven / hundred nine"** (N8) |
| opt answerSlot hto | 8-8-8-8 | - | 8-8-8-8 | S: 10 items in 2x5. The key boxes are right (232, 176, 407, 852, 757, 450, 783, 401, 409, 522). The side band is about 25 % (px) |
| card 390 / 820 / 1280 | 5-7-6-6 | 5-7-6-6 | 5-7-6-6 | The legacy q.visual: a "Number Word Form" title inside the cell, and empty "tens / ones" boxes **plus** a separate yellow input (two answer places). The words sit outside the cell. ws-empty-band: "no kit cell on the host". See N9 (ownership) |
| worksheet 1280 | 7-8-5-7 | | | The legacy cell (D3): the words are in the chrome, the cell is an empty box with a line, and about 70 % of the cell is empty |
| quiz 1280 | 5-7-6-6 | | | The same legacy visual as the card (D3: legacy quiz cell) |

## Findings

**N1. True or False? / Reason It / error-analysis have no wrong answers for 2-digit names (pv-owned, holds).**
- Where: true-false S/M/L, reason-it S/M/L, error-analysis.
- What: `wrongAnswer` in `sheet/providers/pv.js` (~l.1268) builds candidates only when `h > 0` (M-Z1, M-V9) or for a teen (M-L3). The skill's default band deals 10-100, so nearly every T/F claim is the true value. True-false M is 6/6 True; reason-it holds 1 item a page.
- Rubric: C2, "nothing gives the answer away"; PEDAGOGY misconception pages.
- Fix direction: a 2-digit misconception set, e.g. the digits reversed (forty-one -> 14) or ty/teen for ty names (sixty -> 16).
- Check: `ws-providers-unit` WRONG-RATE: on every offered band, at least 1/3 of dealt items must get a wrong answer that differs per slot. Also add a ws-cell-checks TF-BALANCE rule: a true-false page must not be all True / all False.

**N2. In H T O mode the True or False? claim is invisible (pv-owned, holds).**
- Where: true-false (and any claim role) with answerSlot hto.
- What: the words cell with `slot: 'hto'` leaves the boxes empty, so the claimed numeral never prints. The key marks False against nothing.
- Rubric: C1 "the task makes sense on paper"; C2.
- Check: ws-cell-checks CLAIM-INK: on true-false / reason-it / error-analysis, the claimed value's text must appear in the pupil page's cell, for every offered option set.

**N3. Worked steps for a number with no hundreds are false (pv-owned, holds).**
- Where: scripted-model, guided hints, opener steps, the lesson model and the lesson Steps strip, at the default band.
- What: `workedSteps` prints `"${words.split(' hundred')[0]} hundred": 0 in the hundreds`, which gives "thirty-five hundred" (= 3,500).
- Rubric: C2, wrong maths taught.
- Fix direction: when n < 100, skip the hundreds step.
- Check: `ws-providers-unit` STEPS-TRUE: for every band, a step must not quote a hundreds phrase that the item's words do not contain (the quoted text must be a substring of `p.words`).

**N4. "one hundred" sits off its row's line (pv-owned).**
- Where: test S item 18; guided M; opener S.
- What: this round's "3-digit names keep two lines, bottom-aligned" covers band=1000 only. In a 2-digit row, the one-line "one hundred" is centred in a two-line box, so its line is about 5 mm lower than its neighbours'.
- Rubric: C3 "answer in the same place in every cell", AX-4.
- Check: ws-cell-checks ROW-SLOT-Y: within a grid row, answer-slot y positions must not differ by more than 1 mm, at the default band too.

**N5. The model never shows its answer (pv-owned).**
- Where: scripted-model row 3, guided "Model" cell, opener Model cells.
- What: the step writes `{slot:'answer'}`, but the in-place words cell does not trace it on these roles. The lesson p1 does trace "39". "Trace the answer" therefore has nothing to trace.
- Rubric: C1, PEDAGOGY model.
- Check: ws-empty-band `--model-states` (MODEL-ANSWER) on number_word_form: the last model state must carry ink in the answer slot.

**N6. The chant "Three boxes, three digits." contradicts its own items (pv-owned: lesson routine and deal).**
- What: at the skill's default options the lesson prints 2-digit items with no boxes under this Rule. With the lesson's own options, "one thousand" deals four boxes.
- Also: the lesson role at default options does not use the LESSONS practice options (band 1000, hto). Lane or lead should confirm which options the printed lesson is meant to carry.
- Rubric: C2.
- Check: a lesson-unit assertion. When a routine's chant names a box count, every practice item's `slot.count` must equal it. Alternatively, deal band 1000 without 1000 in the lesson.

**N7. Missing space in the highlighted guided model: "one hundredthirteen" (pv-owned, words cell highlight).**
- Where: lesson (LESSONS options) p2 Guided model.
- Rubric: C1, C4.
- Check: ws-cell-checks WORDS-TEXT: the cell's textContent, with whitespace collapsed, must equal `p.words` on every role and state.

**N8. 3-digit names wrap inside the hundreds phrase: "seven / hundred eight", "seven / hundred nine" (pv-owned).**
- Where: band 1000 S, za L.
- What: the template keeps two lines but lets the browser choose the break. The skill's step 1 is "Read the hundreds word", so the hundreds phrase should stay on one line.
- Fix direction: break after "hundred" (a nbsp inside "seven hundred").
- Rubric: C1 for an ELL reader.
- Check: ws-cell-checks WORDS-BREAK: on 2-line names, line 1 must end with "hundred" (or be the whole name).

**N9. The card's legacy visual has two answer places (ownership for lead).**
- What: the empty tens/ones boxes plus the input on the card 390/820/1280. The visual comes from `gen-algebraic.js` (~l.2567, `q.visual`), so the generator is pv's. D3 names the legacy worksheet / quiz cells and the screen numerals, but not the card. Graded C1 5. I record it as D3-class pending a lead ruling; it does not by itself decide this verdict.
- Check: ws-empty-band already notes "no kit cell on the host". Make that note a FAIL for a skill whose print cell is a kit template (SCREEN-PARITY).

Known reds:
- band=20 at S: 51 % under the line (px). It holds the skill.
- to_words at 9 / 6 items a page, with about 31 % beside the line. It holds the skill.

## ENGINE-ROLES (lead ruling D3: graded, recorded, does not hold the skill)

- test.js S row band: EB-BAND 31.4 % on 20 cells, and about 21 % of the page empty at the foot.
- review.js row bands: S/M/L max 31.7 / 32.5 / 32.9 %.
- guided rows: EB-BAND to 62 %, EB-SIDE to 38 %.
- scripted-model rows: EB-BAND to 56.9 %, EB-SIDE to 69 %.
- opener rows: EB-BAND to 50.4 %.
- error-analysis S: EB-BAND 39.9 %.
- reason-it: L EB-BAND 36.9 %, and a lone item (cause N1).
- mixed-practice: M EB-FOOT -21 % (8 cells); L EB-SIDE 31 %.
- lesson.js: p2 warm-up EB-BAND 40.4 % (S/M) and EB-SIDE 31-35 % (S/M/L).
- Screen numerals and the legacy worksheet / quiz cells.

## VERDICT: FAIL

Failing (page, criterion) pairs that are pv-owned and hold the skill:

- lesson S/M/L, C2 3 (N3, N6).
- scripted-model S/M/L, C2 3 and C1 5 (N3, N5).
- guided S/M/L, C2 3 (N3, N5).
- true-false S/M/L, C2 2-3 (N1); true-false hto, C1 2 and C2 2 (N2).
- reason-it S/M/L, C3 3 (N1 cause).
- opener S/M/L, C1 7 and C2 6 (N5, steps).
- error-analysis S/M/L, C2 7 (N1).
- opt band 1000 S/L and zeroPlace S/L, C1 7 (N8).
- opt band 20 S, C3 5, and L, C3 6 (known red).
- opt to_words S/L, C3 6 (known red).
- lesson (LESSONS options), C1 7 and C2 7 (N6, N7).
- test S, C3 (N4 on top of the D3 band).
- card 390/820/1280: C1 5, C3 6 and C4 6 (N9, ownership for lead).

Practice (independent and more-practice at S/M/L, with keys), test M/L, band 100 and the hto option are at 8 or better.
