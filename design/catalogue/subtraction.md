# Family review: subtraction

Category: `subtraction` (51 skills). Generator: `js/modules/gen-operations.js`; `sub_5_pictures` lives in `js/modules/gen-counting.js:868`; routing and the mixed-pool resolver are in `js/modules/generate-question.js`; skill list and grades in `js/modules/data.js:572-627`. A second, divergent copy of the `sub_facts` generator lives in `js/modules/print-generate.js:753` and `:3458`. Machine-readable hosts, tags and verdicts: `design/catalogue/subtraction.overrides.json`.

## Family summary

1. Verdicts: keep 1, fix 31, redo 5, merge 10, split 4 (total 51). Hosts after review: `computation-grid` 28, `word-problems` 19, `visual-grid` 3, `equation-drill` 1. The catalogue's host guesses are wrong for 16 skills: it sent `sub_wp_20` … `sub_wp_1m` and the eight `_plain` twins to `computation-grid` (they are stories) and `subtract` to `visual-grid` (it is bare column work).
2. Worst problem 1: `sub_100_regroup` is almost entirely `100 − n`. `generateSubPair` sets `wantStrategic = regroupType === 'regroup' && maxVal >= 100` (`gen-operations.js:459`) and then demands two borrow columns (`:477`). Inside 100 only a three-digit minuend can borrow twice, so the only qualifying minuend is 100. The baseline print shows five of six items as `100 − 22 / 37 / 51 / 95 / 17`, and the sixth (`99 − 6`) comes from the unchecked fallback at `:484-487` and needs no regrouping at all. A grade-2 "subtract within 100 with regrouping" page is therefore an across-zeros page (owner ruling: across zeros is a later sub-ladder) with a stray non-regrouping item and a 3-digit minuend in a 2-digit skill.
3. Worst problem 2: `sub_facts` cannot generate the half of the fact table that matters. In facts mode the pair is drawn as `a = rng(1, 20); b = rng(1, 20 - a)` (`gen-operations.js:4743-4747`), so minuend + subtrahend ≤ 20 rather than minuend ≤ 20. Every fact where a teen minuend meets a large subtrahend — `13 − 8`, `17 − 9`, `15 − 7`, i.e. exactly the regrouping facts of 1.OA.C.6 — is impossible; big minuends only ever meet 1, 2 or 3 (samples: `20 − 1`, `17 − 1`, `14 − 4`). There is no per-set option (Subtracting 1 … 10, then 0), no `n − 0` / `n − n`, no count-back cue, and vertical / horizontal alternate at random inside one section (`:5237`), visible in the baseline print as item 3 among five horizontals.
4. Worst problem 3: answer leaks and dead code in the word problems. `sub_word_problems` prints the caption `Started with ${total}` under every picture (`gen-operations.js:3811`); in the start-unknown variant `total` is set to the start (`:3776-3778`), so the caption states the answer — the baseline shows "Owen had some dollars … How many did Owen have to start?" above "Started with 14:". In the same generator `roll` holds a string from `pickVariant` but two branches test it numerically (`} else if (roll < 0.72)` at `:3710` and `roll < 0.86` at `:3738`), so the change-unknown and compare-fewer variants are unreachable and every non-take-away, non-compare item falls through to start-unknown. `nl_sub` leaks in the same way: the `find_min` variant draws the hop with `showAnswer: true` and highlights the starting point, so the answer is the dot already on the line (`:674-676`).
5. Worst problem 4: the word-problem pages do not fit and the pictures contradict the numbers. `word-sub` and `unknown-start-wp` cards are so tall that the baseline prints 3 of 6 (`sub_wp_100`), 4 of 6 (`sub_word_problems`) and 2 of 6 (`unknown_start_wp`) before the page ends, and `unknown_start_wp` item 2 loses its answer line at the break. The picture row is capped at 20 icons (`:1119`, `:3800`) while the story says 48 or 90, so the art contradicts the mathematics (P-18); the icons print as a strike-through row of 3 mm glyphs inside a pink or yellow dashed pastel box.
6. Worst problem 5: pupil-facing "borrow". `buildColumnVisual` labels the regroup row "Use top row for borrowing" (`:523`, `carryLabel` `:504`), the range-skill hint says "Borrow when the top digit is smaller!" (`:981`), the `subtract` hint says "Borrow if needed!" (`:5107`, `:5133`) and a distractor message says "forgot to regroup (borrow)" (`:1001`). P-32 allows "regroup" only. The same visual carries the operation in colour (green border for add, pink for subtract, orange for the regroup row) and every item of every column skill ships it.
7. Also family-wide: across-zero items are injected at random into the regroup skills — `wantAcrossZero = wantStrategic && maxVal >= 1000 && Math.random() < 0.15` (`:463`) — which silently mixes the L-5Z sub-ladder into general regrouping and makes a one-type page impossible; the `_plain` twins are the same generator with `q.visual = ''` (`generate-question.js:524-529`), so nine ids are options, not skills; `mixed_add_sub` never produces addition (below); word-problem hints teach keywords ("Words like 'left', 'remain', 'took away' mean SUBTRACT", `:1095`) against P-21 and the research read-across; `_equationBuilderHTML` bolts a blue choose-the-sign widget onto every story visual (`:18-30`), a second task the paper item does not have; and the `sub_wp_*` templates put an active past verb into a passive frame, producing "4 were ate", "85 were ate" (`:1090-1094`).
8. What is already good: the range × regrouping grid itself is the right shape (without → with → mixed at eight sizes, exactly the IXL / Math-Drills rung order); the print column cell (`print-generate.js:5796-5853`) draws a real digit stack with regroup boxes, hides them on `_no_regroup` skills and prints place-value letters, so the structural scaffold of L-3/L-5 already exists; `number_line_sub` and `nl_sub` draw correct, legible, countable hops; `missing_add_sub` prints cleanly at 6 to a page; `sub_50_regroup` and the 1k–1m skills produce sound, varied pairs; every skill has worked-solution text and a hint, so no skill is starting from nothing; `bwIcon` line art has already replaced emoji everywhere except `sub_5_pictures`.
9. Existing worked text is 2 lines for the fact and story skills and up to 5 for the column skills (`workedMax` 2 / 5). The column text ("Line up digits by place value. Subtract each column from the ones.") is usable as the first two `workedSteps` once "borrow" is removed; everything else is a restatement of the hint. `workedSteps`, `wrongAnswer`, the `Say:` frame and vocabulary must be authored for all 51; `decision` lines for the 15 `sub-decide` skills and `setupOnly` for the 40 `sub-setup` skills do not exist at all (catalogue: sub-skill readiness "author" for every skill in the family).
10. The pedagogy standard's L-2, L-3, L-5 and L-5Z are adopted below as SU-F, SU-C, SU-R and SU-Z with two additions the research asks for (ragged lengths, missing digits). 19 ladder steps have no skill today.

