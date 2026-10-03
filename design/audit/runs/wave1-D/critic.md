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
