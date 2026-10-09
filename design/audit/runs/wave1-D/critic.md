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

---

# Round 4: independent critic (Opus medium), 2026-10-09

Tree: claude/sweet-newton-c8wrv1-wip-a3256e8dfc9684535 at 451f424 (round-4 sub-lanes G abc952f, S 22e3454, P 893ff28).
I made my own renders with `ws-grade-render --roles independent`: at S with every screen host (card 1280/820/390, worksheet 1280, quiz 1280), and at L print only, for the 15 lane documents.
I rendered the regression set on this tree and on origin/claude/sweet-newton-c8wrv1 (c91cc8b, a git worktree served through MQ_ROOT), at S with screen hosts and at L, and pixel-diffed them.
The renders are in my scratchpad. The 10 PNGs this report cites are copied to `renders/r4/`. (Note: `renders/r3/` is empty in this tree; round 3's cited PNGs were never committed.)

## Verdict: FAIL

This round fixed 7 of the 13 round-3 defects outright (D1, D2, D6, D8, D12, D13, and D7 on the K-2 pools' legacy cards). The paper pages are again clearly better.
Even so, **8 of 15 documents pass** on every version I graded: odd_even, whole_as_fraction, div_zero_in_quotient, ten_frame_build, dot_array_mult, counting_all, long_div_2digit and remainder_interpret.
The other 7 fail. One defect is new and caps C2:
- **mult_comparison S deals a take-away story** ("Ana gives 2 shells to Noor. How many shells does Ana have left?"). This is H3: the word-work cell retells a 4 ÷ 2 = 2 item as 4 − 2 = 2.

There is also one out-of-lane change of answer shape:
- **missing_add_sub** mixes boxes and lines on one page, and prints 16 at L where live printed 20.

## Gates I ran (all on 451f424)
| Gate | Result |
|---|---|
| `ws-screen-answer --skills` (all 15 lane skills) | **OK**: card, worksheet 3/3 and quiz 3/3 for every skill, and live green |
| `ws-screen-slots` | **OK**: 609 skills, 2436 host renders, 0 doubled answer areas, 0 paper verbs; 10 out-of-lane "suspects" listed for checking by eye. It does not see the doubled sign on mixed_multiplication worksheet card 3 (a sign row and a ring), because both are drawn slots, not a host field |
| ws-grade-render meta (15 skills, S) | 0 console errors; hScroll 0 on every host; smallTargetCount 0 on every card host (div_zero 820/390 was 5 in round 3). mixed_multiplication worksheet has 1 small target (an invisible 49 × 42 px slot input) |
| Orchestrator gates (print-lint S/L 0/191, determinism, content-audit, code-snapshot 608, layout-unit 555, lint self-test, standards, boot-smoke) | Not re-run; taken as reported |

**Lint gaps** (the lint passes pages graded below 8 here):
1. **PAGEFILL measures against the wrong height.** `ws-print-lint.cjs:1440` uses `body = footRect[1] - padT`, which is the whole page above the footer, header and title included. A strip 53–55 mm deep is 23–24 % of the problem area (number_families_add L key, number_families_mult L), but only about 19 % of that body, so it passes. Fix: measure from `gridTop` (`body = footRect[1] - gridTop`).
2. **No check for an empty bordered region in the last grid row.** add_sub_10s S has one.
3. **No check for repeated items on a page.** add_sub_10s S repeats 2 facts; number_families_add S repeats 1 family.

## Round-3 defects: status
| # | Round-3 defect | Status on 451f424 |
|---|---|---|
| D1 | Legacy check-box items get a doubled "Answer:" line | **FIXED.** add_fractions_like S e/f carry no Answer line; L-ANSAREA is added to the lint |
| D2 | dot_array_mult: empty cell at S, padding at L | **FIXED.** S prints 8 in 2 × 4 with rows sized to the arrays. L prints 6 in 2 × 3 |
| D3 | add_sub_10s S prints the L page | **PARTLY.** S now uses 16 pt digits in 3 columns (L: 2 × 8). But 22 problems are dealt and the distinct pool has 20 (+10 on 0–90, −10 on 10–100): g/u (90 − 10) and q/v (20 + 10) repeat. Cell v stands alone, beside an **empty bordered area two tracks wide**, above a 47 mm (20 %) strip. See D-A |
| D4 | mult_comparison answers do not vary; sign answered twice; worksheet wrap | **FIXED** as claimed: answers are 9, 30, 7, 8, 7, 40, 3, 2, 4; one ring for the sign; the worksheet ring is round and "= ☐" stays on the line. **NEW H3**: item h is a subtraction story (D-B) |
| D5 | mixed_multiplication slot shapes; story frame not explained | **PARTLY.** Vertical facts c, d, e are all boxed now. "Circle the sign:" was added, but the frame still has an operator box, so the sign is circled AND written (D-C). The worksheet number-line card is still 37 % empty above the line |
| D6 | long_div_2digit S H13 on width | **FIXED.** 3 × 3; the drawing is 56 % of the cell width; bands are 19–20 % |
| D7 | Pool worksheets deal legacy cards | **FIXED for the legacy cards**: every card on both worksheets is a kit `screen-cell`. Skipping members the screen cannot draw as the paper cell is acceptable parity. But the remaining weights leave mixed_composing's worksheet with 3 of 6 cards from whole_as_fraction, cards 1 and 2 in a row (D-F) |
| D8 | div_zero card touch targets | **FIXED.** smallTargetCount is 0 at 820 and 390; the quotient boxes are about 45 × 70 px at 390 |
| D9 | missing_mult_div: off-name items, density, screen | **PARTLY.** No item asks for a product any more. Quotient unknowns are fine (an unknown factor, 3.OA.6). But the new title "I Can find missing factors" sits over dividend unknowns (☐ ÷ 8 = 2: S items 3, 4, 9, 14, 16, 28; L c, d, i, n, p). Those ask for a product, not a factor. The worksheet still draws lines for the inactive slots, the card still repeats "27 ÷ ___ = 9" above the cell, and L still prints 16 (D-D) |
| D10 | number families | **PARTLY.** The kit print cell, S denser than L (9 / 12 against 4), collapsed doubles and the new titles are all real. Still wrong: uneven rows, the L strips, a repeated family, and squares over-dealt (D-E) |
| D11 | Screen prompts restate the frame | **PARTLY.** Fixed for dot_array_mult ("Multiply the rows by the columns. Type the answer.") and whole_as_fraction ("Type the whole number as a fraction."). Still restated: missing_mult_div card/quiz ("27 ÷ ___ = 9"), counting_all bond card ("? + 4 = 9"), div_zero ("963 ÷ 9 = ?") and long_div ("2052 ÷ 27 = ?") |
| D12 | div_zero S regroup box | **FIXED.** It measures 4.4 × 4.5 mm (16.75 × 17 px at 96 dpi) |
| D13 | Draw task verb, titles, "on each plate" | **FIXED.** "Draw the number." sits in mixed_composing d; "on each plate"; "I Can divide when the quotient has a zero", "I Can review number sense", "I Can review counting and cardinality" |

## Non-lane regression spot check (tree vs live, independent)
- **Unchanged:**
  - addition:add_20_regroup, measurement:time_5min, comparing:compare_objects: print pupil and key **pixel-identical** at S and L.
  - Their screen diffs are the animated background only. I checked the card and quiz side by side and the cells are identical.
- **Changed for the better:**
  - fraction_operations:add_fractions_like S: **D1 fixed.** No Answer line under the "Circle ALL" items, and rows are re-shared (a–d taller, the legacy row shorter); the page is not worse. Identical at L. The worksheet prompts read "Add." where live had "Calculate: 2/7 + 1/7 = ?".
  - multiplication:multiply S and L: the × has its own track (as noted in round 3). This is an improvement.
- **CHANGED, out of lane: subtraction:missing_add_sub** (gen-operations.js ~4437 moves it to the kit `equation` cell).
  - S is much cleaner than live (live's cramped 5-column wraps are gone).
  - But result-unknown items now print a **line** ("19 − 6 = ____") beside **boxed** missing-operand items, two slot shapes in one section. Live boxed every item.
  - L prints **16 in 2 × 8 where live printed 20 in 4 × 5**, leaving a 16 % strip.
  - The quiz host improved (prompt, big digits). See D-G.

## Visual grading
Print rows cover the pupil page and the key. Where only one size is named, the other size scored the same or higher. Screen rows cover card 1280/820/390, worksheet 1280 and quiz 1280.

| Document | Version | Clarity | Pedagogy | Layout | Parity | Result |
|---|---|---|---|---|---|---|
| composing:odd_even | S, L, key | 9 | 8 | 8 | 9 | PASS |
| | screen | 9 | 8 | 8 | 9 | PASS |
| composing:whole_as_fraction | S, L | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| division:div_zero_in_quotient | S | 8 | 8 | 8 | 9 | PASS |
| | L key | 9 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| composing:ten_frame_build | S key, L | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| multiplication:dot_array_mult | S | 8 | 8 | 8 | 9 | PASS |
| | L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| addition:add_sub_10s | L | 9 | 8 | 8 | 9 | PASS |
| | S | 8 | **7** | **6** | 8 | FAIL |
| | screen | 9 | 8 | 8 | 8 | PASS |
| division:missing_mult_div | S, S key | 8 | **7** | 9 | 8 | FAIL |
| | L | 8 | **7** | **7** | 8 | FAIL |
| | screen | **7** | **7** | 8 | **7** | FAIL |
| multiplication:mixed_multiplication | S, S key | **7** | 8 | 8 | **6** (H8) | FAIL |
| | L | 8 | 8 | 8 | 8 | PASS |
| | worksheet 1280 | **7** | 8 | **6** | **6** | FAIL |
| composing:mixed_composing | S, L | 8 | 8 | 8 | 8 | PASS |
| | worksheet 1280 | 8 | **7** | 8 | 8 | FAIL |
| counting_mixed:counting_all | S, L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| division:long_div_2digit | S, S key, L key | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| multiplication:mult_comparison | S, S key | 8 | **4** (H3) | 8 | 8 | FAIL |
| | L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| division:remainder_interpret | S key, L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| addition:number_families_add | S | 8 | **7** | **7** | 8 | FAIL |
| | L key | 8 | 8 | **6** | 8 | FAIL |
| | screen (pre-existing legacy) | **6** | 8 | 8 | **6** | FAIL |
| multiplication:number_families_mult | S key | 8 | 8 | **7** | 8 | FAIL |
| | L | 8 | **7** | **6** | 8 | FAIL |
| | screen (pre-existing legacy) | **6** | 8 | **7** | **6** | FAIL |

## Defects (ranked, §6 form)

**D-A [CRITICAL] mult_comparison S: a take-away story on a times-as-many page (H3).**
- What: S item h reads "Ana has 4 shells. Ana gives 2 shells to Noor. How many shells does Ana have left?" Its frame is 4 ○ 2 = 2, and the key rings "−".
- Why this matters: the title is "I Can solve times-as-many stories", so this item contradicts the name. The screen hosts retell the same story (`q.text = payload.lines.join(' ')`).
- Where: `renders/r4/mult_comparison-S-key.png`, item h.
- Cause:
  1. The generator (gen-operations.js 3475ff) dealt base 2 × multiplier 2 = 4, and sets no `q.a / q.b / q.op`.
  2. `solveStory` (sheet/cells/word-work.js ~121) then tries OPS in order, and 4 − 2 = 2 fits before 4 ÷ 2.
  3. `tellStory('separate')` writes a new subtraction story.
  4. ws-content-audit's seeded sample never hits base = multiplier = 2.
- Cost: C2 capped at 4 on S (H3). It hits any times-as-many item whose answer equals the multiplier (2 × 2) on every host.
- Fix:
  1. In gen-operations.js, set `q.a, q.b, q.op` (`'*'` for format 0, `'/'` for formats 1 and 2) so `solveStory` takes the generator's own step first.
  2. In word-work.js, restrict mult_comparison(_plain) to `*` / `/` (pass the op set, or a `divFirst`-like flag for the inverse forms).
  3. Avoid base = multiplier = 2 in the deal.
  4. Add a content-audit predicate: no story on a mult_comparison page carries a `+` / `−` step.
- Check: sweep 200 seeds of mult_comparison; 0 items have a ring answer of + or −.

**D-B [MAJOR] add_sub_10s S: repeated facts and an empty bordered area.**
- What: the page deals 22 problems from a 20-fact pool, so g = u (90 − 10) and q = v (20 + 10). Row 8 holds v alone, with an empty bordered area two tracks wide beside it, and a 47 mm (20 % of the problem area) strip sits under the grid.
- Where: `renders/r4/add_sub_10s-S-p1.png`.
- Cost: C3 6 (an empty boxed region plus the strip: page not at capacity, white space that is not deliberate); C2 7 (repeats on one page).
- Fix: cap the count at the distinct pool (`min(perPage, 20)`), and pick a grid the count fills:
  - 4 × 5 = 20 if a 46.5 mm cell holds "100 − 10 = ___" at 16 pt;
  - otherwise 3 × 6 = 18, then spread the rows.
  - Never leave part of the last row as an empty bordered track; draw the grid border round the filled cells only.
- Check: 0 repeated facts; the last row is full; strip < 15 %.

**D-C [MAJOR] mixed_multiplication: the story sign is answered twice (H8), and the unit has no instruction.**
- What (S): stories a, b and f carry "Circle the sign: + − × ÷" AND an operator box in the digit frame. The key rings × and also writes × in the box: one decision, two answer places. The unit bank ("pencils / plates / boxes") and its line have no verb, and the page instruction is "Solve.".
- What (worksheet 1280): card 3 repeats the doubled sign ("Tap the sign" over a sign row, plus a ring in the frame). Card 5 (number line) has a 200 px (37 %) empty band above the line.
- Where: `renders/r4/mixed_multiplication-S-key.png` (a, b, f) and `renders/r4/mixed_multiplication-worksheet-1280.png`.
- Cost: C4 capped at 6 (H8 doubled answer slot); C1 7; worksheet C3 6 (H13).
- Fix:
  1. Apply mult_comparison's round-4 treatment to word-work cells in a pool: `signRow: false`, with the ring in the frame as the one sign place. Use the per-cell instruction "Write the sign in the circle. Write the numbers. Write the unit." (word-work.js ~104; the same path for pooled skills).
  2. On the worksheet, top-align the number-line cell (or size the row to its own content) rather than stretching it to its neighbour's height.
- Check: each story cell has one sign slot; on the worksheet, no card band is ≥ 30 %.

**D-D [MAJOR] missing_mult_div: the title does not match the dividend unknowns; screen parity; L density.**
- Title: "I Can find missing factors" sits over 6 of 30 S items (and 5 of 16 at L) whose unknown is the dividend (☐ ÷ 8 = 2). A dividend is a product, not a factor. Fix: title "I Can find the missing number (×, ÷)" (providers/titles.js), or deal only factor, divisor and quotient unknowns.
- Worksheet 1280: inactive slots are underlines sitting below the baseline, where paper prints boxes. Fix: the `equation` cell's screen slot shape follows `slotShape(p)` (box) in every state, not only when focused (screen-cell.js).
- Card and quiz: "27 ÷ ___ = 9" / "___ × 10 = 30" is repeated above the cell. Fix: `screenInstr` "Type the missing number.".
- L: 16 in 2 × 8 with a 140 px (16 %) strip, where a 9th row (90 px) fits, so 18 is possible. Fix: let the row count use the strip (2 × 9).
- Where: `renders/r4/missing_mult_div-worksheet-1280.png`, `renders/r4/missing_mult_div-L-p1.png`.
- Cost: C2 7 (print, every size); L C3 7; screen C1 7 / C4 7.

**D-E [MAJOR] number_families_add / _mult: page fill at L, uneven rows at S, variety.**
- L: number_families_add key and number_families_mult print 4 problems, with strips of 53 mm and 55 mm under the grid (23–24 % of the problem area). Each cell has bands of 25–27 %. A 4-row family is about 71 mm, so 2 × 3 = 6 fits.
- S: row heights differ for identical content.
  - number_families_add: row 1 is 200 px, rows 2 and 3 are 282 px. Cell a sits pinned to the top, while d–i float in the middle.
  - number_families_mult key: rows are 222 / 284 / 223 px.
- Variety: number_families_add S deals the same family twice (f "2, 8, 10" and i "8, 2, 10"). number_families_mult L deals squares in 3 of 4 problems (2,2,4 · 3,3,9 · 5,5,25), so three quarters of the page is two-fact items.
- Where: `renders/r4/number_families_mult-L-p1.png`, `renders/r4/number_families_add-S-p1.png`.
- Cost: L C3 6; S C3 7 (uneven cells, the rubric's own 7 example); C2 7 (add S repeat; mult L squares).
- Fix:
  1. In family.js, give the footprint a measured height so L packs 2 × 3.
  2. In practice.js, spread every row of a section by the same factor (or none).
  3. Deal families without repeats, treating {a, b} as unordered.
  4. Cap doubles/squares at 1 in 4 problems.
- Check: L ≥ 6 per page; S row heights within 5 %; 0 repeated families; squares ≤ 25 %.

**D-F [MINOR] mixed_composing worksheet: the screen pool is skewed.**
- What: 3 of 6 cards are whole_as_fraction (1, 2 and 6; 1 and 2 adjacent). The paper page deals six different members.
- Why: skipping members the screen cannot draw as the paper cell is acceptable parity, but the weights left over should keep the review mixed.
- Cost: worksheet C2 7.
- Fix: in the screen pool path, deal at most 2 of 6 cards per member and never the same member twice in a row (page-deal anti-repeat).
- Where: `renders/r4/mixed_composing-worksheet-1280.png`.

**D-G [MAJOR, out-of-lane change] missing_add_sub: mixed slot shapes, and lower L density.**
- What: the move to the kit `equation` cell draws result unknowns as lines and missing operands as boxes on one page. Live boxed them all.
- What: L prints 16 (2 × 8, 16 % strip) where live printed 20 (4 × 5).
- Cause: equation.js `slotShape` gives `'line'` unless `p.resultBox`, and only missing_mult_div sets `resultBox`.
- Fix:
  1. Set `resultBox: true` on the missing_add_sub payload (gen-operations.js ~4440).
  2. Check its L column count against live's 4 × 5; the 24 pt across sizing makes it 2 columns.
- Where: `renders/r4/REGRESSION-missing_add_sub-L-tree-vs-live.png` (tree on the left).
- Cost: C1 7 for a skill that was not in the lane.

**D-H [MINOR] Small items.**
1. div_zero S quotient boxes are 4.3 mm wide (the regroup boxes now 4.4). Raise them to the same 4.4 mm minimum.
2. dot_array_mult L item d (3 × 10) draws smaller dots than its neighbours. Keep one dot pitch per page, or let the cell wrap.
3. mult_comparison L a/c: "has." wraps alone onto a line. Use a non-breaking space before the last word of a sentence.
4. mixed_composing b: the key shows 2, 4, 4 for 1/☐ + 1/☐ + 1/☐ = 1, but any order is correct. Print "(any order)" in the key, or fix the order with the wall's rows.
5. counting_all worksheet card 1 reads "Is 8 odd or even?" where the paper and mixed_composing read "Odd or even? Tap one box.". Use the parity cell's instruction string.

## Pre-existing, out-of-lane items
- **number_families_add / _mult screen hosts are still legacy.** They show an "(Easy)" heading, left brackets, and a black "Check Answers" button inside the cell, the same as live.
- The lane's new kit `number-family` print cell has no screen twin, so paper and screen now look different (L5). Give the template a `screen` mode and route the card, worksheet and quiz through `screen-cell`.
- add_fractions_like worksheet "Click ALL sums…" check-box cards (screen verb "Click", a grey Submit button): same as live.
- missing_add_sub title "I Can subtract missing numbers +/−" is ungrammatical (same on live).

## What passes
- **Fixed and good:**
  - odd_even, whole_as_fraction, ten_frame_build, remainder_interpret.
  - div_zero_in_quotient: targets fixed, 4.4 mm regroup boxes, every quotient has a zero.
  - dot_array_mult: 8 at S, 6 at L, the frame, the screen prompt.
  - long_div_2digit: 3 × 3 at S; every key checked correct.
  - counting_all: kit cells on paper and on the worksheet.
- **Partial fixes that work:**
  - mult_comparison L and screen: varied answers, one ring, the worksheet ring.
  - mixed_multiplication L: every vertical fact boxed.
- **The regression set holds:** add_20_regroup, time_5min and compare_objects are unchanged, and the add_fractions_like doubled slot is gone.
- **The lint gained L-ANSAREA.** It still needs: PAGEFILL measured from the grid top, an empty-bordered-region check, and a repeated-item check.

# Round 5: independent critic (Opus medium), 2026-10-09

Tree: claude/sweet-newton-c8wrv1-wip-a3256e8dfc9684535 at 08272b1 (round-5 sub-lanes G 5197575, S dbeea7d, P d65034e + follow-up 08272b1).
I made my own renders with `ws-grade-render --roles independent`: at S with every screen host (card 1280/820/390, worksheet 1280, quiz 1280) and at L print only, for the 15 lane documents plus subtraction:missing_add_sub.
For the regression set I rendered S (print and screen) on this tree, on origin/claude/sweet-newton-c8wrv1 (now 4970e4b, a scratchpad worktree served through MQ_ROOT) and on the round-4 tree 451f424 (a second worktree), and pixel-diffed them.
Live has moved since round 4 (4970e4b is not an ancestor of this tree: it carries the Steps-box lane and a layout revert), so tree-vs-live differences are not all this lane's. The tree-vs-451f424 diff isolates what round 5 changed.
The 10 PNGs this report cites are in `renders/r5/`. Both worktrees are removed.

## Verdict: FAIL (14 of 16 pass)

Round 5 fixed the round-4 critical (D-A) and most of the majors. **14 of the 15 lane documents pass** on every version I graded.
Two documents fail:
- **number_families_mult S** still deals the same family twice: 4 of its 12 problems are reorders of another problem (a/g, c/i, d/k, e/h). The default 5 × 5 band has only 10 families (6 pairs + 4 squares), so 12 cannot be dealt without repeats. The new REPEAT lint misses it because its signature is ordered.
- **subtraction:missing_add_sub** (out of lane, touched this round): the paper is now boxed throughout, but the worksheet still draws result unknowns as lines beside operand boxes. The pre-existing title "I Can subtract missing numbers +/−" sits over a page that is half additions.

Two claims did not reproduce in `ws-grade-render`: missing_mult_div L and missing_add_sub L print **16 in 2 × 8**, not 18 in 2 × 9. (The 2 × 8 rows are spread to the page, so there is no strip, and 16 is the 12.1 ceiling for one-symbol grids. Not a defect.) number_families_mult S prints 12 in 3 × 4, not 16.

## Gates
| Gate | Result |
|---|---|
| ws-grade-render meta (16 skills, S, all hosts) | 0 console errors; hScroll 0 on every host; smallTargetCount 0 on every host except mixed_multiplication worksheet-1280 (1, a desktop host, H6 does not apply) |
| `ws-content-audit --category multiplication` (re-run by me) | **OK**, 27 skills, 0 failing (times-story-addsub included) |
| Equation keys (missing_mult_div, missing_add_sub, add_sub_10s; S and L) | Every item evaluated by script: 0 wrong keys, 0 exact-text repeats |
| Orchestrator gates (print-lint S/L 0/191, determinism, content-audit + self-test, code-snapshot 608, layout-unit 558, lint self-test 49, standards, boot-smoke, screen-answer, screen-slots, share-options) | Not re-run; taken as reported |

**Lint gap:** REPEAT compares `signature(q)` (text + answer + payload, in order). A number family dealt as 4, 5, 20 and again as 5, 4, 20 has two signatures, so the lint passes number_families_mult S with 4 repeats. The fix is in D5-1 below.

## Round-4 defects: status
| # | Round-4 defect | Status on 08272b1 |
|---|---|---|
| D-A | mult_comparison take-away story (H3) | **FIXED.** S keys: 9, 30, 7, 8, 7, 40, 3, 9, 4. Every story is solved by × or ÷ (`q.storyOps`). There is no 2 × 2 item, and the content audit is OK |
| D-B | add_sub_10s S repeats and empty bordered area | **FIXED.** 20 distinct facts (0 + 10 … 90 + 10, 10 − 10 … 100 − 10) in 2 × 10. There is no repeat and no hole, and the grid ends 10 mm above the footer. The grid shape is the freeRows question below |
| D-C | mixed_multiplication doubled sign, unit verb, worksheet band | **FIXED.** S stories a, b, f have one sign place (the frame's operator box) under "Write the sign. Solve. Write the unit word.". On the worksheet, card 3 has one ring and card 5 (number line) is sized to its content. Residue: D5-3 |
| D-D | missing_mult_div title, screen, L density | **FIXED.** The title is "I Can find the missing number (×, ÷)". Card, worksheet and quiz say "Type the missing number." over the boxed sentence, with no restated equation. Worksheet slots are boxes. L prints 16 in 2 × 8 with the rows spread to the page (no strip) |
| D-E | number families fill, rows, variety | **PARTLY.** L prints 6 in 2 × 3 for both skills. S rows are equal (add 203 px × 4; mult 203 px × 4). number_families_add S has 12 distinct families with 2 doubles. **number_families_mult S repeats 4 families** (D5-1) |
| D-F | mixed_composing worksheet pool skew | **FIXED.** Six cards from five members; whole_as_fraction is cards 1 and 6, not adjacent |
| D-G | missing_add_sub mixed slot shapes / L density | **PARTLY.** Paper is all boxes at S and L. The worksheet still mixes lines and boxes (D5-2). L prints 16 in 2 × 8 (page full), where live printed 20 in 4 × 5 |
| D-H1 | div_zero quotient boxes 4.3 mm | **FIXED.** Measured 16–17 px = 4.4 mm wide, 7.1 mm tall |
| D-H2 | dot_array L one dot size | **FIXED.** d (3 × 10) has the same pitch as a, b, c |
| D-H3 | lone last word | **FIXED.** "Ravi has." and "Tom has." stay together on mult_comparison L |
| D-H4 | mixed_composing key order | **FIXED.** "(any order)" sits under 1/2 + 1/4 + 1/4 at S and L |
| D-H5 | counting_all odd/even screen prompt | **FIXED.** "Odd or even? Tap one box." |
| pre-existing | number families screen hosts legacy | **FIXED.** Card, worksheet and quiz draw the kit family cell: B&W Andika, one box per answer, no "(Easy)" heading, no in-cell Check button |

## Non-lane regression spot check
Round 5 against round 4 (451f424 → 08272b1):
- **Print unchanged (pixel-identical), S:**
  - add_fractions_like, add_20_regroup, time_5min, multiply, mult_properties.
  - Their screen diffs are the animated background only.
- **Changed by this round, as intended:** mixed_addition. The pool story drops the "Circle the sign" row, which leaves one sign place, on paper and on the worksheet. Nothing else moved.
- **Changed by this round, cosmetic: compare_objects S.** The empty run beside a and b (2 tower cells in a 4-track row) lost its right and bottom border. The frame's top rule now runs on over open paper. See the judgement below and `renders/r5/REGRESSION-compare_objects-S-tree-vs-live.png` (tree on the left).

Against live (4970e4b): live's mult_properties S prints **2 problems over a page-wide hole**, and its mixed_addition S prints 4. The tree prints 7 and 6, so the tree is better on both. Those differences come from live's own later commits, not from this lane.

## freeRows and the borderless empty run: judgement

**freeRows (2 × 9, 2 × 10; dense ceiling at L 16 → 20 for short problems).**
- **Count: acceptable.** DN-1a (2026-09-25) already lets a kit page of short problems hold 30 / 24 / 20 at S / M / L. So 20 at S, and up to 20 at L, is within the standard.
- **Shape: not covered by the letter of the standard.** 2 × 9 and 2 × 10 are not in CL-2's list (2 × 2 / 3 / 4 / 5 / 8 for independent pages). 12.1's Independent row still says "up to 16 … using the 2 × 5 and 2 × 8 grids". The only 2 × 10 in the standard is the 2-up practice strip.
- The cells are equal (CL-3) and the rows are whole, so nothing looks wrong on the page. In my renders freeRows took effect only on add_sub_10s S.
- **Raise it with the owner.** Either amend CL-2 to read "2 × n (n ≤ 10) for one-symbol answers when the count is held by the skill's distinct pool", and align 12.1's Independent row with DN-1a, or require the pool-capped page to use a listed shape: add_sub_10s S would be 4 × 5 = 20 (CL-2's open 4 × 5). Until the owner rules, I do not fail add_sub_10s S on it.
- One side effect to note: S and L now both print add_sub_10s in two columns. S differs only in count (20 against 16) and digit size, and leaves side bands of about 22 % of each cell.

**Borderless empty run (`.blankrun.cut`, grid.js + sheet-kit.css): cosmetics, and against the standard.**
- PG-15 says the remainder is "one unruled blank area **inside the closed outer frame**". The cut opens the frame instead.
- On compare_objects S the result is an L-shaped frame with a top rule that runs over nothing. A teacher reads that as a printing fault.
- The empty area is the same size as before. The hole is hidden, not removed.
- The real fixes in this round are the ones that avoid the hole: `hole()` in buildSheet re-deals or re-lays single-skill pages. Those work: no lane page has an empty run.
- Recommendation: revert the `cut` class (keep PG-15's closed frame), and remove holes by layout, the way buildSheet now does for single-skill pages. Do not count the borderless run as a fix.

## Visual grading
Print rows cover the pupil page and the key. Where only one size is named, the other size scored the same or higher. Screen rows cover card 1280/820/390, worksheet 1280 and quiz 1280.

| Document | Version | Clarity | Pedagogy | Layout | Parity | Result |
|---|---|---|---|---|---|---|
| composing:odd_even | S, L, key | 9 | 8 | 8 | 9 | PASS |
| | screen | 9 | 8 | 8 | 9 | PASS |
| composing:whole_as_fraction | S, L | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| division:div_zero_in_quotient | S, S key | 8 | 8 | 8 | 9 | PASS |
| | L | 9 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| composing:ten_frame_build | S key, L | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| multiplication:dot_array_mult | S, L | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| addition:add_sub_10s | S | 8 | 8 | 8 | 8 | PASS (CL-2 shape to the owner) |
| | L, L key | 9 | 8 | 8 | 9 | PASS |
| | screen | 9 | 8 | 8 | 8 | PASS |
| division:missing_mult_div | S, S key | 8 | 8 | 8 | 8 | PASS |
| | L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| multiplication:mixed_multiplication | S, S key | 8 | 8 | 8 | 8 | PASS |
| | L, L key | 8 | 8 | 8 | 8 | PASS |
| | worksheet 1280 | 8 | 8 | 8 | 8 | PASS |
| composing:mixed_composing | S, L, keys | 8 | 8 | 8 | 8 | PASS |
| | worksheet 1280 | 8 | 8 | 8 | 8 | PASS |
| counting_mixed:counting_all | S, L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| division:long_div_2digit | S key, L | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| multiplication:mult_comparison | S, S key | 8 | 8 | 8 | 8 | PASS |
| | L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| division:remainder_interpret | S, L key | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| addition:number_families_add | S | 8 | 8 | 8 | 8 | PASS |
| | L key | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| multiplication:number_families_mult | S, S key | 8 | **7** | 8 | 8 | FAIL |
| | L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| subtraction:missing_add_sub (touched) | S, S key, L | **7** | 8 | 8 | 8 | FAIL |
| | worksheet 1280 | **7** | 8 | 8 | **7** | FAIL |
| | card, quiz | 8 | 8 | 8 | 8 | PASS |

## Defects (ranked, §6 form)

**D5-1 [MAJOR] number_families_mult S: a third of the page repeats a family.**
- What: S deals 12 families from the default 5 × 5 band. Only 10 exist: {2,3} {2,4} {2,5} {3,4} {3,5} {4,5} and 4 squares. a (4, 5, 20) = g (5, 4, 20); c (3, 2, 6) = i (2, 3, 6); d (2, 4, 8) = k (4, 2, 8); e (4, 3, 12) = h (3, 4, 12). Each pair is the same four facts in a different order.
- Where: `renders/r5/number_families_mult-S-key.png`.
- Cause:
  1. `_familyPair` (gen-operations.js 2204) deals pairs without repeat until the 6 unequal pairs run out, then cycles.
  2. buildSheet's `dup()` and lint REPEAT use the ordered `signature(q)` (print-sheet.js 159), so a reordered family does not count as a repeat. The fill therefore goes on to 12.
- Cost: C2 7 on S and S key (repeats on one page, the round-4 standard). Getting to 10 needs every family on the page to be distinct.
- Fix:
  1. Give number-family items a canonical deal key. Set `q.dealKey = 'nf:' + [a, b].sort() + ':' + op` in the two family branches, and use it in `signature()` when it is present. Then `dup()` and REPEAT both see the repeat, and the existing pool-cap path stops the page at the distinct pool.
  2. At S the 5 × 5 band then caps at 10. Lay that out as 3 × 3 = 9 (6 pairs + 3 squares), or better, deal the default S page from a 2–6 band (10 pairs + squares at 1 in 6). Say which in the option panel's note.
- Check: render number_families_mult S at seeds 1–20; 0 pages with two items whose sorted (a, b) match; REPEAT self-test gains a reordered-family case.

**D5-2 [MAJOR, touched out-of-lane] missing_add_sub: the worksheet mixes lines and boxes, and the title misleads.**
- Worksheet 1280: cards 1–4 (result unknown: "15 − 10 = ___") draw an underline, and cards 5–6 draw a box. Paper now boxes every unknown (`resultBox: true`).
  - Cause: the screen path for this skill does not reach `equationKitTwin`'s `resultBox` branch (screen-cell.js 3324). The worksheet card still renders the legacy line.
  - Fix: route missing_add_sub's worksheet and card through the kit equation twin with `p.resultBox` (as missing_mult_div now does), so every slot is a box.
  - Cost: C1 7 (two slot shapes in one grid) and C4 7 (paper box against screen line). `renders/r5/missing_add_sub-worksheet-1280.png`.
- Title (pre-existing on live, but this skill was moved to the kit this lane): "I Can subtract missing numbers +/−" sits over a page where 7 of 16 L items are additions ("10 + 9 = ☐", "☐ + 2 = 11"). It is also ungrammatical.
  - Fix: add `'subtraction:missing_add_sub': 'I Can find the missing number (+, −)'` to TITLES in `js/modules/sheet/providers/titles.js`, matching missing_mult_div.
  - Cost: print C1 7. `renders/r5/missing_add_sub-L-p1.png`.
- Check: worksheet shows 6 boxed slots; the title matches; `ws-screen-slots` shows 0 shape mismatches for the skill.

**D5-3 [MINOR] mixed_multiplication: the story's sign place is a square digit box on paper, a ring on screen.**
- What: after D-C, the one sign place on paper is the operator-track box of the column frame. It is drawn exactly like the digit boxes beside it (S a, b, f). The worksheet draws the same place as a ring, and mult_comparison's paper draws it as a ring.
- Why it matters: the pupil should know a sign is wanted from the slot's shape (C1). The instruction "Write the sign." carries it today.
- Fix: in word-work.js's column-frame operator cell, draw `circle()` (Hw + 2 mm) when `signRow === false`.
- Where: `renders/r5/mixed_multiplication-S-p1.png` and `renders/r5/mixed_multiplication-worksheet-1280.png` (card 3).
- Check: the sign slot is round on paper and on screen.

**D5-4 [MINOR] mixed_multiplication worksheet: row 3 is ragged.**
- What: card 5 (number line, 375 px) sits beside card 6, a 9 × 4 dot array at 45 px pitch that is 650 px tall. Card 5's band is gone, but the grid now has a short card next to a long one.
- Fix: cap the dot pitch on the worksheet host so a 9-row array is ≤ 420 px, or deal the tall member into a row of its own height class.
- Check: card heights in one worksheet row are within 25 % of each other.

**D5-5 [MINOR] The borderless empty run (kit-wide, `.blankrun.cut`).**
- What: the run leaves an open frame with a dangling top rule (compare_objects S). It contradicts PG-15, and the empty area is no smaller than before.
- Fix: remove `cut` from `blankRun()` (grid.js 19) and the CSS rule (sheet-kit.css 164), restoring PG-15's closed frame. Keep the buildSheet hole-avoidance, and extend it to mixed-height pages: compare_objects S should lay the two tower cells 2-across over half the width, or move them into the full-width rows.
- Check: lint HOLE stays green; no page shows an open frame.

**D5-6 [MINOR] Small items.**
1. Kit `box()` slots at S measure 21 px tall (5.6 mm outer), under SL-4's Hw 6 mm clear height (missing_mult_div S, missing_add_sub S). The key digit is set at .72 em inside it. Fix: make `.ws-box` `box-sizing: content-box` (or height `calc(var(--ws-hw) + 2 × var(--ws-hair))`) so the clear height is Hw. This is kit-wide, not this lane.
2. mult_comparison S d, e, h (the "how many times as many" items, which have no unit bank) are centred in their cells while a, b, c, f, g, i are top-anchored, so the answer row is at three different heights in one section (CL-6). Fix: top-anchor every word-work cell.
3. div_zero_in_quotient deals only X0Y quotients (28 of 28 at S). A quotient with a zero in the ones (840 ÷ 4 = 210) is the second named edge case. Fix: deal 1 in 4 with the zero in the ones place.
4. counting_all worksheet cards 2, 4, 5: the shapes touch the cell's left border (0–2 px pad). Fix: 3 mm pad on the count cell's screen twin.
5. The orchestrator's claims of "missing_mult_div / missing_add_sub L 18 in 2 × 9" and "number_families_mult S 16" do not match `ws-grade-render` on 08272b1 (16, 16, 12). Re-check the claims against the same harness before reporting them.

## Pre-existing, out-of-lane items
- **mult_properties S (tree = round 4, better than live):** legacy cells e–g have a sentence blank AND an "Answer: ___" line (H8 doubled slot), and a and d restate "What is 1 × 3?" over "3 × 1 = ?". On the worksheet, cards 4 and 6 draw the distributive arrays small, with nearly touching dots and no "2 rows / ? rows" captions.
- **mixed_addition S:** the stacked cells a–d and f have no answer row under the rule. 16 + 16 is drawn at twice the size of its neighbours. Cells b–d have empty bands of 60–70 % (H13). "110303 + 41" sits on a K–5 review. On the worksheet, card 6 has a "Yes" check box clipped to a corner. All of these are the same on round 4 and on live.
- add_fractions_like e/f: "Circle ALL sums…" over check boxes with slashed fractions (legacy, the same as before).

## What passes
- **Fixed and good this round:**
  - mult_comparison: ×/÷ stories only, varied answers, one ring, words kept together.
  - add_sub_10s S: 20 distinct facts, no hole.
  - missing_mult_div: title, boxed screen twins without the restated equation, L page full.
  - number_families_add: S 12 distinct with even rows, L 6 in 2 × 3, kit screen cell on all hosts.
  - mixed_multiplication: one sign place, the worksheet number-line card sized to content.
  - mixed_composing worksheet: varied, with "(any order)" in the key.
  - div_zero boxes 4.4 mm.
  - dot_array: one dot size.
  - counting_all: the parity prompt.
- **Unchanged and still at 8+:** odd_even, whole_as_fraction, ten_frame_build, long_div_2digit, remainder_interpret.
- **Regression set holds:** add_fractions_like, add_20_regroup, time_5min, multiply and mult_properties print pixel-identical to round 4. mixed_addition changed only as intended (one sign place).

---

# Round 6: independent critic (Opus medium), 2026-10-09

Tree: claude/sweet-newton-c8wrv1-wip-a3256e8dfc9684535 at a08a37d (round-6 GS 2f9c30c, round-6 P 6e177ea, round-7 a08a37d).
I made my own renders with `ws-grade-render --roles independent`: at S with every screen host (card 1280/820/390, worksheet 1280, quiz 1280) and at L print only, for the 16 documents.
I also rendered mixed_multiplication at the print-lint seed (`hash('multiplication__mixed_multiplication:print')` = 4030286246) at S and L, with a scratchpad copy of the renderer whose only change is the seed.
Because the lint seed showed defects the harness seed does not, I probed the three pool documents over 15 seeds at S and L (`buildSheet`, items per page, grid fill, key text against its slot box). I ran the same probe on the round-5 tree 08272b1 (a scratchpad worktree served through MQ_ROOT) to separate new defects from old ones.
For the regression set I rendered S on this tree, on origin/claude/sweet-newton-c8wrv1 (4970e4b) and on 08272b1, and pixel-diffed them.
The 10 PNGs this report cites are in `renders/r6/`. All scratchpad worktrees are removed.

## Verdict: FAIL (15 of 16 pass; mixed_multiplication fails)

Round 6/7 fixed every round-5 defect except D5-4, which is only part-fixed (cosmetic). At the harness seed all 16 documents grade 8 or better on every version.
**multiplication:mixed_multiplication fails on pages the harness seed does not deal:**
- **At the lint seed (S):** the column-work row now fills (5 across, no hole). But it mixes two digit sizes, and the fact cells' answer box is shorter than the digits printed above it. On the key, "30" and "110" run 4 mm past their boxes (D6-1).
- **On 6 of 30 sampled seeds (S and L):** the page holds 2–4 problems over a 36–68 % empty strip (H5). Some deals also bring legacy members with a doubled slot or a hint that gives the answer away (D6-2).
These defects are **not regressions**. The fill and legacy-member results are identical on 08272b1, and the builder already lists the key overflow as known. They are in-lane, and earlier rounds missed them because every round graded only the harness seed.

## Gates
| Gate | Result |
|---|---|
| ws-grade-render meta (16 skills, S, all hosts) | 0 console errors. hScroll 0 and smallTargetCount 0 on every host, except mixed_multiplication worksheet-1280 (1 small target, a desktop host, so H6 does not apply) |
| Number families, order-free repeat probe (both skills, S and L, seeds 1–20) | **0 of 80 pages repeat a family**. No blank run and no re-laid grid. number_families_mult S = 8 distinct in 2 × 4 on every seed |
| Slot boxes at S (DOM, mm) | `.ws-box` clear height **6.00 mm** (missing_mult_div, missing_add_sub, mixed_multiplication). div_zero quotient boxes 3.9 × 6.7 mm. The mixed_multiplication missing-digit box is **3.5 × 6.0 mm** |
| Key text against its box (mixed_multiplication, 15 seeds × S/L) | **4 of 15 S pages** have a fact answer 15 px (4 mm) past the bottom of its box (seeds 120, 180, 260, 280, and the lint seed). L: 0 of 15 |
| Pool page fill (15 seeds × S/L, grid height ÷ space above the footer) | mixed_multiplication **6 of 30 below 70 %** (S 100: 0.43, S 140: 0.41, S 160: 0.64; L 100: 0.56, L 140: 0.61, L 200: 0.32). The same 6 on 08272b1. mixed_composing 1 of 30 (L 180: 0.63, same on 08272b1). counting_all 0 of 30 |
| Orchestrator gates (print-lint S/L 0/191, determinism, content-audit, code-snapshot 608, layout-unit 563, lint self-test 50, screen-answer, boot-smoke) | Not re-run; taken as reported |

**Lint gap:** `ws-print-lint` passes the lint-seed page although the key prints "110" across its box border. L-OVERFLOW does not compare the text inside a slot with the slot's box on the key document. The `fits` capacity is also not compared with the items dealt: seed 100 S reports `perPage 4` and prints 2.

## Round-5 defects: status
| # | Round-5 defect | Status on a08a37d |
|---|---|---|
| D5-1 | number_families_mult S repeats families | **FIXED.** `nfDedupeKey` (family.js) → `data-ws-dedupe`, which `signature()` and lint REPEAT both read. The generator deals the band's 10 families before any repeats. S prints 8 distinct (4,5) (3,5) (2,3) (2,2) (2,4) (3,4) (2,5) (3,3) in 2 × 4. 0 of 40 pages repeat. **On 2 × 5:** at S a 4-fact family needs about 170 px of a cell, and 5 rows give 171 px, so 2 × 5 would cram. I agree with the builder. See D6-4 for the better route to 10 |
| D5-2 | missing_add_sub worksheet lines + title | **FIXED.** Worksheet 1280, card and quiz box every unknown (`cellKindFor` returns null for `resultBox`). The title "I Can find the missing number (+, −)" is on S, L and the keys |
| D5-3 | sign place square on paper | **FIXED.** The column-frame sign place is a ring when `signRow === false` (S a, b, f; key shows × in the ring). The same ring now also prints on mixed_addition / mixed_subtraction stories (see the regression check), which is consistent |
| D5-4 | worksheet row 3 ragged | **PARTLY.** The cards in row 3 are now equal height. Card 5's bordered cell is still 260 px against card 6's 535 px: the 9 × 4 array at 45 px pitch is unchanged. The ragged edge moved inside card 5, as a 290 px white band (45 % of the card) under its cell. Residue: D6-3 |
| D5-5 | borderless empty run | **FIXED.** `cut` is removed and the lint counts every `blankrun` as a hole. compare_objects S now lays its two tower cells across the full row (closed frame, no open rule). No lane page I rendered has a blank run |
| D5-6.1 | `.ws-box` under 6 mm | **FIXED.** Clear height 6.00 mm at S (additive rule, kit-wide) |
| D5-6.2 | mult_comparison answer rows uneven | **Left as is, acceptable.** The box rows differ by 1.1 mm (a/d) and 1.9 mm (g/h). Only the story text start moves (36 px against 58 px from the cell top). Nit, no score cost |
| D5-6.3 | div_zero ones-zero quotients | **FIXED.** S deals 9 of 28 with a ones zero (110, 220, 120, 140, 320, 330, 210). Nit: 110 appears three times (770 ÷ 7, 880 ÷ 8, 990 ÷ 9) |
| D5-6.4 | counting_all shapes touching the border | **FIXED.** Worksheet cards 2, 4, 5 have a 12 px inner pad |

## Non-lane regression spot check
- **Against round 5 (08272b1 → a08a37d), S print, pixel diff:**
  - add_fractions_like, add_20_regroup, time_5min and multiply are **identical**.
  - mixed_addition and mixed_subtraction differ only in the story's sign place, now a ring (D5-3 applies kit-wide to the column frame). That is intended and matches the screen.
  - compare_objects: round 5's open L-frame beside a and b is gone. The two tower cells now share the row inside a closed frame (`renders/r6/REGRESSION-compare_objects-S-tree.png`). Better.
- **Against live (4970e4b):** every changed document also differs from live through round 5's own changes and live's later commits (4970e4b is not an ancestor). Nothing in the round-6/7 diff touches them beyond the two items above.

## CL-2a: does add_sub_10s S's 2 × 10 "look good"?
**Yes, it meets CL-2a.** `renders/r6/add_sub_10s-S-p1.png`:
- 20 distinct facts (0 + 10 … 90 + 10, 10 − 10 … 100 − 10), which is the skill's whole pool.
- 20 equal cells (CL-3) in whole rows, with the grid ending about 10 mm above the footer. There is no hole and no strip.
- One slot shape. The key is correct on all 20 items.
- Each sentence sits in the middle of its cell, with side bands of about 22 % (under H13's 30 %).
- The listed alternative, 4 × 5, would give 175 px cells for "100 − 10 = ___" (about 170 px wide at S), which is a cramped row. 2 × 10 is the better page.
- Scores: C1 8, C2 8, C3 8, C4 9.

## Visual grading
Print rows cover the pupil page and the key. Where only one size is named, the other size scored the same or higher. Screen rows cover card 1280/820/390, worksheet 1280 and quiz 1280. "Harness" is the `ws-grade-render` seed.

| Document | Version | Clarity | Pedagogy | Layout | Parity | Result |
|---|---|---|---|---|---|---|
| composing:odd_even | S, L, key | 9 | 8 | 8 | 9 | PASS |
| | screen | 9 | 8 | 8 | 9 | PASS |
| composing:whole_as_fraction | S, L | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| division:div_zero_in_quotient | S, S key, L | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| composing:ten_frame_build | S key, L | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| multiplication:dot_array_mult | S, L | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| addition:add_sub_10s | S (2 × 10, CL-2a), S key | 8 | 8 | 8 | 9 | PASS |
| | L | 9 | 8 | 8 | 9 | PASS |
| | screen | 9 | 8 | 8 | 8 | PASS |
| division:missing_mult_div | S, S key, L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| multiplication:mixed_multiplication | S, S key, L, L key (harness) | 8 | 8 | 8 | 8 | PASS |
| | S + key, lint seed | **7** | 8 | **7** | **7** | FAIL (D6-1) |
| | S/L seeds 100, 140, 160 / 200 | 8 | **7** | **5** (H5) | **6** (H8) | FAIL (D6-2) |
| | worksheet 1280 | 8 | 8 | 8 | 8 | PASS (D6-3 residue) |
| | card, quiz | 8 | 8 | 8 | 8 | PASS |
| composing:mixed_composing | S, L, keys (harness) | 8 | 8 | 8 | 8 | PASS |
| | L seed 180 | 8 | 8 | **7** | 8 | FAIL (D6-5) |
| | worksheet 1280 | 8 | 8 | 8 | 8 | PASS |
| counting_mixed:counting_all | S, L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| division:long_div_2digit | S, L | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| multiplication:mult_comparison | S, S key, L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| division:remainder_interpret | S, L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| addition:number_families_add | S, L key | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| multiplication:number_families_mult | S, S key (8 in 2 × 4) | 8 | 8 | 8 | 8 | PASS |
| | L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| subtraction:missing_add_sub (touched) | S (30 in 3 × 10), S key, L | 8 | 8 | 8 | 8 | PASS |
| | worksheet 1280, card, quiz | 8 | 8 | 8 | 8 | PASS |

## Defects (ranked, §6 form)

**D6-2 [CRITICAL, in lane, not a regression] mixed_multiplication: about 1 page in 5 is under-filled, and pool legacy members print doubled slots and answer hints.**
- **What:**
  - S seed 100 prints **2 problems** (a word-work story and an 8 × 6 array). The grid fills 43 % of the space above the footer, and the bottom 57 % of the page is empty. `fits` reports 2 × 2 = 4 per page.
  - Seed 140 S has 2 problems (fill 0.41). Seed 160 S has 4 (0.64). L seeds 100, 140 and 200 fill 0.56, 0.61 and 0.32.
  - **H5 → C3 ≤ 5** on those pages.
  - Some deals bring legacy members:
    - seed 180 S b: "What is 11 × 0? … 11 × 0 = ? … **Any number × 0 = 0** … Answer: ___". The hint gives the answer away on the pupil page (C2 7).
    - seed 180 S a: "16 × 379 = ☐" **and** "Answer: ___" (a doubled slot, H8 → C4 ≤ 6).
    - seed 160 S c: "I can multiply ☐ / I must add ☐", "Say: Each group has __" and "Answer: ___" in one cell.
- **Where:** `renders/r6/mixed_multiplication-S-seed100-p1.png` and `renders/r6/mixed_multiplication-S-seed180-p1.png`.
- **Cause:** `buildSheetFilled` (print-sheet.js 2656 ff.) has three gaps.
  1. Its fill loop `break`s the first time count + 1 spills onto a second page. When the next draw is a tall member, the page stays at 2.
  2. `fillOf()` returns 1 for any page with more than one grid, so the strip checks never run on pool pages.
  3. The re-deal from derived seeds is used only for holes and repeats, never for a spill.
- **Not a regression:** identical counts and fill on 08272b1.
- **Fix:**
  1. In `buildSheetFilled`, when count + 1 spills, try the same count from derived seeds (seed + k × 7919, k = 1…4) before breaking. Keep the first deal that stays on the pages asked.
  2. Make `fillOf()` measure the last grid's bottom against the page's available height when there are several grids. Re-deal while fill < 0.80 on an auto independent page.
  3. Drop the legacy members from the mixed_multiplication pool, or give them kit cells. The candidates are the `mult_properties` "What is …? / Answer:" cell and the area-model "Use the model … Answer:" cell. Their answer-revealing caption must also go ("Any number × 0 = 0" is a hint, and hints fade on independent pages).
- **Check:** across seeds 1–30 at S and L, every mixed_multiplication page has a grid fill ≥ 0.80 and items ≥ `fits.perPage` − 1. No pupil page contains "Answer:" next to a box, and none contains "Any number".

**D6-1 [MAJOR, in lane, known per builder] mixed_multiplication lint seed S: the column-work row mixes two digit sizes, and the fact answer box is smaller than its digits.**
- **What:** row e–i at the lint seed (`renders/r6/mixed_multiplication-S-lintseed-key.png`) holds:
  - three missing-digit stacks (e 6☐ × 4 = 256, g, i) at about 4.5 mm digits;
  - two facts (f 3 × 10, h 11 × 10) drawn at about 10 mm (37 px font).
  - The facts' answer box is 15.5 × 6.0 mm, shorter than the printed operand digits, so the pupil must write 110 smaller than the problem.
  - On the key, "30" and "110" are set at the fact size and hang 15 px (4 mm) out of the box, crossing its bottom border.
  - Across 15 seeds this hits 4 of 15 S pages (seeds 120, 180, 260, 280). L is clean (0 of 15).
  - The missing-digit box is 3.5 mm wide (the same digit is printed 4.5 mm wide).
- **Cost:** C1 7 (box smaller than the digits; two sizes in one row); C3 7 (one row, two drawing scales); C4 7 (the key's answer crosses its slot; AK-1).
- **Cause:** fact.js 351–356, the `boxAns` path. `blank({shape:'box'})` takes the kit's Hw (6 mm at S), but the fact sets `--fd: ${pt}pt` from `factDigitPt(cols)`, and the key value inherits that size. The fine-split group (practice.js `fineSplit`) does not give its members one digit size.
- **Fix:**
  1. In the `boxAns` branch, size the box from the fact's digit: height `calc(var(--fd) * 1.25)`, width `n × DIGIT_EM × var(--fd)`. Alternatively, set the key value's font-size to the box's key size, `.72em` of Hw, as `.ws-box` does elsewhere.
  2. In the fine-split group, pass one `pt` (the smallest member's) to every cell, so stacks and facts share a digit size.
  3. Give the missing-digit box (`ws-box--unknown`) at least the digit width plus 1 mm (about 5.5 mm at S).
- **Check:** probe every key `.ws-box` / `[data-ws-slot]` box: no text rect extends more than 1 px outside its box at S and L over seeds 1–30. In one fine-split row, `--fd` / digit pt is identical in every cell.

**D6-3 [MINOR] mixed_multiplication worksheet: row 3 is level only at the card edge.**
- **What:** the D5-4 fix stretches card 5's chrome. Its bordered cell stays at 260 px against card 6's 535 px, leaving a 290 px white band (45 % of card 5) under the number line. The cause is still the 9 × 4 array at 45 px pitch.
- **Where:** `renders/r6/mixed_multiplication-worksheet-1280.png`.
- **Fix:** cap the worksheet host's dot pitch at 32 px, so a 9-row array's cell is no more than 420 px (screen-cell.css, `.mq-wscard` arrays twin). Then revert the stretch rule, so the cells, not just the cards, match.
- **Check:** the bordered cells in one worksheet row differ by no more than 25 % in height.

**D6-4 [MINOR] number_families_mult S: the page could hold 10 to 12 families, not 8.**
- **What:** 8 in 2 × 4 is clean (row height 203 px; side bands 28–31 %), but the 5 × 5 band's 10 families cannot fill 3 × 4. The S page therefore prints fewer families than number_families_add S (12 in 3 × 4). Cell d (2, 2, 4) has a 31 % right band, at the H13 line.
- **Fix:** deal the default S page from a 2–6 band (10 pairs + 5 squares = 15 families), which restores 12 distinct in 3 × 4. Alternatively, say in the option panel that the 2–5 band holds 8 per page.
- **Check:** S prints 12 distinct in 3 × 4 at seeds 1–20 with 0 repeats.

**D6-5 [MINOR, in lane, not a regression] mixed_composing L seed 180: a 37 % strip under 3 problems.**
- **What:** the page holds frac-model, frac-model and frac-wall: a, b, and a full-width number line c. It ends at 63 % of the page, with an empty band of about 290 px above the footer (C3 7).
- **Not a regression:** the same on 08272b1.
- **Where:** `renders/r6/mixed_composing-L-seed180-p1.png`.
- **Fix:** the same `buildSheetFilled` fill-floor as D6-2 fix 2.
- **Check:** seeds 1–30 at S and L have mixed_composing grid fill ≥ 0.80.

**D6-6 [MINOR, lint] ws-print-lint does not see these defects.**
- L-OVERFLOW does not check slot text against the slot's box on the key.
- PAGEFILL is not run against `fits.perPage` on pool pages at other seeds.
- **Fix:** add a key-slot containment rule (the text range rect of a `[data-ws-slot]` or `.ws-box` within its box, 1 px tolerance). Add a multi-seed pool fill check (seeds 1–10) for `mixed_*` skills.
- **Check:** the lint fails on a08a37d's mixed_multiplication at seeds 100 and 4030286246 (S), and passes once D6-1 and D6-2 are fixed.

## Pre-existing, out-of-lane items
- **Daily tabs under an "I Can" title:** missing_add_sub S and missing_mult_div S print 30 items in 3 × 10 with black number tabs (the letters run out after z), under an "I Can" title. 3 × 10 is not in CL-2's list. 30 at S is within DN-1a. These pages were unchanged in round 5 and are not graded down here. Owner question: extend CL-2a to "3 × 10 for one-symbol answers at S", or cap these pages at 26 so the I Can letters hold.
- **mixed_multiplication worksheet card 4** reads "Fact Family: 10, 8, 80" as its instruction (no verb, and it restates the set). The same appears on round 5.
- div_zero_in_quotient: 110 three times on one S page (different divisors). Item variety nit.

## What passes
- **Fixed and good this round:**
  - number_families_mult: order-free de-duplication end to end (generator, buildSheet, lint), 8 distinct families on every seed.
  - missing_add_sub: boxed slots on every host, correct title.
  - The ringed sign place on paper.
  - PG-15's closed frame restored, with holes removed by layout (compare_objects S better than in round 5).
  - `.ws-box` clear height 6 mm.
  - Ones-zero quotients in div_zero.
  - counting_all worksheet padding.
- **add_sub_10s S 2 × 10 meets CL-2a.**
- **Unchanged and still at 8+ on the harness seed:** odd_even, whole_as_fraction, ten_frame_build, dot_array_mult, missing_mult_div, counting_all, long_div_2digit, mult_comparison, remainder_interpret, number_families_add, mixed_composing.
- **Regression set holds:** four documents are pixel-identical to round 5. mixed_addition and mixed_subtraction changed only as intended (the ring), and compare_objects improved.

# Round 7: independent critic (Opus medium), 2026-10-09

Tree: claude/sweet-newton-c8wrv1-wip-a3256e8dfc9684535 at cf39d5d (round-8 fixes 44ac865 and aef4b2f, ruling CL-2b 068b2ec).
- **My renders.** I ran `ws-grade-render --roles independent` for the 16 documents at S and at L, with every screen host (card 1280/820/390, worksheet 1280, quiz 1280).
- **Pool probe.** A scratchpad probe calls `window.buildSheet` with the teacher-print request shape. It lays out the pupil page and the key in the app's stylesheet, then records build time, page fill (problem area to the footer), H13 bands, overflow, key ink against its box, "Answer:" / "Any number" and legacy cells. It covered mixed_multiplication, mixed_composing and mixed_addition, Independent, S and L, at seeds 1–30, 100, 140, 160, 180, 200, 220 and the lint seed: **222 pages**.
- **More Practice.** I ran the same probe on the **More Practice** role, which is the teacher print screen's default page type (`teacher-print.js` `newSection` → `role: 'more-practice'`). It covered the 16 documents at S and L, seeds 1–2, and the three pools at seeds 1–10.
- **Main-thread probe.** A long-task observer measured how long `buildSheet` blocks the page.
- **Lint.** I ran `ws-print-lint --seed-list` on this tree and against a08a37d (MQ_ROOT) to check D6-6.
- **Regression set.** I rendered it at S on this tree, on a08a37d (round 6) and on origin/claude/sweet-newton-c8wrv1 (now f1dae55), and pixel-diffed the three.
- **Files.** The 10 PNGs this report cites are in `renders/r7/`. The scratchpad worktrees are removed.

## Verdict: FAIL

**The Independent page passes: 16 of 16 documents, and every D6 defect in that role is fixed or accepted.**
- mixed_multiplication's 74 sampled pages all reach the fill floor (lowest 0.812). None has a band, a legacy cell, an "Answer:" row, an "Any number" line or a key value out of its box. The column-work row prints one digit size.

**The round fails on two findings that no earlier round tested:**
- **D7-1 [CRITICAL] The More Practice page type is broken for lane skills.** It is the page a teacher gets by default.
  - mixed_multiplication deals **one problem per page** on 5 of 10 S seeds and 6 of 10 L seeds, filling 25–40 % of the page.
  - number_families_mult and add_sub_10s repeat problems on one page.
  - dot_array_mult S spreads 2 arrays over a 600 px row on 3–4 pages.
  - RUBRIC requires 8 on every page type (H5, C3 ≤ 5).
- **D7-2 [MAJOR] A hard pool page freezes the app for up to a minute.** The build runs as ONE main-thread task: 56.5 s for mixed_multiplication S seed 11 and 41.3 s for mixed_addition S seed 6, measured as a single long task during which no timer fired. 1 build in 5 at S takes over 10 s.

## Gates
| Gate | Result |
|---|---|
| ws-grade-render, 16 documents, S and L, all hosts | 0 console errors on every document. hScroll 0 and smallTargetCount 0 everywhere, except mixed_multiplication worksheet-1280 (1 small target; a desktop host, so H6 does not apply) |
| Pool probe, Independent, 222 pages | **Fill:** lowest mixed_multiplication 0.818 (S) / 0.812 (L); mixed_composing 0.893 / 0.859; mixed_addition 0.868 / 0.815. **H13 bands:** 0, except mixed_addition S seed 6 (h, 37 %). **Items:** at least 3 on every page (3-problem pages: mixed_multiplication S 4/37, L 12/37; mixed_addition L 12/37). **Legacy cells, "Answer:", "Any number":** 0 / 0 / 0 |
| Key ink against its box | Clean in the PNGs. The range-rect probe also flags line-box overshoot on Odd/Even labels and family digits; the PNGs show those are false positives. The lint's glyph-ink measure (AK-2) is the right tool |
| D6-6 lint check | `ws-print-lint --seed-list 100,4030286246` against **a08a37d** FAILS: PAGEFILL 57 % at seed 100; AK-2 "30 runs 3 mm outside its box" at the lint seed. The same run on cf39d5d passes. `--seed-list 6` on cf39d5d **fails** mixed_addition (L-DENSITY H13, cell h 37 %), so the lint sees what the fill loop kept |
| Orchestrator gates (boot-smoke, screen-slots, share-options, screen-answer, code-snapshot, layout-unit; builder's full kit lint 0/281 S/L --seeds 10, determinism, content audit) | Not re-run by me; taken as reported |

## Round-6 defects: status
| # | Round-6 defect | Status on cf39d5d |
|---|---|---|
| D6-1 | two digit sizes in the column row; the key's 30 / 110 hung out of their boxes | **FIXED for mixed_multiplication** (`renders/r7/mixed_multiplication-S-lintseed-key.png`). Row e–i prints the facts at the stacks' digit size, and 30 / 110 sit inside their boxes. Seed 100 S has 4 facts beside a missing-digit stack, all at one size. **Not covered:** a fact beside stacks in an ordinary grid row. mixed_addition S seed 7 prints "14 + 6" at about 10 mm beside 4.5 mm stacks (D7-4). **Missing-digit box: not changed.** It measures 4.1 × 6.5 mm at S, and the standard asks for track − 1 mm, minimum 4.4 mm, dashed (§6, LS-8, VA-7). The key digit touches its edges at S and at L. The builder says widening it would break the place-value tracks. I accept that for this lane, but this is a kit-wide pre-existing gap (see out-of-lane) |
| D6-2 | under-filled pool pages; legacy members; the "Any number × 0" giveaway | **FIXED on Independent.** Fill is at least 0.81 on all 222 probe pages. No legacy member, no "Answer:" and no "Any number" appear on any page. seed 100 S now prints 9 problems (`mixed_multiplication-S-seed100-p1.png`). mult_properties no longer prints "Any number × 1 = that number" / "× 0 = 0" (regression set). **Residue:** when none of the 24 re-deals passes, the best deal is kept even with an H13 band (mixed_addition S seed 6, D7-3). **Not applied to More Practice** (D7-1) |
| D6-3 | worksheet row 3 cells unequal | **PARTLY.** Card 6's 9 × 4 array cell is capped at 418 px (was 535). Card 5's cell is 260 px, so the two cells differ by 38 % (round-6 check: ≤ 25 %). The white band under card 5's cell is about 175 px (33 % of the card), down from 290 px. Minor |
| D6-4 | number_families_mult S holds 8 | Left, as an owner suggestion. Accepted |
| D6-5 | mixed_composing L seed 180 strip | **FIXED.** It now prints 4 problems with fill 0.93. The lowest mixed_composing L fill is 0.859 |
| D6-6 | lint blind to key overflow and to other seeds | **FIXED** (see Gates) |
| CL-2b | pages over 26 items numbered 1–N | **MET.** missing_add_sub S and missing_mult_div S number 1–30 in black tabs from the first item, with no letters. 3 × 10 at S looks good (8 8 8 8) |

## Build time (teacher print path, `window.buildSheet`, this container's headless Chromium)
| Pool, size | Median | p90 | Max | > 10 s | > 20 s |
|---|---|---|---|---|---|
| mixed_multiplication S | 4.0 s | 16.5 s | **63.1 s** | 8 / 37 | 3 / 37 |
| mixed_multiplication L | 2.9 s | 13.6 s | **63.8 s** | 5 / 37 | 2 / 37 |
| mixed_addition S | 3.9 s | 15.9 s | **41.0 s** | 8 / 37 | 2 / 37 |
| mixed_addition L | 0.5 s | 3.0 s | 15.1 s | 1 / 37 | 0 |
| mixed_composing S / L | 0.6 / 0.5 s | 2.5 / 1.6 s | 5.1 / 2.8 s | 0 | 0 |

**The page is frozen, not just slow.** A long-task observer recorded `buildSheet` as one task:
- mixed_multiplication S seed 11: 56.5 s;
- mixed_addition S seed 6: 41.3 s;
- a fast seed: 2.7 s.

A 100 ms interval fired 4 times in 56 s. So "Building the page…" cannot paint, nothing on the screen responds, and Chrome may offer to kill the tab.

`teacher-print.js` rebuilds on every option change (350 ms debounce) and on "New numbers", from a fresh random seed. A teacher therefore meets a 10–60 s freeze about once in every five pool builds at S. A school Chromebook is slower than this container. **Not acceptable** (LESSONS L2 / usability): see D7-2.

## Visual grading
Print rows cover the pupil page and the key. Where only one size is named, the other size scored the same or higher. Screen rows cover card 1280/820/390, worksheet 1280 and quiz 1280. "Seeds" means the 37-seed probe.

| Document | Version | Clarity | Pedagogy | Layout | Parity | Result |
|---|---|---|---|---|---|---|
| composing:odd_even | S, L, key | 9 | 8 | 8 | 9 | PASS |
| | screen | 9 | 8 | 8 | 9 | PASS |
| composing:whole_as_fraction | S, L | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| division:div_zero_in_quotient | S, S key, L | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| composing:ten_frame_build | S, L | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| multiplication:dot_array_mult | S, L | 8 | 8 | 8 | 9 | PASS |
| | screen (worksheet: cells now level at 420 px) | 8 | 8 | 8 | 8 | PASS |
| | **More Practice S** | 8 | 8 | **5** (H5/H13) | 7 | **FAIL (D7-1)** |
| addition:add_sub_10s | S (2 × 10), L, key | 8 | 8 | 8 | 9 | PASS |
| | screen | 9 | 8 | 8 | 8 | PASS |
| | **More Practice S** (30 from a pool of 20) | 8 | **6** | 8 | **7** | **FAIL (D7-1)** |
| division:missing_mult_div | S (1–30, CL-2b), S key, L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| multiplication:mixed_multiplication | S, L, keys: harness, lint seed and 37 seeds | 8 | 8 | 8 | 8 | PASS |
| | worksheet 1280 | 8 | 8 | 8 | 8 | PASS (D6-3 residue) |
| | card, quiz | 8 | 8 | 8 | 8 | PASS |
| | **More Practice S/L** (1 problem per page on 11 of 20) | 8 | **6** | **3** (H5) | **6** | **FAIL (D7-1)** |
| composing:mixed_composing | S, L, keys (37 seeds) | 8 | 8 | 8 | 8 | PASS |
| | worksheet 1280 | 8 | 8 | 8 | 8 | PASS |
| | More Practice S (last page fills 49–66 %) | 8 | 8 | 8 | 8 | PASS (the last page may be short, PG-23) |
| counting_mixed:counting_all | S, L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| division:long_div_2digit | S, L | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| multiplication:mult_comparison | S, L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| division:remainder_interpret | S, L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| addition:number_families_add | S, L key | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| | More Practice S (fill 0.70) | 8 | 8 | **6** | 8 | **FAIL (D7-1)** |
| multiplication:number_families_mult | S (8 in 2 × 4), L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| | **More Practice S** (12 from 10 families, fill 0.70–0.74) | 8 | **6** | **6** | 7 | **FAIL (D7-1)** |
| subtraction:missing_add_sub | S (1–30, CL-2b), S key, L | 8 | 8 | 8 | 8 | PASS |
| | worksheet 1280, card, quiz | 8 | 8 | 8 | 8 | PASS |

The other More Practice pages pass the probe numbers: odd_even, whole_as_fraction, div_zero, ten_frame_build, missing_mult_div, missing_add_sub, long_div, mult_comparison, remainder_interpret, counting_all. Their fill is at least 0.89 and no page repeats a problem. Repeats across pages A and B are allowed. counting_all S's last page fills 0.55–0.62, a short last page.

## Defects (ranked, §6 form)

**D7-1 [CRITICAL, in lane, pre-existing, never graded] More Practice (the teacher's default page type) under-fills and repeats on lane skills.**
- **What:**
  - **mixed_multiplication:** Practice A and B hold **one problem each** on S seeds 1, 3, 5, 8, 10 and L seeds 1–5, 8 and 10. Fill is 0.25–0.40, and the score box reads "/1" (`renders/r7/MP-mixed_multiplication-S-seed1-A.png`). That is H5 (a lone item on a page), so C3 ≤ 5. Round 8 made it worse on 3 of 5 seeds against a08a37d: seed 1 went from 6 to 2 problems, seed 3 from 6 to 2 and seed 4 from 8 to 4. Removing the legacy members shrank the pool, and the fill floor does not run for this role.
  - **number_families_mult S:** 12 per page from a 10-family band, so (5, 3, 15) and (4, 4, 16) each print twice on Practice A. The 4 × 3 grid ends with a 26–30 % strip (`MP-number_families_mult-S-seed1-A.png`).
  - **number_families_add S:** fill 0.70.
  - **add_sub_10s S:** 30 per page from 20 facts, so "10 − 10" prints 4 times and "20 − 10" 3 times on one page (`MP-add_sub_10s-S-seed1-key.png`).
  - **dot_array_mult S:** 6 arrays per letter over 2–3 pages. Practice A page 1 holds 2 arrays in a 615 px row, with about 30 % empty above and below each (`MP-dot_array_mult-S-seed1-A1.png`). Fill 0.43–0.79.
- **Cause:**
  - `autoPoolPage()` (print-sheet.js) returns false for any role other than `'independent'`, so `buildSheetFilled`'s re-deal never runs on More Practice.
  - The single-skill distinct-problem cap and the even-row reseat (print-sheet.js 2874 ff., the round-4 D-B fix) are not applied to `morePracticePlan`.
  - The same pages are identical on a08a37d, apart from the mixed_multiplication counts above.
- **Fix:**
  1. Run the pool fill floor for `role: 'more-practice'` per letter page (each letter is one page asked).
  2. Apply the distinct-problem cap and the even-row fill to the More Practice plan, as on Independent: 2 × 10 for add_sub_10s, 8 for number_families_mult.
  3. Give dot_array_mult More Practice the Independent page's grid (2 × 4 at S).
- **Check:** probe More Practice for the 16 documents at S and L, seeds 1–10. Every letter page needs fill ≥ 0.81 (except a sheet's last page), at least 3 problems, no H13 band and no repeat within a page. Add `--roles more-practice` to the lane's lint run.

**D7-2 [MAJOR, in lane, introduced by round 8] Pool builds block the main thread for up to a minute.**
- **What:** see the build-time table. The longest measured page builds as one 56.5 s task. 8 of 37 S builds of mixed_multiplication and of mixed_addition take more than 10 s.
- **Cause:** `buildSheetFilled` builds up to 25 deals. `poolQuality` lays out each one twice (pupil and key) synchronously in `pageCheck`, and nothing yields between deals. The outer `buildSheet` re-deal (k ≤ 3) can wrap that in turn.
- **Fix:**
  1. Yield between deals (`await new Promise(r => setTimeout(r))`) so the page paints and stays responsive, and show "Finding a page that fills…" on the preview.
  2. Judge the cheap plan figures (`pageFillOf`, item count) first, and lay out only the candidates that pass them.
  3. Measure the key only for the deal that will be kept.
  4. Cap the total time (for example 5 s) and keep the best deal found so far.
  5. Better still, make the first deal fill: after a spill, pick the next member from the ones that fit the space left.
- **Check:** across seeds 1–30 at S, the median build is under 1.5 s and the maximum under 5 s. No single long task exceeds 1 s while a build runs.

**D7-3 [MINOR, in lane (every mixed pool), not a regression] When no re-deal passes, the kept page can still fail H13.**
- **What:** mixed_addition S seed 6 kept deal 118791 after trying all 24 re-deals (37 s). Cell h, "300 + 100 = ___", leaves a 37 % band. `ws-print-lint --seed-list 6` fails it on L-DENSITY H13 (`renders/r7/mixed_addition-S-seed6-key.png`). On a08a37d the same seed was much worse: fill 0.65 and a legacy "Answer:" cell.
- **Fix:** comes with D7-2 fix 5. A pool that cannot fill with a short fact should take another kind of member for the last slot, rather than keep a banded page.
- **Check:** `ws-print-lint --seeds 30` on the mixed pools at S and L is clean.

**D7-4 [MINOR, not a regression] A fact in an ordinary grid row prints at the fact ladder's size beside small stacks.**
- **What:** mixed_addition S seed 7 row a–c prints "14 + 6" with about 10 mm digits beside "61 + 23" with 4.5 mm digits (`renders/r7/mixed_addition-S-seed7-p1.png`). The D6-1 one-digit-size rule runs only inside a fine-split column-work group (practice.js 837 ff.) and for `boxAns` facts.
- **Fix:** apply the same `pt: metricPt` to every fact that shares a grid section with a stack.
- **Check:** every row with a stack has one digit size, measured as stack digit font-size equal to fact `--fd`.

**D7-5 [MINOR] D6-3 residue: worksheet row 3 cells still differ by 38 %.**
- **What:** card 5's cell is 260 px and card 6's is 418 px (`renders/r7/mixed_multiplication-worksheet-1280.png`).
- **Fix:** the cap could be 340 px, or card 5's cell could stretch to the row (`align-items: stretch` on the cell, with the drawing centred).
- **Check:** ≤ 25 % difference.

## Pre-existing, out-of-lane items
- **Missing-digit box (kit-wide, stack.js / sheet-kit.css):** it computes to a **solid** border, 4.1 mm wide at S. The standard asks for a short-dash outline (LS-8, owner ruling 2026-09-19) and track − 1 mm with a 4.4 mm minimum (§6, VA-7). live f1dae55 has no dashed rule either. At S and L the key digit touches the box edges. Owner / kit lane.
- **mult_properties (legacy):** "3 × 7 = 2 × 7 + ____ × 7. What is the missing number? Answer: ___" still has two answer places. The giveaway line is gone, which is better.
- **mixed_multiplication worksheet card 4:** "Fact Family: 10, 8, 80" is the instruction, with no verb. It is the same on rounds 5 and 6.
- **3-problem L pool pages:** mixed_multiplication and mixed_addition L each print 3 problems on 12 of 37 seeds. These pages pass the fill floor and H13, and L's default is 2 × 2, so I did not grade them down. Owner question: should an L review page hold at least 4?

## Non-lane regression spot check
- **Against round 6 (a08a37d → cf39d5d), S print, pixel diff:**
  - add_fractions_like, add_20_regroup, time_5min, multiply and compare_objects are **identical**.
  - mult_properties differs only because "Any number × 1 = that number" / "× 0 = 0" is removed (intended).
  - mixed_addition and mixed_subtraction deal kit members only. Both harness pages grade 8 8 8 8, with no "Answer:" row and a full grid. Better.
- **Against live (f1dae55):** the changed documents also differ through rounds 5–8 and live's own later commits, which are not ancestors of this tree. Nothing in the round-8 diff touches them beyond the items above.

## What passes
- **The Independent role, all 16 documents, at S and L and on every screen host.** It now holds on many seeds for the three pools, not only the harness seed.
- **Fixed this round:**
  - pool fill floor on the printed page;
  - kit-only pool members;
  - no answer-giving property line;
  - one digit size and contained key values in mixed_multiplication's column row;
  - lint AK-2 and multi-seed pool lint, which demonstrably fail the round-6 tree;
  - CL-2b numbering on the 30-item pages;
  - the worksheet dot-array cap.
- **The regression set holds:** five documents pixel-identical to round 6; three changed only as intended.

# Round 8: independent critic (Opus medium), 2026-10-09

Tree: claude/sweet-newton-c8wrv1-wip-a3256e8dfc9684535 at 079843a (round-9 fixes e2327be / 29d55f2 / 9ddd188, CL-9a 079843a).
- **My renders.** `ws-grade-render --roles independent,more-practice` for the 16 documents at S (print) and L (print and every screen host: card 1280/820/390, worksheet 1280, quiz 1280). At M (print) for dot_array_mult, number_families_add, number_families_mult and mixed_multiplication.
- **Probe.** A scratchpad probe calls `window.buildSheet` with the teacher print screen's request shape (More Practice asks for letters A and B). It records the build time and the longest stretch a 20 ms heartbeat could not run. It then lays out the pupil document in a same-origin tab and measures, per page: items, grid fill (grid top to bottom over grid top to footer), repeats (order-free dedupe key, else the drawing), label kind, the dot diameter, the smallest `.ws-box`, "Answer:" / "Any number" in the visible text, and a **CL-40 keep-out check** (any text or drawing inside the label square plus 1 mm).
  - Pools (mixed_multiplication, mixed_composing, counting_all): S and L, both roles, seeds 1–10, 100, 140, 160, 180, 200 = **180 builds**. mixed_addition: S and L, both roles, seeds 1–11 = 44 builds.
  - All 16 documents: S, M and L, both roles, seeds 1–6 = **576 builds**.
- **Earlier tree.** The same probe on cf39d5d (round 7, scratchpad worktree via MQ_ROOT) for the two findings that needed a before/after.
- **Regression set.** Independent S on this tree and on origin/claude/sweet-newton-c8wrv1 (686b907), pixel-diffed and looked at side by side.
- **Files.** The 10 PNGs cited are in `renders/r8c/`. The scratchpad worktrees are removed.

## Verdict: FAIL

**Every round-7 defect is fixed.** More Practice now deals and fills each letter as its own page, pool builds are fast and never freeze, and CL-9a numbering reads well on almost every page. The harness pages of all 16 documents grade 8 or better at S and L on both roles and every screen host.

**The round fails on four findings, one introduced by CL-9a:**
- **D8-1 [MAJOR, regression from 079843a]** At L, mult_comparison's story text runs into the new black number tab on 12 of 12 pages sampled. The text starts 0.5 mm inside the tab's right edge, on the same line.
- **D8-2 [MAJOR]** dot_array_mult deals more arrays than the owner's target: up to **16 at S** (target 8) and **9 at L** (target 4–6).
- **D8-3 [MAJOR, owner target]** number_families_add at M prints 6 families (target 8) over a 17 % strip.
- **D8-4 [MAJOR, pre-existing, never graded]** missing_add_sub Independent at M prints 18 sentences in 3 × 6 over a **29 % empty strip** on every seed.

## Gates
| Gate | Result |
|---|---|
| ws-grade-render, 16 documents, S/L/M, both roles, all hosts | 0 console errors. hScroll 0 and smallTargetCount 0 everywhere, except mixed_multiplication worksheet-1280 (1 small target; a desktop host, so H6 does not apply) |
| Pool probe, 180 builds (+44 mixed_addition) | **Fill:** lowest 0.82 (mixed_multiplication L More Practice). **Items:** at least 3 on every page. **Repeats / "Answer:" / "Any number":** 0 / 0 / 0. Every page has numbered tabs (CL-9a) and no letters |
| 16-document probe, 576 builds | 0 repeats. Fill ≥ 0.82 on every page, **except missing_add_sub Independent M at 0.71 on 6 of 6 seeds** (D8-4). Keep-out hits: **mult_comparison L 10 of 12 pages, text 0.5 mm inside the tab** (D8-1). Near misses (0.5 mm gap, under CL-40's 1 mm): remainder_interpret M on 12 of 12 pages, mixed_multiplication M on 2 pages, counting_all L/M on 2 pages (a shape's box) |
| Dot diameter (DOM) | S 3.0 mm, M 3.5 mm, L 4.0 mm on every dot_array_mult page, which meets the owner's floor (about 3 mm at S, 4 mm at L) |
| Slot boxes | `.ws-box` ≥ 6.5 mm at S, 8.5 mm at M, 10.5 mm at L |
| D7-4 (one digit size) | mixed_addition S seed 7: row 5–8 prints "18 + 2" at the stacks' digit size (round 7: 10 mm beside 4.5 mm). **FIXED** |
| D7-5 (worksheet row 3) | mixed_multiplication worksheet 1280: cards 5 and 6 are equal bordered cells (`renders/r8c/mixed_multiplication-worksheet-1280.png`). **FIXED** |
| Orchestrator gates (full kit lint 0/281 at S and L, ws-layout-unit 564, lint self-test 54; More Practice lint, timing and determinism running) | Not re-run by me; taken as reported. **The lint runs at S and L only**, so it cannot see D8-3 or D8-4 at M. It has no keep-out rule, so it cannot see D8-1 |

## Round-7 defects: status
| # | Round-7 defect | Status on 079843a |
|---|---|---|
| D7-1 | More Practice under-fills and repeats | **FIXED.** mixed_multiplication More Practice holds 5–10 problems per letter at S and 3–7 at L, with fill ≥ 0.82, over 15 seeds × 2 letters × 2 sizes. add_sub_10s More Practice S prints 20 distinct facts in 2 × 10. number_families_mult More Practice S prints 8 distinct in 2 × 4. number_families_add More Practice S prints 12 in 3 × 4 (fill 0.90). dot_array_mult More Practice S prints 8–10 at fill ≥ 0.95 on 11 of 12 letters. Residues are D8-2 and D8-3 |
| D7-2 | pool build freezes the app | **FIXED** (table below). No build exceeds 4.2 s. The longest blocked stretch is 1.03 s, once in 224 pool builds; everything else is ≤ 0.74 s |
| D7-3 | kept page fails H13 | **FIXED** in what I sampled: no band and no fill under 0.81 on 224 pool pages, and every build reports a passing deal (`ok@n`) |
| D7-4 | fact beside stacks at another size | **FIXED** (see Gates) |
| D7-5 | worksheet row 3 cells unequal | **FIXED** |

## Build time (teacher print request, `window.buildSheet`, this container's headless Chromium; More Practice builds letters A and B)
| Pool, size, role | n | Median | p90 | Max | Longest blocked stretch |
|---|---|---|---|---|---|
| mixed_multiplication S Independent | 21 | 0.67 s | 1.03 s | 1.48 s | 0.54 s |
| mixed_multiplication S More Practice | 21 | 1.57 s | 3.85 s | **4.13 s** | **1.03 s** (seed 160) |
| mixed_multiplication L Independent / More Practice | 21 / 21 | 0.49 / 1.15 s | 0.86 / 1.62 s | 1.05 / 2.70 s | 0.32 / 0.62 s |
| mixed_multiplication M Independent / More Practice | 6 / 6 | 0.47 / 1.06 s | 0.67 / 2.13 s | 0.74 / 2.27 s | 0.29 / 0.41 s |
| mixed_addition S Independent / More Practice | 11 / 11 | 0.71 / 0.99 s | 1.15 / 1.89 s | 1.48 / 3.23 s | 0.74 / 0.72 s |
| mixed_composing, counting_all (any) | 162 | ≤ 0.74 s | ≤ 0.96 s | 1.35 s | 0.60 s |

Round 7 measured a 63 s maximum and a 56.5 s single task. Every figure now sits inside the round-7 check (median < 1.5 s, maximum < 5 s), and the 1 s single-task limit is exceeded once, by 30 ms. Builder's figures (S Independent median 0.57 s, More Practice p90 4.26 s) agree with mine. **Accepted.**

## Visual grading
Print rows cover the pupil page and the key. Screen rows cover card 1280/820/390, worksheet 1280 and quiz 1280. "IND" is Independent and "MP" is More Practice. Unless a seed is named, the harness seed is graded, and the probe numbers cover seeds 1–6 (16 documents) or the 15-seed set (pools).

| Document | Version | Clarity | Pedagogy | Layout | Parity | Result |
|---|---|---|---|---|---|---|
| composing:odd_even | IND + MP, S/M/L, keys | 9 | 8 | 8 | 9 | PASS |
| | screen | 9 | 8 | 8 | 9 | PASS |
| composing:whole_as_fraction | IND + MP, S/L | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| division:div_zero_in_quotient | IND + MP, S (1–28)/L, keys | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| composing:ten_frame_build | IND + MP, S/L | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| multiplication:dot_array_mult | IND S (8 in 2 × 4), IND L (6), IND + MP M (6–8) | 8 | 8 | 8 | 9 | PASS |
| | **MP S seed 6 letter B (16 in 4 × 4)** | 8 | **7** | **7** | 8 | **FAIL (D8-2)** |
| | **MP L seed 2 letter A / IND L seed 6 (9 / 8 at L)** | 8 | 8 | **7** | 8 | **FAIL (D8-2)** |
| | screen | 8 | 8 | 8 | 8 | PASS (card note below) |
| addition:add_sub_10s | IND + MP S (20 in 2 × 10, CL-2a), L, keys | 8 | 8 | 8 | 9 | PASS |
| | screen | 9 | 8 | 8 | 8 | PASS |
| division:missing_mult_div | IND + MP S (1–30)/M/L | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| multiplication:mixed_multiplication | IND + MP S/M/L, keys, 15 seeds | 8 | 8 | 8 | 8 | PASS |
| | MP L seed 5 letter A (3 problems, one full-width column) | 8 | 8 | 8 | 8 | PASS (see owner question) |
| | screen (worksheet row 3 now level) | 8 | 8 | 8 | 8 | PASS |
| composing:mixed_composing | IND + MP S/M/L, 15 seeds | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| counting_mixed:counting_all | IND + MP S/M/L, 15 seeds | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| division:long_div_2digit | IND + MP S/M/L | 8 | 8 | 8 | 9 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| multiplication:mult_comparison | IND + MP S/M, keys | 8 | 8 | 8 | 8 | PASS |
| | **IND + MP L, pupil and key** | **7** | 8 | **7** | 8 | **FAIL (D8-1)** |
| | screen | 8 | 8 | 8 | 8 | PASS |
| division:remainder_interpret | IND + MP S/L, keys | 8 | 8 | 8 | 8 | PASS |
| | IND + MP M (text 0.5 mm from the tab) | 8 | 8 | 8 | 8 | PASS (nit, D8-5) |
| | screen | 8 | 8 | 8 | 8 | PASS |
| addition:number_families_add | IND + MP S (12 in 3 × 4), L (6) | 8 | 8 | 8 | 8 | PASS |
| | **IND + MP M (6 in 2 × 3, fill 0.83)** | 8 | 8 | **7** | 8 | **FAIL (D8-3)** |
| | screen | 8 | 8 | 8 | 8 | PASS |
| multiplication:number_families_mult | IND + MP S (8 in 2 × 4), M (9 in 3 × 3), L (6) | 8 | 8 | 8 | 8 | PASS |
| | screen | 8 | 8 | 8 | 8 | PASS |
| subtraction:missing_add_sub | IND + MP S (1–30), L, MP M (16, fill 0.92) | 8 | 8 | 8 | 8 | PASS |
| | **IND M (18 in 3 × 6, fill 0.71)** | 8 | 8 | **6** | 8 | **FAIL (D8-4)** |
| | worksheet 1280, card, quiz | 8 | 8 | 8 | 8 | PASS |

## Defects (ranked, §6 form)

**D8-1 [MAJOR, in lane, regression from 079843a CL-9a] At L, mult_comparison's story text runs into the black number tab.**
- **What:**
  - On every mult_comparison L page sampled (Independent and More Practice, seeds 1–6), cells whose story starts at the top of the cell begin the first line 0.5 mm *inside* the tab's right edge, on the tab's own line.
  - Example: "1 ■Lena has 54 crayons." The black square touches the "L" (`renders/r8c/mult_comparison-L-tab-collision.png`). The key is the same.
  - On cf39d5d the same cell carried the quiet letter "a.", and the text cleared it by 0.9 mm (`renders/r8c/mult_comparison-L-r7-letter.png`). The 6 mm tab now fills the reserved square that the letter left mostly empty.
  - Near misses elsewhere: remainder_interpret M and mixed_multiplication M ("Write the sign in …") start 0.5 mm right of the tab, and counting_all L/M bring a shape within 1 mm. All are under the CL-40 keep-out (label side + 1 mm).
- **Cost:** C1 7 (a label touching content, CL-40). C3 7 (the label and the problem collide).
- **Cause:** the story/comparison cell content starts at the cell's top-left padding. It does not start below the label square, or at label side + 2 mm, as CL-40 requires. Nothing checks CL-40: the lint has no keep-out rule, and the switch to tabs was not re-rendered at L.
- **Fix:** honour CL-40 in the cell frame (`sheet/cell.js`): when a label is drawn, the content box's top inset becomes label side + 1 mm, unless the first content line starts at least label side + 2 mm from the left. Add an L-LABEL keep-out rule to `ws-print-lint`: no text range rect or drawing rect intersects the label square plus 1 mm.
- **Check:** the probe's keep-out check finds 0 hits on the 16 documents at S, M and L, both roles, seeds 1–6. The lint fails cf39d5d+079843a's mult_comparison L.

**D8-2 [MAJOR, in lane] dot_array_mult deals more arrays than the owner's density target.**
- **What:**
  - The owner's target (STATUS §2, 2026-10-09) is 4–8 arrays a page: L 4–6, M 6, S 8.
  - **S:** More Practice seed 6 letter B prints **16 arrays in 4 × 4** (`renders/r8c/MP-dot_array_mult-S-seed6-B.png`). The arrays nearly touch the tabs, and a 10 × 5 sits in a 44 mm cell. Independent seed 6 and More Practice A seed 1 / B seed 5 print 10.
  - **L:** More Practice seed 2 letter A prints **9 in 3 × 3** (`renders/r8c/MP-dot_array_mult-L-seed2-A.png`), and so does letter B at seed 4. Independent seed 6 prints 8.
  - **M** prints 6–8 (target 6).
  - In all, 7 of the 54 sampled pages exceed the target, 3 of them by 50 % or more.
  - Dots stay at 3.0 / 3.5 / 4.0 mm, which is right.
- **Cost:** a 16-array page for an SEN pupil is a wall of dots: C2 7, C3 7. A 9-array L page breaks the owner's L ceiling: C3 7.
- **Cause:** with smaller dots, a deal of small arrays (2 × 3, 3 × 2 …) measures short. The fill loop (`refitLetters`) then adds columns (3c, 4c) and items to reach FILL_OK 0.81. Nothing caps the count at the owner's per-size number.
- **Fix:** give dot_array_mult a per-size ceiling of 8 at S, 6 at M and 6 at L, in its footprint or the role's distinct-cap. When short arrays leave height, spread the rows (or deal a taller array) instead of adding a column.
- **Check:** across seeds 1–20, both roles, S ≤ 8, M ≤ 6 (or 8 with a note) and L ≤ 6 arrays per page, each page with fill ≥ 0.81.

**D8-3 [MAJOR, owner target] number_families_add prints 6 families at M.**
- **What:**
  - At M, Independent and More Practice print **6 families in 2 × 3** on every seed, with fill 0.83: a 17 % strip, about 40 mm (`renders/r8c/number_families_add-M-p1.png`). The owner's target is M 8, "without wasted white space".
  - number_families_mult at M prints **9 in 3 × 3** (fill 0.83, `renders/r8c/MP-number_families_mult-M-A.png`). That is at or above the target, and the cells read well, so I accept 9 for ×/÷.
  - The builder's "6 or 9 at M" is therefore half right: 9 is acceptable and 6 is not.
- **Cost:** C3 7 (an owner-named count missed, with a visible strip).
- **Fix:** let number_families_add take the 3-column M layout that number_families_mult uses. "17 − 10 = ☐" at M is about 52 mm and fits a 61 mm column. Alternatively, tighten the M family cell's row pitch so 2 × 4 fits. Then judge at 9 or 8.
- **Check:** number_families_add M prints ≥ 8 distinct families with fill ≥ 0.85 on seeds 1–20, both roles, and no H13 band.

**D8-4 [MAJOR, in lane, pre-existing (identical on cf39d5d), never graded at M] missing_add_sub Independent M has a 29 % empty strip.**
- **What:** 18 sentences in 3 × 6 end at 71 % of the problem area on every seed (`renders/r8c/missing_add_sub-M-seed1-p1.png`). More Practice at M prints 16 in 2 × 8 at fill 0.92, so the Independent page's distinct cap / CL-2b path takes a different grid.
- **Cost:** H13 (C3 6).
- **Fix:** at M, either use More Practice's 2 × 8, or deal 3 × 7 / 3 × 8 (21–24 sentences, within DN-1a for short problems), or stretch the rows.
- **Check:** `ws-print-lint --source kit --size M --skills subtraction:missing_add_sub,division:missing_mult_div,addition:add_sub_10s` is clean. **Run the lane's lint at M too**; it covers only S and L today.

**D8-5 [MINOR] CL-40 near misses at M.**
- **What:** remainder_interpret M (12 of 12 pages) and mixed_multiplication M story cells start their text 0.5 mm right of the tab. That reads acceptably but breaks the 1 mm keep-out.
- **Fix:** the same as D8-1.

**D8-6 [MINOR, lint] DN-2 on More Practice compares letters A and B as one sheet.** See the DN-2 judgement below. Scope DN-2 (and PG-23) per letter, as PAGEFILL already does with `letterOf`.

## DN-2 judgement (More Practice letter A against letter B)
**Not a real defect. The lint finding is a false positive.**
- PT-MPR-1 makes each letter its own sheet, handed out alone, with its own score.
- For example, mixed_multiplication S seed 2 prints 10 problems on A (fill 0.93) and 5 on B: a times-table grid, a family and three skip-count strips, at fill 0.92. Both pages are full, and neither is "less than half used".
- The item counts differ because the problems differ in size, which a mixed review is meant to have.
- DN-2's "a page is never less than half used" should compare pages *within* one letter (the fix is in D8-6).

## CL-9a judgement (numbered tabs by default)
**The ruling is implemented and right, with one regression (D8-1).**
- Every page of every lane document now numbers its problems 1–N with the CL-30 tab, on the pupil page and on the key. Each More Practice letter restarts at 1. I saw no page that mixes letters and tabs.
- Letters for parts inside a problem stay as they were: counting_all's "A has more / B has more", compare_objects' "Tower A / Tower B" and "Line A / B". They read better beside numbers than they did beside item letters.
- Tab sizes follow CL-31 (4 mm at S, 6 mm at L).
- The legacy cells in the regression set (mult_properties) carry the tab cleanly.
- The tab is heavier than the quiet letter it replaces, so every template that put content inside the reserved square now shows it (D8-1, D8-5).

## Screen hosts
- All 16 documents pass on card 1280/820/390, worksheet 1280 and quiz 1280.
- Note (not graded down): dot_array_mult's practice card at 1280/820 draws a 2 × 4 array with dots about 85 px across. The card scales a small array to fill its box, which contradicts "dot arrays much smaller" on screen. Consider a dot-pitch cap on the card, as the worksheet host already has.

## Pre-existing, out-of-lane items
- **remainder_interpret:** the remainder box is one digit wide. At seed 1 S, 71 ÷ 12 = 5 R 11 puts a 2-digit remainder into it (the key's "11" fills the box edge to edge). It should be as wide as the divisor's digit count.
- **mult_properties (legacy):** "… + ____ × 7. What is the missing number? Answer: ___" still has two answer places (unchanged).
- **mixed_multiplication worksheet card 4:** "Fact Family: 10, 8, 80" as the instruction (unchanged).
- **Owner question (carried):** mixed_multiplication L prints 3 problems on 7 of 45 sampled pages (Independent and both letters), and mixed_addition L on 16 of 33. They pass the fill floor. mixed_multiplication MP L seed 5 A lays its 3 in one full-width column (`renders/r8c/MP-mixed_multiplication-L-seed5-A.png`), which is acceptable but spacious. Should an L review page hold at least 4?
- **Kit-wide missing-digit box** (solid, 4.1 mm at S; see round 7): unchanged.

## Non-lane regression spot check (S Independent, this tree against origin/claude/sweet-newton-c8wrv1 686b907)
- **All 8 documents differ, as expected.** Every item label changed from "a." to a numbered tab. add_20_regroup, time_5min, multiply and add_fractions_like differ in nothing else: the same items and the same grid. The tabs sit in the same reserved square, with no collision.
- **mixed_addition, mixed_subtraction and mult_properties** also differ through rounds 5–9's own changes (kit-only pool members, the ringed sign place, and mult_properties dealt 7 items in kit and legacy cells instead of 2 legacy cells). All three are better than live.
- **compare_objects:** "Tower A / Tower B" now sits under a numbered tab, which is clearer than the letter-plus-letter labelling it replaces.
- **Nothing regressed beyond the intended label change.**

## What passes
- **D7-1 to D7-5 are all fixed.** More Practice letters are dealt, filled and de-duplicated as their own pages. Pool builds take seconds, not a minute, and the page stays live. The kept page passes. One digit size sits beside stacks. The worksheet row is level.
- **CL-9a** numbering on every page type and on the key.
- **Owner density targets met:** number families S (12 ×/+ at 3 × 4, 8 ×/÷ at 2 × 4), L 6, M ×/÷ 9. Dot arrays S 8 and L 6 on the harness pages. Dots at 3.0 / 3.5 / 4.0 mm. Boxes ≥ 6.5 mm.
- **Unchanged and still 8+:** odd_even, whole_as_fraction, div_zero_in_quotient, ten_frame_build, add_sub_10s (2 × 10 in both roles), missing_mult_div, long_div_2digit, remainder_interpret, mixed_composing, counting_all, number_families_mult.
