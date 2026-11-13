> **PARTIAL - NOT A VERDICT.** This critic was stopped by the weekly usage limit (2026-11-13) before it finished. Resume it after the reset (2026-11-19 22:00 UTC); do not read any score below as final.

# Critic r2 (narrow): PR #47 changes 203a4052..5b4c61ac5 (lane lf-checks), graded at 5b4c61ac5 (frozen)

Independent critic, Opus medium, 2026-11-13. Worktree /tmp/claude-0/wt-r2c. Browser runs one at a time through /tmp/mq-browser-run.sh.

**VERDICT: in progress.**

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
