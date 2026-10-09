# Critic round 4: Search terms for every skill (lane a21ec3ef403026c80, head abd70a4)

Independent critic, 2026-10-09. I read and tested only; I did not edit any code.

**Verdict: FAIL.** Coverage scores **9**, Precision **9** and Ranking **9**. No regression scores **7**, and a pass needs 8
or more on all four criteria.

Every search defect from round 3 is fixed:
- P-D: the divide-by rule now applies only to a bare divisor, and it demotes skills instead of excluding them.
- R-C: Division Facts is second for "divide by 2" in all six boxes.
- The new self-label gate shows 592 of 592 skills found by their own label.
- Most of the nice-to-haves landed.

The round fails on the U-A fix itself. The notice is now an absolutely positioned overlay with `z-index:30`. In the
**student** box the results dropdown has `z-index:1000` and starts at the same spot, so the dropdown covers the
"Showing results for …" line whenever results are showing. In practice that means always. Pupils, who make most of the
typos, no longer see the correction. In r3 they did. The gate still passes, because it reads `textContent` and does not
check what is visible.

## What I ran

| Check | Result |
|---|---|
| `node --input-type=module --check` search-notice.js, search-terms.js | clean |
| `node tests/scripts/ws-search-terms.cjs` | OK: 107/107 rank-1, **592/592 skills found by their own label**, 4 rank-2, 15 expected-empty, 11 corrections, 130 primary, 232/232 queries |
| `ws-search-order` | OK (18 queries × 2 views, 6 notices, plus the new second-card and filter-row checks) |
| `ws-boot-smoke`, `ws-teacher-library` | OK, OK |
| `ws-teacher-shell` | FAIL under load (the known Andika woff2 font-abort flake); **OK** when rerun with nothing else running (`--exclusive`) |
| `git merge-tree --write-tree claude/sweet-newton-c8wrv1 HEAD` (f1dae55) | clean; f1dae55 is already an ancestor of HEAD, so the merge is a fast-forward |
| Node diff of r3 (fd7eeab) vs r4 top 3 over 1,153 queries (every SKILL_TERMS term, every PRIMARY_SKILLS phrase, every live label) | 71 top-1 changes, 0 queries lost; every change is an improvement except "corner" (below) |
| Puppeteer at **1366×768** with real keystrokes: 35 queries × all six boxes (student, Navigator, Quiz builder, Teacher library, Sets picker, print "Add a skill"); notice geometry, stacking, scroll and view-change checks; 1280×720 spot check | below; **0 console errors** |
| Speed | 1–32 ms per query in Node (most under 10); no typing lag in any box |

## Round 3 defects, re-proved

### P-D: fixed (all six boxes agree with Node)

| Query | Now, rank 1 (and 2) |
|---|---|
| divide by 2 digit numbers / Divide by 2-Digit Numbers / divide by 2-digit | long_div_2digit, box_division_easy |
| divide 2 digit by 1 digit | box_division_easy, area_model_div_2by1 |
| divide 3 digit by 1 digit / dividing 3 digit numbers | box_division_hard, area_model_div_3by1 |
| divide by 1 digit / ÷ 1 digit | box_division_easy, box_division_hard, area models |
| Box Method Division (2÷1 digit) / (3÷1 digit) | box_division_easy / box_division_hard |
| Area Model Division (2÷1 digit) / (3÷1 digit) | area_model_div_2by1 / area_model_div_3by1 |
| Area of a Triangle (b×h÷2) | area_triangle |

The new gate check (h) runs `findSkills(label)` for every live skill and needs the skill in the top 3: **592/592**. The
r3 self-search counted 48 + 6 misses. All of them are now found, including the 48 "(No Pictures)" / "(No Visuals)"
labels.

### R-C: fixed

In all six boxes, "divide by 2", "divided by 2", "÷2" and "÷ 2" give Halving, then Division Facts (1–12), then Division
with Remainders. `ws-search-order` now checks the second card in the Navigator and Quiz builder, and `ws-search-terms`
checks the grouped order. "divide by 10" / "divide by 1000" / "divide by 1,000" still put place_value_10x first.

### U-A: the reflow is fixed, but a new defect appears (U-B, blocking)

- No box moves and no filter row reflows in any of the six boxes. The Library's "All domains" stays on one row, and the
  Quiz builder box keeps its width (screenshots in the scratchpad).
- In the Navigator the line sits just under the box, on the card's white. In the Library it sits in the gap above the
  list card. In the Quiz builder it sits inside the filter card. All three read well.