## Proposed ladders

One delta per step. "opt" = an option on an existing id, not a new id. `responseScope` values are the contract's.

### SU-F: subtraction facts within 20 (K-1)

Strategy: count back with a dot tile on the subtrahend (P-2). Adopts L-2.

| Step | I Can … | Delta | Skill |
|---|---|---|---|
| F1 | Take Away and Count What Is Left | start | `sub_5_pictures` (redo: counters, cross out) |
| F2 | Subtract With a Picture and Numbers | representation: bridging | `sub_5_pictures` opt `frame=picture+symbols` |
| F3 | Subtract on a Number Line | representation | `number_line_sub` (hops drawn), then `nl_sub` `task=find_diff` |
| F4 | Subtract 1 and Subtract 2 | responseScope: full | `sub_facts` opt `facts=[1,2]`, vertical, dot tile |
| F5 | Subtract 1 and Subtract 2 Written Across | format | same id, horizontal; both orientations in separate sections from here |
| F6-F12 | Subtract 3 … Subtract 9 (one set per step) | range (fact set) | `sub_facts` opt `facts=[n]` |
| F13 | Subtract 0 and Subtract All | range (fact set) | NEW `sub_zero_all` (`n − 0`, `n − n`; last, per P-FL-18) |
| F14 | Subtract From 10 | range | `sub_10_regroup` (redo as "subtract from 10") |
| F15 | Subtract a Digit From a Teen (no regroup) | range | `sub_20_no_regroup` |
| F16 | Subtract a Digit From a Teen (use ten) | range | `sub_20_regroup` |
| F17 | Facts to 20, Mixed | range | `sub_20_mixed`, `sub_facts` opt `facts={from:0,to:9}` |
| F18 | Find the Missing Part | unknown | `missing_add_sub` split (SU-U) |
| F19 | Add or Subtract: Look at the Sign | opMix | `mixed_add_sub` (redo) |
| F20 | Solve Take-Away Stories | representation | `sub_wp_10`, then `sub_wp_20` |

`sub_10_no_regroup` and `sub_10_mixed` are the within-10 entry pages for F4-F6 at Level K.

### SU-C: column subtraction without regrouping (grades 1-3)

Strategy: standard algorithm, ones first. Adopts L-3.

| Step | I Can … | Delta | Skill |
|---|---|---|---|
| C1 | Subtract Tens and Ones With Blocks | start | NEW `sub_2d_blocks` |
| C2 | Write a Subtraction Problem From Blocks | responseScope: setup | `sub_2d_blocks` `responseScope=setup` |
| C3 | Subtract a One-Digit Number (lined up) | range (ragged) | NEW `sub_2d_1d` (research item 7) |
| C4 | Subtract Two-Digit Numbers | range | `sub_50_no_regroup`, then `sub_100_no_regroup` |
| C5 | Rewrite a Problem in the Grid | format | `sub-setup` page of C4 ("Do not solve.") |
| C6 | Subtract Three-Digit Numbers | range | `sub_1k_no_regroup` (3d − 2d before 3d − 3d) |
| C7-C9 | Four, Five, Six Digits | range | `sub_10k_no_regroup`, `sub_100k_no_regroup`, `sub_1m_no_regroup` |

### SU-R: subtraction with regrouping (grades 2-5)

Strategy: standard algorithm, regroup from the next place. Adopts L-5.

