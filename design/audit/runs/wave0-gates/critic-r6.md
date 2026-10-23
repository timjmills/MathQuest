# Critic r6: Wave 0 part A, the five precritic checks from the pilot-su-c critic r1

Critic: independent, mq-opus-medium. Round 6, 2026-10-23. Branch `claude/sweet-newton-c8wrv1-wip-wave0-gates` at b692dd23.
Scope: only the five checks added after r5 PASSED the rest of the lane:
- `ws-sibling-compare.cjs`
- `ws-slot-clip.cjs`
- `ws-phone-card.cjs`
- `ws-card-rulings.mjs`, run as `--check rulings` and as `--check offered`

Also in scope: their wiring in `ws-precritic.cjs`, the fixtures under `tests/fixtures/precritic/` and the five `*-pilot` backtest rows.
I edited no tracked file.

## Verdict: FAIL

| Criterion | Score |
|---|---|
| 1. Does what the lead asked | 6 |
| 2. The backtests are real | 8 |
| 3. Usable by a builder | 7 |

## What I ran

**Backtests.** `ws-backtest --row sibling-compare-pilot,slot-clip-pilot,phone-card-pilot,card-rulings-pilot,card-not-offered-pilot` gave **5/5 PASS** in 155 s. I re-ran each BAD and GOOD state by hand to read the reasons.

**Self-tests.** All four pass:
- `ws-sibling-compare`: 8 cases
- `ws-card-rulings`: 17 cases
- `ws-slot-clip`: 3 fixture pages
- `ws-phone-card`: 3 fixture pages

**Precritic.** `ws-precritic --skill addition:add_1k_no_regroup --browser-jobs 1` on HEAD finished OK in 1317 s:
- 15 PASS and 1 N/A.
- `card-rulings` and `card-not-offered` were SKIPPED (no rulings).
- `ws-slot-clip` took 1161 s of it.

**Why each BAD state fails** (b3948d88, the tree critic r1 graded):

| Row | BAD output | r1 defect | Reason correct? |
|---|---|---|---|
| sibling-compare | ABOVE `single/ex-group S L-DENSITY H13: ours 16, siblings max 0` | the lead's sibling-compare.txt line for this row (rule 0b; not a numbered r1 defect) | yes |
| slot-clip | 100 of 100 segments under 4.4 mm (narrowest 4.06 mm) at S on `sub_100`, and 240 of 240 on `sub_1m`; M and L ok | D3 | yes |
| phone-card | from 4 digits, FOCUS is on box 4 of 4 / box 6 of 6 (the leftmost); `sub_1m` has CLIP-X of 13 px at 390x844 and 17 px at 390x664; `sub_100` ok | D5 (focus and clip) | yes |
| card-rulings | R-ZERO-NOT-SEEDED: `sub_50` 55 %, `sub_100` 46 %, `sub_2d_1d` 29.7 % (bound 10 %) | D1 | yes |
| card-not-offered | `band` offered on all 7 skills | D6 | yes |

**Is GOOD a fair stand-in?** Yes. `good.patch` makes the critic's own written fixes for D1, D3, D5 and D6, and nothing else.

**Caveats on the backtests:**
- The sibling-compare GOOD state is one row at one size.
- It passes only because the default compares against the max over all 8 stack siblings: TY-11 12 against `add_1k_regroup` 14. Against the paired siblings (8) it would be ABOVE (see N1).
- No backtest covers a lane skill without a matrix pin. That is D1 below.

## Blocking defects

### D1. The sibling comparison never sees a new skill's rows

A new skill's red rows pass rule 0b unchecked.

**Where:**
- `tests/scripts/ws-sibling-compare.cjs:73` compares only `status === 'RED'` (or `OK` under `--all-rows`).
- `ws-coverage-matrix` `verdict()` (~l. 717) makes every row with findings and no pin `PENDING(no-baseline)`, never RED.
- `ws-precritic` passes no `--all-rows`.

