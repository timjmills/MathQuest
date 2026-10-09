# Wave 1 Lane D: critic report (Opus low, independent)

Tree: agent-a3256e8dfc9684535 at e117447 (base 8fd2a10). Graded 2026-10-02.

## Verdict: FAIL (the lint work is sound; several fixed documents grade below 8)

## Gates (run on e117447, clean worktree)
- `ws-print-lint --source kit` (full, 191 docs): **FAIL, 8 findings in 4 documents**. The base had 33 documents failing; 29 now pass.
  Still failing: composing:fraction_number_line (H13 x2, 33% empty band), composing:mixed_composing (PAGEFILL 79 mm / 30%),
  multiplication:mult_comparison (PAGEFILL 61 mm / 23%), multiplication:mixed_multiplication (H13 x4, stack content pinned to one side, 31%).
  All 4 were already in the base list (before.txt). **No new failures on documents that passed before.**
- `ws-boot-smoke`: OK.
- `ws-screen-answer` (4 skills): FAIL. box_division_easy has no answer control on the card, worksheet or quiz; fraction_number_line has none on the card.
  **The same failures occur on base 8fd2a10** (checked in a separate worktree), so this commit did not cause them.
- Lint script: `tests/scripts/ws-print-lint.cjs` is **unchanged** between 8fd2a10 and e117447. No rules, exemptions or thresholds were weakened.
- Merge onto claude/sweet-newton-c8wrv1: `git merge-tree --write-tree` gives a clean tree with **0 conflicts**.

## What the diff contains (25 files, +19,320 lines)
- About 17.9k lines are lint output under design/audit/runs/wave1-D/ (before/full-k2/full-operations/r1/r2 .json and .txt).
  The .json files (about 17k lines) are generated and bulky and should not be committed. Keep the .txt summaries at most.
- There are **no renders** in runs/wave1-D/, so the builder gave no visual evidence. I rendered my own sample (scratchpad, not committed).
- Code: about 1.4k lines. New templates: long-multiplication, parity, frac-wall. k2kit grows, a k2 provider is added, and gen-algebraic, gen-operations and gen-fractions are reworked.

## Were root causes fixed centrally?
- TY-1/TY-2 ('−' printing in LiberationSans): **central, but with a blunt tool.** css/print-worksheet.css adds
  `.print-edition *, .ws-legacy * { font-family: Andika !important; font-style: normal !important }`.
  This is additive, as the rule requires. However, `!important` on `*` overrides every inline font in legacy print, including any intended italics.
  Its comment says "only legacy cells and stacked fractions are touched", but `.print-edition *` covers the whole legacy print edition.
- L-KEY AK-4: **central.** adapters.js `stamp()` now draws the kit `blank()` line in every state, and print-sheet.js `hostItem` strips the stamp only where the key writes into the cell's own slot.
  The pupil page and the key now carry the same slots by construction.
- PAGEFILL: **central** for mixed pools (iterative count fit in buildSheet). The new `equation` → 'short' footprint class is also central.
- Other fixes are per-skill rewrites into new kit templates (parity, long-multiplication, frac-wall). That is legitimate migration, not patching.

## Visual grading (independent role, pupil and key)
| Document | Clarity | Pedagogy | Layout | Parity | Result |
|---|---|---|---|---|---|
| composing:odd_even | 8 | 6 | 8 | 8 | FAIL |
| division:div_zero_in_quotient (key) | 8 | 8 | 7 | 9 | FAIL |
| composing:whole_as_fraction | 7 | 7 | 8 | 8 | FAIL |
| multiplication:dot_array_mult | 8 | 6 | 3 | 8 | FAIL |
| addition:add_sub_10s (key) | 9 | 8 | 7 | 9 | FAIL |

So the 29 "fixed" documents **pass the lint but do not reach 8 on all four criteria**. Overall: FAIL.

## Defects (ranked, §6 form)
1. **[BLOCKING] dot_array_mult: orphan last page.** 5 items are dealt: 4 on p1 and 1 on p2, leaving about 75% of p2 empty. P1 also has a 25% empty strip.
   The rebalanced-last-page contract is broken, and the lint missed it (PAGEFILL appears to skip the final page). Fix: size the count to whole pages, or rebalance.
   The lint gap should be filed separately.
2. **[MAJOR] dot_array_mult: the item counts dots and does not multiply.** There is no "rows × columns = ☐" frame, so the pupil can count 56 dots one by one.
   The title "I Can multiply dot array" is ungrammatical.
3. **[MAJOR] odd_even: four problem types on one independent page** (dots with check box, which-is-even, which-is-odd, circle/cross).
   This breaks P-1, one new thing per step, and the instruction is the generic "Solve.".
   The 19-dot item is drawn in rows of 5 and 4 instead of pairs, so the pairing model that decides odd or even cannot be seen.