| Step | I Can … | Delta | Skill |
|---|---|---|---|
| R1 | Trade 1 Ten for 10 Ones | start | NEW `sub_trade_ten` |
| R2 | Tell When I Need to Regroup | responseScope: decision | `sub_100_mixed` `responseScope=decision` (sub-decide page) |
| R3 | Regroup With a Picture | representation: bridging | `sub_trade_ten` opt `frame=picture+grid` |
| R4 | Show the Regrouping | responseScope: notation | `sub_50_regroup` `responseScope=notation` (sub-notate page) |
| R5 | Subtract Two Digits With Regrouping (boxes) | responseScope: full | `sub_50_regroup` |
| R6 | Subtract Two Digits (no boxes, mixed) | scaffold | `sub_50_mixed`, `sub_100_mixed` |
| R7 | Rewrite and Subtract | format | `sub-setup` page of R6 |
| R8 | Solve Regrouping Stories | representation | `sub_wp_50`, `sub_wp_100` |
| R9 | Three Digits: Regroup the Ones | range | `sub_1k_regroup` opt `places=[ones]` |
| R10 | Three Digits: Regroup the Tens | range | `sub_1k_regroup` opt `places=[tens]` |
| R11 | Three Digits: Regroup Twice | range | `sub_1k_regroup` opt `places=[ones,tens]` |
| R12 | Four Digits (no zeros in the top number) | range | `sub_10k_regroup` |
| R13 | Five, Then Six Digits | range | `sub_100k_regroup`, `sub_1m_regroup` |
| R14 | Find the Missing Digit | unknown | NEW `sub_missing_digits` (research item 15; dashed digit box) |
| R15 | Check by Adding | responseScope: judge | NEW `sub_check_by_adding` (research item 20) |

### SU-Z: subtracting across zeros (after SU-R; owner ruling)

Adopts L-5Z. No skill exists today; the 15% random injection at `gen-operations.js:463` must be removed from SU-R first.

| Step | I Can … | Delta | Skill |
|---|---|---|---|
| Z1 | Subtract From a Whole Ten | start | NEW `sub_from_whole_ten` |
| Z2 | Subtract From a Whole Hundred | range (2 zeros) | NEW `sub_from_whole_hundred` (takes the `100 − n` items now trapped in `sub_100_regroup`) |
| Z3 | Subtract From a Whole Thousand | range (3 zeros) | NEW `sub_from_whole_thousand` |
| Z4 | Subtract Across One Zero | position (tens) | NEW `sub_across_one_zero` |
| Z5 | Subtract Across Two Zeros | range (2 zeros inside) | NEW `sub_across_two_zeros` |
| Z6 | Subtract With Zeros in the Middle | position | NEW `sub_zeros_middle` (seeds the P-10 non-example where nothing crosses the zero) |

### SU-W: subtraction stories, one schema per step (K-5)

Word problems follow the computation step at the same range (P-21). Ranges come from the existing `sub_wp_*` ladder (10, 20, 50, 100, 1k, 10k, 100k, 1m).

| Step | Schema | Skill |
|---|---|---|
| W1 | separate, result unknown ("How many are left?") | `sub_wp_*` (take-away only after the split) |
| W2 | separate, change unknown ("How many were taken?") | NEW `sub_wp_change_unknown` (revives the dead branch at `:3710`) |
| W3 | separate, start unknown | `unknown_start_wp` opt `variant=give` |
| W4 | compare, difference unknown ("How many more?") | NEW `sub_wp_compare` (split of `sub_word_problems`) |
| W5 | compare, smaller unknown ("n fewer than") | NEW `sub_wp_compare_fewer` (revives the dead branch at `:3738`) |
| W6 | part-whole, part unknown | NEW `sub_wp_part_whole` |

`unknown_start_wp` opt `variant=get` is an *addition* start-unknown item and belongs to the addition family's ladder, not here.

### SU-U: unknowns and equality (grades 1-2)

One unknown position per step, addition before subtraction before mixed (P-16, research item 12).

| Step | Unknown | Skill |
|---|---|---|
| U1 | `a − b = ?` (result) | not a missing-number item; it is SU-C/SU-R |
| U2 | `a − ? = c` (subtrahend) | NEW `missing_sub` opt `unknown=subtrahend` |
| U3 | `? − b = c` (minuend) | NEW `missing_sub` opt `unknown=minuend` |
| U4 | mixed positions, subtraction only | `missing_sub` opt `unknown=mixed` |
| U5 | + and − mixed (discrimination) | `missing_add_sub` (keeps the id, becomes the mixed step) |

### Skills in no ladder

`mixed_subtraction` is a review pool for Mixed practice and Daily Spiral. `mixed_add_sub` is the SU-F F19 / SU-U U5 discrimination step once it really mixes. The eight `sub_wp_*_plain` ids, `sub_word_problems_plain` and `subtract` become options on their targets and carry no ladder step of their own.

## Every skill

"W" = `workedSteps` must be authored. Misconception ids: SU-M1 subtracts the smaller digit from the larger in each column; SU-M2 forgets to reduce the digit that was regrouped from; SU-M3 regroups when no regrouping is needed; SU-M4 treats `0 − n` as `n`; SU-M5 counts the start number as the first count back (off by one); SU-M6 reverses the numbers (`b − a`); SU-M7 adds instead of subtracting; SU-M8 on a compare story, subtracts the wrong pair or adds.

