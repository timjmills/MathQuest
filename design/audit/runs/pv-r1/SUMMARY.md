# Critic pv-r1 — rounding (owner request) and the place-value lane (2026-09-26)

Tree f8220ad. Grades: branch `critic-pv-r1` ff4151e, `design/audit/runs/pv-r1/grades.jsonl`. Evidence in scratchpad
`critic-pv-r1/`. **0 of 13 skills pass; 40 of 157 versions; 1 of 13 panels (placevalue:expand).** Keys 100 % correct.

## Owner requests
| Skill | Variant | Pass | Low | Fails |
|---|---|---|---|---|
| nearest_10 / 100 | default, plain | 3/7 each | 5 | independent, test, guided H13 at S; error-analysis H13 |
| nearest_1000 | default / plain | 2/7, 3/7 | 5 | + comma tell on EA; default card 390 answer line clipped |
| nearest_10000 | default / plain | 2/7 each | 5 | + card 390 |
| nearest_100000 / million | default / plain | 2/7 each | 5 | + default card 390 hides the input (H6); place letters ≈ 6 pt at S |
| rounding_table list | 2, 3, 6 places | 0/7 | 3 | below |
| rounding_table table col / row | | 0/3 | 7 | blank column / row cycles in order (L10) |
| panels nearest_* (6) | | 0/6 | 5 | OC11, OC3 |
| panel rounding_table | | 0/1 | 4 | no support control; one place allowed; no number-size control |

rounding_table list, 6 places, L: 2 problems a page; the instruction's second line overprinted by the grid; guided 3
pages with the model showing only its last step; EA six fix boxes off the page (H2 / H9); card: first wrong answer shows
every answer.

"Normal rounding" — task right, page and panel not finished. Works: plain "7,712 → ____", keys 100 %, halfway and
round-up-into-next-place present, no multiples; worksheet and quiz honour Plain; card ladder climbs (digit marks → line →
blanked steps → solution). S sparse (cells 32–37 % empty, 17 mm gutters). EA gives the verdict away: wrong values print
without commas ("40000"), right with ("60,000"). Plain duplicates Support "None" (byte-identical, OC11). Plain buried:
second value of "What the pupil does" in the last group, below the fold at 1280 and 420, truncated label, next to the
near-identical "How the pupil answers".

"Several places" — delivered for 2–3 places at S; breaks at 4+ and on screen. Works: one number per cell with a line per
place, keys correct, the 1,445 trap and round-up-across present. 6 places at L as above. Halfway never rotates: with 2–3
places it is always halfway for 100; halfway for 1,000 never dealt, and on that item the nearest-10 answer is the number
itself. Card: first wrong answer "Here is how" with every answer (860, 900), no support rungs, then only "ask your
teacher"; slots drawn as a box over the paper line; 390 overflow at six places. A single ticked place is accepted
(contradicts "Round to Several Places").

## Other skills
| Skill | Variant | Pass | Low | Main failures |
|---|---|---|---|---|
| number_line_scales (new) | all | 0/7 | 3 | every page / seed deals 70, 40, 20, 80, 65 in order (test = practice); S = L 5 lines; cells 48–60 % empty |
| value | 3 decimals | 0/7 | 5 | "worth" line length gives the place away (L3); tab / footer "Level 2 · 2.NBT.1" |
| expand | 3 decimals | 3/7 | 6 | mixed cell heights; EA fix boxes sized per part (L3); Level 2 tag |
| compare | 3 decimals | 0/7 | 4 | answers cycle > > < > > = (11 of 16 ">"); "4.7560" under Thousandths (OC4); 390 card wraps |
| place_value_disks | 3 decimals | 2/7 | 5 | S = L 3 charts; "0.001" labels ≈ 6 pt; guided spills to 2 pages (H5) |
| pv_disks_build | 2 decimals | 3/7 | 4 | EA 1 item a page (H5); guided 2 pages; Level 2 tag |
| disks: dots / crossed / × 10 / every number | | 2/8 | 5 | × 10 2 a page; cross stroke through the label; "every number" only 4 distinct items and its box count gives away how many answers; build guided H5 |
| panels value / compare / disks / build | | 0/4 | 4 | compare OC4; disks OC14; no support control on compare, disks, build |