**Effect.** For any skill without a matrix pin, the rows with findings are never compared with the siblings, and the row reads PASS "no red matrix row to compare". Today that is every live skill except the 8 in `baseline.json`, including the pilot's own preset `sub_2d_1d`. The pilot's pinned rows were also pinned by the lane itself, before its work.

**Reproduce 1: the r1 tree, the pilot's preset.**
- Command: `state-run --state pilot-su-c/bad.state.json -- node tests/scripts/ws-sibling-compare.cjs --root {root} --skills subtraction:sub_2d_1d --rows single/ex-group --sizes S --run-siblings`
- Result: `OK (0 red row(s) compared ...)`.
- The matrix run file shows that same row as `PENDING no-baseline` with S `L-DENSITY H13: 16` (siblings 0). This is the identical count that FAILs `sub_100` in the backtest.
- The lead's comparison listed 38 counts above the siblings for `sub_2d_1d`.

**Reproduce 2: HEAD, end to end.**
- Precritic on `addition:add_1k_no_regroup` gives `ws-sibling-compare PASS: no red matrix row to compare`.
- Yet the matrix had 11 `PENDING(no-baseline)` rows with findings.
- I relabelled those rows RED in a copy of the run file and gave it the precritic's own sibling run (`--sibling-run`). The result was `FAIL - 1 count above` (`single/ex-group S L-SIZE TY-11: ours 16, siblings max 14`).

**Reproduce 3: a synthetic row.** A `PENDING no-baseline` row with H13 50 against `add_100_regroup` gives `OK`.

**Fix.** Compare `PENDING(no-baseline)` rows as well. They printed and have no pin, so for rule 0b they are the lane's red. Better still, compare every printed row that has findings. Then add a `*-pilot` backtest on `sub_2d_1d`.

### D2. ws-phone-card FOCUS fails approved skills wrongly when the focused box moves

**Where.** `tests/scripts/ws-phone-card.cjs:81-82` picks "the ones box" as the rightmost box of the lowest row, within 2 px of the maximum `top`. The focused legacy box `input.column-answer-input.mq-active-box` sits 3-4 px higher than its row:
- `add_10k_regroup`: top 661 against 665
- `sub_1m_regroup`: top 418 against 421

So the probe's "want" becomes the second box from the right, and FOCUS fails while focus is on the ones box. The message contradicts itself: "answer box 1 from the right of 4; the ones box is 1".

**Reproduce on HEAD.** Run `/tmp/mq-browser-run.sh node tests/scripts/ws-phone-card.cjs --skills subtraction:sub_1m_regroup,addition:add_10k_regroup,subtraction:sub_100_regroup --items 1`:
- `add_10k_regroup` FAILs at 844 and at 664.
- `sub_1m_regroup` is ok at 844 and FAILs at 664 (it depends on the viewport and timing).
- My debug dump of the inputs is in the scratchpad, `critic6/dbg-focus.cjs`.

**Effect.** Every lane that touches a 4-6-digit regroup skill drawn by the legacy column twin (engine class (e)) is blocked by a false FAIL. The gate has no baseline or sibling escape.

**Fix.** Group rows by the input's row in the layout, not by its rendered top: for example the parent row element, or a tolerance of about half the box height. Then add the active-box offset to the self-test.

### D3. ws-card-rulings prints OK when only some of the scope has rulings

**Where.** `tests/scripts/ws-card-rulings.mjs:225-230` and `:295-298`. NO-RULINGS (exit 4, SKIPPED) fires only when no block covers any skill in scope.

**Reproduce.** Run `--rulings pilot-su-c/rulings.json --skill subtraction:sub_100_no_regroup,addition:add_100_regroup --check rulings`. It prints `no rulings for: addition:add_100_regroup (not checked)` and then `ws-card-rulings: OK (... 1 without rulings)`, exit 0. `ws-precritic` `PARSE.cardRulings` reads that as **PASS**.