| Skill id | Grade | Host | Special tags | Verdict | Defects (short) | To author |
|---|---|---|---|---|---|---|
| `sub_facts` | 1 | computation-grid | fact-layouts, fact-family, flashcards, k-one-page, hands-sort, hands-match, hands-find | redo | `a + b ≤ 20` gate makes every teen-minus-large-digit fact impossible (`:4743-4747`); no fact-set option; no `n − 0` / `n − n`; vertical and horizontal alternate at random in one section (`:5237`); no dot cue; a second generator in `print-generate.js:753, :3458` prints "facts" to 100 | W; SU-M5, SU-M6, SU-M1; Say: "___ minus ___ equals ___."; vocab: subtract, difference, count back |
| `subtract` | 1 | computation-grid | sub-setup | merge -> `sub_100_mixed` | twin of the `_mixed` ladder driven by `state.range`; adds a 10% missing-operator branch that is 4-way multiple choice with × and ÷ inside a grade-1 subtraction skill (`:4634-4676`) and a 20% missing-number branch (`:4678`); "Borrow if needed!" (`:5107`, `:5133`); at range 1,000+ it prints 4-digit column work under a grade-1 tag | alias option `range=setting`; move missing-number to `missing_sub`, missing-operator to `mixed_add_sub` |
| `sub_word_problems` | 2 | word-problems | sub-setup, schema-story, hands-match | split | five schemas in one id, two of them dead code (`:3710`, `:3738`); the picture caption prints the answer on start-unknown items (`:3811`); 20% "circle the numbers you need" variant with broken text ("Emma had 22 crayons in 9 minutes", `:224`); icons capped at 20 for totals up to 100; pastel dashed boxes; 4 of 6 items fit the page | variants `take_away`, `compare`, `compare_fewer`, `change_unknown`, `start_unknown`; W; SU-M7, SU-M8, SU-M6; Say: "___ take away ___ is ___."; vocab: left, difference, fewer |
| `sub_word_problems_plain` | 2 | word-problems | sub-setup, schema-story, hands-match | merge -> `sub_word_problems` | same generator with `q.visual = ''` (`generate-question.js:524-529`) | alias option `pictures=off` |
| `missing_add_sub` | 1 | equation-drill | k-one-page | split | six unknown positions and two operations chosen per item (`:2700-2701`); the `sum` / `difference` positions are plain computation, not missing-number items (baseline item 4: `16 − 11 = ?`); no part-whole box or tally scaffold (L-2 step 13); decimals silently enter from `state.decimalPlaces` | variants by `op` × `unknown`; NEW `missing_sub`; W; SU-M7, "subtracts when the unknown is the minuend", SU-M6; Say: "___ take away ___ leaves ___."; vocab: missing, part, whole |
| `sub_5_pictures` | K | visual-grid | k-one-page | redo | emoji objects (`gen-counting.js:869`) against the owner ruling; red strike-through carries the meaning (`:879`); two answer slots per cell (a `?` in the equation and an "Answer:" line); 8 distinct items in 12 (items 1 and 2 identical in the baseline); `n ≤ 5` only, never 0 or `n − n` | rebuild on plain counters / the 8 line-art pictures, black cross-out; W; SU-M5, SU-M4, "counts the crossed-out ones too"; Say: "___ take away ___ is ___."; vocab: take away, left, cross out |
| `unknown_start_wp` | 2 | word-problems | schema-story | split | `give` is subtraction-start-unknown, `get` is addition-start-unknown, alternating (`:3864`); 50% of items are built as multiple choice (`:3901`); operator coloured green / orange by operation (`:3933`); the unknown sits in a dashed box (P-26 reserves dashed); the equation is printed for the pupil, so nothing is set up; 2 of 6 items fit the page and item 2 loses its answer line | split `give` (stays) / `get` (addition family); W; "answers with the number shown now", "undoes with the wrong operation", SU-M6; Say: "___ plus ___ equals the start."; vocab: at first, start, now |
| `sub_10_no_regroup` | K | computation-grid | fact-layouts, flashcards, k-one-page, sub-setup | fix | "borrowing" caption and pink / orange column visual on every item (`:504-520`); 9 distinct in 12; no `n − 0` or `n − n`; grade K but 1.OA.C.6 content | W (existing column text usable after the wording fix); SU-M5, SU-M6, SU-M4; Say: "___ minus ___ equals ___."; vocab: minus, difference |
| `sub_10_regroup` | K | computation-grid | fact-layouts, flashcards, k-one-page, sub-setup | redo | nothing can regroup inside a single digit, so the skill degenerates to `10 − n`; 6 distinct in 12 (the baseline repeats `10 − 9`); mislabelled as regrouping | rebuild as "Subtract From 10" (SU-F F14); W; SU-M4, SU-M5; Say: "10 minus ___ equals ___."; vocab: ten, left |
| `sub_10_mixed` | K | computation-grid | fact-layouts, flashcards, k-one-page, sub-setup | fix | the "mixed" of two sets that are the same set plus `10 − n`; no mixed-section instruction; 9 distinct in 12 | W; as `sub_10_no_regroup`; section instruction that says the page is mixed |
| `sub_20_no_regroup` | 1 | computation-grid | fact-layouts, flashcards, k-one-page, sub-setup | fix | ragged (2d − 1d) and equal-length pairs mixed at random; column visual wording and colour; no ten-frame or number-strip scaffold | W; SU-M5, SU-M1, SU-M6; Say: "___ minus ___ equals ___."; vocab: ones, tens |
| `sub_20_regroup` | 1 | computation-grid | fact-layouts, flashcards, k-one-page, sub-decide, sub-notate, sub-setup | fix | as above; the "use ten" strategy is never shown; hint says "Borrow when the top digit is smaller!" | W; SU-M1, SU-M2, SU-M5; decision lines: "The top ones digit is smaller. I regroup." / "The top ones digit is bigger. No regrouping."; notate line: "Cross out the ten. Write 10 more ones."; Say: "13 is 0 tens and 13 ones."; vocab: regroup, ten, ones |
| `sub_20_mixed` | 1 | computation-grid | fact-layouts, flashcards, k-one-page, sub-decide, sub-setup, hands-sort | fix | no mixed-section instruction; no deliberate no-regroup seeding ratio | W; SU-M1, SU-M3; decision lines as `sub_20_regroup`; sort labels: "Regroup" / "No regrouping" |
| `sub_50_no_regroup` | 2 | computation-grid | sub-setup | fix | wording and colour; no place-value letters below grade 3 (`print-generate.js:5815`) although L-3 asks for them; `minVal = maxVal/10` so the small-number and ragged cases never appear | W; SU-M1, SU-M6; Say: "___ minus ___ equals ___."; vocab: ones, tens, line up |
| `sub_50_regroup` | 2 | computation-grid | sub-decide, sub-notate, sub-setup | fix | wording and colour only; the pair generation here is sound | W; SU-M1, SU-M2, SU-M5; decision and notate lines as `sub_20_regroup`; Say: "4 tens 2 ones becomes 3 tens 12 ones."; vocab: regroup, tens, ones |
| `sub_50_mixed` | 2 | computation-grid | sub-decide, sub-setup, hands-sort | fix | no mixed instruction; no seeded ratio | W; SU-M1, SU-M3; decision lines; sort labels |
| `sub_100_no_regroup` | 2 | computation-grid | sub-setup | fix | as `sub_50_no_regroup`; 2d − 1d ragged items arrive by accident, not as a step | W; SU-M1, SU-M6 |
| `sub_100_regroup` | 2 | computation-grid | sub-decide, sub-notate, sub-setup | redo | the two-borrow gate leaves `100 − n` as the only qualifying item (`:459`, `:477`); the fallback (`:484-487`) emits unchecked pairs, so a "with regrouping" page can contain `99 − 6`; 3-digit minuend inside a "within 100" skill; this is Z2 content at grade 2 before any 2-digit regrouping | restrict the 2-borrow rule to 3+ digits; move `100 − n` to `sub_from_whole_hundred`; W; SU-M1, SU-M2, SU-M4; decision, notate lines |
| `sub_100_mixed` | 2 | computation-grid | sub-decide, sub-setup, hands-sort | fix | no mixed instruction; this is the natural host of the R2 decide-only page | W; SU-M1, SU-M3; decision lines: "regroup" / "no regrouping"; sort labels |
| `sub_1k_no_regroup` | 3 | computation-grid | sub-setup | fix | 3d − 2d and 3d − 3d mixed at random (research: ragged comes first); wording and colour | W; SU-M1, SU-M6, "lines the numbers up on the left"; vocab: hundreds, place value |
| `sub_1k_regroup` | 3 | computation-grid | sub-decide, sub-notate, sub-setup | fix | which place regroups is random, so R9-R11 cannot be separated; across-zero items injected at 15% (`:463`) | option `places=[ones|tens|both]`; W; SU-M1, SU-M2, SU-M4; decision, notate lines |
| `sub_1k_mixed` | 3 | computation-grid | sub-decide, sub-setup, hands-sort | fix | no mixed instruction; inherits the zero injection | W; SU-M1, SU-M3; decision lines |
| `sub_10k_no_regroup` | 4 | computation-grid | sub-setup | fix | wording and colour; no place-value letters above 3 digits | W; SU-M1, SU-M6 |
| `sub_10k_regroup` | 4 | computation-grid | sub-decide, sub-notate, sub-setup | fix | across-zero injection (`:463`) puts Z5 items on an R12 page; place of regrouping random | W; SU-M1, SU-M2; decision, notate lines |
| `sub_10k_mixed` | 4 | computation-grid | sub-decide, sub-setup, hands-sort | fix | no mixed instruction; zero injection | W; SU-M1, SU-M3 |
| `sub_100k_no_regroup` | 5 | computation-grid | sub-setup | fix | wording and colour; 5-digit numbers, no place-value letters, no grid option | W; SU-M1, SU-M6 |
| `sub_100k_regroup` | 5 | computation-grid | sub-decide, sub-notate, sub-setup | fix | zero injection; random regroup places | W; SU-M1, SU-M2; decision, notate lines |
| `sub_100k_mixed` | 5 | computation-grid | sub-decide, sub-setup, hands-sort | fix | no mixed instruction; zero injection | W; SU-M1, SU-M3 |
| `sub_1m_no_regroup` | 5 | computation-grid | sub-setup | fix | wording and colour; six digits at 2 columns is tight in print | W; SU-M1, SU-M6 |
| `sub_1m_regroup` | 5 | computation-grid | sub-decide, sub-notate, sub-setup | fix | zero injection; random regroup places | W; SU-M1, SU-M2; decision, notate lines |
| `sub_1m_mixed` | 5 | computation-grid | sub-decide, sub-setup, hands-sort | fix | no mixed instruction; zero injection | W; SU-M1, SU-M3 |
| `sub_wp_10` | K | word-problems | k-one-page, schema-story | fix | keyword hint (`:1095`); blue choose-the-sign widget on the visual (`:18-30`); result-unknown only; verb agreement ("were ate"); no unit word after the answer blank; no schema diagram | W; SU-M7, SU-M5, SU-M6; Say: "___ take away ___ is ___ ___."; vocab: left, take away |
| `sub_wp_10_plain` | K | word-problems | k-one-page, schema-story | merge -> `sub_wp_10` | same generator with the visual stripped | alias option `pictures=off` |
| `sub_wp_20` | 1 | word-problems | schema-story | fix | as `sub_wp_10`; baseline text "There were 11 cookies. 4 were ate." | W; as `sub_wp_10` |
| `sub_wp_20_plain` | 1 | word-problems | schema-story | merge -> `sub_wp_20` | twin | alias option `pictures=off` |
| `sub_wp_50` | 2 | word-problems | sub-setup, schema-story | fix | keyword hint; `minVal = maxVal/10` so both numbers are always ≥ 5 and the answer is often 2; 20-icon cap contradicts the numbers; cards overflow the page | W; SU-M7, SU-M1, SU-M6; Say / vocab as `sub_wp_10`; set-up frame for the story-to-column rewrite |
| `sub_wp_50_plain` | 2 | word-problems | sub-setup, schema-story | merge -> `sub_wp_50` | twin | alias option `pictures=off` |
| `sub_wp_100` | 2 | word-problems | sub-setup, schema-story | fix | as `sub_wp_50`; only 3 of 6 items fit the printed page | W; as `sub_wp_50` |
| `sub_wp_100_plain` | 2 | word-problems | sub-setup, schema-story | merge -> `sub_wp_100` | twin | alias option `pictures=off` |
| `sub_wp_1k` | 3 | word-problems | sub-setup, schema-story | fix | keyword hint; single schema; "After 368 read, how many were left?" is not a sentence a Level-2 reader can parse | W; SU-M7, SU-M1; Say: "___ minus ___ equals ___ ___."; vocab: remain, difference |
| `sub_wp_1k_plain` | 3 | word-problems | sub-setup, schema-story | merge -> `sub_wp_1k` | twin | alias option `pictures=off` |
| `sub_wp_10k` | 4 | word-problems | sub-setup, schema-story | fix | as `sub_wp_1k`; contexts (refunds, graduations, bounced visitors) carry vocabulary an ELL pupil does not need | W; SU-M7, SU-M1 |
| `sub_wp_10k_plain` | 4 | word-problems | sub-setup, schema-story | merge -> `sub_wp_10k` | twin | alias option `pictures=off` |
| `sub_wp_100k` | 5 | word-problems | sub-setup, schema-story | fix | as `sub_wp_10k`; 17-word stories with commas in every number | W; SU-M7, SU-M1 |
| `sub_wp_100k_plain` | 5 | word-problems | sub-setup, schema-story | merge -> `sub_wp_100k` | twin | alias option `pictures=off` |
| `sub_wp_1m` | 5 | word-problems | sub-setup, schema-story | fix | as `sub_wp_10k`; money items give no currency handling and "How many dollars remain?" mis-numbers a mass noun | W; SU-M7, SU-M1 |
| `sub_wp_1m_plain` | 5 | word-problems | sub-setup, schema-story | merge -> `sub_wp_1m` | twin | alias option `pictures=off` |
| `nl_sub` | 1 | visual-grid | k-one-page | split | three unknown positions rotate 4:1:1 (`:655-657`); `find_min` and `find_sub` set `showAnswer: true` and highlight the answer tick, so no subtraction happens; the scale changes item to item (0-14, 0-20, 0-25 on one baseline page); `a` up to 100 makes a 96-hop jump | variants `find_diff` (stays), `find_sub`, `find_min`; W; SU-M5, "counts ticks instead of jumps", SU-M6; Say: "Start at ___. Jump back ___."; vocab: number line, jump back |
| `number_line_sub` | 1 | visual-grid | k-one-page | fix | the `?` label only prints when the answer tick is a labelled major tick, so on a 0-20 line most items mark nothing (`:857-865`); every hop is pre-drawn, so the pupil only reads a tick; blue arcs in a skill labelled "(B&W)" | W; SU-M5, "reads the tick before the landing point", SU-M6; Say: "Start at ___. Jump back ___. I land on ___."; vocab: number line, jump back, land |
| `mixed_add_sub` | 2 | computation-grid | sub-decide, sub-setup | redo | never mixes: because the id starts with `mixed_` and sits in the `subtraction` category, `generate-question.js:207-210` resolves it to a random *subtraction* skill and its own `ops = ["+", "-"]` branch (`:4554`) is unreachable; the pool spans K to grade 5 (`5,807 − 5,392` beside `5 − 3`); no "circle the sign first" step | rebuild as the F19 / U5 discrimination step; W; SU-M7, "uses the first sign for the whole page", SU-M3; decision lines: "The sign is +. I add." / "The sign is −. I subtract."; Say: "The sign is ___."; vocab: sign, add, subtract |
| `mixed_subtraction` | M | computation-grid | (none) | keep | review pool; draws uniformly from all 50 other ids, so a grade-1 page can serve `sub_1m_regroup`, and it inherits every defect above | grade-bounded pool option; mixed-section instruction |