## Root causes (files)
1. **Answers dealt from position, not seed (L10)** — `gen-pv.js`: number_line_scales `genScaleLine` / `blockOrder` ignore
   the seed; nearest_* and rounding_table `dealRoundKind` / `roundMultiNumber` use `slot(6)` (item b always halfway, d
   always rounds up); rounding_table list halfway place always 100; table blank column / row cycles; decimal compare
   cycles > > < > > =.
2. **Answer given away by typography or slot size (L3)** — EA wrong values unformatted next to formatted correct
   (`roles/error-analysis.js` prepare / likeCorrect; `providers/pv.js` pvRoundingErrors, multiWrong); value "worth" line
   width follows the answer (`gen-pv.js`); expand EA fix boxes sized per part (`error-analysis.js`).
3. **Wasted space (H13 / H5, L1 / L2)** — `print-sheet.js`, `roles/error-analysis.js`, `roles/guided.js`, `cells/pv.js`
   footprints: EA cells 41–51 % empty on every rounding skill; guided cells 31–44 % empty, guided S 20–26 % strip at the
   foot; S independent / test keep L's 18 items spread with gutters (30–37 %); S = L count for number_line_scales (5),
   decimal disks (3), nearest_10 (18); 1–2 a page for 6-place rounding_table L, × 10 disks, pv_disks_build EA; guided
   spills to 2–3 pages.
4. **rounding_table print and screen** — print: instruction into the grid, fix boxes overflow, `multiSteps` truncated in
   the guided model (`cells/pv.js`, `print-sheet.js`, `providers/pv.js`); screen ladder: no `supports`, worked steps not
   blanked (`providers/pv.js`, `support-ladder.js`); screen layout: box over line, "10 →" row misaligned on worksheet and
   quiz, 390 overflow (`screen-cell.js`).
5. **390 overflow** — cut-line answer clipped at 4+ digits, hidden at 6–7 (H6); decimal compare wraps (`screen-cell.js`).
6. **Panels** (`skill-options.js`, `screen-cell.js`) — Plain duplicates Support "None" (OC11) and is buried; chart and marks
   supports print-only, not on the card (OC3); rounding_table no support control, accepts one place, no size control;
   compare breaks its decimal-places promise (OC4); number_line_scales and place_value_disks ignore S (OC14).
7. **Tab / footer don't follow options (L6)** — decimal pages "Level 2 / Grade 2 · 2.NBT.x"; number_line_scales decimals
   "All levels · 2.MD.6"; a 1,000,000 rounding table "Level 3".
8. **Smaller** — place letters ≈ 6 pt at S; comma after the cut bar ("7|,712"); cross stroke through disk label; "every
   number" 4 items; round-up-across always lands on the band top (4 of 16 plain nearest-1,000 answers are 10,000).

## Top fixes
1. `gen-pv.js`: deal everything from the seeded rng.
2. `error-analysis.js`: format the wrong value like the right one; size cells to content (clears the comma tell and H13 on
   12 rounding versions).
3. rounding_table: the nearest_* ladder on screen; many-place pages in 2 columns with a short instruction; labelled fix
   boxes, one per line.
4. Size S: shrink cells and add rows instead of gutters (independent, test, guided for all nearest_*, number_line_scales,
   decimal disks).
5. Panel: "Plain (no drawing)" as the first value of the Support group replacing "None"; remove the duplicate "What the
   pupil does" value — one click at the top of the panel.
6. 390: stack the answer under the number on cut-line rounding cells.
7. Tab / footer: level and standard from the decimals option and the largest place.