4. **[MAJOR] add_sub_10s and div_zero_in_quotient: H13 empty space.** In add_sub_10s the answer wraps under the equation and the lower half of each cell is empty.
   div_zero_in_quotient has an empty strip of about 20% under the grid. The lint passes both, which suggests its thresholds are too loose for the 3-column fact layout.
5. **[MAJOR] whole_as_fraction: redundant text gives the method away.** "Write 4 as a fraction with denominator 1" sits above "4 = ?/1" and a separate Answer line: three statements for one slot.
   The '?' numerator should itself be the slot, which also lowers the writing load.
6. **[MINOR] The `!important` font override on `.print-edition *`** is wider than its comment claims. Narrow it to `.ws-legacy` cells.
7. **[MINOR] Committed generated lint JSON (about 17k lines)** under runs/wave1-D/. Drop the .json files.
8. **[INFO] 4 documents still fail the lint** (listed above), and the pre-existing ws-screen-answer failures (box-division, number-line-place card) are outside this lane.

---

# Round 2: independent critic (Opus medium), 2026-10-03

Tree: agent-a3256e8dfc9684535 at 731a447. The live branch claude/sweet-newton-c8wrv1 (50dbfa6) is an ancestor of the tree.
I rendered my own evidence into the scratchpad with ws-grade-render, `--roles independent`, S and L, on this tree and on the live branch (MQ_ROOT).
The renders are not committed. I also viewed the builder's renders in runs/wave1-D/renders/. The `S/` and `L/` sub-folders there are STALE: they still show add_sub_10s pinned to the top of its cells, which round 3 changed. The flat `*-S-*.png` / `*-L-*.png` files are the current renders.

## Verdict: FAIL

The lint gate is honest, and its new check makes it tighter. Several of the lane's own documents grade below 8 on Layout, though, and one prints a clipped cell.
Row spread lets the lint pass on pages that are still sparse. It turns a PAGEFILL strip into padding inside tall cells, and the lint does not measure that.

## Gates
- **ws-print-lint --source kit, full**: S **OK, 0 findings in 191 documents**; L **OK, 0 findings in 191 documents**.
- **Lint integrity**: the diff of tests/scripts/ws-print-lint.cjs against live only ADDS rules. The new L-DENSITY PG-23 rule flags an orphan last page under a third of the body. No rule, threshold or exemption was loosened. OK.
- **ws-layout-unit**: OK, 544 assertions. The diff adds assertions (packByHeight PG-23, fineSplit) and removes none.
- **ws-screen-answer** (dot_array_mult, odd_even, add_sub_10s, div_zero_in_quotient, mixed_multiplication): OK. Card, worksheet 3/3 and quiz 3/3 pass for all five, and live green passes.
- **ws-boot-smoke**: OK.
- **node --check** on every changed module: clean.
- **Merge dry run** (`git merge-tree --write-tree claude/sweet-newton-c8wrv1 HEAD`): clean tree, 0 textual conflicts. There IS a semantic conflict with Lane B; see defect 4.

## Non-lane regression check (tree vs live, S and L, pixel-identical or not)
- addition:add_20_regroup, measurement:time_5min, composing:base10_build: **identical** at S and L.
- fraction_operations:add_fractions_like: identical at L. It differs at S, where the legacy "Circle ALL" row now takes its own height instead of an even share. It is neutral to slightly better, with no regression.
- **multiplication:multiply: CHANGED at S and L.** Every vertical × fact now prints a boxed answer, not the open zone. This comes from gen-operations.js:2151, `if (skill === 'multiply' && !across) q.cell.payload.ansBox = true`, which reaches all of `multiply`, not only mixed_multiplication. The page itself looks fine (8), but it is an out-of-lane change of answer shape with no option behind it. See defect 4.

## Visual grading (pupil and key; renders are mine unless marked)
| Document | Clarity | Pedagogy | Layout | Parity | Result |
|---|---|---|---|---|---|
| composing:odd_even S, L | 9 | 8 | 8 | 9 | PASS |
| composing:whole_as_fraction L | 8 | 8 | 8 | 9 | PASS |
| division:div_zero_in_quotient L key | 9 | 8 | 8 | 9 | PASS |
| composing:ten_frame_build S, L key | 8 | 8 | 8 | 9 | PASS |
| multiplication:dot_array_mult L | 8 | 8 | **6** | 8 | FAIL |
| addition:add_sub_10s S | 8 | 8 | **6** | 9 | FAIL |
| division:missing_mult_div L | **7** | **7** | **4** | 8 | FAIL |
| multiplication:mixed_multiplication L | **6** | **7** | **3** | 8 | FAIL |
| composing:mixed_composing S, L | **7** | **6** | **3** | **7** | FAIL |
| counting_mixed:counting_all S, L | 8 | **6** | **6** | 8 | FAIL |
| division:long_div_2digit S | **7** | 8 | **6** | 8 | FAIL |
| multiplication:mult_comparison L (builder render) | 8 | **7** | 8 | 8 | FAIL |
| number_families_add / _mult (builder render) | **7** | **7** | 8 | 8 | FAIL |

