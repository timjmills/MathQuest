Lane: pilot-su-c
Title: Pilot — SU-C column subtraction without regrouping, six skills onto `stack`
Session: session_01G5ktGS4kteYMuLFxnxGEgU
Branch: claude/sweet-newton-c8wrv1-wip-pilot-su-c
Owner of files: subtraction no-regroup generator branch (gen-operations.js ranged sub), subtraction provider, skill-options / skill-presets / standards / wrm / search-terms entries for the six + `sub_2d_1d`
State: fix
Updated: 2026-10-23
Builder profile: mq-opus-low
Critic rounds: 1, FAIL

## Now
- Step 2: one builder run (mq-opus-low) for all six skills from the signed card.

## Owner go

## Open questions
- none

## Times
Times: fix round 1 (machine deltas + critic r1 D1-D12), start 2026-10-23T19:44Z, end —, profile mq-opus-medium
Times: critic round 1 (all pages graded directly: stack x single has no certificate; S and L full, M spot), start 2026-10-23T19:06Z, end 2026-10-23T19:41Z, profile mq-opus-medium, tokens 350k — FAIL (min C1 4, C2 4, C3 6, C4 5); also FAILED by the lead's ruling (sibling comparison)
Times: sibling matrix run (approved stack skills, for the pin comparison), start 2026-10-23T19:05Z, end 2026-10-23T19:37Z, profile —
Times: precritic step 3 pass 2 (after fixes, base merged), start 2026-10-23T18:38Z, end 2026-10-23T19:01Z, profile — — 12 PASS, 1 N/A, coverage-matrix FAIL: 60 RED (11 rows not in pin), all in classes (a)-(d); 98 PENDING are rows needing M2/M4/T3 (not built), not budget
Times: precritic step 3 fixes by orchestrator (fact-probe column choice; worked steps capped at 4), start 2026-10-23T18:28Z, end 2026-10-23T18:37Z, profile — (orchestrator)
Times: precritic step 3 pass 1 (run by the builder), start 2026-10-23T17:55Z, end 2026-10-23T18:25Z, profile mq-opus-low — FAIL: coverage-matrix 62 RED (11 rows not in pin), 98 PENDING
Times: gate step 1 ws-spec-card --check-signed, start 2026-10-23T16:43Z, end 2026-10-23T16:44Z, profile — (OK)
Times: builder step 2 (one run, all six + sub_2d_1d), start 2026-10-23T16:46Z, end 2026-10-23T18:28Z, profile mq-opus-low, tokens 320k, 139 tool uses (102 min, of which ws-precritic ≈ 30 min)
Times: merge W0-A wave0-gates (coverage-matrix baseline), start 2026-10-23T16:44Z, end 2026-10-23T16:45Z, profile —

## Log
- 2026-10-23 18:40: precritic pass 1 triage. OURS, fixed: fact-probe 1 row a page for 6-digit stacks (fact-probe.js bestCols vs digit clamp with separators); side-anchor overflow and ILLEGIBLE at 4-6 digits (worked steps 5-6 lines -> 4). ENGINE classes, reproduced on approved stack skills: H13 stack pinned in a forced 2-column cell (add_1k_regroup, sub_1k_regroup); TY-11 7 pt step numbers in sheet/anchors.js (add_10k_regroup); fact-rows ILLEGIBLE / PG-12 (sub_100k_regroup, sub_1m_regroup). Mixed-pages lane: sections/*, mixed/defaults. Gap: anchors.js does not reserve the anchor cell's height for its step text. Card tool gap: --check-signed fails after the build because §7 lists live options.
- 2026-10-23: pilot started 16:43Z; card gate OK; merged origin/claude/sweet-newton-c8wrv1-wip-wave0-gates (bda2b0c), matrix baseline has rows for the six.
- 2026-10-23 17:08: lead — owner decision (RUBRIC): every grade covers S and L in full and spot-checks M; critic brief must say so. Merge RUBRIC from claude/sweet-newton-c8wrv1 before the critic.
- 2026-10-23 19:10: LEAD RULING. Critic r1 started while ws-precritic was still red (the (a)-(d) pins were neither written nor checked), which breaks process rule 4. r1 runs, but counts ONLY if the sibling comparison confirms all 60 red rows are engine debt at or below the approved skills' counts. If any count is the pilot's own, r1 is a FAILED round: fix on mq-opus-medium, re-run precritic until green against the pins, then critic r2. Orchestrator's error: the critic should have waited for the pin comparison.
- 2026-10-23 19:40: SIBLING COMPARISON (design/audit/runs/pilot-su-c/sibling-compare.txt; siblings add/sub_100/1k/10k_regroup, sub_100k/1m_regroup on the same matrix rows): 115 class×size counts at or below the paired approved sibling, 236 ABOVE. So, by the lead's ruling, critic r1 is a FAILED round. Clearest pilot-own classes: sections/* at L (PG-12 ×8, ILLEGIBLE ×8, H13, PAGEFILL; siblings 0); sections ex-each/ex-group at M/L; single/ex-group H13 ×16 at S on 2-digit (siblings 0); cols2 H13 counts 5/4 of the siblings' (more items a page, same per-cell class); TY-11 above siblings because the regroup siblings have no worked steps (no anchors), which is not a like-for-like comparison. Next: fix round on mq-opus-medium (machine deltas + critic r1 findings), precritic green against the pins, critic r2.
- 2026-10-23 19:45: CRITIC R1 FAIL (design/audit/runs/pilot-su-c/critic-r1.md). Lowest scores C1 4 / C2 4 / C3 6 / C4 5. The defects that cost points: D1 zero cases flood the 2-digit pages (generator); D2 heads off by default; D3 answer boxes 4.06 mm (< TY-21 4.4); D4 no lesson data, so the fallback lesson runs (H3); D5 screens from 4 digits (binaryParts rejects commas: focus, clipping on the 390 card); D6 legacy `band` option offered (H4/H3); D7 heads collide at 5-6 digits (H2); D8 sub_2d_1d narrow set; D9-D12 minor. Engine rulings: (a) confirmed except D12; (b), (c), (d) confirmed; new (e) binaryParts comma (also on sub_10k_regroup, add_10k_regroup). Caught by no machine check: D1, D2, D3, D4, D7. Should have been caught: D5 (screen-slots / chromebook-fit), D6 (options-verify). CAUSE ATTRIBUTION: mostly the CARD (it is silent on heads-on-by-default vs the support level, lesson data, the band option, the screen comma path), then MISSING MACHINE CHECKS (zero-case rate, box width, head collision), then the builder (D1 contradicts card §9.4).
- 2026-10-23 20:01: lead: new process rules 0a (uncertified pair builds run on mq-opus-medium) and 0b (before the critic: precritic green against the pins AND every red matrix row at or below the approved siblings; re-run sibling-compare). 0b applies before critic r2.