Host notes: nothing in this family is read-and-choose without a computation, so only `missing_add_sub` goes to `equation-drill` (an equation with a blank). `sub_facts` stays on `computation-grid` and reaches the fact rows, probe and strips through `fact-layouts`. The three picture / number-line skills are the only `visual-grid` members. `sub-setup` is given only where a horizontal statement has a vertical form worth writing: every column skill, and the story skills from `sub_wp_50` up, where MW4K's "line-up" sheets are the public analogue.

## Details (every verdict other than keep)

**`sub_facts` (redo).** Three separate faults. The pair constraint makes the regrouping half of the fact table unreachable; the fact set cannot be selected, so the family's whole teaching order (Subtracting 1 … 10, then 0) cannot be printed; and orientation flips per item, which breaks P-16 and P-28 on one page. Rebuild around a fact-set descriptor (`facts:[n]`, `facts:{from,to}`), a fixed orientation per section, the dot tile beside the subtrahend as cue part 1, and `n − 0` / `n − n` as the last set. The duplicate generator in `print-generate.js` (facts to 100) must be deleted, not fixed, so that print and screen come from one source.

**`subtract` (merge).** "Basic Subtraction" is the `_mixed` ladder with `state.range` in place of a fixed band, plus two branches that belong elsewhere. Alias it to `sub_100_mixed` with `range=setting`, keep the id and its share code, and drop the multiple-choice missing-operator branch entirely — a grade-1 subtraction page must never ask whether the answer is × or ÷.

