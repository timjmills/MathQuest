Lane: lf-mixreview
Title: Mixed review page type: spec card (grades x areas mix, sendable, playable, week, weighting, breakdown)
Session: session_01HVwpAE3g6EZH8idgErP6LP
Branch: claude/lf-mixreview
Owner of files: design/cards/mixed-review/ (card.json, mixed-review.md); this status file
State: build (steps 1, 1b, 2 of card §9b)
Updated: 2026-11-20
Builder profile: mq-opus-medium
Critic rounds: 1, card critic r1 FAIL (min 6), fixed in the card (§9c)

## Now
- The spec card is written: design/cards/mixed-review/mixed-review.md (hand-written; card.json alongside). No product code.
- The lead ruled on all 16 questions (2026-11-19); the card's section 9 is now Rulings. Waiting for the hand signature.
- After signing: step 0 the lead applies the PAGE_TYPES 5.5 diff (card 9a); then lanes MR-E (checks first), MR-B, MR-A, MR-C, MR-D, critic (card 9b).

## Owner go

## Open questions
- none (all 16 ruled by the lead 2026-11-19). Formerly: the 16 questions of card section 9. The ones that change the design: 1 (AREA_LABELS not in the repo; designed against AREAS), 2 (screen weighting vs PT-DLG-26 / P-RV-9), 3 (alias, not a role module), 4 (mixed order before M2: shelf-level interleave), 6 (the only-8/10 pool is 32 skills, OA / NBT / Words only), 7 (2-up at N = 5), 16 (ws-spec-card has no page-type kind: hand signature).

## Times
- Times: builder card, start —, end 2026-11-19T23:12Z, profile mq-opus-medium

