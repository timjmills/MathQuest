Lane: lf-ops
Title: Lessons-first wave 1: the pilot unit's operations skills to 8/10 (G3-Y4.B4, count_by_tables for round 1)
Session: https://claude.ai/code/session_013pHDnQ7sfFBg45rrEDgLdJ
Branch: claude/sweet-newton-c8wrv1-lf-ops
Owner of files: LANES.operations (gen-operations.js, gen-mult-patterns.js, the ops cells and providers), design/cards/count-row/, design/cards/ops-tables/, design/lanes/lf-ops/
State: building
Updated: 2026-11-07
Builder profile: mq-opus-medium
Critic rounds: 0, none

## Now
- Day 1: skip-count fix (skipcount-fix @ 3bbbed3f) merged into the lane branch (conflicts resolved: print-sheet.js comment, screen-cell.js reveal(), lesson.js import, backtests.json union, deploy-gates comment); boot-smoke OK.
- Cards drafted for the owner's one sitting: design/cards/count-row/count-row.md (count_by_tables, skip_count_line, skip_count_grid) and design/cards/ops-tables/ops-tables.md (mult_chart, mult_properties, arrays_groups, the two plain story skills, the three build entries). Both `--check-signed`: "needs owner signature (everything else green)".
- div_facts support-aid questions (facts card is signed; these become rulings via `--rulings-only`, no re-sign): below, F1-F4.
- Meanwhile step 2 (checks first): R4-1..R4-5 and SC1..SC6 checks, precritic on every scope skill.

## Owner go

## Open questions
Owner sheet (one sitting; "all as suggested" accepted). Card sections 9 hold the same questions with their full wording.

count-row card (design/cards/count-row/count-row.md §9):
1. Sign the 7a decisions as proposed? Suggested: yes.
2. Precritic reds that held skip-count critic r6: (a) sibling-compare has no approved count-row sibling -> SKIPPED-owner until this card's skills pass; (b) shape / 15-number pages hold fewer rows -> accepted cost, if H13 holds; (c) placevalue:more_less_10 CL40-INK on --role lesson -> the placevalue lane's, pinned meanwhile. Suggested: yes to all three.
3. Hide word-problems, fact-rows and fact-probe for the count rows? Suggested: yes.
4. Answer spaces = Lines (owner 2026-10-03 exception to SL-3) stays, default Boxes? Suggested: yes.
5. Times labels fade each -> given -> none, dropped on Test / Review / pre-skill? Suggested: yes.
6. I Can line from the rows ("I can count by 2s to 12s" for the default)? Suggested: yes.
7. count_row_end (G1-Y2.B1 S15): option `endAt` (count by 2s to 20 ...), plain option? Suggested: yes.

ops-tables card (design/cards/ops-tables/ops-tables.md §9):
1. Sign the 7a decisions as proposed (key-word cues / bank hidden on the plain stories, as family-check)? Suggested: yes.
2. Hide fact-rows / fact-probe on all five, word-problems on mult_chart / mult_properties / arrays_groups? Suggested: yes.
3. Real lesson data for the five skills? Suggested: yes, this lane.
4. tables_links -> new skill multiplication:related_tables ("Use the 3, 6 and 9 times-tables"), `pair` a plain option? Suggested: yes.
5. mult_three -> new skill multiplication:multiply_three_numbers, factors to 5, plain `order` option? Suggested: yes.
6. div_by_itself -> div_facts option `facts: ones-and-self` AND preset skill "Divide a number by 1 and by itself"? Suggested: yes.
7. mult_chart: no factor pairs in the prompt, row and column shaded grey on every task? Suggested: yes.

facts card (signed 2026-10-31) - div_facts support aids, from critic r4 (recorded as rulings with --rulings-only, the signature kept):
F1. Test pages: H13 (empty band < 30 %) wins over the PT-TST fixed large cells for a horizontal fact, so Test rows are sized to the cell's footprint like Independent? Suggested: yes.
F2. Array support: draw a true array (quotient rows of the divisor) on EVERY fact of the section; the option is offered only while the section's largest dividend is <= 50 (else greyed in the panel with the reason, and the fits line names it). Suggested: yes.
F3. Skip strip: draw to 10 x or 12 x the divisor (the band's top), in two lines of 6 like the touch row, no term marked. Suggested: yes.
F4. Fade packet: dealt in support order (all -> fewer -> none, a block per stage), each page's rows sized to the supports that page carries, the fact left-anchored at one x. Suggested: yes.

## Times
Times: builder day-1 cards + merge, start 2026-11-07T00:00Z, end —, profile mq-opus-medium (lane session)

## Log
- 2026-11-07: lane started; skip-count fix merged; count-row and ops-tables cards drafted; owner sheet sent to the lead.
