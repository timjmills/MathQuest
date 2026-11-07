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
- 2026-11-07 owner scope (via lead): BUILD lessons only, no owner sign-off of cards. Re-aimed below ("Scope after the 2026-11-07 decision").
- Cards: count-row and ops-tables have every 7a line and every 9 question DECIDED by the lane (recorded as "lane decision 2026-11-07"). `--check-signed` reports "needs owner signature (everything else green)". The lane did NOT write "Signed: owner" (it would misstate who signed); the lead decides how the card gate reads a lane decision (question to the lead below).
- div_facts F1-F4 are lane decisions recorded here, NOT written into the owner-signed facts card (that card stays as the owner signed it on 2026-10-31).
- Step 2 running: R4 machine checks (builder sub-agent); precritic on the scope skills.

## Scope after the 2026-11-07 decision (BUILD lessons, earliest rounds first)
Operations skills used by BUILD lessons that are not at 8/10 (design/lessons-first/queue.json, kind "build"):
- Round 1, G3-Y4.B4: division:div_facts, div_word_problems_plain, multiplication:mult_word_problems_plain (two-step word problems BUILD); count_by_tables, mult_chart (patterns on the multiplication table BUILD); mult_properties, arrays_groups, count_by_tables (properties BUILD). number_ops_mixed:word_problems_mixed is partial only (supports the lesson, not blocking, plan section 3).
- Round 1, G4-Y5.B3: multiplication:mult_comparison + build entry comparison_statements (times as many BUILD); division:remainder_interpret (divide and interpret the remainder BUILD; its build entry multi_step_four_ops is algebra's).
- Round 2 (after round 1): addition:add_column_multi, add_wp_100, subtraction:sub_wp_100, sub_wp_20, multiplication:mult_zeros (+ facts_times_tens).
- Round 4: addition:number_line_add, subtraction:number_line_sub (+ nl_tens_ones_jumps).
- Dropped (serve only non-BUILD lessons): build entries tables_links (S6), div_by_itself (S12), mult_three (S13); recorded as DEFERRED on the ops-tables card.
- Already at 8/10 and left alone: mult_facts, add_facts, sub_facts (and add_wp_20 as marked in the queue).

## Owner go

## Open questions
Lane decisions under the owner rule of 2026-11-07 (no owner sign-off): every item below is decided AS SUGGESTED, ops-tables 4-6 DEFERRED (non-BUILD), plus ops-tables 8 comparison_statements = option task=statement + preset skill. Question to the lead: how does `ws-spec-card --check-signed` (precritic's card row) accept a lane-decided card? Suggested: the lead (or lf-checks) adds a recognised `Signed: lane <id> under owner rule 2026-11-07, YYYY-MM-DD` form, or rules the card row SKIPPED-owner for this program.

Original sheet (one sitting; "all as suggested" accepted). Card sections 9 hold the same questions with their full wording.

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
- 2026-11-07: owner scope decision received (BUILD only, no sign-off); re-aimed to round-1 BUILD skills (adds mult_comparison, remainder_interpret; drops tables_links, div_by_itself, mult_three); cards decided by the lane, left unsigned pending the lead's gate ruling.
- 2026-11-07: lane started; skip-count fix merged; count-row and ops-tables cards drafted; owner sheet sent to the lead.
