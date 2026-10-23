# Wave 0 S1 — `ws-precritic` (status)

Branch `claude/sweet-newton-c8wrv1-wip-wave0-precritic` (no PR). Spec: `design/IMPROVEMENT_PLAN.md` §1.4 row S1 and
"What `ws-precritic` runs"; §1.7. Lead session_01HVwpAE3g6EZH8idgErP6LP.

## What was built
- Lane W0-A built most of the tool: commits ce202fcd (`ws-precritic.cjs`, `tests/fixtures/precritic/role-sample.json`,
  `ws-providers-unit --skill`, `ws-teacher-wrm --grade/--lesson`) and b1c50244 (the size-L print-lint pin, 721
  documents). They came from branch `…-wave0-precritic-seed`, merged here fast-forward on the lead's instruction.
- This session checked that work and finished it:
  - **print-lint at S / M / L.** The `--skill` row now lints the skill at all three sizes (§1.4: "at S / M / L"). Each
    size has its own pin: `print-lint.json` (L), `print-lint.S.json`, `print-lint.M.json`. A skill missing from a size's
    pin runs without `--baseline` at that size, so any finding there fails, and the row prints the command that pins it.
  - **options-verify against a pin.** `ws-options-verify` was red on the target skill (36 of 48 values: the number-line
    options `nl*` do nothing on `subtraction:sub_100_no_regroup`. This is a real defect and is now pinned, not hidden).
    Its rows are compared per (option, value) with `design/audit/baselines/options-verify.json`. A failing pair not
    in the pin is FAIL, and so is any failure on a skill the pin does not list.
  - **screen-slots pin** `design/audit/baselines/screen-slots.json`, from a full sweep of every live skill.
  - **The verdict wording.** A gate whose tool or flag is not in the tree is shown as `SKIPPED-NOT-BUILT`. It appears in
    the table and in the verdict (`OK on 12 of 13 gates; 1 SKIPPED-NOT-BUILT (not run, not passed): …`) and is never
    counted as passed. Without `--strict` the run exits 0; with `--strict` it exits 3. `N/A` rows (the gate ran, but
    there was nothing in scope to check) are named in the verdict too.
  - **Help and reruns.** `--help` prints the header. Every failing row gives its log path and the command that reruns
    that gate alone. The verdict names gates by id.
  - **The --role print-lint row** says how many of the role pages are not pinned. Print-lint names a role page
    `cat:skill#role`, and the pin holds only independent pages, so an unpinned role page must be clean.

## Current state (critic round 2 PASS at 4e7884a; later fixes D1, D5, D6)
Sections above describe round 1. This is the state now.