**`sub_word_problems` (split).** The id carries five schemas, two of which are unreachable because `roll` is compared numerically after `pickVariant` made it a string. Fixing the comparison alone would make the page worse, not better: five schemas in one section is the P-28 fault. Split into five variants, one per SU-W step, and remove the 20% "circle the numbers you need" branch from the base id — it is a Reason It / Stretch format, not a production item, and its generated sentences ("22 crayons in 9 minutes") are not English.

**`missing_add_sub` (split).** Six positions × two operations at random. Two of the six ("sum", "difference") are not missing-number items at all. Split by operation and position: the subtraction positions become `missing_sub` with an `unknown` option (U2-U4), and `missing_add_sub` keeps its id as the mixed U5 step. Add the part-whole box and the count-up tally of L-2 step 13 as scaffold levels.

**`sub_5_pictures` (redo).** The only emoji left in the family, a red strike-through that carries the meaning, two answer slots per cell, and eight distinct items in twelve. Rebuild on the teacher's chosen counting set with a black cross-out, one answer slot, `n` up to 5 then up to 10, and `n − 0` / `n − n` seeded.

**`unknown_start_wp` (split).** Half its items are addition. Split `give` (subtraction) from `get` (addition, moves to the addition family). Then: one response mode on both media (the multiple-choice half must go), operator in black, the unknown in a solid box marked `?`, and the equation removed from the independent level so that writing it is the pupil's work.

