# lf-engine-roles critic r3: FAIL (last round, the lane is parked)

The critic was independent and ran at medium. It graded the r3 proof PNGs only, plus pixel measurements of where the ink ends on each page, at head 1b7280c88. lf-engine saved this report because the critic could not write files.

## Scores

| Pupil page | Pages | C1 | C2 | C3 | C4 |
|---|---|---|---|---|---|
| coordinate_q1 M | 1 | 8 | 8 | 8 | 8 |
| coordinate_q1 L | 1 | 8 | 8 | 8 | 8 |
| shape_name_match_3d M | 1 | 8 | 8 | 8 | 8 |
| shape_name_match_3d L | 1 | 8 | 8 | 8 | 8 |
| round_sort_10 M | 1 | 8 | 8 | 9 | 8 |
| round_sort_10 L | 2 | 8 | 8 | 8 | 8 |
| add_wp_10k M | 2 | 8 | 8 | **6** | 8 |
| add_wp_10k L | 2 | 8 | 8 | 8 | 8 |
| multi_step_word M | 2 | 8 | 8 | 8 | 8 |
| multi_step_word L | 2 | 8 | 8 | 8 | 8 |

## What is resolved

- **F1 is resolved.** coordinate_q1 and shape_name_match_3d print the Model and Guided side by side on one page.
- **round_sort_10 M** is one page.
- **round_sort_10 L** is two pages, and both leftovers are honest: about 106 mm white each, against a 128 mm next part.
- **coordinate_q1 L** passes the r9b honest-leftover rule: about 96 mm white, against a next part of at least 110 mm.
- **No cell is squashed**, and every key spot-checked matches its pupil page.
- **F2 is resolved.** multi_step_word L page 2 now fits inside its frame.

## Findings

### F3 is not justified on add_wp_10k M (blocking; same class as r2: wasted space)

The measured page has more room than the plan thinks:

- Page 1's ink ends at y = 627 px, and the page body reaches at least y = 995. That leaves at least 97 mm white.
- The Guided band printed on page 2 measures 89 mm.
- So the band fits page 1, and the Opener could be one page. Instead it prints two pages, 55 % and 74 % used.
- The plan estimates 84 mm white and a 90.8 mm band (opener.js lines 153–156, `p1WhiteMm`). That puts page 1 at least 13 mm fuller than it renders.

**Check:** add an L-DENSITY SPILL-P1 rule to ws-print-lint.

- It measures page 1's white and page 2's first band in the render, then applies `spillP1Ok` to those numbers.
- Its backtest must FAIL on 1b7280c88 for add_wp_10k M.

### Minor, this lane

At L, the half-width Guided header on shape_name_match_3d wraps to two lines.

**Check:** a header-strip lint that flags a label wrapping to a second line.

### Skill-owned (not scored)

- coordinate_q1's Model is not worked: an empty grid with a blank Answer line. **Check:** fail a Model cell that has no answer ink on the pupil page.
- F5 and LS-4 are unchanged.

## Lane decision

This is round 3, and wasted space has now failed twice (r2 and r3). Under the round cap the lane escalates to the lead rather than running a round 4. The root cause is that the plan's page-1 white estimate does not match the render; the next builder fixes that first.