## Defects (ranked, §6 form)
1. **[BLOCKING] mixed_multiplication L: a clipped cell and an empty boxed cell.** A 4th item (d, 4 × 217 area model) now runs past the grid: cell d has no bottom border and its content reaches the footer zone. PG-12 overflow, and the lint did not catch it.
   Cell c sits beside an empty bordered cell, 25% of the grid. The story rows a and b were squeezed by splitCellH(rowsUsed), so the "a."/"b." labels collide with the first line of the story (label keep-out broken).
   Live printed 3 items with no overflow. Fix: count the split part's rows into the page fit (fineSplit / the iterative count) and keep the label keep-out on squeezed rows. Add a lint check for a grid taller than the page body (a missing bottom border).
2. **[BLOCKING] missing_mult_div L: 1 column × 8 rows, down from 3 × 6 = 18 on live.** Each full-width 180 mm cell holds a 70 mm equation, and a 15% strip remains under the grid.
   S keeps 30 items but goes from 5 × 6 to 3 × 10. Answer shapes are now mixed on one page: ruled lines for "12 × 8 = ___" and boxes for the missing factor, where live drew boxes throughout.
   This is a lane document, and it got worse. Cause: `across: 'beside'` sizing (fact.js footprint `wMm` = the whole sentence) pushes the page to the column count the widest sentence allows.
   Fix: the beside form must not take a page below live density. At L, 3 columns of 58 mm fit "11 × 12 = ___" at the fact digit size.
3. **[MAJOR] Size S ignored (LESSONS_LEARNED) on add_sub_10s and mixed_composing.** add_sub_10s S prints 16 items in 2 × 8 at the SAME digit size as L, where live S printed 28 in 4 × 7.
   mixed_composing prints 3 items in the same 2 × 2 at S and L, the 4th cell an EMPTY BOXED CELL, with rows stretched 1.9×. Fix: the beside form must honour S (smaller pt, more columns). The fill count for a mixed pool must fill the grid, never leave an empty boxed track.
4. **[MAJOR, merge risk] `ansBox` collides with Lane B's `ansBox` option.** Lane B (origin/...-wip-laneB) stamps `q.cell.payload.ansBox` with the strings `'one' | 'digit' | 'off' | null` (resolveAnsBox in skill-options.js, `_stampAnsBox`). Lane D stamps `payload.ansBox = true` and fact.js tests truthiness (`p.ansBox ? 'box'`).
   After both merge, a teacher's **'off' (plain line) draws a box**, because the string is truthy. Lane D's boolean `true` is an unknown value to resolveAnsBox, which falls back to automatic.
   The two lanes also disagree on scope: Lane D boxes every `multiply` fact unconditionally, while Lane B makes it a teacher option. There are no textual conflicts, so git will not flag this.
   Fix: rename Lane D's flag (e.g. `boxAns`) or adopt Lane B's value domain (`'one'`) and its resolver. Restrict it to the items mixed_multiplication deals, or leave the multiply page unchanged until Lane B lands.
5. **[MAJOR] Row spread (up to 1.9×) reads as padding, not design (RUBRIC C3).** dot_array_mult L: 3 problems on the page, and the a/b row is about 125 mm tall for about 65 mm of content. About 60 mm of white sits above and below each array, and a 10% strip remains under the grid.
   counting_all S: 3 problems at size S, each with 25–30 mm of empty band top and bottom. mixed_composing: as above.
   The spread defeats PAGEFILL (each band stays under 30% because the content is centred) while the page still holds 3 problems. Fix: spread only after the count fill has put on as many problems as fit; cap the spread at about 1.3× when the count is Auto.
   File a lint rule: problem ink area / grid area under X on an Auto-count practice page.
6. **[MAJOR] mixed_composing b and counting_all c are legacy cells inside kit pages.** b ("Write how many more make 10." plus a full-width "Answer: ____") and c ("Draw 36. Then trade 1 ten for 10 ones.", a tens/ones chart with no answer slot and no instruction for what is written) break one-look parity.
   counting_all, "counting & cardinality", deals a Grade-3 fraction-wall sum. That is a name/content mismatch to raise with ws-content-audit.
7. **[MAJOR] mult_comparison / remainder_interpret: the frame gives the sign away.** The instruction says "Circle the sign", but every item already draws a ÷ bracket (divisor box ) dividend boxes), so the answer to "circle the sign" is printed.
   The box counts also reveal digit counts (one or two divisor boxes). remainder_interpret's unit bank reads "days · apple · boxes", singular "apple". Fix: a neutral two-box frame (☐ ○ ☐ = ☐) until the sign is chosen.
