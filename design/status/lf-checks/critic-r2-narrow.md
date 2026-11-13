# Critic r2 (narrow): PR #47 (lane lf-checks), 203a4052..aa214cc46, graded at aa214cc46 (frozen; first pass at 5b4c61ac5)

Independent critic, Opus medium, 2026-11-13 (resumed after the usage stop). Worktree /tmp/claude-0/wt-r2c (and wt-r2c-base at 203a4052), both removed at the end. Browser runs went one at a time through /tmp/mq-browser-run.sh. Probes are in the critic's scratchpad. No tracked file was edited except this report.

**VERDICT: PASS.** C1 9 · C2 8 · C3 8 · C4 8. Four minors, none below 8.

## Evidence (runs)
| Run | Result |
|---|---|
| `node --check` / `--input-type=module --check` on the 7 changed JS files | OK |
| `ws-empty-band --self-test` | OK (22 rules/cases with a row; ebitem / slot-ink notes 13; ebItemOf 7) |
| `ws-screen-answer --focus-gap-self-test` | OK (12 cases + 3 ink calibrations) |
| `--focus-gap-html` on the 4 new fixtures | below-1px FAIL 1 px, below-clear OK, wrap-1px FAIL 1 px "wer once", wrap-clear OK ✓ |
| `ws-backtest --row` the 5 new rows | 5 PASS (48 s) |
| `ws-precritic-plan` | OK (150 rows on the lane's path); `--checks-from-critics` 48 pass / 22 exempt / 11 fail, none an lf-checks row (WARNING only, header date) |
| **Probe p1:** ONE line under the ring, "wer" (x-height) under the ring and "Tall" on the same line ~40 px to its right, outside the ring's span; ink 5 px clear | **FAIL "0 px"** ✗ (the line's metrics include "Tall"'s ascenders; m1 below) |
| `ws-empty-band --skill placevalue:unit_form,multiplication:arrays_groups,division:div_facts --sizes M --hosts none --no-baseline`, 203a4052 vs 5b4c61ac5 | both FAIL (246), 51 renders / 601 cells; EB-SIDE 153 = 153. **No EB-SIDE (between) finding on any real print page** ✓ (no false alarm). Diff: only the new slot-ink notes and EB-ITEMKEY / EB-ITEMPARITY PASS |
| The same 3 skills, `--roles independent --only EB-SIDE` with the 3 screen hosts, both trees | both FAIL (18), identical; no (between) finding ✓ |
| **buildSheet parity probe** (5 skills × 5 grid roles × S/L, key on, seed fixed), 203a4052 vs 5b4c61ac5 | **50 of 50 pupil pages and keys byte-identical** ✓: the `ebItem` switch and `ebItemOf` change nothing in a normal build; 0 `data-eb-partial` emitted; pupil with key on = key off, 50 / 50 (the tool's switch to `key: grid` measures the same pupil page) |
| `ws-screen-answer --focus-gap-all`, 203a4052 vs 5b4c61ac5 | both OK, 37 skill rows × card / worksheet / quiz, 0 FOCUS-GAP findings, output byte-identical: no new false alarm or miss on live hosts ✓ (p1's class does not occur on today's hosts) |
| `ws-backtest --row` the 41 other rows calling ws-empty-band or ws-screen-answer (4776 s; shared slots) | 37 PASS, 2 FAIL, 2 PENDING. FAIL: eb-fact-roles (known, facts lane) and guided-tight-rows (known, routed to lf-roles), as the lane listed. PENDING: eb-foot-gridcols-patterns, eb-foot-review-add-facts (as before). eb-r7 m2's rows (eb-vocab-match3-guided, vocab-r9-gdpcap) now PASS ✓ |
| **Widened scope at aa214cc46** | |
| (a) `git diff --stat 5b4c61ac5 aa214cc46 -- tests/` | only backtests.json (+1 row), ws-role-raster.cjs, ws-grade-render.cjs, ws-precritic-plan.mjs, ws-precritic.cjs: the three reverts take the ink-size work out cleanly; outside tests/ only the ledger, the status file and this report ✓ |
| (b) `ws-grade-render --raster-self-test` | OK (6 cases, 7.5 s) |
| (b) `ws-backtest --row rr-clip-npr-model-l,no-dropped-row` | 2 PASS. rr-clip: FAIL 16.5 s at 47b1f2a86, OK 15.5 s at 7c1e3dbb4 |
| (b) false positives: `--raster-fit` on addition:add_facts and placevalue:unit_form × scripted-model, guided × S/M/L, `--keep-pdf` | OK, 12 role sheets / 24 PDF pages, no finding ✓. 111 s for both skills (about 9 s a sheet, about 55 s a lane skill on precritic --skill). The grey text is #949494 (148), read as ink; the key's answer colour is #c2410c |
| (c) no-dropped-row at aa214cc46 (36 commits behind master) | "295 row ids in the fork point (203a4052e), 301 here: none dropped" ✓. At 5b4c61ac5 (the master-tip baseline) the same tree read "13 DROPPED" ✓, the bug |
| (c) a genuinely dropped row (eb-fixture-band removed by hand, then restored) | `FAIL (no-dropped-row: 1 ... eb-fixture-band)` ✓ |
| `ws-precritic-plan` at aa214cc46 | OK (151 rows on the path; self-test 48 cases). `--checks-from-critics`: 49 pass / 23 exempt / **13 fail** (11 at 5b4c61ac5; m2) |
| `ws-boot-smoke` | OK |
| facts pin `--skill add_facts,mult_facts,div_facts --vocab-ink --page-fill` | OK (276 renders, 2555 cells, 828 within the pin, 497 s); 0 multi-item / partly-indexed / unmeasured notes, which supports the m4 exemption |

## Verified
- **FOCUS-GAP per line (eb-r7 m1):** both fixtures and the self-test read right. `--focus-gap-all` is byte-identical before and after, with 0 findings on 37 skills × 3 hosts. No new false alarm or miss on live hosts.
- **EB-SIDE (between) (eb-r7 m5):** u3 FAILs. On 3 skills it raises 0 new findings on real print pages and on 3 screen hosts, so there are no false alarms.
- **The buildSheet `ebItem` switch:** 50 of 50 normal builds are byte-identical to 203a4052, pupil and key. Key on or off does not change the pupil page.
- **EB-ITEMKEY and EB-ITEMPARITY** run on every grid role of a real `--skill` run and PASS. The fixtures FAIL and PASS as they should.
- **EB-FOOT (ebitem m1, m2):** no silent fallback; partly indexed cells are noted (self-test).
- **The exemptions are honest.** eb-r7 m3, ebitem m1 and ebitem m2 are note lines with no verdict, each held by named self-test cases. eb-r7 m4 is a real limit, stated in the tool, and the pin shows no live multi-item cell. The owner and lead-deploys rows name the built sweep and `no-dropped-row`. The baseline-fix exemption is the thinnest (m4 below).

## Defects (all minor)
- **m1 (C2) FOCUS-GAP still reads a whole LINE's metrics, not just the glyphs under the ring.** Probe p1: one line, "wer" (x-height) under the ring and "Tall" about 40 px to the right of the ring's span, ink 5 px clear. It reads **0 px** (a false alarm). It does not occur on today's hosts. **Check:** in `lineText`, keep only the characters that overlap the ring horizontally, and add a self-test case for "ascenders beside the ring, same line, 5 px clear: no finding".
- **m2 (C3) Ledger regression at aa214cc46.** CHECKS_FROM_CRITICS.md lines 106 and 107 re-add the OLD "pending" copies of the owner row and the lead-deploys row. Lines 104 and 105 already hold the exempted versions. The sweep now fails 13 rows, up from 11, and the lane did not notice. **Check:** the sweep flags duplicate rows (same date, owner and finding) and compares its FAIL count with the merge base, so a lane cannot add new FAIL rows.
- **m3 (C1) RR-CLIP threshold gap.** Text is skipped only above 230, but pixels count as ink only below 200. A span in light grey (between about #c8c8c8 and #e6e6e6) is judged but can never be inked, so it is a latent false RR-CLIP. **Check:** skip spans lighter than the ink threshold (or derive the threshold from the span's colour), and add a self-test PDF with one #d0d0d0 line.
- **m4 (C3) The baseline-choice fix has only an exemption, no test.** The merge-base logic is untested: `no-dropped-row` proves only the `--rows-before` path. **Check:** a pure `baselineRef(mergeBase, tip)` with a self-test, or a self-test on a planted two-branch git repo.

## Scores
- **C1 9:** every changed verdict reads right on fixtures and real pages. EB-SIDE (between) and per-line FOCUS-GAP add no false alarm live. The parity holds 50 of 50. RR-* catches F3 and is clean on 2 extra skills. no-dropped-row behaves correctly both ways.
- **C2 8:** one probe-only FOCUS-GAP false alarm (m1); RR-CLIP has a latent grey gap (m3).
- **C3 8:** self-tests, the plan, the 7 new rows and 37 of 41 old rows are green; the 2 reds are known and routed. m2 and m4 are open.
- **C4 8:** the notes name their modes. The runtime is stated (raster about 9 s a sheet; the empty-band pin is 497 s because grid roles are built twice). The duplicated ledger rows (m2) make the ledger misleading.