- **U-B (blocking): the student box hides the notice.** The notice gets `z-index:30`, while `#skillSearchResults` is
  `position:absolute; z-index:1000` and starts 2 px above the notice (notice top 606.6, dropdown top 604.6). The
  screenshot of "tme" shows no notice at all. If I hide the dropdown, "Showing results for time" is there underneath it.
  So in the box pupils use, a corrected search ("tme", "perimter", "aera") now shows changed results with no
  explanation. That is the r2 P-A failure, back in one box. `ws-search-order` misses it because it reads `textContent`.
  - Fix: in the student box, put the line above the dropdown (a z-index above the results, or inside
    `#skillSearchResults` as its first row), or draw it to the right of the box as r3 did, but without becoming a flex
    item.
  - Add a gate check that `elementFromPoint` at the notice's centre hits the notice. Do this with `pointer-events`
    switched on for the probe, because `pointer-events:none` makes `elementFromPoint` skip the element. A
    `getBoundingClientRect` overlap test against `#skillSearchResults` would also work.
- **U-C (minor): in the Sets picker the notice covers the "Level" filter label.** The notice is at y 289–309 and "Level"
  is at y 303–319. At 1366×768 and at 1280×720 the label reads as "Leve…" behind the pill. Give the notice room (a
  reserved line, or margin under the box) rather than overlapping the next row.
- **Print picker (cosmetic):** the notice overlaps the top 4 px of the results dropdown's border. It is readable.
- The new capture-phase click handler that hides notices on a view change runs *before* the view changes. In my test
  `tvPick0Fix` and `soSearchInputFix` kept `hidden=false` after a real sidebar or Back click. They are not visible
  only because their parent view is `display:none`, so this does no harm today, but the handler does nothing.

### Nice-to-haves

| Item | Result |
|---|---|
| C-D No Pictures / No Visuals | fixed: "addition word problems no pictures" → add_word_problems_plain, "equivalent fractions no visuals" → equiv_frac_nv; "no visuals", "no pictures" and "plain" list the 47 plain variants; "pictures", "visuals" and "addition with pictures" still lead with the pictured skills |
| vertex, input output, clockwise / anticlockwise, midnight / noon, 10 times bigger, numicon, quatre past | all fixed, in all six boxes |
| compass directions | 0 results (honest: no skill teaches it; now an EXPECT0 row) |
| bonds to 100 / number bonds to 100 | still only add_sub_10s (open, minor; no "bonds to 100" skill exists) |
| lost, tie, pond, may, sole, seed, spit, bride | no longer corrected; 0 results |
| Owner ruling: skip counting | count_by_tables, skip_count_line, skip_count_grid in all six boxes |

## Regressions vs r3 (search results)

The Node diff found none that matter. 0 queries lost results, and 70 of 71 top-1 changes are the intended fixes. The
exception is a minor ranking change:

- **R-D (minor):** "corner" now puts Count Sides & Vertices (M) above Count Corners on a Shape (K), because the new
  `corner` term outranks the label's "Corners". "corners" is still right.

## 40 fresh queries (none used in r1–r3)

36 put a right skill first:
subitising, near doubles, fact families, arrays, equal groups, remainders, prime numbers, factor pairs, square numbers,
place value chart, round to nearest 10, greater than less than, number line to 20, simplify fractions, improper
fractions, tenths and hundredths, perimiter of rectangle (typo), area of rectangle, right angle, parralel lines (typo),
bar graph, pictogram, mean median mode, probabilty (typo), order of operations, bodmas, algebraic expressions, elapsed
time, litres, grams, giving change, partitioning, column subtraction, halves and quarters (benchmark fractions; partition
shapes is 2nd), dividing fractions, decimels (typo).

2 return 0 results honestly, because no skill teaches them: roman numerals, 24 hour clock.

2 miss:
- **C-F (minor):** "commutative property" returns 0, but Multiplication Properties (3.OA.5) exists. "commutative",
  "turnaround facts" and "associative" should reach it.
- **R-E (minor):** "decimals to fractions" puts Fraction → Decimal first and Decimal → Fraction second. The word order
  of the query should decide which one leads.

## Scores

| Criterion | Score | Why |
|---|---|---|
| Coverage | **9** | 36 of 38 answerable fresh queries are right first. C-D and C-E are closed. Left: bonds to 100, commutative property. |
| Precision | **9** | P-D is fixed at the root: the rule fires only on a bare divisor, it demotes instead of excluding, and the 592/592 self-label gate holds it. No real word is rewritten. Nothing lost in the 1,153-query diff. |
| Ranking | **9** | R-C is fixed in all six boxes, and a second-card check is now gated. Minor: corner (R-D), decimals to fractions (R-E). |
| No regression (speed, UI, console, merge) | **7** | Fast, 0 console errors, the merge is clean, and no reflow. However, the student box no longer shows the correction notice (U-B), which r3 did show. The Sets notice covers the "Level" label (U-C). |

## To pass

1. Fix U-B: make the "Showing results for" line visible in the student box while its dropdown is open, and gate it
   with a visibility check, not a `textContent` check.
2. Fix U-C: the notice must not cover the Sets picker's "Level" label (or any other label) at 1366×768 or 1280×720.
3. Optional: make the view-change hide run after the click (or drop it), commutative property → mult_properties,
   "decimals to fractions" → d_to_f first, keep "corner" on Count Corners.