## Log
- 2026-11-19: Card critic r1 FAIL min 6 (design/lanes/lf-mixreview/card-critic-r1.md, 7afebf5f). All 13 defects fixed in card.json and mixed-review.md (§9c table, each verified against the code): ceil(N/2) cap; adapt weights choose skills only; shelf-level mixed order, no separate screen order; one dealer dealReviewItems in print-sheet.js running the RETRIES / rung ladder; V1 freezes deal, rotation and shelf order with a pinned week-v1 fixture; wide visuals 4 / 3 a page; at most 3 skills a page (page-aware deal, capacity re-derived); COUNT backtest fixture count-ignored; nine POOL fixtures; labels assert as step 1b's gate; allLessons() cited; 2-up counted per half; pinned precritic filter sample. 13 rows added to design/lessons-first/CHECKS_FROM_CRITICS.md (exempt: card text). Still unsigned; ready for card critic r2.
- 2026-11-19: Lead rulings applied to card.json and mixed-review.md: section 9 became Rulings (each dated 2026-11-19, lead); AREA_LABELS (exact table from the lessons-browser card at 55ae9d090) added and its build as step 1b; weighting named EX-MXR-ADAPT in the card and PT-MXR-9 (plus PT-DLG-26 / P-RV-9 diff sentences); Only 8/10 ✓ defaults OFF with a ✓ mark per passed skill and the count on the toggle, MIX-REVIEW-POOL updated; N = 5 prints 2-up (capacity row, PT-MXR-3, MIX-REVIEW-COUNT). Still unsigned.
- 2026-11-19: Card written by hand in the generated nine-section structure (ws-spec-card knows only template / family kinds; the tool was not changed). It has no spec-card machine block, so `ws-spec-card --check-coverage --all` adds one "no spec-card block" FAIL line for it (that run already fails on master for 13 other cards' stale rule excerpts); `--check-signed --skill` output is unchanged. Reuse found: mixed-practice.js (GROUPED + M1 mixed, dealCounts, interleave), review.js PT-REV-2, answer-key.js skillItemMap / answerListRows, teacher-plan.js largest-remainder allocation, teacher-areas.js areaOf / AREA_ORDER, wrm-links.js pacing + weekForDate, gamification.js spaced repetition, progress.js mastery, quiz-results.js skillAnalysis, game-flow.js skillBreakdown, the enhanced share code (weight digits carry the item counts). Blockers: mixed-practice fills the page (no exact count yet); M2 block packer not built; no AREA_LABELS; no area grouping in any results screen.

## Card critic r3 FAIL (min 6, K2) - round cap reached, STOPPED (2026-11-20)
r1 / r2 defects all FIXED except D5 / N2 (partly). check-v1 OK (11 props, 31 fixtures) and the critic's own probes
(17,280 sheet + 16,000 day round trips identical) hold. New defects: 1 the V1 freeze does not pin the imported
interleave.js / rng.js nor the registry rows; 2 a lone item on a page (H5); 3 a flat skill with 1 item on a page; 4 no
footprint-kind -> class table (12.1 word-problem / long-division rows, legacy M1); 5 the seed-formula sentence is false;
6 props c / e / k trust the dealer's report; 7 the no-S fixture is caught by luck; 8 two codecs (prototype vs skill-codes.js).
Root cause (the r2 class again): a normative card sentence with no property asserting it. Proposed check: every deal rule
sentence in §2 / §3 / §7a carries a property id, and check-v1 fails on a rule sentence without one (rule -> property trace).

## Card critic r4 FAIL (min 5, K2) - final round, STOPPED per lead (2026-11-20)
check-v1 OK in all four modes, but the critic's sweep found the identical-mix claim false: 501 of 108,000 single-sheet
codes re-deal a different sheet (replay deals from the dealt list alone, so the dealer chooses with a smaller cycle; up
to 17 % on kind pools). Prop a was never swept, so check-v1 could not see it. Also: props f / g / h / j still trust the
dealer (comeback, top-ups, SHELF tables); the trace detector misses common rule wordings (18 untagged rules found); step 2
builds rows with fc not kind and codes from data.js not FROZEN_SKILL_CODES; "placement grade" vs the table grade; §9b
step 3 seed wording; step 1 property map incomplete; 12.1 long word problems at L.
Proposed next (if the lead reopens): deal() returns the replay of its own code (deal -> encode -> replay, one pass, stable
in every case checked) and assert deal(replay(code(x))) == deal(x) swept in --fill; every property recomputes; the trace
inverts its default (every bullet sentence normative unless [I]). All fixes are local to the dealer, its check and the card text.

## Build (signed card, 2026-11-20): steps 1, 1b and 2 (builder, mq-opus-medium: first build of a new engine-level screen)
Card §10 deferrals done in these steps, with no re-sign (each is §10-deferred to the step named):
- L3 (step 1): check-v1 `--trace` INVERTS its default. Every sentence of a §2 / §3 bullet, of a §7a bullet and of a §7a
  Decision cell is normative unless it is marked `[I]`. The splitter also splits after a tag's "]. " before a lower-case word
  or a digit. The 76 orphans the inverted trace found (the critic's 18 plus every Decision cell, Header, Key pages) are tagged
  in the card: 75 tags, plus one §2 host sentence marked `[I]` (normative in §7a Order modes with its X tag). There are 5 new
  trace FAIL fixtures for the planted forms (plain rule, after a tag, should, refuses, Decision cell). Trace now: 197
  normative sentences, 114 by a property, 83 by a product check.
- L8 (step 1): the card §9b step 1 map now copies the §8 V1-core column: SHARE a i m, COUNT b c d e h j j2 k l, POOL g n
  (+ b c d), WEEK f (+ a). The same map is executable in tests/scripts/ws-mix-review.mjs `CHECKS`.
- card.json is NOT re-synced for these text edits. The checks read only mixed-review.md, and card.json mirrors the §9b text.
  This is noted so that the lead can re-sync it when it signs the next card change.
- Step 1 (MR-E) also adds tests/scripts/ws-mix-review.mjs. It runs `--check count|pool|share|hosts|week|breakdown|labels|trace`,
  has ONE named fixture per FAIL state under tests/fixtures/mix-review/<check>/{fail,pass,pending}/, and the pending states
  are named with their build step. It adds 12 backtest rows `mix-review-*` (6 pending, one per later step) and
  ws-precritic `--role mixed-review` on the pinned filter sample tests/fixtures/precritic/mix-review-sample.json. Its Node cores
  ARE check-v1's properties, run on the product dealer through check-v1 `configure()`.
- Step 1b: `AREA_LABELS` in js/modules/teacher-areas.js (the 11 rows of card §7a; lessons-browser R1 55ae9d090).
- Step 2: js/modules/mixed-review.js = proto/dealer-v1.mjs with ONLY its two import paths changed (pins re-taken in
  tests/fixtures/mix-review/frozen.json; interleave.js and rng.js pins unchanged). js/modules/mixed-review-pool.js holds
  poolRows, placementGrades, footprintKind, DEFAULT_FILTERS and weightsFrom. The frozen V1 table
  tests/fixtures/mix-review/v1-registry.json (708 rows) comes from `ws-mix-review --pin`, and 20 of 20 product golden codes
  replay. skill-codes.js delegates the V1 tokens to V1 encode / decode (one codec). design/SHARE_CODES.md has a
  "Mixed review tokens" section.
  - L4: rows carry `kind`, never `fc` (pool-row-fc).
  - L5: codes are FROZEN_SKILL_CODES. Every live skill outside MIXED / NOSTD already had a frozen code, so nothing had to
    be pinned. The one live skill with no frozen code is all_mixed:custom_mixed, a MIXED pool, which is never a row.
  - L6: the card's order-mode text now says "the frozen V1 table's grade".

## Findings for the lead (build step 2, 2026-11-20)
1. **L9 contradicts §2 rule 5 / prop l. BLOCKED, not built.** A `word-problem-long` kind capped at 2 at L makes a lone item
   unavoidable on a pool of long word problems at odd N at L (5 = 2 + 2 + 1). On a mixed pool (tests/fixtures/mix-review/
   pools/pool-wplong.json) the frozen dealer leaves a lone item on 744 of 10,800 sheets: its guard cannot give one back from
   a 2-item page. The dealer was therefore moved WITHOUT L9. The state is pinned as
   tests/fixtures/mix-review/count/pending/count-long-wp.json ("BLOCKED, lead ruling needed"). A ruling is needed on which
   rule yields, or on a guard change, which would ship before V1 is released.
2. **The live footprint kinds are not the contract's 10.** 689 of 708 table rows are `legacy`, because the providers author
   no footprint. The other 19 carry kinds outside SKILL_CELL_CONTRACT 3.5: family-check 1, arrays-turn 2, count-row 2,
   choice 2, picture 1, word-work 7, table 4. V1's rowOf classes an unlisted kind as typical (not legacy). So almost every
   page is GROUPED and typical: no compact fact page and no M1. The table records each kind as is, and V1 decides the class.
   While V1 is unreleased, the lead may want the table's kinds derived from the drawn template instead. That needs a
   browser generation pass and a table re-pin, and must be decided before the first V1 code ships.
3. Placement chips: WRM Reception (PK) lessons place a skill under the K chip (chipOf in mixed-review-pool.js). The card
   names no PK chip.

## Gates (step 2, 2026-11-20)
- ws-mix-review --built-only --sample: OK (48 PASS, 52 CAUGHT; 20 states PENDING: count 4 (3 engine + count-long-wp BLOCKED), pool 3,
  share 3, week 1, hosts 5, breakdown 4). ws-backtest --row mix-review-{trace,labels,count,pool,share,week}: 6 PASS; the
  other 6 mix-review rows are pending (steps 3-5).
- check-v1 OK (15 props, 50 fixtures, trace 197/114/83); ws-boot-smoke OK; ws-code-snapshot OK (741 codes, nothing moved);
  ws-standards OK; ws-search-terms OK; ws-precritic-plan --checks-from-critics OK (350 pass, 128 exempt, 0 fail);
  ws-precritic --role mixed-review --dry-run plans the gate.
- ws-share-options: FAIL (14) on this branch AND on the step-1b commit 2cef9e43b before skill-codes.js was touched, in a
  worktree, with the same findings. The harness's "Times 7, 8" pick reads back as every table except 7 and 8 (code
  EA~C01234569ABCDEF_NA). So the failure is not this lane's; it is reported to the lead.

## PARK NOTES / next
- Done: steps 1, 1b and 2. Next: step 3 (MR-A engine, lf-engine files) is NOT started (brief: stop after step 2).
- Open for the lead: findings 1 (L9 vs prop l, BLOCKED) and 2 (live footprint kinds) above, and the pre-existing
  ws-share-options FAIL.
- Resume: `node tests/scripts/ws-mix-review.mjs --built-only --sample tests/fixtures/precritic/mix-review-sample.json`;
  `node tests/scripts/ws-backtest.mjs --row mix-review-trace,mix-review-labels,mix-review-count,mix-review-pool,mix-review-share,mix-review-week`;
  `node design/cards/mixed-review/proto/check-v1.mjs`. When a pending state is built, move its fixture from
  <check>/pending/ to <check>/fail/, add its pass fixture, and drop `pending` from its backtest row.