8. **[MINOR] long_div_2digit S: inconsistent digit tracks.** trackOf widens 3-digit dividends ("8 8 0", divisor "1 6") but not 4-digit ones ("4183", "47"), so neighbouring cells use different digit pitches. Each cell is still about 75% empty at S. Fix: one track per page (the widest any item may take), or more columns at S.
9. **[MINOR] number_families_add / _mult: an unexplained "Answer: ____" line** under four complete equation rows. The pupil has nothing to write there. It is off-centre in the 2-equation (11, 11, 121) item. Remove it, or say what goes in it.
10. **[MINOR, pre-existing] Item labels wrap after z** ("y. z. a. b.", so two "a." on one page) on div_zero_in_quotient S, missing_add_sub S and add_sub_10s live S. A key reference becomes ambiguous. Use aa./ab. or numbers past 26.
11. **[MINOR, pre-existing] missing_mult_div S key** (builder render): the answers in box slots sit at the bottom-left and overflow the box edge ("120", "132"), while line-slot answers are half size.
12. **[INFO] Round-1 defects 1–3, 5–7: FIXED.** dot_array_mult has no orphan page, adds a rows × columns frame and a fixed title. odd_even is one kind with paired dots. whole_as_fraction has a single "= ☐/1" prompt. The !important is narrowed to `.ws-legacy`. The lint .json files are removed. Defect 4 is fixed for add_sub_10s on L and for the div_zero key.

## What passes
The lint work is real. 0/191 at S and L, with a stricter lint. Paired odd/even dots, the whole-as-fraction slot, the dot-array frame, the boxed div_zero key, the ten-frame min width and the PG-23 packByHeight rebalance are all good work.

---

# Round 3: independent critic (Opus medium), 2026-10-09

Tree: claude/sweet-newton-c8wrv1-wip-a3256e8dfc9684535 at ce4d090 (round-2 fixes in 219c057, plus determinism 8cac51a and split placement ce4d090).
I made my own renders with `ws-grade-render --roles independent`, at S (with every screen host) and at L, for the 15 lane documents.
I rendered the regression set on this tree and on origin/claude/sweet-newton-c8wrv1 (c91cc8b, a git worktree served through MQ_ROOT).
The renders are in my scratchpad. The 10 PNGs this report cites are copied to `renders/r3/`.

## Verdict: FAIL

The gates are green, and 9 of the 11 round-2 defects are fixed or mostly fixed. The paper pages are clearly better than round 2.
Even so, **4 of 15 documents pass** on every version I graded: odd_even, ten_frame_build, remainder_interpret and counting_all.
counting_all passes on paper only. Its online worksheet fails.
Two problems are new and were caused by the lane:
- **div_zero_in_quotient**: the practice card's inputs are under 44 px at 820 and 390 (H6). On live they were not.
- **Legacy cells**: the adapters `stamp()` change prints a doubled "Answer: ____" line under legacy check-box items (H8). This hits out-of-lane skills too (add_fractions_like S).

## Gates I ran (all on ce4d090)
| Gate | Result |
|---|---|
| `ws-print-lint --source kit --size S` | **OK**, 191 documents, 0 findings |
| `ws-print-lint --source kit --size L` | **OK**, 191 documents, 0 findings |
| Lint integrity (`git diff origin/... -- ws-print-lint.cjs ws-layout-unit.mjs`) | Rules and assertions are only added (L-DENSITY PG-23 ORPHAN, L-DENSITY SPREAD, packByHeight / fineSplit asserts); nothing is loosened |
| `ws-layout-unit` | OK, 545 assertions |
| `ws-sheet-determinism` | OK |
| `ws-boot-smoke` | OK |
| `ws-screen-answer` (all 15 lane skills) | OK: card, worksheet 3/3 and quiz 3/3 for every skill, and live green. **number_families_add now passes**, so the STATUS §10 pre-existing failure does not reproduce here |
| `ws-content-audit --skill` (missing_mult_div, mult_comparison, remainder_interpret, counting_all, mixed_composing, mixed_multiplication, div_zero_in_quotient, add_sub_10s) | OK, 0 failing |
| `node --input-type=module --check` on the 10 changed modules | clean |

The lint passes several pages graded below 8 here. It has no check for these three things:
- an empty bordered cell (dot_array_mult S);
- S printing the same grid as L (DN-1a, LESSONS L1);
- a one-line problem in a tall cell (SPREAD skips drawings under 20 mm, so mixed_addition S passes with a cell 37 % / 43 % empty and a 24 % page strip).

