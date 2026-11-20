
## PARKED as built (lead 2026-11-14)
Head 9b52bc399. Not merged toward master: its area-model-div.js change alters the live 2by1 / 3by1 pages, which are ungraded.
The first item after the reset is an area-model-div TEMPLATE round (Opus medium), checked on 2by1, 3by1 and 4by2: the footprint height slack, the lesson top-start, the key slots, Reason It L with the fraction form, TOUCH-HIT, and the H13 capacity of the forms. Then the full critic.
The precritic reds are ledgered in CHECKS_FROM_CRITICS (2026-11-14, lf-ops-amdiv).

## Template round 1 (Opus medium, 2026-11-19/20) - NOT clean; stopped at the $40 cap
Merged master (d38308824, then e487f8f9a via ws-merge-master). Fixes, each FAIL on 9b52bc399 and OK on 5b684ed22:
- lesson L-TOPSTART x12 (lesson Practice page, 9.6 mm): print-sheet.js LESSON_PM_CENTRE_CSS centred every cell of a lesson
  Practice / Mixed page; area-model-div cells now keep the top of the box (CL-4b). Backtest `amdiv-lesson-topstart`.
- L-KEY AK-2 (Scripted Model key 9 of 12 slots, True or False? 1-3 slots): cherry-picked the lead-ruled `mq-smstate` /
  `mq-tofblank` marks from lf-ops-props (bf2061910, 39bd019f6); the key-weight minor now skips `mq-smstate` cells too
  (self-tests: a light answer beside a marked cell fires, inside one does not). Backtest `amdiv-key-slots`.
- footprint hMm from the ink (+6 pads, was +14 slack) and `inkHMm`: M sign 56 -> 47, long / fraction 66 -> 57; L 64 -> 55,
  77 -> 68. No measured page changed rows (the planners read the measured cell); it moved the long_div_2digit lesson Warm-up
  area-model cell 50 -> 48 mm (the only control page set that changed: 31 of 32 HTML-identical, add_facts, mult_facts,
  long_div_2digit, area_model_mult x 8 roles at M).
Still red on 4by2 after round 1 (precritic 20261120-000855-1140): EB-BAND independent / more-practice M (long form 28.2 %,
measured cells 76.5 mm for 52 mm of ink: 3 rows where 4 would fit), lesson M p2 / p3, Scripted Model M; error-analysis and
Reason It L-TOPSTART (the roles centre the work, CL-4b owner 2026-11-12, vs the lint); Reason It L CL40-INK, LONE-PAGE;
pre-skill-check L DN-2; TOUCH-HIT x48 (the probe ran clean: real); options H13 long / fraction 6 vs 8 (capacity not fitted,
card capacity line not changed, no re-sign asked). 3by1 (live) shows the same template classes (EB-BAND independent M x18).

## Template round 2 (Opus medium, 2026-11-20) - stopped at the $40 cap, NOT clean
- H13 / EB-BAND long + fraction @M: footprint `denseRoom: 1` for the long and fraction forms and print gaps 0.1 / 0.3 em
  (screen unchanged): 4 rows at M, 8 a page like the sign form; options-verify --render OK (was 6 vs 8). L stays 6 for every
  form. Backtest `amdiv-long-rows` (FAIL 86f63e822 -> OK 91ee8eaa8). No card change, so no re-sign.
- L-TOPSTART on Error Analysis / Reason It: ws-print-lint CENTRED_ROLES exemption (CL-4b owner 2026-11-12, lead ruling
  2026-11-20), self-tests both ways; ledger row exempt-with-reason (a lint-side change cannot be a commit pair).
- NOT done: TOUCH-HIT (the q-0 / q-1 inputs are already 113 x 68 px: elementFromPoint owns them, but a real tap 1 px inside
  focuses body - not a size problem; the total box is fine; cause not found), Reason It L LONE-PAGE (A over B at L is ~2 x 55
  mm plus the response: one a page is the measured capacity - needs a lead ruling in design/audit/baselines/capacity.json),
  pre-skill-check L DN-2 (role paging of the prerequisite sections, not the template).
- New after round 2 (branch precritic, cut at the 2 h limit, /tmp/mq-precritic run in r2-branch-4by2.txt): lesson M p3
  L-DENSITY PAGEFILL (59 mm strip, 27 %) and lesson EB-BAND M p2 / p3, L p2 - the tighter print gaps changed the lesson
  Practice page; next round must re-fit it. ws-no-size-s GATE-TOKEN and ws-chromebook-fit (aborted module requests) look
  master / environment-side: unverified.
- 3by1 / 2by1 precritic and the master comparison were not run this round (slot contention: the 4by2 run alone hit 2 h).
