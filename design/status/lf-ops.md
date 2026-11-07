Lane: lf-ops
Title: Lessons-first wave 1: the pilot unit's operations skills to 8/10 (G3-Y4.B4, count_by_tables for round 1)
Session: https://claude.ai/code/session_013pHDnQ7sfFBg45rrEDgLdJ
Branch: claude/sweet-newton-c8wrv1-lf-ops
Owner of files: LANES.operations (gen-operations.js, gen-mult-patterns.js, the ops cells and providers), design/cards/count-row/, design/cards/ops-tables/, design/lanes/lf-ops/
State: building
Updated: 2026-11-07
Builder profile: mq-opus-medium
Critic rounds: 1, FAIL (r1 build #4: lowest 2)

## Now
- 2026-11-07 owner scope (via lead): BUILD lessons only, no owner sign-off of cards. Re-aimed below ("Scope after the 2026-11-07 decision").
- Cards: count-row and ops-tables have every 7a line and every 9 question DECIDED by the lane (recorded as "lane decision 2026-11-07"). `--check-signed` reports "needs owner signature (everything else green)". The lane did NOT write "Signed: owner" (it would misstate who signed); the lead decides how the card gate reads a lane decision (question to the lead below).
- div_facts F1-F4 are lane decisions recorded here, NOT written into the owner-signed facts card (that card stays as the owner signed it on 2026-10-31).
- Step 2 done: six R4 checks in ws-print-lint (225eb3e), each FAILS on head; 7 backtest rows (pass commit TBD until the fix). Precritic red list below.
- BLOCKED for this session: recording F1-F4 on the owner-signed facts card (the session's permission check refuses edits to that card); the owner or lead adds them and re-signs. The div_facts aid fixes wait for it.

## Scope after the 2026-11-07 decision (BUILD lessons, earliest rounds first)
Operations skills used by BUILD lessons that are not at 8/10 (design/lessons-first/queue.json, kind "build"):
- Round 1, G3-Y4.B4: division:div_facts, div_word_problems_plain, multiplication:mult_word_problems_plain (two-step word problems BUILD); count_by_tables, mult_chart (patterns on the multiplication table BUILD); mult_properties, arrays_groups, count_by_tables (properties BUILD). number_ops_mixed:word_problems_mixed is partial only (supports the lesson, not blocking, plan section 3).
- Round 1, G4-Y5.B3: multiplication:mult_comparison + build entry comparison_statements (times as many BUILD); division:remainder_interpret (divide and interpret the remainder BUILD; its build entry multi_step_four_ops is algebra's).
- Round 2 (after round 1): addition:add_column_multi, add_wp_100, subtraction:sub_wp_100, sub_wp_20, multiplication:mult_zeros (+ facts_times_tens).
- Round 4: addition:number_line_add, subtraction:number_line_sub (+ nl_tens_ones_jumps).
- Dropped (serve only non-BUILD lessons): build entries tables_links (S6), div_by_itself (S12), mult_three (S13); recorded as DEFERRED on the ops-tables card.
Priority order (lead, 2026-11-07, from data/curriculum/ccss-build-lessons.json, overdue and due-now first):
1. #4 Properties of multiplication (3.OA.B.5): mult_properties, arrays_groups, count_by_tables
2. #7 Two-step word problems (3.OA.D.8): div_facts (R4 aids), mult_word_problems_plain, div_word_problems_plain
3. #8 Multiples of 10 with basic facts (4.NBT.B.5/B.6): mult_zeros (+ facts_times_tens)
4. #2 One-step bar-model word problems within 20 (1.OA.A.1): add_wp_20 / sub_wp_20 bar-model stories
5. #16-17 Grade 2 one- and two-step bar-model word problems (2.OA.A.1): add_wp_100, sub_wp_100
6. #18 Add up to four two-digit numbers (2.NBT.B.6): add_column_multi
7. #3 Patterns on the multiplication table (3.OA.D.9 / C.7): mult_chart (count_by_tables shared with #4)
Then: mult_comparison + comparison_statements (#22), remainder_interpret.
- Already at 8/10 and left alone: mult_facts, add_facts, sub_facts (and add_wp_20 as marked in the queue).

- Build #4 (mult_properties, arrays_groups, count_by_tables), builder r1-r2, head 0f2aeec: precritic --strict 9 FAIL -> 2 FAIL (log /tmp/mq-precritic/20261107-090028-14093; lessonfit and spec-card re-run green after 0f2aeec / f31a5b7). Still red, stopped by rule 7 (two rounds): (1) sibling-compare: 36 unproven counts, arrays / arrays-turn have no approved sibling (mostly page-level DN-2 / PG-23 / PAGEFILL); (2) print-lint --roles lesson S: mult_properties lesson Practice SPREAD 49 % (limit 50 %), 4 turn-array problems a page at lesson L type. Both to the lead for a ruling. LEAD RULING 2026-11-07: (1) sibling-compare SKIPPED for arrays / arrays-turn (first family on the template; siblings.json ownerSkipped; the critic grades the named pages by eye; on pass they become approved siblings); (2) SPREAD 49 % accepted for the skill critic as a KNOWN lesson-page finding, not a pass: the properties LESSON does not pass until lf-engine adds a per-practice-block `opts` override and the lesson data deals a facts-only second block. F1-F4 now owner rulings on the facts card (4a97fcf).

## Precritic before any fix (step 2; run on 6d015f2-era tree before the cards were signed; log scratchpad precritic-0.txt)
Red rows, with cause where known:
- print-lint independent S / M / L: a few counts above the pin in 2 of 7 skills (to triage per skill in the build rounds).
- print-lint --roles lesson S / L: 24-25 findings in 5 of 7; lesson pages not pinned for count_by_tables, mult_chart, mult_properties, ... (no real lesson data yet: ops-tables Q3).
- div_facts single-support and all-supports print-lint at S: 13-39 findings (the R4-1..R4-5 defects, now caught by the new checks of 225eb3e).
- ws-grade-render --gate: 36 overflow, 5 small targets in 7 units.
- ws-sibling-compare: 150 rows with no sibling measured (count-row card ruling (a): SKIPPED-owner until its skills pass).
- ws-phone-card: FOCUS x 6.
- ws-card-rulings --check offered: wpCues / wpBank still offered on the two plain story skills while the signed card hides them (fix in skill-options, as family-check did).
- ws-dealer-uniform: mult_word_problems_plain (24), div_word_problems_plain (20).
- ws-node-lint LESSON-DATA etc: 7 found, all pinned (exit 1 unexplained; recheck).
- ws-options-verify --render: 25 value pages worse than the default (count_by_tables onePage / jumps=15 / shapes at S: count-row card ruling (b) accepts fewer rows if H13 holds).
- ws-spec-card: was unsigned at the time; signed since (7f06c72).

## Build #4 properties of multiplication (2026-11-07, builder mq-opus-medium, first build on the ops-tables / count-row pair)
- Skills: multiplication:mult_properties, arrays_groups, count_by_tables. Precritic before: 9 FAIL / 16 PASS / 1 N/A / 2 SKIPPED of 28 (log pc-0).
- mult_properties forms 1-3 moved off coloured legacy HTML: break apart = arrays-turn type 'split' (one array, gap + bracket, three
  boxes); x 1 / x 0 = the equation cell. Real provider hooks (workedSteps, wrongAnswer MU-M4/M5/M7, strings + Say) for every kind.
  forms default [0] (one property a page), appended in skill-options.
- Lesson data (ops-tables 9 Q3) for arrays_groups and mult_properties in prereqs.js; arrays template got lessonStepState.
- arrays_groups: picture box on mixed / groups-only pages, rows banded per block of six on one-kind pages (H13-ROW); CL-40 spacers.
- count-row (for lf-algebra, lead request): train wraps to a narrow cell, shaped tiles keep the box pitch, twin tiles >= 44 px input,
  one-page row clears the label keep-out.
- New check: ws-visual-quality VQ-NOLEGACY some-legacy (backtest vq-some-legacy-lf). sibling-compare `ownerSkipped` (count-row
  card 9 Q2(a)). options-render pin: count_by_tables jumps=15 (card 9 Q2(b)); shape pages no longer need a pin.

## Critic r1 (build #4, c37053c) - per-round findings (rule 00)
Verdict: FAIL all three - mult_properties lowest 2 (Reason It arrays spill out of the A/B boxes, H2), arrays_groups lowest 4 (Error analysis tags over the grey answers, H2), count_by_tables lowest 2 (Reason It rows overprint, off the page). Report design/audit/runs/lf-ops/critic-r1.md.
Automatic checks (would have caught each finding): 1 band-anywhere H13 for non-fact templates; 2 grade-render --gate on EVERY role the signed card offers x every forms value (Reason It OVERFLOW was in the logs); 3 slot >= 14 mm and one width per section; 4 capacity S > M where the template measures smaller; 5 PAGEFILL on the last page of multi-section sheets + lesson Practice; 6 GRID-EVEN on every kit grid; 7 title / Rule / vocab from the forms dealt + card-rulings string check for decided titles; 8 L-KEY one answer per slot; 9 tag-vs-slot overlap; 10 paper / screen frame equality; 11 options-verify: fewer rows AND an H13 band is a defect.
Speed-ups: 1 critic renders one skill a run (the 3-skill render hit the 10-minute limit); 2 a per-page max-band % in ws-grade-render meta.json (builder sees H13 first); 3 generate precritic's plan from the signed card's 7a offered roles x option values (most reds were outside the plan); 4 --save-html with relative CSS; 5 a lint for a lesson rendered for an option value with no lesson entry.
Lead 2026-11-07: this lane's fix builder owns the precritic plan-from-card change (grade-render --gate on every 7a-offered role x every option value, plus the in-cell empty-band measure); additive, backtest rows, to land in LESSONS_LEARNED. Cost read by the lead: cost_usd $55.23 at 09:34 UTC (about 2.8 % of the week at $20 = 1 %) of the $250 cap.
Lane root cause: the builder's precritic was green on roles it ran, but precritic does not run Reason It / Error analysis / True or False / forms 1-3 / times=each Test. Next round: the fix builder runs grade-render --gate and print-lint on every 7a-offered role at S/M/L first.

## Fix round after critic r1 (branch claude/sweet-newton-c8wrv1-lf-ops-fix4 @ 27ceb36, pushed) - STOPPED by rule 7
- Checks added (all FAIL on c37053c, backtest rows cc-card-overflow, cc-card-overflow-cbt, cc-tagink, cc-keyjoin, cc-size-s, cc-title, cc-title-cbt, pl-sections-pagefill; pass commits TBD): the precritic plan from the signed card (tests/lib/ws-card-plan.mjs + ws-precritic render-gate-<id> / cell-checks-<id>; 8369527, 770643f - THE version for every lane, sent to lf-placevalue); new ws-cell-checks (OVERFLOW, KEYJOIN, TAGINK, SIZE-S, TITLE / LESSON-OPT); print-lint PG-23 on the last page of a sections sheet. Interim BAND / SLOT / GRIDEVEN behind --interim (1965d75, 2afcb9f; drop when lf-placevalue's H13-ABS / SLOT-W-EQUAL / GRID-EVEN land). Check 10 (paper = screen frame) not written.
- Fixed: titles / Rule / vocab from the options (54bcf16), one corrected number on True or False? / Reason It and wide items on Reason It (0fac67e), error-analysis tags outside the arrays (8faaef1), boxes >= 14 mm one width a section, no shared picture box, three columns at S, screen frame words (e2a7e9e), phone tap wording (b499e33), count-row wrap on live width (a3e4929, the 3d8bca1 regression).
- STILL OPEN (two medium rounds, same class): empty bands 30-43 % (D-MP-1, D-CB-4/5) on mult_properties S/M and lesson / guided pages; GRID-EVEN at L (D-MP-3, reverted: full width broke detailed lesson g3-oa5 E12 / E24b); forms-1 and mixed lessons overflow; count_by_tables lesson overflow with times=each/given and jumps=15; Reason It one row a page; test S mixed-forms 4 mm body overflow; pre-skill-check L key overflow; D-AG-4, D-CB-7/8, D-MP-9/14/15; number_patterns_rule lesson overflow (lf-algebra; root cause not found).
- Root cause of the band class (rule 7): the cell heights come from the tallest item a row can hold (footprint per template, not per dealt item), and the lesson / guided roles reserve the same; a fresh builder needs a per-dealt-item footprint in arrays / arrays-turn / count-row (the interim BAND measure is the check). Not run: full precritic --strict, every-role grade-render, ws-backtest.

## Brief for the FRESH #4 builder (lead ruling 2026-11-07: after the Thursday 22:00 UTC reset; Opus medium, a rebuild after two failed rounds)
Skills: multiplication:mult_properties, multiplication:arrays_groups, multiplication:count_by_tables (BUILD lesson #4, Properties of multiplication, 3.OA.B.5). Cards: design/cards/ops-tables/ops-tables.md, design/cards/count-row/count-row.md (signed). Defects: design/audit/runs/lf-ops/critic-r1.md; what fix4 already fixed: section "Fix round after critic r1" above.
ROOT CAUSE to fix first: cell heights come from each template's TALLEST POSSIBLE item (footprint per template), not from the items actually dealt; the lesson / guided / Test roles reserve the same. So pages of small arrays or short rows carry 30-43 % empty bands (D-MP-1, D-CB-4/5) and every attempt to shrink one role broke another. Make the footprint per DEALT item in cells/arrays.js, cells/arrays-turn.js and cells/count-row.js (footprint(payload, ctx) from the payload's own rows / cols / tiles / times labels), and let layout band rows by the dealt heights (layout.js already groups in-place cells by height from 1.2x). Do not size rows by the band's maximum.
Then, in order: GRID-EVEN at L for mult_properties without breaking detailed lesson g3-oa5 E12 / E24b (keep 2 columns, size pairs per dealt item); the forms-1 and mixed lessons' overflow; count_by_tables lesson overflow with times=each/given and jumps=15; Reason It one row a page; test S mixed-forms 4 mm overflow; pre-skill-check L key overflow; D-AG-4 picture / prompt order; D-CB-7/8; D-MP-9/14/15; the number_patterns_rule lesson overflow (lf-algebra's skill, count-row template: root cause unknown; lf-algebra reverted 3d8bca1's wrap hunk interim).
Checks: promote the interim BAND to H13-ANY in ws-cell-checks (header names the sibling H13-ABS in ws-print-lint, lf-placevalue); drop the interim SLOT / GRIDEVEN (use lf-placevalue's SLOT-W-EQUAL / GRID-EVEN-ALL, opt in with an "lf-ops" entry in tests/fixtures/precritic/opt-in-rules.json); write critic check 10 (paper = screen frame); fill the TBD pass commits of the 8 fix4 backtest rows and the 7 R4 rows once green. Run the FULL precritic --strict (with the card-plan rows) and every-role grade-render, one skill a run, before any critic.
Gates as in the lane brief, plus ws-detailed-lesson --check for g3-oa5-mult-properties and g3-oa9-mult-table-patterns. Lesson records may have moved to js/modules/lessons/families/multdiv.js by then (lf-engine): re-apply this lane's lesson entries there.

## Hand-offs with other lanes
- lf-engine (session_013pHDnLTpMERUWs7oNEgzJ3): (1) adds lesson key `practiceBlocks: [{shape:[count,cols], opts?}]` (1-3 blocks); when it lands, set mult_properties' lesson data to `practiceBlocks: [{shape:[4,2]}, {shape:[4,2], opts:{task:[2], pictures:false}}]` (the properties lesson does not pass before this). (2) Its branch moves lesson records to js/modules/lessons/families/*.js: after the lead merges lf-engine into the integration branch, re-apply this lane's prereqs.js entries (arrays_groups, mult_properties, div_facts, mult/div_word_problems_plain, count_by_tables) as ROUTINE + LESSON records in families/multdiv.js (patterns:* in families/algebra.js; schema lessons/schema.js; gates ws-lesson-coverage, ws-lesson-unit), and stop editing prereqs.js.
- lf-placevalue (session_013pHDnMCXcY6kXV15KHf4Yp): its opt-in checks are pushed on claude/lf-placevalue (H13-ABS e6b1c0b9, GRID-EVEN-ALL 86795b38, SLOT-W-EQUAL + DRAW-CAP dc867132, WRONG-FITS-SLOTS be6e3dd8, SCREEN-DIGIT 8daf992a, options-render bands 19ef4dac; precritic wiring bd18396f). Opt in with an "lf-ops" entry in tests/fixtures/precritic/opt-in-rules.json; drop this lane's interim SLOT / GRIDEVEN. H13-ABS misses the band between picture and slots: band-anywhere: lf-placevalue chose (b) - this lane keeps it, renamed H13-ANY in ws-cell-checks (promoted out of --interim), with a header line naming the sibling rule H13-ABS in ws-print-lint (lf-placevalue adds the matching line on its side). TODO for the next #4 builder. It takes 8369527 + 770643f (precritic plan from the card) after its builder finishes.
- Merge-train note: lf-placevalue cherry-picked the card-plan commits (its 9b86c263 / 6e54004a). On a branch without design/cards/{ops-tables,count-row}, ws-precritic-plan FAILs the 7 backtest rows cc-card-overflow, cc-card-overflow-cbt, cc-tagink, cc-keyjoin, cc-size-s, cc-title, cc-title-cbt ("not on the lane's path"): the card plan only plans carded skills. Expected; green once both branches are merged. Do not re-pin them.
- lf-algebra: owns genNumberPatterns + the number_patterns_rule provider block; count-row.js changes through this lane (3d8bca1 delivered; lf-algebra reverts only its wrap hunk, interim, until this lane finds the number_patterns_rule lesson overflow root cause).

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

## Build #7 two-step word problems (3.OA.D.8): div_facts R4 aids + plain x / ÷ stories (2026-11-07, builder mq-opus-medium)
- div_facts R4-1..R4-5 to facts card F1-F4: ÷ supported rows at the Test's 1.05 room (touch S/M 3 x 5); skip strip to the band's top
  multiple in two lines (dc67f40); true array (quotient rows of the divisor) in one frame a section, offered only to dividends <= 50
  (panel greys "Dot array" with the reason, fits line names each fact; d08bcc7, 5342758); sign box under a ÷ fact whose line cannot
  stand beside it (no lone full-width row, Test L 3 x 4); faded packet dealt as one-page stages all -> light -> none, rows per page,
  later stages <= 2 x the first page (f2d1e8d); all-supports page: the dropped array is no alternative, split shares the touch size,
  clash rows foot-aligned (1b8580f). Every R4 check green on each support alone S/M/L x independent/more-practice/test/review
  (--seed render) and the fade packet M; backtest rows pass f2d1e8d (skip-strip-reach-lf, fade-order-lf confirmed).
- Plain stories: wpCues / wpBank hidden (4 skills, card 7a); story numbers freshDeal (dealer-uniform OK); structure-first Model
  (groups named, no key words) + Say frame; lesson data (4 steps, 2-panel chart); lesson print-lint S/M/L 0 findings.
- Check change for the lead: ws-options-verify tries a panel-locked set value in the context where it is offered (`valueBase`,
  div_facts array with the 2-4 tables), compared with that context's default.
- 2026-11-07 12:50 UTC, merged lf-ops-fix4 (7f82e6a). Precritic --strict on the merged tree (log /tmp/mq-precritic/20261107-114813-16988):
  8 FAIL / 61 PASS / 2 SKIPPED-INCOMPLETE of 71. Fixed after it: cell-checks x3 (div_facts TITLE via optionICan, story lesson
  wpBar OVERFLOW via offOpts; re-run OK, 738 pages, 3ed796e). Still red: (1) sibling-compare - word-work plain stories have no
  approved sibling (35 unproven; needs the lead's ownerSkipped ruling as for arrays); (2) print-lint --kind sections --pages 2 S/L -
  the 3-skill sheet continues the mult-story sub-section into page 2's leftover and leaves page 3 one row (DN-2 / PG-23 /
  PAGEFILL): engine page flow (practice.js composer), not fixed; (3) grade-render --gate TARGET - word-work answer digit inputs
  40 x 44 px at card-390 (shared word-work twin, also on mult_word_problems); (4) phone-card FOCUS on mult stories - the checker
  wants the first copy box even when it must stay blank (expect ''), active-box D6 keeps it blank: a checker vs D6 conflict for
  the lead. card-rulings offered INCOMPLETE: the facts card has no notOffered entry for div_facts (card data).

## Hand-over findings (not this lane's files)
Neither one holds the plain story skills (lead ruling 2026-11-07).
- ENGINE (roles/practice.js, the shared-roles lane): `ws-print-lint --kind sections --pages 2` at S and L. A sub-section continues into
  the previous page's leftover space and then breaks, so the next page holds one row (the 3-skill div_facts + mult / div story
  sheet at L: page 3 has 2 stories, a 136 mm empty strip). Findings: DN-2, PG-23, PAGEFILL.
- HOSTS (the shared word-work screen: cells/word-work.js twin and css/screen-cell.css): the word-work answer-digit inputs are 40 x 44 px
  on the 390 px practice card (ws-grade-render --gate TARGET, H6). The same twin is used by mult_word_problems and the other column stories.
