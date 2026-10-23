Lane: pilot-su-c
Title: Pilot — SU-C column subtraction without regrouping, six skills onto `stack`
Session: session_01G5ktGS4kteYMuLFxnxGEgU
Branch: claude/sweet-newton-c8wrv1-wip-pilot-su-c
Owner of files: subtraction no-regroup generator branch (gen-operations.js ranged sub), subtraction provider, skill-options / skill-presets / standards / wrm / search-terms entries for the six + `sub_2d_1d`
State: precritic
Updated: 2026-10-23
Builder profile: mq-opus-low
Critic rounds: 0, none

## Now
- Step 2: one builder run (mq-opus-low) for all six skills from the signed card.

## Owner go

## Open questions
- none

## Times
Times: precritic step 3 pass 2 (after fixes, base merged), start 2026-10-23T18:38Z, end —, profile —
Times: precritic step 3 fixes by orchestrator (fact-probe column choice; worked steps capped at 4), start 2026-10-23T18:28Z, end 2026-10-23T18:37Z, profile — (orchestrator)
Times: precritic step 3 pass 1 (run by the builder), start 2026-10-23T17:55Z, end 2026-10-23T18:25Z, profile mq-opus-low — FAIL: coverage-matrix 62 RED (11 rows not in pin), 98 PENDING
Times: gate step 1 ws-spec-card --check-signed, start 2026-10-23T16:43Z, end 2026-10-23T16:44Z, profile — (OK)
Times: builder step 2 (one run, all six + sub_2d_1d), start 2026-10-23T16:46Z, end 2026-10-23T18:28Z, profile mq-opus-low, tokens 320k, 139 tool uses (102 min, of which ws-precritic ≈ 30 min)
Times: merge W0-A wave0-gates (coverage-matrix baseline), start 2026-10-23T16:44Z, end 2026-10-23T16:45Z, profile —

## Log
- 2026-10-23 18:40: precritic pass 1 triage. OURS, fixed: fact-probe 1 row a page for 6-digit stacks (fact-probe.js bestCols vs digit clamp with separators); side-anchor overflow and ILLEGIBLE at 4-6 digits (worked steps 5-6 lines -> 4). ENGINE classes, reproduced on approved stack skills: H13 stack pinned in a forced 2-column cell (add_1k_regroup, sub_1k_regroup); TY-11 7 pt step numbers in sheet/anchors.js (add_10k_regroup); fact-rows ILLEGIBLE / PG-12 (sub_100k_regroup, sub_1m_regroup). Mixed-pages lane: sections/*, mixed/defaults. Gap: anchors.js does not reserve the anchor cell's height for its step text. Card tool gap: --check-signed fails after the build because §7 lists live options.
- 2026-10-23: pilot started 16:43Z; card gate OK; merged origin/claude/sweet-newton-c8wrv1-wip-wave0-gates (bda2b0c), matrix baseline has rows for the six.
- 2026-10-23 17:08: lead — owner decision (RUBRIC): every grade covers S and L in full and spot-checks M; critic brief must say so. Merge RUBRIC from claude/sweet-newton-c8wrv1 before the critic.
