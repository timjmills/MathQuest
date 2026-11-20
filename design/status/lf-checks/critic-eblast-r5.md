# Critic eblast r5: pin and capacity checks on the gate paths, fail-closed pin, judged-role note

Independent critic, Opus medium, 2026-11-20. Graded `git diff 7545ca805..HEAD` (head c008fe4e5, merged with master
e487f8f9a; branch claude/sweet-newton-c8wrv1-lf-tools-eblast). Round 5, narrow, against the r4 pass condition P1-P3.

## Verdict: PASS (C1 9, C2 8, C3 9, C4 8)

| Criterion | Score | Why |
|---|---|---|
| C1 correctness | 9 | `--pin-check` now fails closed: an unresolvable or unreadable base prints FAIL with the base and the git error, exit 1. A base that resolves to a copy with no markers is still OK. |
| C2 checks prove it | 8 | Both checks are on the precritic plan (every run) and in deploy session 1. Backtest rows prove the dropped entry and the fail-closed base. There is no `--self-test` case for P2 (r4 asked for one); the commit-pair row covers it instead. |
| C3 no collateral | 9 | The ws-empty-band change touches only the pin's catch. The precritic and deploy additions are two node gates, under 1 s each. The t15 files in the diff come from master's merge, not this lane. |
| C4 clarity | 8 | The P3 comment is accurate. The two CHECKS_FROM_CRITICS "Where it runs" cells are corrected, and a new ledger row records r4. |

## What I ran

- `ws-precritic --skill addition:add_facts --dry-run`: lists `[node] ws-empty-band --pin-check` and `[node] ws-empty-band --capacity-check`.
- `ws-deploy-gates.sh --list`: session 1 has both as node gates. Both are UNTIMED, which is a budget warning only.
- `--pin-check --base deadbeef0`: FAIL, "cannot be resolved or read: … git show deadbeef0:…", exit 1.
- Plain `--pin-check`: OK. It reports 16 roles and that the merge-base e487f8f9a has no list, exit 0.
- `--capacity-check`: OK (17 roles, 32 passed skills).
- `--self-test`: OK.
- `ws-backtest --row eblast-pin-dropped-entry,eblast-pin-fails-closed`: 2/2 PASS (FAIL then OK). It was run directly, not through mq-browser-run.
- `ws-backtest --row eblast-advisory-fixture,eblast-role-capacity-drift,eblast-blocking-pin`: 3/3 PASS.
- **P3 comment vs code.**
  - `FIXED_CAP_ROLES` (line 142) is exactly pre-skill-check, true-false, reason-it, error-analysis and test.
  - The `by:'role'` entries in role-capacity.js are exactly guided, error-analysis, review, test, pre-skill-check, mixed-practice, true-false, reason-it and word-problems.
  - The other roles are independent and more-practice (by teacher), stretch, scripted-model, opener, lesson and fact-probe (by fixed), and fact-rows (by table).
  - That makes 8 of the 16 listed roles that neither rule judges. The comment says exactly this.
- `ws-precritic-plan --checks-from-critics`: OK (445 rows: 355 pass, 90 exempt, 0 fail).

## Notes (not blocking)

- **N1.** The live pin protects nothing until this lane reaches master, because the merge-base has no list yet ("has no list"). This is inherent to a merge-base pin. After the merge, every later branch is pinned.
- **N2.** The `eblast-pin-dropped-entry` row pins base 4292106c4, a lane commit. If the lane were squash-merged, that commit would stop being reachable and the row would ERROR. Re-point it to the master merge commit after the deploy train.
- **N3.** A precritic gate whose flag disappears from the script shows `SKIPPED-NOT-BUILT` rather than FAIL (`needFlags`). This is the existing pattern for every flagged gate, but the deploy node gate would still go red.
- **N4.** The two new backtests.json rows use 1-space indentation, while the file uses 2. This is cosmetic, and the JSON parses.
- **N5.** P2 asked for self-test cases. A `--self-test` pair (a bad base gives FAIL; a resolvable base with no markers gives OK) would make the gate self-proving without git history.

## Automatic checks this round would add

None needed. The r4 findings are each closed by a gate that runs on every precritic run and deploy session 1.