**`sub_10_regroup` (redo).** There is no regrouping inside a single digit; the generator can only satisfy its own gate with `10 − n`, which is why six of twelve items repeat. Rename the step to "Subtract From 10" (SU-F F14, the bridge into "use ten to subtract") and generate all nine facts plus `10 − 10` and `10 − 0`.

**`sub_100_regroup` (redo).** See family summary 2. Two changes: apply the two-borrow rule only when the minuend has three or more digits, and make the fallback re-check `hasBorrow` so that a "with regrouping" set never contains a no-regroup item by accident (P-10 wants those seeded on purpose, one per set of six or more). The `100 − n` items become `sub_from_whole_hundred` in SU-Z.

**`mixed_add_sub` (redo).** The bug is in the resolver, not the generator: any id beginning `mixed_` is treated as a category pool, so this skill silently becomes "a random subtraction skill". It must be excluded from `categoryMixedSkills` (it is a real skill with its own `ops` branch), then rebuilt as the discrimination step — circle the sign, then solve — with a deliberate mix and the decide-only page as its sub-skill.

**`nl_sub` (split), `number_line_sub` (fix).** Between them these two cover the pictorial step of SU-F. Separate `nl_sub`'s three unknown positions into variants, stop drawing the answer on the `find_min` and `find_sub` items, fix the scale to one range per section, and cap the minuend at 20. In `number_line_sub`, move the `?` label out of the `isMajor` branch so the answer tick is always marked, label every integer at nlMax ≤ 20, and draw the arcs in black. The later steps should fade the hops: all hops → first hop only → an empty line.

**The nine `_plain` twins (merge).** `generate-question.js` maps each `*_plain` id to its parent and blanks `q.visual`. That is an option ("Pictures: off"), not a skill, and it doubles the navigator, the print dialog and every review page for no pedagogical gain. Keep the ids as aliases (share codes are positional) and expose one `pictures` option on the parent, which also lets a page fade from picture to bare inside one ladder step (P-8).

**The twenty-two `fix` column skills.** One wording pass and one colour pass fix most of them: "regroup" everywhere, black hairlines, no green/pink/orange operation coding, and the "Use top row for borrowing" caption removed. Then three structural changes: remove the 15% across-zero injection (`:463`) so SU-Z can exist; make the regrouped place an option on the `_regroup` ids so R9-R11 are separable; and print place-value letters at every size and grade, not only grade 3 with 2-3 digits.

