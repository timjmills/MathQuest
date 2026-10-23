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

## Gate map (§1.4 → this tool)
| §1.4 gate | Row | State |
|---|---|---|
| ws-node-lint | `node-lint` | runs (its own baseline) |
| ws-providers-unit --skill | `providers` | runs; N/A when the test has no item maker for the skill |
| ws-content-audit --skill | `content-audit` | runs; N/A outside the audited families |
| ws-options-verify --skill | `options-verify` | runs, compared with the pin |
| ws-presets-unit | `presets` | runs only when a skill is a preset or a preset's host |
| ws-coverage-matrix --skills | `coverage-matrix` | **SKIPPED-NOT-BUILT** (E1 queued). Until it lands, print-lint at S/M/L stands in for it (independent role only, not every kind × option) |
| ws-screen-slots --skills --baseline | `screen-slots` | runs. `--baseline` is not in the script yet (S5), so precritic compares its doubled-area and paper-verb lines with the pin itself and says so in the row |
| ws-screen-answer --skills | `screen-answer` | runs |
| ws-chromebook-fit --skills | `chromebook-fit` | runs |
| ws-code-snapshot, ws-boot-smoke | | run |
| --template: ws-panes-unit, the template's unit test, fixtures, ws-grade-render --template --contact-sheet | | planned (dry run checked on `function-table`, 4 skills) |
| --role: ws-grade-render --roles + ws-print-lint --roles on the role sample | | planned; the role pages are not pinned yet (see open items) |
| --teacher: shell, library, preview, quiz, wrm --grade --lesson, flows, tokens, plain-words | | flows and tokens are **SKIPPED-NOT-BUILT** |

The browser gates go through `/tmp/mq-browser-run.sh`. If that file is missing (a fresh container), precritic installs
it from `tests/scripts/mq-browser-run.sh` and checks Chromium, puppeteer, the proxy CA and PyMuPDF first (`pip install
pymupdf` is the fix it prints).

## Baseline provenance (all pinned 2026-10-23)
| File | Scope | Content | How |
|---|---|---|---|
| `print-lint.json` (W0-A) | 721 documents, size L, independent | 6614 findings in 384 documents | its `how` field |
| `print-lint.S.json` | the 20 role-sample skills + sub_100_no_regroup | 107 findings in 10 documents | `ws-print-lint --source kit --size S --skills <21> --report-only --json`, trimmed |
| `print-lint.M.json` | same 21 | 98 findings in 9 documents | the same with `--size M` |
| `options-verify.json` | same 21 | 292 failing (option, value) pairs | `ws-options-verify --skill <ids> --json` (via node, so values match `JSON.stringify`) |
| `screen-slots.json` | every live skill (723 skills, 2892 host renders) | 1 doubled answer area: `measurement:reading_ruler_hard` card (S9's known fix) | `ws-screen-slots --report-only` |

## Verification
- `node tests/scripts/ws-precritic.cjs --skill subtraction:sub_100_no_regroup` → exit 0, verdict `OK on 12 of 13
  gates; 1 SKIPPED-NOT-BUILT (not run, not passed): coverage-matrix; 1 N/A (ran, nothing to check): providers`.
- **Seeded failure.** Red ink (`style="color:#c00"`) on the operator sign in `sheet/cells/stack.js`, reverted
  afterwards. The run exits 1: the print-lint rows at L, S and M each FAIL with `L-INK INK-1: 0 -> 18 / 40 / 24`.
- A seeded emoji in the skill's label is not caught: the kit sheet does not print the label, so this is not a gap.
- `node --check tests/scripts/ws-precritic.cjs` and `node --input-type=module --check < tests/scripts/ws-providers-unit.mjs`
  both pass. `ws-providers-unit` without `--skill` is unchanged (OK, 105383 checks).

## Times
Times: precritic --skill subtraction:sub_100_no_regroup, final run — wall 171 s (2 min 51 s). Per gate: chromebook-fit 134 s, options-verify 35, screen-answer 17, screen-slots 9, print-lint L 7 / S 8 / M 8, content-audit 4, boot-smoke 4, node-lint 1, code-snapshot 1, providers 0. Two browser slots, no slot wait. The target was about 5–6 min; this run is under it.
Times: seeded-failure run (red ink in stack.js) — wall 170 s, exit 1.
Times: first run, before the S/M and options pins — wall 170 s, exit 1 (options-verify red, unpinned).
Times: pinning — screen-slots full sweep 22 min (12:57–13:19, one slot); options-verify on 21 skills 7 min 20 s; print-lint S and M on 21 skills about 3 min each.

## Open items (not silently passed; each shows in the table)
- `coverage-matrix` is SKIPPED-NOT-BUILT until E1 lands. When it lands it replaces the S/M/L print-lint rows, which only
  cover the independent page with default options.
- The S and M pins and the options-verify pin cover 21 skills. A lane whose skill is outside them gets a FAIL for any
  pre-existing finding at S or M, or in its options, until that skill is pinned with a STATUS note. Two fixes are
  possible: a full S and M sweep (about 1 h of slot time each, judging by L) and a full options-verify sweep, or the
  coverage matrix.
- The `--role` print-lint pages (`cat:skill#role`) are not pinned, so a `--role` run is red on any pre-existing finding
  on a role page.
- When S5 adds `ws-screen-slots --baseline`, precritic passes it the same pin and reads that flag's output. The parser
  for the flag's output was written before the flag existed, so check its regex when S5 lands.