### Gate map (§1.4 → this tool)
| §1.4 gate | State |
|---|---|
| ws-node-lint | runs (its own baseline) |
| ws-providers-unit --skill | runs; N/A when the test has no item maker for the skill (the pilot skills have none) |
| ws-content-audit --skill | runs (`--category` when the scope is one category); N/A outside the audited families |
| ws-options-verify --skill | runs, compared with `options-verify.json`. A crash or an unexplained exit code is FAIL even when every failing value is pinned (D1) |
| ws-presets-unit | runs when a skill is a preset or a preset's host |
| ws-coverage-matrix --skills | **runs**, as a node gate with `--slots 2` (it takes its own slots), against `design/audit/matrix/baseline.json` |
| ws-print-lint --source kit at L / S / M | runs; duplicates the matrix's single/defaults row and is cheap |
| ws-screen-slots --skills --baseline | runs with the native `--baseline` (S5's `host:kind` format) |
| ws-screen-answer, ws-chromebook-fit --skills | run. chromebook-fit gets `--baseline` once `baselines/chromebook-fit.json` exists (S5) |
| ws-code-snapshot, ws-boot-smoke | run |
| --template | the `--skill` gates for every skill that draws the template on any seeded item; ws-panes-unit; a unit-test row and a fixtures row that always print (SKIPPED-NOT-BUILT or N/A, with the reason); ws-grade-render --template --contact-sheet |
| --role | ws-grade-render --roles and ws-print-lint --roles on the 20-skill role sample; the role is checked against sheet/roles |
| --teacher | shell, library, preview, quiz, wrm (`--grade` / `--lesson`), plain-words. flows and tokens are **SKIPPED-NOT-BUILT** |

The verdict counts every result type: `OK: 12 PASS (2 on the baseline), 1 N/A, 0 SKIPPED-NOT-BUILT of 13`. A crash,
a timeout (the gate's whole process tree is killed), a gate that checked 0 or too few items, and output the tool
cannot read are all FAIL.

### Baselines (all pinned 2026-10-23)
| File | Scope |
|---|---|
| `print-lint.json` (W0-A) | every live skill, size L, independent (721 documents) |
| `print-lint.S.json`, `print-lint.M.json` | the 20 role-sample skills + the six pilot skills (26 documents) |
| `options-verify.json` | the 20 role-sample skills + the six pilot skills |
| `screen-slots.json` | S5's pin from the full sweep (723 skills) and the dark / big-board sweeps |
| `design/audit/matrix/baseline.json` | 34 addition rows (E1) + 93 rows for the six pilot skills |

A skill outside a pin FAILs on any finding there: the print-lint rule (an unpinned document must be clean). The row
prints the command that pins it, and a pin needs a STATUS note.

### Verification at 4e7884a (critic round 2)
- `--skill subtraction:sub_100_no_regroup`: exit 0, 256 s (the matrix 255 s on 2 slots, chromebook-fit 146 s).
- A seeded no-regroup break in gen-operations.js: exit 1, content-audit and coverage-matrix FAIL.
- Seeded red ink in stack.js (round 1): exit 1, print-lint L/S/M FAIL.
- `--timeout 0.3`: the slow gates FAIL "timed out", and no process is left behind.
- 23 input-validation probes all exit 2.

### Open items
- Full S/M print-lint and options-verify sweeps (nightly), so skills outside the pins don't start red.
- The role pages (`cat:skill#role`) are not pinned, so a `--role` run is red on any pre-existing role-page finding.
- Critic r2 low items not fixed:
  - D2: screen-answer and chromebook-fit rows only check that each skill is named. S5 could print "checked N of M".
  - D3: content-audit trusts its own audited count.

## Round 2 (after critic round 1: FAIL, fidelity 6 / honesty 5 / usability 7)
- Critic r1 (mq-opus-medium) found 13 defect classes. The worst: a crash or timeout could show PASS; the timeout did not
  stop browser gates; a gate that checked 0 documents showed PASS; --template dropped skills silently.
- Fixer r2 (mq-opus-medium, a rebuild after a failed round) fixed all 12 code defects in 1f2174e:
  - A shared `judge()` makes any non-zero exit the parsed findings don't explain, or any timeout, a FAIL.
  - Timeouts kill the whole process group and its descendants.
  - Every gate's checked-count is compared with its scope.
  - Input is validated; `--role` is read from sheet/roles.
  - `--template` always prints its unit-test and fixtures rows.
  - The coverage matrix now exists (merged from wave0-gates, 0392cc7) and runs as a node gate with `--slots 2`.
  - ws-screen-slots' native `--baseline` is used, in S5's pin format (`host:kind`).
- **Pilot pins (lead's request; STATUS note).** All for the six pilot skills, subtraction sub_50 / 100 / 1k / 10k /
  100k / 1m _no_regroup:
  - options-verify: 36 inert nl* values each on sub_50, sub_100 and sub_1k (5f632ba; the speed-audit lane is fixing
    them in ws-options-verify, and these entries go when it lands).
  - print-lint S and M: clean.
  - chromebook-fit and screen-slots: clean.
  - **Coverage matrix:** `ws-coverage-matrix --skills <six> --baseline design/audit/matrix/baseline.json
    --write-baseline --slots 2` pins 93 rows run (201 listed: 84 PENDING, 24 N/A). Its red rows are pre-existing
    findings on these skills, mostly PG-12 overflow at S on the sections and mixed kinds, and H13 density. The pilot
    lanes inherit them as their starting line; any rise is FAIL.

Times: critic r1 18 min (13:35–13:53). Fixer r2 53 min.
Times: precritic --skill sub_100_no_regroup with the matrix on --slots 1: wall 440 s (the matrix 439 s; options-verify waited 244 s for a slot held by another session).
Times: precritic --skill <six pilot skills> with the matrix on --slots 1: wall 1593 s (the matrix 1592 s for 288 documents).
Times: coverage-matrix pin for the six on --slots 2: 757 s (93 rows × S/M/L).
Times: critic r2 11 min, PASS (fidelity 8, honesty 8, usability 8). precritic --skill sub_100_no_regroup with the matrix on --slots 2: wall 256 s (target 5–6 min: met).
Times: after D1/D5/D6, precritic --skill sub_100_no_regroup: wall 256 s, exit 0 (OK: 12 PASS (2 on the baseline), 1 N/A, 0 SKIPPED-NOT-BUILT of 13).
