# Lane D fix round 11: gates (2026-10-16)

Branch `claude/sweet-newton-c8wrv1-wip-a3256e8dfc9684535`. The merge `be4b2ea` (main `e53677e` into the lane) is verified,
and so is the round-10 size-M density patch `b6256e9`. Every output file below is in this folder.

## What round 11 fixed

| # | Problem found | Cause | Fix (commit) |
|---|---|---|---|
| 1 | "Key after each page" left letter B out of a More Practice printout. The short key headed the letters "Page 1/2", not "Practice A/B" | The merge's `mergeLetterSheets` copied only letter A's `pupilPages` / `keyPages` / `keyPlans`, and `arrangeKey` reads these | Every letter's per-page lists are joined and renumbered (`985a861`). New gate: `tests/scripts/ws-key-letters.cjs` |
| 2 | `key-options` failed with 132 alignment findings: given text was printed in key ink | The lane's legacy ringed option (D1) and its parity cross wrapped printed text in an element the pupil page lacks, and the merged INK-31 tagging inks such elements | The ring goes on the option itself (`985a861`). An odd number sits in the cross's box on the pupil page too (`80b244e`) |
| 3 | CL-40 at More Practice L: missing_mult_div "55 ÷ ☐ = 11" sat under a two-digit tab, and a counting_all picture ran into the tab | (a) The keep-out square of a w2 tab is 8.4 mm, and the digits' glyph box rises above the line box. (b) A count picture 2 mm wider than the room was centred, so it spilled into the keep-out | (a) An equation under a w2/w3 tab gets the keep-out + 1.5 mm as its top inset. (b) The count picture is safe-centred (`8b4cae7`) |
| 4 | CL-40 at M in the full kit lint, which had never run at M: number_seq_fill and select_even_odd | A strip too wide for the room right of the keep-out, and "100" rising into tab 10's square | Step-right cells are safe-centred. A parity sort under a w2/w3 tab steps right. At M and L every labelled sequence strip steps down onto the bottom padding, so the strips stay level (`add1788`) |
| 5 | number_families_add M printed 9 at fill 0.826, under the critic's ≥ 0.85 check for D8-3 | The rows were capped at their content height, which left a 17 % strip | The number families take the owner page ceiling (`PAGE_CAP`: +/− 12/9/6, ×/÷ 8/9/6). Their rows now share the grid: fill 0.985 (`327a9c2`) |
| 6 | ws-share-options failed: "17×1" and a null preview body | (a) The CL-9a tab numbers ran into the parsed "7 × 1". (b) The preview frame was read between two builds | The test drops `[data-ws-label]` before it parses, and waits for `#tvStage` ready. This makes the test stricter, not looser (this round) |

All CSS changes are additive (`css/sheet-kit.css`, at the end of the file). No lint rule was loosened.

## Gates on the final tree

| Gate | Result | Output |
|---|---|---|
| ws-boot-smoke | OK | `r11-boot.txt` |
| ws-layout-unit | OK (564 assertions) | (run in the foreground) |
| ws-print-lint `--self-test` | OK (59 assertions, 47 planted defects) | `r11-lint-selftest.txt` |
| ws-sheet-determinism S / M / L (sweep and single build) | OK, OK, OK; lane-16 sweep at M also OK | `r11-determinism-{S,M,L}.txt`, `r11-determinism-lane-M.txt` |
| ws-sheet-timing S, M, L (pools, both roles, 20 seeds) | OK (worst max 4.24 s, longest task ≤ 0.71 s) | `r11-timing.txt` |
| key-options (answer-key options) | OK | `r11-key-options.txt` |
| ws-key-letters (new: key options through buildSheet for MP letters, pools, multi-page IND, S/M/L) | OK (105 cases) | `r11-key-letters.txt` |
| ws-print-lint kit, 16 lane skills, Independent, `--seeds 10`, S / M / L | 0 / 43 each | `r11c-lint-lane-ind-{S,M,L}.txt` |
| ws-print-lint kit, 16 lane skills, More Practice `--letters A,B --seeds 10`, S / M / L | 0 / 43 each | `r11c-lint-lane-mp-{S,M,L}.txt` |
| ws-print-lint kit, FULL (family redone), `--seeds 10`, M (first run ever at M) / S / L | 0 / 281 each | `r11c-lint-full-{M,S,L}.txt` |
| Focused lint: families and pools after PAGE_CAP, S/M/L, both roles | 0 everywhere | `r11-lint-families.txt` |
| ws-screen-answer, 16 lane skills | OK | `r11-screen-answer.txt` |
| ws-screen-slots (609 skills, 2436 renders) | OK (0 doubled, 0 paper verbs) | `r11-screen-slots.txt` |
| ws-share-options | OK (after fix 6) | `r11-share-options.txt` |
| ws-code-snapshot | OK (608 codes, 35 categories, nothing moved) | `r11-code-snapshot.txt` |
| ws-content-audit, 16 lane skills | OK | `r11-content-audit.txt` |
| `node --input-type=module --check` on every modified module | OK | |

## Round-8 defects and round-10 items: status

These come from the probe `r11-density-probe.txt` / `r11/r11-density.json`, and from the families and keep-out reruns. Each probe page is a printed page at seeds 1–10, both roles, at S, M and L.

| Item | Status |
|---|---|
| D8-1 mult_comparison L text into the tab | **Closed.** The story starts 1.0 mm right of the tab (CL-40 edge). The lint's CL-40 rule is clean at S/M/L in both roles |
| D8-2 dot_array_mult over the owner target | **Closed.** S 8 (More Practice 6–8), M 6, L 6, fill 0.98 on every page |
| D8-3 number_families_add M | **Closed.** 9 in 3 × 3, fill 0.985. number_families_mult M is also 9 at fill 0.985 |
| D8-4 missing_add_sub Independent M strip | **Closed.** 16 in 2 × 8 at fill ≥ 0.915 (was 18 at 0.71) |
| D8-5 CL-40 near misses (remainder_interpret M, mixed_multiplication M) | **Closed.** Text starts at the 1 mm keep-out edge, and the lint is clean |
| counting_all unlabelled item | **Closed.** 0 unlabelled cells on 90 pages (S/M/L, both roles) |
| Lone area model (mixed_multiplication L) | **Closed.** L-DENSITY HOLE is 0 in the lane and full lints at 10 seeds |

## Open

- **mixed_multiplication S Independent fill:** the lowest page fill is 0.813 (seeds 1–10). That is above the pool's floor of 0.81, but under the 0.82 that round 8 measured. **Critic round 9** should judge it.
- **remainder_interpret L** prints 2 long story cells a page. Round 8 graded this as a pass.
- **The Print screen builds its preview twice on open:** the frame reloads after the first build. Main (`e53677e`) does it too, but its build finishes sooner. Not in lane.
- **`OWNER-REQUESTS-2026-10-16.md`** (area-model edge boxes, division problem form, mixed choices) is queued for the round after r11. It is not built here.
- **Critic round 9** has not been run. `ws-stamp-assets` is due before deploy (main session).
