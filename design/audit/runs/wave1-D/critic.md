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
