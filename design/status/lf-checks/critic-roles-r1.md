# Critic: precritic --skill role cover (ws-role-cover + ws-drawing-variants), round 1

Independent critic (Opus medium), 2026-11-14. Graded `git diff 22752843c..1ca7d777a` on
claude/sweet-newton-c8wrv1-lf-tools-roles. Builder's note: design/status/lf-checks.md "2026-11-14".

## Verdict: FAIL (C1 6, C2 7, C3 8, C4 8)

| Criterion | Score | Why |
|---|---|---|
| C1 coverage correctness | 6 | Roles x M/L are right; drawing variants miss every option drawn in the buildSheet layer (D1) |
| C2 checks prove it | 7 | Both backtests PASS and the role cover finds E3 / E5 / E6; the E3/E5/E6 pass state cannot fail (D2); no backtest for variant selection |
| C3 no collateral damage | 8 | Gates green, checks-from-critics 193 -> 194 pass (same 14 fail), +~47 min wall a skill, stated |
| C4 clarity | 8 | `FAIL lint cat:skill#role@size~opt=value: rule xN - msg` is clear; doc claim on supports is wrong (D1), copy-light dry run prints no size (D3) |

## What I verified

- Roles: count_by_tables on 8f76b6401 (card count-row.md) plans its 13 offered roles (the 4 hidden roles left out); on
  this tree (no card) all 17 buildSheet roles; add_facts the facts card's 17. Sizes M and L. Matches card / ws-card-plan.
- "Already rendered by another row" holds: lint independent + lesson at L and M (rows print-lint-kit, -M, -lesson-L, -M),
  empty-band on the card roles (or ws-empty-band's DEFAULT_ROLES, identical to EB_DEFAULT_ROLES) at M,L, raster
  scripted-model + guided at M,L. Lint pins only hold `#lesson` docs, so no red role is hidden by a pin.
- `ws-backtest --row precritic-role-cover-plan`: PASS (FAIL 0.8 s / OK 1.6 s).
  `--row role-cover-cbt-e3-e5-e6` (via the runner): PASS (FAIL 151.7 s / OK 14.8 s). Direct run on 8f76b6401, lint on
  opener, error-analysis, scripted-model, independent at M,L: E3 (scripted-model@L L-OVERLAP SECTION), E5 (opener@M/L
  CL40-INK), E6 (error-analysis@M/L CL-4b) named, plus AK-2 on scripted-model; independent clean. 0.6 min.
- `--dry-run` states the size and minutes: count_by_tables here 302 + 288 + 302 units, 3 shards of ~30-32 min, 93.9 min
  slot / ~47 min wall; add_facts 2 shards, 18.2 min. Shards go through /tmp/mq-browser-run.sh; row timeout 90 min > shard.
- precritic --self-test OK (role-cover 14 cases, drawing-variants OK); ws-no-phone-width OK; ws-no-size-s OK.

## Defects

**D1 (C1, major) - options drawn by buildSheet are judged "same as defaults", so their drawings are never role-covered.**
ws-drawing-variants signs a value from `generateQuestionFor` + `kitCellSpec` + `renderCell` only. Supports (touch,
touchall, tile, frame, line, boxsign), and likely `cover` and `mix`, are drawn in js/modules/print-sheet.js (o.support,
lines 151-1658), so all 6 support values read "defaults" and add_facts / sub_facts get "1 of 30". The note's "its supports
keep their own print-lint-supports rows" is not true coverage: those rows are independent, more-practice, test, review at
M only. Proven escape: `ws-print-lint --source kit --supports frame --roles guided --skills addition:add_facts` gives
**L-SUPPORT SCC-T10 major** (answer zone moves between cells, supports drawn) at L and at M; at defaults guided is clean.
No precritic --skill row renders guided with a support, so it reaches the critic. Same run: error-analysis CL-4b x8,
scripted-model AK-2 under frame.
Check that catches it: ws-drawing-variants signs each value on the BUILT page (buildSheet pupil HTML skeleton of one role,
e.g. independent, through the kit in node or one browser call), or treats any option print-sheet.js reads from `opts`
(a static scan for `o.<id>` / `opts.<id>`) as a drawing option; self-test case: add_facts support=frame must be a variant.
Backtest: this tree, add_facts, --plan must list a support variant (FAIL now).

**D2 (C2, minor) - the E3/E5/E6 pass state is unfalsifiable.** expect-e3-e5-e6.sh prints OK for ANY FAIL that lacks all
three findings, and the pass state runs that same wrapper, so a red Independent page still reads OK. Check: apply the
"all three visible" re-statement only on the fail args (e.g. a `--expect-e3e5e6` flag), let the pass state's own verdict
through; self-test the wrapper with a planted unrelated FAIL in the pass state.

**D3 (C4, minor) - copy-light dry runs do not state the role-cover runtime.** `--copy-light --dry-run` plans the
role-cover rows but returns before the `role cover size: ... est N min` line (ws-precritic.cjs ~1611-1621). Check: run
`ws-role-cover --plan-check` on the copy-light dry run in the precritic-role-cover-plan row (add a copy-light pass arg).

**N1 (note, not scored) - numbers are masked whole**, so a value that only widens numbers (band 20 vs 10, missing 100,
3-digit answers) is never a variant; a slot that fits 2 digits but not 3 on a non-Independent role at L would escape. Not
proven here; worth a size-class signal on the widest answer string.

## For the fix round
Rebuild at medium (failed a critic round). Fix D1 first: it changes the plan size of every fact skill (6 support values
x 17 roles x M/L), so re-measure and re-state the runtime and shard count.
