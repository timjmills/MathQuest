# lf-engine-roles critic r4: FAIL. Last round; the lane is parked.

| | |
|---|---|
| Graded | eb17fe01a |
| Critic | independent, medium; graded from the PNGs only |
| Sample | 18 Openers, 49 after pupil pages; 11 keys spot-checked, all match their pupil pages |
| Saved by | lf-engine (the critic could not write files) |

## Result

- **r3's blocking finding is resolved.** add_wp_10k M now prints on one page, 90 % used, with no squashed cell.
- **No page got worse.** The pixel diff shows only add_wp_10k M, multi_step_word M and L, and two_step_letter_equation M and L changed.
- **Every split in the sample is an honest leftover:**

| Page | White left | Next part | Verdict |
|---|---|---|---|
| multi_step_word M | 59 mm | 142 mm | honest |
| multi_step_word L | 38 mm | 162 mm | honest |
| two_step_letter_equation L | 93 mm | 104.5 mm | honest; the Model now draws the bar model |

The other splits are honest leftovers too: add_sub_fact_family L, add_wp_10k L, sub_wp_10k L, bar_graph M and L, elapsed M and L, area_model L and round_sort L.

## Scores

C1 ease of use, C2 educational value, C3 spacing and layout, C4 standard fidelity. The pass bar is 8 on every criterion.

| Opener page | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| add_wp_10k M | 8 | 8 | 9 | 8 |
| multi_step_word M, L | 8 | 8 | 8 | 8 |
| two_step_letter_equation M, L | 8 | 8 | 8 | 8 |
| **placevalue:expand M** | 8 | 8 | **6** | 8 |
| **placevalue:combine M** | 8 | 8 | **6** | 8 |
| fraction_of_set M, coordinates_plot_q1 M and L | 8* | 8 | 8 | 8* |
| the other 26 pages | 8 | 8 | 8 | 8 |

\* Excluding the skill-owned defects F2 and F3.

## Findings

**F1 (this lane, blocking): the Model is squeezed into half width at M.**
- On expand M and combine M the Model sits at half width beside Steps.
- The equation wraps: "+ 3" and "= 369" drop to a second line.
- The Model is stretched to the Steps' height, which leaves an empty band of 52 % / 44 % of the cell. H13 caps C3 at 6.
- These pages were the same at 1b7280c88; they are new only to this sample.
- r1 fixed the same pattern (DN-10 / L11: the Model full width, with Steps underneath), but that fix was only checked at S and L.
- Check:
  - ws-empty-band EB-BAND with `--roles opener --size M`, on expand, unit_form and combine;
  - a WRAP rule: when a half-width Model's equation row wraps, the Model goes full width;
  - a backtest that fails on 1b7280c88 for expand M.

**F2 (skill-owned): the fraction_of_set M Model.**
- It uses colour emoji (H4) and prints two "Answer:" labels (H16).
- It is a different kind of problem from the Guided one.
- Check: an L-INK emoji/colour scan on legacy cells, and a match on the Model's and the Guided's problem kind.

**F3 (skill-owned): coordinates_plot_q1 M and L.**
- "C(6,9)" overlaps "Answer:" (H2), and the Model is not worked.
- Check: text bounding boxes inside a cell must not intersect; plus the Model-has-answer-ink check.

## The 7 mm reserve ruling: sound, with two conditions

The engine plans to 232 mm of the 239 mm body, so the 7 mm reserve is not room the plan can use. The check forgives at most 7 mm and still catches the r3 case.

1. Read `SPILL_RESERVE_MM` from the engine's budget constant per size, instead of typing it again in ws-print-lint.cjs (line 3665).
2. Add a boundary backtest with a band 1 to 6 mm shorter than the raw white.

## Sample shortfall

18 Openers, against the lead's minimum of 20.