**The eight `fix` story skills.** Same three changes for all of them: replace the keyword hint with the structure rule and the schema diagram (P-21; the keyword panel stays as the teacher option), delete the choose-the-sign widget from the visual, and cap the picture at a number it can honestly draw (≤ 20 items, otherwise no picture). Then fix the verb agreement in the passive templates, pre-print the unit word after the answer blank, and shrink the card so six items fit a page.

## New skills needed

Append only; never reorder existing ids.

| Id | Ladder step | Note |
|---|---|---|
| `sub_zero_all` | SU-F F13 | `n − 0` and `n − n`, after the 1-9 sets (P-FL-18) |
| `sub_2d_blocks` | SU-C C1, C2 | base-10 picture beside a labelled T O grid; also the set-up page |
| `sub_2d_1d` | SU-C C3 | ragged lengths as a step, not an accident (research item 7) |
| `sub_trade_ten` | SU-R R1, R3 | trade 1 ten for 10 ones; the concept page L-5 step 1 |
| `sub_missing_digits` | SU-R R14 | one missing digit, then two; dashed digit box (owner ruling) |
| `sub_check_by_adding` | SU-R R15 | check-only: does the difference plus the subtrahend give the minuend? |
| `sub_from_whole_ten` | SU-Z Z1 | 50 − 8, then 50 − 27 |
| `sub_from_whole_hundred` | SU-Z Z2 | takes the `100 − n` items now trapped in `sub_100_regroup` |
| `sub_from_whole_thousand` | SU-Z Z3 | 4,000 − 1,257 |
| `sub_across_one_zero` | SU-Z Z4 | 304 − 126 |
| `sub_across_two_zeros` | SU-Z Z5 | 3,004 − 1,257 |
| `sub_zeros_middle` | SU-Z Z6 | includes the non-example where nothing crosses the zero |
| `sub_wp_change_unknown` | SU-W W2 | revives the dead branch at `:3710` |
| `sub_wp_compare` | SU-W W4 | difference unknown; split from `sub_word_problems` |
| `sub_wp_compare_fewer` | SU-W W5 | revives the dead branch at `:3738` |
| `sub_wp_part_whole` | SU-W W6 | part-whole, part unknown |
| `missing_sub` | SU-U U2-U4 | subtraction unknowns with a `unknown` option |

Reference-site work the family still needs: none of the `sub_wp_*` schemas were checked against MW4K's actual sheets (the PDFs were not opened, research §0.3), so the schema wording and the unit-word convention should be confirmed by a logged-in reviewer before W1-W6 are written.

## Questions for the owner

1. **`sub_100_regroup` today prints `100 − n`.** A grade-2 "within 100 with regrouping" page is currently an across-zeros page. Recommendation: apply the two-borrow rule only from three digits up, move `100 − n` to `sub_from_whole_hundred` in SU-Z, and re-check the fallback for a real borrow. This changes what an existing id generates; the id and share code stay.
2. **The 15% across-zero injection inside every `_regroup` skill.** Recommendation: remove it. It contradicts the ruling that across zeros is its own sub-ladder taught after general regrouping, and it makes a one-type page, a matched Test A/B and a facsimile key impossible for six ids.
3. **The nine `_plain` twins.** Recommendation: merge them into a `pictures` option on their parents, keeping every id as a positional alias. This halves the story half of the family and lets one ladder step fade from picture to bare.
4. **`mixed_add_sub` produces no addition.** Recommendation: exclude it from the `mixed_` pool resolver and rebuild it as the "circle the sign, then solve" discrimination step. The alternative — renaming it — would move a share-code position and is not worth it.
5. **Grade tags.** `sub_10_no_regroup`, `sub_10_regroup`, `sub_10_mixed` and `sub_wp_10` are tagged K but are 1.OA content (K is within 5); `subtract` is tagged 1 yet prints 6-digit column work at Max Number 1,000,000; `sub_facts` is tagged 1 but the print path emits facts to 100. Recommendation: retag the within-10 skills as grade 1, leave `sub_5_pictures` at K, and let `subtract`'s grade follow the range once it is an alias. Grade tags drive filters and the teacher footer only.
6. **Fact-set options for `sub_facts`.** The × and ÷ set order is ruled; + and − only have "the zero set comes last". Recommendation: adopt the IXL / MW4K order for subtraction — Subtracting 1, 2, 3 … 9, 10, then 0 and `n − n` together — and expose `facts:[n]` and `facts:{from,to}` exactly as for × and ÷.
7. **The subtraction fact cue.** P-31 defines the + / − cue as a dot tile beside the smaller numeral. For subtraction the numeral to count back is the subtrahend, which is always the smaller one, so the rule already works — but on `n − n` and `10 − 9` items the tile is as long as the minuend. Recommendation: cap the tile at 10 dots and drop it on `n − n`.
8. **Where the number-line skills sit.** `nl_sub` and `number_line_sub` are two spellings of one representation (one interactive, one "B&W"). Recommendation: keep both ids, make `number_line_sub` the print-first cell for SU-F F3 and `nl_sub` the unknown-position variants, rather than merging — the two have genuinely different hop drawings and both print.
9. **Second regroup row below the rule.** `print-generate.js:5849` (and `:6870`) draws a dashed box row between the rule and the answer on every subtraction cell. That is not US notation (regroup marks go above the minuend). Recommendation: delete the `regroup-bot` row and keep the marks above; dashed then stays reserved for the missing-digit box as ruled.
