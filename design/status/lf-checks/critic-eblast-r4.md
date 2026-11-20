# Critic eblast r4: role-ceiling drift check and per-role blocking allow-list

Independent critic, Opus medium, 2026-11-20. Graded `git diff 089a37939..3714ea89d` (branch
claude/sweet-newton-c8wrv1-lf-tools-eblast). Round 4.

## Verdict: FAIL (C2 7). r3 G1 is fixed. The new pin is not run by any gate against the merge base.

| Criterion | Score | Why |
|---|---|---|
| C1 correctness | 8 | The drift parser, `eblastMode`, `blockingOf` and `pinLost` are right. One defect: `--pin-check` passes when the base cannot be read (P2). |
| C2 checks prove it | **7** | Drift is proven on both the precritic and deploy paths. The pin is proven only against a hard-coded base, on the deploy path only. The live merge-base `--pin-check` runs nowhere (P1). |
| C3 no collateral | 9 | No false red on a listed role: 3 skills × 4 judged roles. The builder's 32-skill sweep has 0 reds outside pre-skill-check. |
| C4 clarity | 8 | The messages are clear: they name the role, size, both values and the file, and the declared ceiling (N1 fixed). Two weaknesses: the seeding note says "green" for roles that are never judged (P3), and the CHECKS_FROM_CRITICS "Where it runs" cell is wrong for these two checks. |

## What I ran

- `ws-empty-band --self-test`: OK (r4 drift 4, blocking 5, pin 4). `--capacity-check`: OK (17 roles, 32 passed skills).
- **Drift mutation.** I copied mixed-practice.js to scratch with `MAX_SHELVES` L 5 changed to 6 and ran `--capacity-check --role-src`. Result: `FAIL mixed-practice L: role-capacity.js says 5, <file> MAX_SHELVES says 6`, exit 1. It names the role, size, both values and the file. I also renamed reason-it's `ROWS`: the check FAILs with "declares no ROWS", so it fails closed.
  All 8 copied constants are covered by `ROLE_CONST`. The by:'fixed' and by:'teacher' entries have no role constant to compare against.
- **Blocking vs advisory** (`--html`, no `--eblast-block`):
  - test-pg23.fail.html (test, listed) gives `ws-empty-band: FAIL (1)`, exit 1.
  - pre-skill-check.fail.html and cap-parity.fail.html (pre-skill-check, not listed) print `ADVISORY` and exit 0.
- **Spot-check** with `--page-fill --hosts none`, roles test, review, mixed-practice and true-false, on sub_100_no_regroup, add_facts and add_wp_10. EB-LASTPAGE and CAP-PARITY PASS on all three skills. Test and true-false sit at their declared L ceilings. Review and mixed-practice L pages are full.
  - Unrelated to this change: sub_100_no_regroup shows `EB-SIDE FAIL 30` in that run. EB-SIDE is untouched by this diff, and I did not check whether the baseline covers it.
- **Pin mutation.** I dropped 'review' from a scratch copy of the gate.
  - With `--base a2fddf4c7`: FAIL, "lost 'review'", exit 1.
  - With the default base (merge-base with origin/master, 65c28ccdf): OK, "has no list".
  - With `--base nosuchrev`: OK, exit 0 (P2).
- `ws-backtest --row` on the 9 eblast rows (the 7 from r3 plus `eblast-role-capacity-drift` and `eblast-blocking-pin`): 9/9 OK.
- `ws-precritic-plan --checks-from-critics`: see the run note at the foot.

## P1 (C2, must fix): nothing runs the merge-base pin

- `ws-precritic.cjs` runs neither `--pin-check` nor `--capacity-check`, and it does not run ws-empty-band's `--self-test` either. Its self-test loop covers copy-light, drawing-key, role-cover and drawing-variants.
- `ws-deploy-gates.sh` reaches both checks only through `ws-backtest --kind fixture`. On that path:
  - Drift is checked on the live tree, because the row's pass state reads every real role file. This is good.
  - The pin is checked only against the fixed `a2fddf4c7`. It protects the 16 seeded roles and nothing added later.
- The failure the row names is "a silently dropped gate". It comes back the first time a role joins the list (pre-skill-check, after its fix). Dropping that role later would fail no gate.
- The CHECKS_FROM_CRITICS cell "precritic (empty-band --page-fill), deploy" is wrong for both new rows. `--page-fill` never calls `capacityCheck()` or the pin.

Fix:
- Add a node gate `ws-empty-band --pin-check` (default merge-base) to precritic's always-run checks and to `ws-deploy-gates.sh`.
- Add `--capacity-check` as well, or ws-empty-band's `--self-test`, which calls it.
- Correct the two "Where it runs" cells.

## P2 (C1, should fix): the pin fails open

If `git merge-base` or `git show` fails (a bad `--base`, a shallow clone, no `origin/master`), `src` is null and the pin reports OK with "has no list".

Fix:
- A base that cannot be resolved should FAIL.
- Only a base that resolves but whose copy has no markers should be OK.
- Add a self-test case for each.

## P3 (C4): 8 of the 16 listed roles are never judged

- **EB-LASTPAGE** judges only `FIXED_CAP_ROLES`: pre-skill-check, true-false, reason-it, error-analysis and test.
- **CAP-PARITY** judges only roles declared by:'role': guided, error-analysis, review, test, pre-skill-check, mixed-practice, true-false, reason-it and word-problems.
- So independent, more-practice, stretch, scripted-model, opener, lesson, fact-probe and fact-rows are listed, but neither rule can ever go red on them. The brief named only scripted-model and fact-rows.

Listing them is harmless, but the seeding comment and the status say "every role green on all passed skills". Those 8 roles are not judged at all, so the reader cannot tell that their entries block nothing. One line beside the list should say which listed roles are judged by which rule.

## Pass condition for r5

P1 and P2 fixed, each with a backtest or self-test case:
- a dropped later-added entry FAILs against the merge base;
- an unresolvable base FAILs.

Both checks must be on the precritic and deploy paths. Add the P3 note. No re-grade of C3 is needed.

## Run note

`ws-precritic-plan --checks-from-critics`: OK (353 pass, 90 exempt, 0 fail).
