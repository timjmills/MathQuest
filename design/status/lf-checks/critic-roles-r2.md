# Critic: precritic --skill role cover, round 2

Independent narrow critic (Opus medium), 2026-11-14. Graded `git diff ac526b6b2..5e8ac3b56` on
claude/sweet-newton-c8wrv1-lf-tools-roles, against round 1 (critic-roles-r1.md, D1-D3).

## Verdict: PASS (C1 8, C2 9, C3 8, C4 9)

| Criterion | Score | Why |
|---|---|---|
| C1 coverage correctness | 8 | D1 closed: page-vocabulary signature on buildSheet output finds the buildSheet-drawn supports; the gaps left are option combinations and multi-page packets (N2, N3), not single values |
| C2 checks prove it | 9 | 6 rows PASS with real fail states; wrapper pass side can now fail, and that is tested |
| C3 no collateral damage | 8 | self-tests green, checks-from-critics 197 pass / 14 fail (none dropped); add_facts role cover 18.2 -> 92.6 min slot (~46 min wall) |
| C4 clarity | 9 | every dry run (copy-light too) prints the variant list, size and minutes; status note states the cost |

## What I verified

- **D1.** `--skill addition:add_facts --dry-run`: 17 card roles (guided among them) + 8 of 30 variants
  [notation=across, support=touch, boxsign, touchall+tile+frame+line, touchall, tile, frame, line]; 3 shards
  (102/102/98 lint units). `supportArgs` passes `--supports <v>` to print-lint, so L-SUPPORT runs.
  Other skills: sub_facts gets 6 variants (support=touchall is judged the same as touch, frame the same as tile, because
  their page vocabularies are identical); div_facts gets 8 (touch, boxsign, skip, think, 4 divForm values). Every value
  that changes the independent page gets a row. Planning takes 0.2-0.6 s a skill.
- **Probe (independent, M, seed 7000, 1 page): is it enough?** For single values it is, with one small exception.
  `fact-rows.js:156` reads `opts.constant` only on the Fact rows role: a one-value constant changes the title
  ("Add 7" instead of "Addition facts"). The independent probe masks numbers, so all 15 `constant` values read as
  defaults. That is title text, not a new drawing kind, so the risk is low. `divForm` is also read only by fact-probe and
  error-analysis, but it changes the independent page too, so it is caught. Not role-only, but missed: N2, N3.
- **D2.** expect-e3-e5-e6.sh re-states the result only with `--expect-e3e5e6`. Without that flag, OK requires the run
  itself to be OK and none of E3 / E5 / E6 to appear. `--check-wrapper` plants an unrelated FAIL and checks it stays FAIL.
  `ws-backtest --row role-cover-cbt-e3-e5-e6`: PASS (FAIL 34.0 s / OK 16.2 s). Row role-cover-e3e5e6-pass-can-fail: PASS.
- **D3.** `--copy-light --dry-run` prints `role cover:` and `role cover size: 302 + 272 + 302 ... est 92.6 min ...
  ~46.3 min wall` before the copy-light verdict. Row precritic-copy-light-role-cover-size: PASS.
- **Rows.** role-cover-buildsheet-variants PASS (1.2 / 2.0 s); precritic-role-cover-plan PASS; browser row
  role-cover-add-facts-guided-frame PASS (14.1 / 11.6 s; its pass side greps for L-SUPPORT SCC-T10 on guided@L).
- **Gates.** precritic --self-test OK (role-cover 18 cases); ws-role-cover --self-test OK, including a live check that
  add_facts support=frame is a variant. `ws-precritic-plan --checks-from-critics`: 197 pass, 48 exempt, 14 fail (same 14
  as round 1, none dropped).
- **Runtime.** It is stated clearly in the dry run and in the status note, together with the cut the builder offers
  (raster at L only). About 46 min of wall time for every fact skill with supports is acceptable for a pre-critic gate,
  but it is the lead's budget call. The 0.2-0.6 s of planning time is negligible.

## Notes (not scored; for a later round)

- **N1** (from r1): a number masked as a whole still hides a value that only widens numbers. Not addressed.
- **N2: combinations.** Variants are single deviations from the defaults. div_facts support=array reads "defaults"
  because at the default band (and at band=100) the largest dividend is over DIV_ARRAY_MAX, so the array is never drawn.
  The array is only drawn with a small `constant`, a combination the planner never makes. The same holds for
  mix=problem and cover=needed: each only changes the page when supports are chosen.
- **N3: multi-page.** cover=fade only acts when pages > 1 (print-sheet.js 1562, 1612). The one-page probe reads it as
  defaults.
- **N4.** The single-role title reading (`constant` on Fact rows), described above.
- **N5.** sub_facts frame == tile (and touchall == touch) on the independent page vocabulary. Sharing one row is right
  only if those values also look the same on the other roles. Not checked here.

## Next lane
N2 and N3 are combination and multi-page classes. They can be closed with a card-named combination list (§7a option
lines), or with a probe at pages=2 and at each support crossed with the minimal `constant`.
