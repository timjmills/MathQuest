Lane: lf-mixreview
Title: Mixed review page type: spec card (grades x areas mix, sendable, playable, week, weighting, breakdown)
Session: session_01HVwpAE3g6EZH8idgErP6LP
Branch: claude/lf-mixreview
Owner of files: design/cards/mixed-review/ (card.json, mixed-review.md); this status file
State: fix
Updated: 2026-11-19
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