## Round-2 defects: status
| # | Round-2 defect | Status on ce4d090 |
|---|---|---|
| 1 | mixed_multiplication L: clipped cell d, empty boxed cell | **FIXED.** 6 problems, one full page, no overflow, no empty cell. New slot defect, see D5 |
| 2 | missing_mult_div L: 1 × 8 | **PARTLY.** Now 2 × 8 = 16. Live printed 3 × 6 = 18, and a 16 % strip is left under the grid. Answer shapes are now all boxes (fixed) |
| 3 | Size S ignored (add_sub_10s, mixed_composing) | **add_sub_10s NOT FIXED**: S and L both print the same 16 items in 2 × 8 (D3). mixed_composing: the empty boxed cell is gone and 6 problems fill the page (fixed) |
| 4 | `ansBox` clash with Lane B | **FIXED.** Renamed to `boxAns`, scoped to mixed_multiplication. The `multiply` page no longer boxes its answers |
| 5 | Row spread reads as padding | **PARTLY.** SPREAD_CAP is 1.7 (round 2 asked for about 1.3). counting_all and mixed_composing now hold 6. dot_array_mult L still holds 3 problems, about half of each cell empty (D2) |
| 6 | Legacy cells in kit pools; counting_all deals Grade 3 | **FIXED on paper.** K-2 pools deal kit cells; counting_all deals K-2 only. **Still legacy on the online worksheet** (D7) |
| 7 | mult_comparison frame gives the sign away; "apple" | **FIXED.** Neutral ☐ ○ ☐ = ☐ frame; the unit is singular only when the answer is 1. New defects D4 |
| 8 | long_div_2digit inconsistent tracks | **FIXED.** One track pitch per page. The S cells are still mostly empty (D6) |
| 9 | number_families "Answer: ____" line | **FIXED.** The key fills the boxes |
| 10 | Labels past z | **FIXED.** Pages over 26 problems are numbered (div_zero S 28, missing_mult_div S 30) |
| 11 | missing_mult_div S key overflow | **FIXED.** Key values are centred and fit their boxes |

## Non-lane regression spot check (tree vs live, independent, S and L)
- addition:add_20_regroup, measurement:time_5min, composing:base10_build: **pixel-identical** at S and L.
- multiplication:multiply: **changed at S and L, for the better.** The boxed answer is gone, so round-2 D4 is resolved. The × now has its own track, where live printed "×12" touching the digits.
- fraction_operations:add_fractions_like: identical at L. **REGRESSION at S**: items e and f ("Circle ALL sums that equal 1", check boxes) now also print an "Answer: ____" line, which is a doubled answer slot (H8). See D1.
- subtraction:mixed_subtraction S: the footer seed differs (756635 on live, 764554 on the tree) because of the derived-seed reseat, so the page deals other items. Neutral. Fact cell c ("5 − 2") prints at a much larger digit size than the stacked cell d beside it (minor, pool-wide).
- addition:mixed_addition S: 5 problems where live had 4. It is still sparse: cell a (16 + 16) is 37 % / 43 % empty above and below, with a 24 % strip under the grid. Not worse than live, and the lint passes it (gap above).

## Visual grading
Print rows show the pupil page and key. Where only one size is named, the other size scored the same or higher. Screen rows cover card 1280/820/390, worksheet 1280 and quiz 1280.

| Document | Version | Clarity | Pedagogy | Layout | Parity | Result |
|---|---|---|---|---|---|---|
| composing:odd_even | S, L, key | 9 | 8 | 8 | 9 | PASS |
| | screen | 9 | 8 | 8 | 9 | PASS |
| composing:whole_as_fraction | S, L key | 8 | 8 | 8 | 9 | PASS |
| | screen (all hosts) | 8 | **7** | 8 | **7** | FAIL |
| division:div_zero_in_quotient | L key | 9 | 8 | 8 | 9 | PASS |
| | S | **7** | 8 | 8 | 9 | FAIL |
| | card 820 / 390 | **5** | 8 | 8 | 8 | FAIL (H6) |
| composing:ten_frame_build | S, L key | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| multiplication:dot_array_mult | S | 8 | 8 | **6** | 8 | FAIL |
| | L | 8 | 8 | **6** | 8 | FAIL |
| | screen | **7** | 8 | 8 | 8 | FAIL |
| addition:add_sub_10s | L | 9 | 8 | 8 | 9 | PASS |
| | S | 9 | 8 | **6** | 9 | FAIL |
| | screen | 9 | 8 | 8 | 8 | PASS |
| division:missing_mult_div | S, S key | 8 | **6** | 9 | 8 | FAIL |
| | L | 8 | **6** | **7** | 8 | FAIL |
| | screen | **7** | **6** | 8 | **7** | FAIL |
| multiplication:mixed_multiplication | S | **6** | 8 | 8 | 8 | FAIL |
| | L, L key | **7** | 8 | 8 | 8 | FAIL |
| | screen | 8 | 8 | **7** | 8 | FAIL |
| composing:mixed_composing | S, L | **7** | 8 | 8 | 8 | FAIL |
| | worksheet 1280 | **6** | 8 | **6** | **6** | FAIL |
| counting_mixed:counting_all | S, L | 8 | 8 | 8 | 8 | PASS |
| | worksheet 1280 | **7** | 8 | **6** | **7** | FAIL |
| division:long_div_2digit | L key | 8 | 8 | 8 | 9 | PASS |
| | S | 8 | 8 | **6** | 8 | FAIL (H13) |
| | screen | 8 | 8 | 8 | 8 | PASS |
| multiplication:mult_comparison | L, L key | **7** | **6** | 8 | 8 | FAIL |
| | S key | **7** | **7** | 8 | 8 | FAIL |
| | worksheet 1280 | 8 | 8 | **7** | **7** | FAIL |
| division:remainder_interpret | S key, L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| addition:number_families_add | S | 8 | **7** | **6** | 8 | FAIL |
| | screen (pre-existing legacy) | **6** | 8 | 8 | **6** | FAIL |
| multiplication:number_families_mult | L key | 8 | 8 | **6** | 8 | FAIL (H13) |
| | screen (pre-existing legacy) | **6** | 8 | **7** | **6** | FAIL |