**Effect.** Suppose a card's block lists the six ladder skills but forgets the preset. Then `ws-precritic --skill <all seven>` shows card-rulings PASS, and the preset is never checked. That is the "OK without checking" the lead ruled out.

**Fix.** Any unruled skill in scope makes the gate SKIPPED for that skill, or INCOMPLETE. Never OK.

## Nits

- **N1. The default sibling set is more lenient than the comparison that motivated it.** By default `ws-sibling-compare` compares against the max over all 8 stack siblings. The lead's pilot comparison used the paired (same size band) siblings. Of its 236 ABOVE counts:
  - 198 are on pinned skills. 149 of those stay above the all-sibling max; the other 49 become "engine".
  - 38 are on `sub_2d_1d` (D1).

  `siblings.json` already has the `pairs`, but precritic does not pass `--paired`. Either make paired the default where pairs exist, or record the choice with a STATUS note.
- **N2. The matrix renders the independent role only** (plus the layout, sections and mixed rows). So ws-slot-clip, which covers "every row the matrix renders", never sees the lesson packet, test or more-practice roles, or the skill's own options (support level or heads, zeros, lengths).
  - On the r1 tree this leaves D7 (heads overlap at 5-6 digits) uncaught.
  - The HEADS probe itself works. On the r1 `sub_1m` page at `level:[2]`, S, it finds 64 overlapping head pairs (HTh/TTh by 1.97 mm), where print-lint reported 0 findings.
  - D7 would be caught on the default page once D2's heads-by-default fix lands.
- **N3. No card in `design/cards` has a rulings block, and `design/cards/README.md` and `ws-spec-card` say nothing about the block.** So checks 4 and 5 are SKIPPED on every real skill. A run without `--strict` ends `ws-precritic: OK`. The lead should make `--strict` (or a written rulings block) a condition of rule 0b / "clean before the critic".
- **N4. `ws-slot-clip` dominates the precritic wall time:** 1161 of 1317 s, because it measures the 8 siblings on every row. It also leaks its `mq-slotclip-*` tmp dir on the probe-failure exit (`ws-slot-clip.cjs:265`). Five such dirs from earlier runs sit in /tmp.
- **N5. SLOT-W measures only `.ab[data-ws-seg]`** (stack digit strips). On any other template it measures 0 segments and says nothing. "0 box segment(s)" should be marked as not applicable in the table, not counted as a pass.

## Which r1 defects these checks would catch

The lead counted about 8 machine-measurable r1 defects. These five checks catch **4 of them on the r1 tree, as built**:

| r1 defect | Caught by | On the r1 tree |
|---|---|---|
| D1 zero cases | card-rulings | yes, once a rulings block exists (only the fixture has one) |
| D3 4.06 mm boxes | slot-clip SLOT-W | yes |
| D5 focus and 390 px clip | phone-card | yes. The instruction swap (engine class (e)) is not checked |
| D6 band offered | card-not-offered | yes, once a block exists |
| D12 `sub_1m` side anchors at L | sibling-compare | yes in principle (pinned row, red). Not run in the backtest |
| D7 heads overlap | the HEADS probe works | no: no matrix row turns heads on (N2) |
| D2 heads off by default | none: the rulings have no "structural scaffold" assert | no |
| D8 `sub_2d_1d` set (b = 1 on 31 % of items) | expressible as `maxShare {eq:["b",1]}`, but the fixture has no such ruling | no. The instruction text is unchecked |
| Rule 0b ABOVE counts on `sub_2d_1d` | sibling-compare | no (D1) |

Not caught by any of the five: D4 (lessons with no lesson data, regrouping Warm-up, the L6 Steps box), D9 (`wrongAnswer`), D10 (thin worked steps), D11 (the zeros label) and the instruction text of D5 and D8.

## To pass round 7

1. Fix D1, D2 and D3.
2. Add backtests: `sub_2d_1d` unpinned on the r1 tree must FAIL; the legacy column-twin siblings must pass phone-card; a partial rulings scope must be SKIPPED.
3. Decide N1 and record the decision.
