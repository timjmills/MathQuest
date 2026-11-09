Lane: lf-ops
Title: Lessons-first wave 1: the pilot unit's operations skills to 8/10 (G3-Y4.B4, count_by_tables for round 1)
Session: https://claude.ai/code/session_013pHDnQ7sfFBg45rrEDgLdJ
Branch: claude/sweet-newton-c8wrv1-lf-ops
Owner of files: LANES.operations (gen-operations.js, gen-mult-patterns.js, the ops cells and providers), design/cards/count-row/, design/cards/ops-tables/, design/lanes/lf-ops/
State: paused
Updated: 2026-11-07
Builder profile: mq-opus-medium
Critic rounds: 5, FAIL (build #4 r1 lowest 2; div_facts r5 6, r6 5, r7 7; plain stories r1 3)

## Now
- HAND-OVER 2026-11-07 ~13:50 UTC (lead: no new work after ~14:10, week at ~44-60 %). Nothing passed; nothing added to redesign-passed.js. Draft PR #38 into claude/sweet-newton-c8wrv1.
- #4 Properties (mult_properties, arrays_groups, count_by_tables): critic r1 FAIL, fix round (fix4, merged) stopped by rule 7; PARKED to next week - fresh-builder brief below.
- #7 Two-step: div_facts support aids critic r5 FAIL lowest 6 (rule 7, H13 class; root cause fillToCeiling in roles/test.js, now caught by H13-INK on Test); plain x / ÷ stories critic r1 FAIL lowest 3 (WP-1 mult forms dead, D-1 division worked in the long-division bracket).
- Next week, in order: div_facts fresh builder (Test stretch, supports-off page, RP-81, fade one-x); the stories fix round (WP / M / D list below); the #4 fresh builder; then #8 mult_zeros, #2 / #16-17 bar-model stories, #18 add_column_multi, #3 mult_chart, mult_comparison, remainder_interpret.

## Hand-over findings (not this lane's files)
- Shared composer js/modules/sheet/roles/practice.js (the shared-roles lane): a story sub-section continues into the previous page's leftover room, so a later page holds one row (DN-2, PG-23). Fires on `ws-print-lint --kind sections` at S with the defaults, on ex-each L, ex-group L and on --pages 2 S / L (critic wp r1 widened the list).
- Shared word-work screen: the answer-digit inputs are 40 x 44 px on the 390 px card (H6, ws-grade-render TARGET).

## Critic plain stories r1 (critic-wp-r1.md, d26d2c4) - FAIL: mult_word_problems_plain lowest C2 4, div_word_problems_plain lowest C2 3 (forms [2])
- WP-1 (critical) mult `forms` dead: arrays [1] and comparison [2] print the equal-groups story (389 / 389); `tellStory` in cells/word-work.js maps every x story to groups. WP-2 (major) div forms [2] "remainder to interpret" never deals a remainder. WP-3 (major) paper != screen (bank and label line order, the sign box square vs circle, a 1- vs 2-column division grid). WP-4 (minor) a wrapped story moves its grid down at L. WP-5 (major) the lesson vocabulary match gives itself away, division reuses the x words. WP-6 (minor) Model panels do not build up. M-1 (major) the x sign in two places on the key. M-2 (major) 5 of 10 x digit boxes never used. M-3 (minor) Model 8 x 2 vs Say "2 groups of 8". M-4 (minor) duplicate bank word. M-5 (major) lesson Warm-up 51 % empty. M-6 (minor) ex-each L worked example at S type. D-1 (critical) division worked in the long-division bracket on grade-3 facts (copy row, remainder 0). D-3 (minor) filler words "days" / "boxes" in 17 / 20 banks.
- Passed: no key-word teaching, nothing given away, units written, one frame a section, B&W, Say frames, keys, sensible numbers.
- Automatic checks: FORMS-LIVE (a schema signature per offered value in ws-options-verify, digits and names masked); SLOT-DOUBLE; DEAD-BOX / LIVE-ROWS over 20 seeds; paper = screen frame order (critic check 10, still unwritten); slot-y spread a row <= 2 mm; VOCAB-ECHO; MODEL-PROGRESS; SAY factor order; BANK-UNIQUE + filler variety; lesson Warm-up H13; anchor font >= 0.9 x item font.
- Speed-ups: --save-html relative CSS (or --png); ws-grade-render --help exits; options-verify masks digits before comparing (would have caught WP-1); hand-over notes paste the lint's full red list.

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

## Critic div_facts r5 (narrow, c41a48c) - FAIL, lowest 6 (C3); rule 7: STOPPED (same H13 class survived Lane D r3, r4 and r5)
Report design/audit/runs/lf-ops/critic-divfacts-r5.md. All five r4 defects fixed (touch / boxsign full, a true array, skip strip to 12 x, no lone row on boxsign Test L, the packet fades in order). New:
- R5-1 (critical): Test rows stretched to fill the page, not sized to the problems (F1 not met): skip Test M 34 %, think Test S 36 % / M 40 %, plain-fact Test S/M/L 50-56 % empty a cell. ROOT CAUSE: `fillToCeiling` in js/modules/sheet/roles/test.js stretches the rows; ws-print-lint's H13-INK EXCLUDES Test pages (the old r4 ruling that F1 replaced), so it reported 0 on a 40 % page.
- R5-2 (critical, pre-existing): the supports-off div_facts page (the array's fallback above 50) is stretched the same way: Independent S/M 54 / 53 %, L 36 %, Review S/M 35 / 40 %.
- R5-3 (major): the array has no 1.5 mm gap after the 5th row (WDS RP-81); C2 7.
- R5-4 (minor): tables 2-4 Test S prints 12 like M and L; Independent S rows 76 mm where 57 suffice.
- R5-5 (minor): think boxes shrink to fit (two sizes on Test M, 97 % / 85 %).
- R5-6 (critical): fade packet page 3 is 54 % empty a cell, 49 % of the page used; facts centred, not at one x (F4); the answer place moves beside / under / beside.
- R5-7 (nit): touch fits line says 16 / 22 pt, touch facts print ~28 pt.
Regression (add / mult facts, div_facts_long, supports off, M): pixel-identical to r4. Keys correct.
Automatic checks: 1 ink-based H13 on EVERY role (Test included, per F1) and every support alone plus the supports-off page; 2 an RP-81 array-gap check; 3 per-support S > M count; 4 a shrink-to-fit check on support SVGs; 5 fact left-x spread per section / packet + answer form constant across fade stages; 6 fits-line digit size vs measured.
Speed-ups: the lane's own H13-INK carried a ruling F1 had already replaced: when a card ruling changes, re-read every check that cites the old ruling (grep the rule id in tests/).
Next (fresh builder, after the reset): remove the Test stretch (fillToCeiling) for fact pages, size rows to the dealt problems; the supports-off page the same; RP-81 gap; S > M; no shrink; one x per section and one answer form in the packet.

## div_facts aids rebuild r6 (lead resume 2026-11-07 evening, $50 cap) - NOT clean, no critic; rule 7 STOP again
Fresh builder (mq-opus-medium). Merged origin/master 5cbe360 (8cb16bd; backtests.json union 97 rows; boot-smoke OK).
- Fixed: R5-1 Test rows 1.15 x the measured height, never stretched (9a8acc5, scoped to div_facts by the dealing skill in 96e1b1c); R5-2 supports-off Independent / Review pack up to 30 / 24 / 20 with the fact over its answer line (9a8acc5; skipped with worked examples, 78f5a82); R5-3 RP-81 1.5 mm gap after every 5th row / column (e81243f); R5-7 fits line names the touch digit (4de7b77). Backtest h13-ink-test-plain-lf pass 96e1b1c (ws-backtest --row OK, and h13-ink-supports-lf OK). Regression: add / sub / mult facts and div_facts_long Independent / Test / Review M, 24 PNGs pixel-identical. ws-simple-print OK, boot-smoke, code-snapshot, visual-quality OK.
- Precritic --strict (before 78f5a82): 63 PASS / 4 FAIL / 2 SKIPPED. Reds: print-lint-h13-plain-S (supports-off Independent S, 30-31 % band beside narrow facts in 61.5 mm cells); sibling-compare (ex-group L PAGEFILL, fixed by 78f5a82, not re-run); divform-mix-L (pre-existing, identical on the merge commit); spec-card-signed (the facts card cites rules master changed: needs regeneration + the owner's re-sign).
- STOPPED (two attempts each): R5-2 at S - the page cap 30 with S digits leaves 30-31 % beside narrow facts (lifting the count hits the CL-40 tab inset) -> lead ruling needed (cap 36 at S, or accept a narrower cell grid). R5-6 fade packet - one answer form made page 1 34 % empty; the row stretch on pages under 80 % full lives in sheet/layout.js and left-anchoring needs cells/equation.js or sheet-kit.css (outside this lane's fact files) -> shared-layout owner. R5-4 and R5-5 not attempted.
- Learning rows (rule 00): checks - a rule-index change after a merge must re-run ws-spec-card --check-signed on every card a lane builds to, before the builder starts (the facts card went red silently on the master merge); H13 beside the content (horizontal band) on narrow-fact cells at S is a separate measure from the vertical band. Speed-ups - give a fresh builder the files of every shared layer its defects live in, or rule the owner first (R5-6 needed layout.js / equation.js); a $50 resume buys one builder round, not a builder + critic, on a skill with a multi-layer defect.

## div_facts aids r7 (owner rulings 2026-11-08, $50 cap) - support pages clean; empty-band red on other roles; no critic yet
- Fixed: S cap 36 on the supports-off page, rows 1.1 x measured, never stretched (841f2db, eedd6bb, d71bd74, 9ec1214); R5-6 fade packet one answer form, the fact left-anchored at one x (ws-eq-left / ws-eq-under, div_facts only), rows 1.25 x measured, layout noStretch flag (a066a7b); R5-4 tables 2-4 at S: array pitch 2.25 mm, Independent S 20, Test S 16, M 12 (cd0c43d); R5-5 think box no shrink (cd0c43d). Merged lf-checks' ws-empty-band (83386f0).
- Hash check (add / mult / sub facts, div_facts_long; Independent / Test / Review; S/M/L): 72 / 72 PNG and 36 / 36 HTML byte-identical.
- Precritic --strict at d71bd74: 66 PASS / 2 FAIL / 2 SKIPPED. h13-plain S/M/L, fade-packet-M, sibling-compare PASS. FAIL divform-mix-L (pre-existing, identical on b23e418: fact-rows L-TOPSTART 0 -> 40); FAIL ws-empty-band 186 (119 at S on b23e418; ~162 after 9ec1214) - independent / review / test / more-practice now 0; left: lesson, opener, guided (EB-BAND), fact-probe and scripted-model (EB-SIDE, 49), mixed-practice (EB-FOOT 31). Backtest eb-ops-divfacts-S pending.
- Open: fade packet page 3 at M about 40 % used (rows unstretched, stage capped at 2 x page 1).
- Learning rows: checks - a new shared check that renders every card-offered role (ws-empty-band) found 160+ findings on roles no div_facts critic round ever graded (lesson, opener, guided, fact-probe, scripted-model, mixed); run it at the start of a round, not after the fixes. Speed-ups - one-skill hash checks (72 PNG / 36 HTML) prove a shared layout change byte-safe in minutes: make it a standard gate for any shared-file edit.

## Critic div_facts r6 (narrow, 49a7b12a, 2026-11-08) - FAIL, lowest 5 (C3, fade packet page 3); no deploy
Report design/audit/runs/lf-ops/critic-divfacts-r6.md. Every r5 defect fixed (Test cell bands 21-24 %, supports-off S holds 36, the array's subitising gap, S > M, one think-box size, one answer form in the packet, the touch fits line). Keys correct. Regression add / mult facts, div_facts_long pixel-identical to r5. All other in-scope pages 8/8/8/8.
- R6-1 (RULING NEEDED): supports-off and greyed-array Test pages: the cells pass but the grid stops half way (Test S 49.7 % of the page, 117 mm white; M 50 %; L 61 %); think Test S / M leave 50 / 64 mm. F1 sizes rows to the problems while WDS 12.1 caps a Test at 20 / 16 / 12. Options: the Test count follows Independent capacity; Form A and B on one sheet; or the owner accepts a short Test page.
- R6-2: 3-digit facts at M: the answer line ends 0.53-0.79 mm from the cell's right rule (CL-8 needs 3 mm) on skip / think Independent, More practice, Test M (C3 7).
- R6-3: the drawn array (tables 2-4) at L takes 4 columns where M takes 3: the fact 1.85 mm from the rule in 7-10 of 12 cells (C3 7).
- R6-4: fade packet page 3 uses 40 % of the page (129 mm white) while Independent M holds 24 (H5, C3 5).
- R6-5: the fact's left edge moves 5.0 mm between packet page 1 and pages 2-3 (F4 one x).
Learning rows (rule 00): checks - EB-PAGE: white under the grid per page vs one row pitch (the cell-only gate let F1 move the space from the cells to the page); a side-gap check (ink to each side rule >= the CL-8 pad, probed with the band's widest fact) and columns(L) <= columns(M); fact-left-x across ALL pages of a packet; fits-line vs drawn rows. Speed-ups - run the page and cell measures together when a ruling moves space; a page < 70 % used at a role ceiling is a precritic WARN naming the colliding rule, so the lead rules it before a critic; shot.cjs needs an absolute path.
Lesson regression check (lead rule 2026-11-08, before any deploy): branch vs origin/master, ws-detailed-lesson --check / --repeats on the 5 lessons using lane skills: g3-oa5, g3-oa9-input-output, g3-oa9-mult-table (E2 font flake, re-run OK), g4-nbt1 all match; g3-oa8-two-step-wp (not passed) WORSE on the branch: E9b 13-14 % strip and E12 unequal grids on P2 / P2b (master fails E35 only) - to next week's stories round with a bisect (likely the plain-story lesson data / word-work layout or fix4's in-place height grouping).

## div_facts aids r8 (owner R6-1 (a), $45) - not clean: one L case needs a ruling; no critic yet
- Checks (ws-empty-band, div_facts opt-in, self-test 12 cases; each FAILs on 49a7b12a, passes on 893377fa; backtests eb-page-divfacts-test, eb-page-divfacts-fade, eb-pad-divfacts-M, eb-cols-divfacts-array, eb-factx-divfacts): EB-PAGE (white under the grid vs one row pitch: Test S 119 mm, fade M page 3 131.5 mm), EB-PAD (CL-8 3 mm, probed with ÷12 facts: 0.72 mm), EB-COLS (L never denser than M: array L 4 vs M 3), EB-FACTX (packet fact x spread 5.30 mm).
- Fixes: R6-1 the across-fact Test takes the Independent capacity (to 36 / 24 / 20; Long division and Fraction keep 12.1) (4a07ada1, 893377fa); R6-2 / R6-3 width measure counts the tab inset: 3-digit facts 3 columns at M, array L 3, boxsign S 4, skip / think M print the line under the fact (c05a5dae, 893377fa); R6-4 fade stages no longer capped at 2 x page 1 (c05a5dae); R6-5 one left inset across the packet (c05a5dae, d943b0d4).
- Gates: precritic on 9ce3c683 3 FAIL / 65 PASS (divform-mix-L pre-existing; sibling-compare fade L H13 fixed in d943b0d4, not re-run; empty-band below). Hash add / mult / sub facts + div_facts_long x Independent / Test / Review x S/M/L: 36 / 36 PNG + 36 / 36 HTML byte-identical. simple-print, boot-smoke, code-snapshot OK.
- RULED (owner 2026-11-09, via the lead: "this is fine. I approve" -> option (a)): at L a fact too wide for its column starts under the number tab, 3 columns kept, div_facts-scoped. An implementation of F1 / CL-40 under the signed facts card, no card change. Was: at L "1xx ÷ 1x =" is 50 mm of ink; beside the w2 tab inset (9.7 mm) + the 3 mm pad it does not fit a 61.5 mm column: skip L 2.35 mm from the rule (EB-PAD x 8) and fade L page 3 prints 2 x 5 with 53 mm white (EB-PAGE); forcing 2 columns gives a 31 % side band (EB-SIDE). Options: (a) at L a fact too wide for its column starts under the number tab (taller rows, same 3 columns) - RECOMMENDED: keeps the page full and the CL-8 pad, a div_facts-scoped layout change; (b) 2 columns at L for 3-digit ÷ 2-digit sections; (c) accept 2.35 mm at L.
- PARKED (lead 2026-11-08 ~20:40 UTC). Next week, in order: the owner's ruling -> a short builder -> critic r7 (keep its renders) -> a narrow deploy branch (div_facts aids commits only) on current master 198d437e9, after ws-detailed-lesson --check / --repeats on the 5 lessons, ws-empty-band and the hash check.
- Commits: app 4a07ada1, c05a5dae, 893377fa, d943b0d4; checks / tests d2fc15ec, 15ca2e52, 9ce3c683.

## Critic div_facts r7 (narrow, 17ce2fe1, 2026-11-09) - FAIL, lowest 7 (two C3 7); every other graded page >= 8
Report design/audit/runs/lf-ops/critic-divfacts-r7.md; renders kept in the lane session's scratchpad r7-renders/ (not in the repo). R6-1..R6-5 all fixed (Test pages full; side gap at M 3.70 mm; array L 2 columns vs M 4; fade M page 3 holds 24, 91.5 % used; one fact x across the packet). Regression add / mult facts, div_facts_long byte-identical to r6 (12 / 12). Keys correct.
- R7-1 (C3 7): supports-off and greyed-array Test M prints 21 where Independent M prints 24: Test rows 29.1 mm vs 27.8 mm (FACT_TEST_ROOM 1.15 in sheet/roles/test.js), the 8th row misses by 1.6 mm, 34.4 mm white; breaks the owner's 2026-11-08 ruling (Test count follows Independent). Fix: the Test rows take the Independent row factor (1.1) for facts. Lead question: other supports print fewer on Test than Independent but each page is full in its own rows (skip S 18 / 21, think S 21 / 24, boxsign M 12 / 16, array S 16 / 20, L 9 / 10) and scored 8 - ruling needed whether the owner's Test = Independent count applies there too.
- R7-2 (C3 7): fade packet L page 3: 20.1 mm between the fact (started under the tab) and its answer line, against 12.7 mm everywhere else; rows 41.1 mm, 15 facts where Independent L holds 18, 42.6 mm white. Fix: the under-the-tab start keeps the 12.7 mm fact-to-line gap.
Five-lesson check (lead rule) on 17ce2fe1 vs origin/master 2fe21f2b: g3-oa5, g3-oa9-input-output, g4-nbt1 match; g3-oa9-mult-table matches (E2 font flake on the first run, two re-runs OK); g3-oa8 (not passed) still worse on the branch (E9b, E12 on P2 from the stories work) - not in the narrow deploy.

### Findings -> checks (owner / lead 2026-11-09; rounds r5-r7 of div_facts)
| Finding | Check that now catches it (new / extended) | Backtest row (FAIL on failed state, PASS on fix) | On precritic / detailed-lesson path | Would have saved |
|---|---|---|---|---|
| R5-1 Test rows stretched (fillToCeiling) | H13-INK on Test pages (extended; F1) + `--h13-ink plain` | h13-ink-test-plain-lf (c41a48c / 96e1b1c) | precritic print-lint-h13-plain-S/M/L | 1 round (r5) |
| R5-2 supports-off page stretched | H13-INK plain (extended) + ws-empty-band EB-BAND | h13-ink-test-plain-lf; eb-ops-divfacts-S (b23e418 / 35ede15a) | precritic h13-plain rows, empty-band | 1 round |
| R5-3 no RP-81 array gap | none: drawn-array gap is visual; one-line reason: needs a per-SVG circle-row pitch probe, proposed (critic r5 check 2), not built | - | - | 0 (fixed in the same round) |
| R5-4 S = M count on tables 2-4 | EB-COLS columns(L) <= columns(M) (partial) | eb-cols-divfacts-array | precritic empty-band | 1 round |
| R5-5 think box shrink | none: proposed shrink-to-fit probe on support SVGs not built; reason: one finding, fixed by removing max-width | - | - | 0 |
| R5-6 / R6-4 fade packet page 3 empty | EB-PAGE white under the grid (new) + FADE-ORDER (R4) | eb-page-divfacts-fade (49a7b12a / 893377fa) | precritic empty-band, fade-packet-M | 2 rounds (r5, r6) |
| R5-6 / R6-5 fact x moves in the packet | EB-FACTX across all packet pages (new) | eb-factx-divfacts | precritic empty-band | 2 rounds |
| R5-7 fits line digit size | none: one-line reason, wording; a fits-line vs measured-digit check proposed (critic r6 observation) | - | - | 0 |
| R6-1 Test grid half the page (F1 vs 12.1 ceiling) | EB-PAGE (new) | eb-page-divfacts-test (49a7b12a / 893377fa) | precritic empty-band | 1 round (r6) |
| R6-2 answer line 0.5-0.8 mm from the rule | EB-PAD CL-8 3 mm probed with the widest facts (new) | eb-pad-divfacts-M; eb-pad-page-divfacts-L (be028660 / a4c6b694) | precritic empty-band | 1-2 rounds (r6, r8) |
| R6-3 array L denser than M | EB-COLS (new) | eb-cols-divfacts-array | precritic empty-band | 1 round |
| R7-1 Test M 21 vs Independent 24 | NOT YET: an EB-PAGE Test-vs-Independent capacity comparison (Test count < Independent count for the same facts and size) - to build with the fix | - | - | would have saved r7 |
| R7-2 fade L page 3 fact-to-line gap 20 mm | NOT YET: a gap-consistency check (fact-to-answer-line distance within 1 mm across a packet / role) - to build with the fix | - | - | would have saved r7 |

## Brief for the FRESH #4 builder (lead ruling 2026-11-07: after the Thursday 22:00 UTC reset; Opus medium, a rebuild after two failed rounds)
Skills: multiplication:mult_properties, multiplication:arrays_groups, multiplication:count_by_tables (BUILD lesson #4, Properties of multiplication, 3.OA.B.5). Cards: design/cards/ops-tables/ops-tables.md, design/cards/count-row/count-row.md (signed). Defects: design/audit/runs/lf-ops/critic-r1.md; what fix4 already fixed: section "Fix round after critic r1" above.
ROOT CAUSE to fix first: cell heights come from each template's TALLEST POSSIBLE item (footprint per template), not from the items actually dealt; the lesson / guided / Test roles reserve the same. So pages of small arrays or short rows carry 30-43 % empty bands (D-MP-1, D-CB-4/5) and every attempt to shrink one role broke another. Make the footprint per DEALT item in cells/arrays.js, cells/arrays-turn.js and cells/count-row.js (footprint(payload, ctx) from the payload's own rows / cols / tiles / times labels), and let layout band rows by the dealt heights (layout.js already groups in-place cells by height from 1.2x). Do not size rows by the band's maximum.
Then, in order: GRID-EVEN at L for mult_properties without breaking detailed lesson g3-oa5 E12 / E24b (keep 2 columns, size pairs per dealt item); the forms-1 and mixed lessons' overflow; count_by_tables lesson overflow with times=each/given and jumps=15; Reason It one row a page; test S mixed-forms 4 mm overflow; pre-skill-check L key overflow; D-AG-4 picture / prompt order; D-CB-7/8; D-MP-9/14/15; the number_patterns_rule lesson overflow (lf-algebra's skill, count-row template: root cause unknown; lf-algebra reverted 3d8bca1's wrap hunk interim).
Checks: promote the interim BAND to H13-ANY in ws-cell-checks (header names the sibling H13-ABS in ws-print-lint, lf-placevalue); drop the interim SLOT / GRIDEVEN (use lf-placevalue's SLOT-W-EQUAL / GRID-EVEN-ALL, opt in with an "lf-ops" entry in tests/fixtures/precritic/opt-in-rules.json); write critic check 10 (paper = screen frame); fill the TBD pass commits of the 8 fix4 backtest rows and the 7 R4 rows once green. Run the FULL precritic --strict (with the card-plan rows) and every-role grade-render, one skill a run, before any critic.
practiceBlocks LANDED (lf-engine 6bcfe3cc, branch claude/sweet-newton-c8wrv1-lf-engine; schema validatePracticeBlocks in lessons/schema.js): after that branch merges, set the mult_properties lesson record in families/multdiv.js to `practiceBlocks: [{shape:[4,2]}, {shape:[2,2], opts:{task:[2], pictures:false}}]` ([4,2]+[4,2] needs 227 mm at L, page holds 217 mm), and give the provider a task-2 instruction (today block 2 prints "Look at the array. Write two facts." with no array drawn; it comes from the skill's instructionKey). This closes the lesson SPREAD finding.
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
Times: critic plain stories r1, start 2026-11-07T13:22Z, end 2026-11-07T13:43Z, profile mq-opus-medium
Times: critic div_facts r5, start 2026-11-07T12:48Z, end 2026-11-07T13:04Z, profile mq-opus-medium
Times: builder #7 (div_facts aids + stories), start 2026-11-07T09:37Z, end 2026-11-07T13:18Z, profile mq-opus-medium
Times: fix #4 (fix4), start 2026-11-07T09:50Z, end 2026-11-07T11:10Z, profile mq-opus-medium
Times: critic #4 r1, start 2026-11-07T09:36Z, end 2026-11-07T10:13Z, profile mq-opus-medium
Times: builder #4, start 2026-11-07T07:40Z, end 2026-11-07T09:20Z, profile mq-opus-medium
Times: builder R4 checks, start 2026-11-07T06:30Z, end 2026-11-07T07:45Z, profile mq-opus-medium
Times: lane day-1 cards + merge, start 2026-11-07T06:25Z, end 2026-11-07T06:47Z, profile lane session

## Log
- 2026-11-09: L-width fix (a4c6b694, 17ce2fe1) + master merge (11720699); critic r7 FAIL lowest 7 (R7-1 Test M 21 vs 24, R7-2 fade L gap); stopped at the $35 cap.
- 2026-11-09: resumed ($35 cap); owner ruling (a) on the L width; master 2fe21f2b merge conflicts in backtests.json, options-render.pins.json, ws-cell-checks (lib + script), ws-empty-band -> given to the builder.
- 2026-11-08 ~20:40: div_facts aids r8 parked by the lead (budget); L-width ruling with the owner.
- 2026-11-08: div_facts aids r7 fixes + empty-band pins (master-equal) + critic r6 FAIL (lowest 5: R6-1 Test page half empty needs a ruling, R6-4 packet page 3); lesson check found the g3-oa8 P2 regression; no deploy.
- 2026-11-07 evening: div_facts aids r6 rebuild (lead resume, $50): 4 fixes, not clean (4 precritic reds), R5-2 S and R5-6 stopped by rule 7; no critic run.
- 2026-11-07: COST (lead reading): session cost_usd $200.65 at 13:21 UTC = about 10.0 % of the weekly limit ($20 = 1 %), of the lane's $250 cap (80 %). Lane paused to next week; the lead confirmed the next-week order.
- 2026-11-07 ~13:50: hand-over. Cost (superseded above): lead read cost_usd $55.23 at 09:34 UTC; later sub-agent runs (fix4 ~0.6 M tokens, #7 ~0.7 M, three critics ~0.9 M) are not read yet - the lead reads the session's cost_usd (session_013pHDnQ7sfFBg45rrEDgLdJ) for the final figure ($20 ~ 1 % of the week).
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