## Defects (ranked, §6 form)

**D1 [CRITICAL, out-of-lane regression] Legacy check-box items print a doubled answer slot.**
- What: add_fractions_like S items e and f ("Circle ALL sums that equal 1") draw check boxes and, below them, "Answer: ____". Live drew no line.
- Where: `renders/r3/REGRESSION-add_fractions_like-S-p1.png`. Cause: `js/modules/sheet/adapters.js` `stamp()`, round-1 AK-4, now draws the `blank()` line in the pupil state on every legacy cell that has a display value, including cells whose own slots are check boxes or circles.
- Why: H8 (doubled answer slot) caps C4 at 6, and C1 loses a point. It reaches every legacy skill whose print HTML already holds its own answer place, not only lane documents.
- Fix: in `stamp()`, return '' when the legacy HTML already carries a writing place (`data-ws-slot`, `.blank-box`, `input[type=checkbox]`, check-box glyphs, or a "Circle" / "Check" instruction). Add a print-lint rule: a cell may not hold both a box / check slot and an `Answer:` line.
- Check: add_fractions_like S e and f have no Answer line; a lint sweep finds no cell with two slot kinds.

**D2 [MAJOR] dot_array_mult: an empty bordered cell at S, and padding at L.**
- What: S prints 7 problems in a 2 × 4 grid, so cell h is an **empty boxed cell**. This is the round-2 "never leave an empty bordered track" rule, and claim (c) said it was fixed. Its rows also differ in height (a/b 73 mm, g 47 mm).
- What: L prints only 3 problems (/3). Cells a and b are 114 mm tall with 59 mm of content (bands 25 % / 24 %). Row c is 25 % / 22 % empty, and a 10 % strip remains.
- Where: `renders/r3/dot_array_mult-S-p1.png`, `dot_array_mult-L-p1.png`.
- Why: C3 6 at both sizes (C3: page not at capacity, white space that is not deliberate).
- Fix:
  1. Apply the pool "fill whole rows" step to single-skill pages too: a measured, row-packed section deals a count that fills its last row (8 at S).
  2. At L, a 3 × 10 array is 87 mm wide and fits a 93 mm half cell. Allow it in 2 columns (the `maxCols` / width test in the footprint) so L holds 4 problems in 2 × 2.
  3. Lower SPREAD_CAP toward 1.3 when the count is Auto.
  4. Add a lint check: no bordered cell without an item.
- Check: S has 8 problems and no empty cell; L has 4 or more problems, each row at least 65 % ink.

**D3 [MAJOR] add_sub_10s S prints the L page (LESSONS L1, DN-1a "Size S never prints the grid of L").**
- What: S and L print the same 16 items in 2 × 8. S digits measure 22 px against 27 px at L: almost the same size, because the columns-win ladder scales the digits back up.
- Where: `renders/r3/add_sub_10s-S-p1.png` against the L page. meta reports "Digits 16 pt" at S, while the rendered cap height is about 5.8 mm, roughly 23 pt.
- Why: C3 6 at S (L1 class).
- Fix: in `fact.js`, when the beside form is sized at S, measure at the S digit size before the columns ladder grows it. Then let the page take 3 columns (62 mm cells hold "100 − 10 = ____" at 16 pt), or 2 × 10 = 20 (the skill's distinct-fact pool).
- Check: S shows more items or columns than L, and the S digit cap height is about 4 mm.

**D4 [MAJOR] mult_comparison: answers do not vary, and the sign is answered twice.**
- What (L10): on the seeded L page **all 4 answers are 2** (8 ÷ 4, 6 ÷ 3, 16 ÷ 8, 14 ÷ 7). On S, 4 of 6 answers are 2.
- What: the instruction says "Circle the sign", and the frame then asks for the same sign in the ○ (the key shows it in both places), so one answer is written twice.
- What: on the online worksheet the "= ☐" answer box wraps under the equation on all 6 cards. The paper ○ is a square box on screen.
- What: in c, "has." wraps alone onto a line.
- Where: `renders/r3/mult_comparison-L-key.png`; the S key; `worksheet-1280`.
- Why: C2 6 at L and 7 at S; C1 7 (doubled response); worksheet C3 7 and C4 7.
- Fix:
  1. Deal multiplier and base from the seeded rng with an anti-repeat on the answer across the page (the L10 rule; the page-deal held values in `page-deal.js` are a likely suspect).
  2. Change the instruction to "Write the sign in the circle. Write the numbers. Solve." and keep the sign bank as a reference row that is not circled.
  3. In `screen-cell`, keep "= ☐" on the equation's line (nowrap) and draw the sign slot round.
- Check: no answer appears more than twice on a page of 6; the worksheet cards show one line per equation.

**D5 [MAJOR] mixed_multiplication: answer places differ between cells, and the story frame is not explained.**
- What: on L, vertical facts c (1 × 10) and d (10 × 8) have an open answer zone while e (11 × 1) has a box, so one section uses two slot shapes (C1 rule).
- What: on S, the three story items a, b and f each carry a sign bank, a 3 + 4 digit-box frame with an operator box, a unit bank and a unit line, under the instruction "Solve.". Nothing tells the pupil to choose the sign, write the numbers or pick the unit.
- What: on the online worksheet, card 5 (number line) has an empty band about 40 % deep above the line.
- Where: `renders/r3/mixed_multiplication-L-key.png`, `mixed_multiplication-S-p1.png`.
- Why: C1 7 at L and 6 at S; screen C3 7.
- Fix: stamp `boxAns` on every vertical fact this pool deals, or on none. Give word-work cells in a pool their own instruction line inside the cell, as the counting_all parity cell already does ("Write the sign. Write the numbers. Solve."), from the word-work provider strings.
- Check: c, d and e have the same slot; each story cell shows its own verb line.

**D6 [MAJOR] long_div_2digit S: H13 on width.**
- What: each 93 mm cell holds a 34 mm drawing, leaving bands of 33 % (left) and 31 % (right). The drawing is 36 % of the cell width, which is under the builder's own `narrowCells` threshold of 40 %. Rows are 20 % / 20 % empty.
- Where: `renders/r3/long_div_2digit-S-p1.png`, cell a measured at 349 × 267 px.
- Why: H13 caps C3 at 6.
- Fix: at S, the problem's own width allows 3 columns (62 mm cells), giving 9 problems in 3 × 3. Let the `long` footprint's `maxCols` follow the measured width at S (12.3 "one more column at S"). Apply the `narrowCells` test to single-skill sections, not only to the reseat.
- Check: S prints 3 columns; no cell has a side band of 30 % or more.

**D7 [MAJOR] Pool online worksheets still deal legacy cards (mixed_composing, counting_all).**
- mixed_composing worksheet:
  - Card 4 is "Click ALL the ODD numbers": a check-box list with a grey Submit button. The verb is not "Tap", and the task differs from paper (Circle even / Cross out odd).
  - Card 5 is "Build 38. Trade 1 ten for 10 ones." with Compose / Decompose buttons.
  - Card 1 reads "Type 3 as a fraction with denominator 1."
- counting_all worksheet: card 1 "Which tower is taller?" has towers about 10 mm tall; card 3 "What number comes after 8?" is a tall card about 80 % empty.
- Why: RUBRIC C3 says no card of a different "type" from its neighbours; parity (L5) fails. Worksheet C1 6–7, C3 6, C4 6–7.
- Fix: the screen deal must use the same kit members as the paper deal. Apply the K-2 pool "kit cells only" filter in the screen pool path (generate-question / mixed play), and drop the legacy members from the screen pool.
- Check: every worksheet card is a kit `screen-cell` and has a paper twin.

**D8 [MAJOR, new] div_zero_in_quotient card: touch targets under 44 px (H6).**
- What: the new short-division card has quotient inputs of 34 × 56 px at 820 and 28 × 47 px at 390, and regroup inputs of 19 × 29 and 15 × 24 px. meta reports smallTargetCount 5 on card-820 and card-390, and 30 on the worksheet.
- What: live (one quotient box over a long-division frame) had 0.
- Where: `renders/r3/div_zero_in_quotient-card-390.png`.
- Why: H6 caps C1 at 5 on card-820 and card-390.
- Fix: give `mq-cellslot` a minimum of 44 × 48 px on touch widths. Make the `mq-opswork` regroup boxes at least 44 px, or not focusable (they are scratch, VA-13).
- Check: smallTargetCount is 0 on card-820 and card-390.

**D9 [MAJOR] missing_mult_div: off-name items, density at L, screen parity.**
- What: 9 of the 30 S items ask for a product ("12 × 8 = ☐", "4 × 5 = ☐"), not a missing factor. The title reads "I Can divide missing factors ×/÷".
- What: L prints 16 against live's 18, with a 16 % strip under the grid.
- What: on screen, the worksheet's inactive slots are underlines while paper uses boxes, and the card repeats the equation above the cell ("___ ÷ 9 = 3" over the same equation).
- Where: `renders/r3/missing_mult_div-S-key.png` (items 1, 3, 7, 8, 14, 16, 19, 28, 30), the L page and the worksheet.
- Why: C2 6. Read strictly as H3, the name caps C2 at 4; the content audit does not catch it because it reads operations, not the unknown's role. Also L C3 7 and screen C1 7 / C4 7.
- Fix: put the unknown on a factor (or on the dividend or divisor of a division fact) for every item, or rename the skill. Use the title "I Can find missing factors". Draw boxes for every slot on the worksheet. Drop the duplicated prompt text above the screen cell.
- Check: 0 items whose unknown is the product; the worksheet slots are boxes.

**D10 [MAJOR] number_families_add / _mult: S prints the L page, H13 at L, and a doubles mismatch.**
- What: S prints the same 2 × 2 = 4 as L, where S fits 2 × 3.
- What: number_families_mult L cell d is 30 % empty above and 27 % below (H13).
- What: number_families_add prints double families with repeated rows ("1 + 1", "1 + 1", "2 − 1", "2 − 1"), while _mult collapses them to 2 rows.
- What: the titles read "I Can add number families & subtract" and "I Can multiply number families & divide".
- Why: C3 6; C2 7 for add.
- Fix: size the family cell from its measured height at S; top-align cells in a row (or size the row to the 4-row item and give 2-row items a short row); collapse double families in add the way mult does; titles "I Can complete a number family (+, −)".
- Check: S holds more than L; no band of 30 % or more.

**D11 [MINOR] dot_array_mult and whole_as_fraction screens: the prompt repeats the frame and gives away the method.**
- What: dot_array_mult reads "Multiply the array: 2 rows × 4 columns = ?" above a cell that already shows "2 rows × 4 columns / 2 × 4 = ☐". whole_as_fraction reads "Type 2 as a fraction with denominator 1." (round-1 D5 again, on screen). Both differ from the paper instruction.
- Why: screen C1 7, C2 7 (whole_as_fraction), C4 7.
- Fix: use the paper strings through the BD-11 verb map ("Multiply the rows by the columns. Type the answer." / "Type the whole number as a fraction.").

**D12 [MINOR] div_zero_in_quotient S: regroup boxes too small to write in.**
- What: the box between the dividend digits measures 2.6 × 4.8 mm at S (10 × 18 px); at L it is 4.8 × 5.8 mm. TY-21 sets 4.4 mm wide as the minimum and SL-12 a 6 / 7 / 8 mm regroup strip.
- Why: C1 7 at S.
- Fix: in `long-division.js`, set the regroup box width to max(4.4 mm, track − 1 mm), with height from the regroup row.

**D13 [MINOR] mixed_composing: draw task without an instruction, and ungrammatical titles.**
- What: item d ("95" over a Tens / Ones chart and a "| = 1 ten, o = 1 one" key) is a draw task, but the only instruction is "Solve.".
- What: titles across the lane are ungrammatical: "I Can make mixed number sense", "I Can divide zero in the quotient", "I Can work on all counting & cardinality".
- What: remainder_interpret says "beads in each plate" where "on each plate" is right.
- Fix: a per-cell verb line for draw cells ("Draw 95."); title strings from the provider (L6).

## What passes
- odd_even (paired dots, one task, a correct facsimile key).
- ten_frame_build (10 = the 1–10 deal, at the minimum frame size at S).
- remainder_interpret (three interpretation types, bank and unit line, at S and L).
- counting_all on paper (K-2 only, with the parity caption in its own cell).
- The div_zero L key, whole_as_fraction on paper, add_sub_10s L, long_div L, and long_div / remainder / ten_frame / odd_even on every screen host.
- The fixes to the round-2 defects are real: boxAns scoping, the neutral sign frame, numbered labels, centred key values, one track pitch, mixed_multiplication with no overflow, and deterministic seeded pages (ws-sheet-determinism OK).
- The lint is honest: it only gained rules. It is now missing three checks: an empty bordered cell, S grid = L grid, and a one-line item in a tall cell.

## Known pre-existing, out-of-lane items
- The number_families_add / _mult screen hosts are legacy: an "(Easy)" heading, left brackets, and a black "Check Answers" button inside the cell next to the orange CHECK. They are the same on live. ws-screen-answer now passes them.
- mixed_addition S sparseness is not a regression; live was worse. It is a lint gap.
