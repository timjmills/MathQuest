# Critic r2: lane S1, fix round 1 (D1, D2, D3, N2, N4) and the same-shape sibling ruling

Critic: independent, mq-opus-medium. Round 2, 2026-10-24, 11:25–11:46 UTC.

Branch `claude/sweet-newton-c8wrv1-wip-s1-checks`:
- a1b6cb90, the fix round;
- 96f5fcc2, the same-shape sibling ruling. The lead added it to my scope mid-round.

I edited no tracked file. I did my scratch work in four detached worktrees and removed all of them afterwards:
- /tmp/s1c2 (a1b6cb90)
- /tmp/s1c2b (96f5fcc2)
- /tmp/s1c2-27 (27577cf)
- /tmp/s1c2-ff (ff471fd)

The mutations below were made only in /tmp/s1c2b, and I restored each one before the next run. This report is the only file I created, and it is uncommitted.

The lead's rulings in critic-r1.md still hold. main's sub_100_regroup regression and the unsigned cards are not counted against S1.

## Verdict: PASS

| Criterion | Score |
|---|---|
| 1. Does what the lead asked | 9 |
| 2. The backtests are real | 9 |
| 3. Usable by a builder | 8 |

## (a) The r1 findings

| r1 | Status | Evidence |
|---|---|---|
| D1 | **fixed** | See D1 below. |
| D2 | **fixed** | See D2 below. |
| D3 | **fixed** | See D3 below. |
| N2 | **fixed** | `ws-options-verify --render --skill subtraction:nope` gives "FAIL (unknown skill(s) subtraction:nope …)", exit 2. `ws-spec-card --check-signed --skill subtraction:nope` gives "FAIL — unknown skill(s) …", exit 1. `ws-dealer-uniform --skill fractions:nope` gives FAIL, exit 2. |
| N4 | **closed by decision** | NO-CARD stays N/A, and the row now says in words that a NEW family needs a signed card first (`ws-precritic.cjs` l. 718). Under `--strict`, the card-rulings SKIPPED row still turns a card-less new lane red. Rule 0b's text was not changed; that is acceptable. |
| N1, N3 | open, routed | Recorded in the status file: N1 waits for the card tool's next change; N3, the app hook, is with the lead. |
| N5 | fixed | `design/status/s1-checks.md` now records the D1 merge, the critic r1 row and fix round 1. |

### D1: dealer-uniform gives N/A

```
$ node tests/scripts/ws-dealer-uniform.mjs --skill area_perimeter:perimeter_intro,placevalue:more_less_10,measurement:time_hour,algebra:tape_diagram,fractions:identify
ws-dealer-uniform: N/A - no operand-dealt items: area_perimeter:perimeter_intro, … fractions:identify (0 OK, 0 FAIL, 0 INCOMPLETE, 5 N/A of 5 skill(s); 4.3 s)   exit 4
$ … --skill fractions:identify,subtraction:sub_50_no_regroup
ws-dealer-uniform: FAIL - sub_50_no_regroup (6) (… 1 N/A of 2 skill(s) (N/A, no operand-dealt items: fractions:identify) …)
```

- The `PARSE.dealerUniform` regex matches that N/A line.
- The self-test grew from 15 to 19 cases: N/A only; N/A beside OK; all items threw still FAIL; an empty scope is never OK.
- The backtest row r1 asked for ("a fractions skill gives N/A") was not added. The self-test covers the verdict, but not the reader. See N-r2-4.

### D2: precritic lints the lane skill's own lesson page

`ws-precritic --skill subtraction:sub_50_no_regroup --dry-run` plans two lesson gates:
- `print-lint-lesson-L`: `--roles lesson --skills subtraction:sub_50_no_regroup --baseline design/audit/baselines/print-lint.json`
- `print-lint-lesson-S`: `--size S … --baseline design/audit/baselines/print-lint.S.json`

The same two gates are planned for `--skill fractions:identify`. With `--role lesson --skill sub_50`, the skill joins the role sample (3 lesson lines name it).

`ws-precritic-plan` gives `OK (20 rows on the lane's path, 19 not applicable)`.

### D3: the presets D8 real commit pair

The `s1-presets-obey` row now runs on 27577cf (fail) and ff471fd (pass). By hand, today's script on each tree gave:

| Tree | Result |
|---|---|
| 27577cf | `FAIL (2)`. Both halves of D8 show: `sub_2d_1d: instruction key "default-write" … host sub_100_no_regroup says "subtract" (pilot D8)` and `narrow set: its first number runs 52-99 … must reach 27 or below and 82 or above (pilot D8)` |
| ff471fd | `OK` |
| ff471fd with `--no-baseline` | `OK`, 0 D8 lines. The pass state does not lean on the pin. |

The seeded row was kept as `s1-presets-obey-seeded`, with a `realPair` reason.

## (b) Nothing broke

**Self-tests, all OK:**

| Tool | Result |
|---|---|
| dealer-uniform | 19 cases |
| presets-unit | 10 predicate cases |
| precritic-plan | 7 cases |
| spec-card | 76/76 |
| card-rulings | 22 cases |
| sibling-compare | 20 cases at a1b6cb90, 24 at 96f5fcc2 |
| slot-clip | 7 fixture pages, at 96f5fcc2 |
| node-lint | OK |
| content-audit | 141 assertions |

**Backtests at a1b6cb90.** `MQ_BACKTEST_TMP=… ws-backtest --row s1-dealer-uniform,s1-presets-obey,s1-presets-obey-seeded,wrap-op-pilot,h13-lesson-warmup-pilot` gave **5 PASS, 0 FAIL; 436.6 s; ws-backtest: OK**.

**The two dry runs:**
- `ws-precritic --skill subtraction:sub_50_no_regroup --dry-run`: exit 0. It plans lesson L / S, dealer-uniform, node-lint S1, spec-card-signed and the rest.
- `ws-precritic --skill fractions:identify --dry-run`: exit 0. It plans lesson L / S and dealer-uniform (now N/A).

## The same-shape sibling ruling (96f5fcc2)

**The fix is correct.** I measured the shapes with the commit's own `shapesOf`, on a scratch copy that exports it:

| Skill | Tracks |
|---|---|
| add_100_regroup | 3 |
| sub_100_regroup | 2 |
| sub_1k_regroup | 3 |
| add_1k_regroup | 4 |
| sub_10k_regroup | 4 |
| add_10k_regroup | 5 |
| sub_100k_regroup | 5 |
| sub_1m_regroup | 6 |
| sub_100_no_regroup | 2 |
| sub_50_no_regroup | 2 |

`siblingsOf` then chose these:

| Lane skill | Siblings | Peers |
|---|---|---|
| sub_100_regroup | none | sub_100_no_regroup, sub_50_no_regroup |
| sub_50_no_regroup | sub_100_regroup (add_100_regroup dropped) | none |
| sub_1k_no_regroup | sub_1k_regroup | none |
| sub_10k_no_regroup | sub_10k_regroup | none |

**The shape is stable.** It does not depend on whether the 24 seeds happen to reach 100. `add_100_regroup`'s `ansDigits` is 3 on every one of 200 seeded items, and only 3 of those items have the answer 100. So the shape belongs to the skill, not to the sample.

**Peers are measured like siblings.** Precritic passes `--run-siblings` to both sibling-compare and slot-clip (l. 692, 697). A peer judged on its pins alone would err toward ABOVE, never toward a false pass.

**ws-slot-clip still works.** It reads `S.sibOf` from `loadSiblings`; peers are swapped into `sibOf` there, so its extra/ sibling runs follow. Its self-test is OK.

**Backtests at 96f5fcc2:**
- the rows: sibling-compare-pilot, sibling-compare-unpinned-pilot, slot-clip-pilot, slot-clip-heads-pilot, d1-partner-attribution, d1-real-partner, d1-real-unattributed;
- the result: **7 PASS, 0 FAIL; 654.7 s; ws-backtest: OK**.

The d1-real rows give `--siblings add_100_regroup,…` explicitly. Explicit siblings bypass the shape filter, which is right for a fixture.

**One gap**, a nit (N-r2-5): the ruling says same template AND same tracks. `same()` compares tracks only. The template is taken on trust from the siblings.json section, even though `tpl[s]` is now measured for every candidate.

## (c) Trying to break the new pieces

**ws-precritic-plan.** I ran four mutations, one at a time, restoring the file after each.

| Mutation in ws-precritic.cjs | Plan result |
|---|---|
| lesson gate off (`if (false && ctx.role !== 'lesson')`) | **FAIL**: wrap-op-pilot and h13-lesson-warmup-pilot (2 of 20). Caught |
| dealer-uniform gate off (l. 706) | **FAIL**: s1-dealer-uniform. Caught |
| presets gate off (l. 636; the dry run then plans 0 presets lines) | **OK**, 20 rows. Not caught |
| spec-card-signed gate off (l. 714; 0 check-signed lines) | **OK**, 20 rows. Not caught |

So 19 of the 39 rows are "not applicable" and unguarded. Two of them are S1's own checks: check 9 (presets) and the r7 D2 signature gate. See N-r2-1.

**The D8 pin.** No new D8 defect can hide behind it. A pin is an exact text, a new preset or a changed range changes that text, and the 44 pins all still print the same on 27577cf.

But "only `(pilot D8)` lines can be pinned" holds only in `--write-baseline`; the reader never checks it. I tested this on the seeded bad state (ff471fd + bad.patch):

| Run | Result |
|---|---|
| unchanged | `FAIL (6)`: `mult_2by1_column item 0..5: does not obey its preset tiles=21` |
| after appending the check-6 line `multiplication:mult_2by1_column item 0: does not obey its preset tiles=21 (81 × 84 = ? = 6804)` to the pin file | `1 pinned D8 finding(s) still print … FAIL (5)` |

So a pinned non-D8 line is silenced, and it is reported as "D8". See N-r2-2.

**The lesson gate on a real skill.**

```
$ /tmp/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --skills subtraction:sub_50_no_regroup --size S --baseline design/audit/baselines/print-lint.S.json
subtraction:sub_50_no_regroup#lesson  6+3k … DENSITY 12 … TOPSTART 6  FAIL
ws-print-lint: FAIL - ratchet: 2 count(s) rose above design/audit/baselines/print-lint.S.json
  - subtraction:sub_50_no_regroup#lesson L-TOPSTART CL-4b: 0 -> 6
  - subtraction:sub_50_no_regroup#lesson L-DENSITY H13: 0 -> 12
```

The gate runs and reads the real page:
- The H13 findings are the pilot's N2 class: the pilot fix a930c43 is not in this branch.
- TOPSTART comes from main's newly merged CL-4b rule.

A sub_50 lane would own both, as designed ("an unpinned lesson page must be clean"). Neither is an S1 defect.

## Blocking defects

None.

## Nits

### N-r2-1. ws-precritic-plan does not guard rows whose command names no skill

Taking the presets gate or the spec-card-signed gate out of precritic leaves the plan green (mutations above). Those rows are s1-presets-obey, -seeded, card-gate-decisions, card-gate-rulings, card-rulings-pilot and card-not-offered-pilot.

- **Smallest fix.** Give such rows a `path` field, for example `"path": "--skill subtraction:sub_100_no_regroup"` for card rows, or a preset skill for presets rows. The plan then asserts that the row's tool appears in that dry run. A skill-less row without `path` is a FAIL, not N/A.
- **Check that would have caught it:** the mutation table above, as a plan self-test. For each WRAPPERS-free tool named in backtests.json, remove its `add(gate(...))` and require the plan to FAIL.

### N-r2-2. The D8 pin reader accepts any text

The header and the brief say only "(pilot D8)" lines can be pinned. The reader removes any failure whose text is in the file. The proof is the seeded run above: FAIL 6 became FAIL 5.

- **Smallest fix.** On read, `pinned = new Set(list.filter((f) => / \(pilot D8\)$/.test(f)))`. Make a non-D8 entry in the file a FAIL of its own ("pin file holds a non-D8 line").
- **Check that would have caught it:** a presets-unit self-test case. A pin set with a check-6 line must not remove that failure.

### N-r2-3. The D8 pin never reports stale entries

On ff471fd none of the 44 lines print, because the pilot's compose.js presetId fix is not on main. When it merges, all 44 go stale, silently. A later regression to the same text would then be hidden.

- **Smallest fix.** Print `fixed? pinned "<line>" no longer found (re-pin …)`, as ws-dealer-uniform already does.
- **Check that would have caught it:** a self-test case where a pin with no matching failure yields a "fixed?" line.

### N-r2-4. dealer-uniform's N/A is "the reader found no a op b", not "the skill deals no numbers"

In the + − × ÷ categories, these return N/A:
- mult_arrays, mult_equal_groups, arrays_groups;
- count_by_2s … 5s, count_by_tables;
- the fact-family skills;
- addition:comparison_word.

Several of these do deal factors or addends. This follows r1's own suggested fix and is visible as N/A in the row, so it is not a false PASS. But a × lane on arrays gets no dealer check.

- **Smallest fix.** In an operation category, 0 operands read is INCOMPLETE ("reader cannot read this payload"), not N/A, unless the skill is listed as non-dealt. Also add the r1-requested backtest row (fractions:identify gives N/A).
- **Check that would have caught it:** an "every domain" smoke over one skill per category, printing the N/A list for review.

### N-r2-5. Same-shape checks tracks only

The ruling asks for same template AND same tracks. `same()` in `siblingsOf` compares tracks only.

- **Smallest fix.** Add `&& (!tpl[s] || tpl[s] === tpl[k])`.
- **Check that would have caught it:** a self-test case with a same-track sibling of another template.

### Observation, not counted

Approved + − × ÷ skills FAIL dealer-uniform on this tree without a pin: add_facts (7), mult_facts (1), sub_word_problems (1), the *_missing_digit skills and others. The baseline pins only sub_100_regroup and add_100_regroup. These look like real dealer findings: repeated items on a page, and a period of b = 0. The next lane on those skills starts red, by design. The lead may want them pinned or listed as debt before those lanes start.

## Re-grade (held from r1; not redone in depth)

| Item | Status |
|---|---|
| Task A (§7a / §7b, `--check-signed`, the 02c5308e fold-in) | held; spec-card self-test 76/76 |
| W0-A r7 D2 (rulings under the signature) | held; card-rulings self-test 22 cases; spec-card-signed is still planned on `--skill` |
| W0-A r7 D1 (partner attribution) | held; d1-* rows 3/3 PASS at 96f5fcc2 |
| The 5 wave-0 pilot checks | the sibling-compare / slot-clip rows 4/4 PASS at 96f5fcc2, with the shape filter in place |

## Per-round findings: the automatic check for each

| Finding | Check that would have caught it |
|---|---|
| N-r2-1 | plan mutation self-test: removing any planned tool's gate must FAIL ws-precritic-plan |
| N-r2-2 | presets-unit self-test: a non-D8 line in the pin set is not removed |
| N-r2-3 | presets-unit self-test: a pin with no matching failure prints "fixed?" |
| N-r2-4 | per-category smoke listing the N/A skills in + − × ÷ |
| N-r2-5 | sibling-compare self-test: a same-track, other-template sibling is dropped |

Speed-ups the round revealed:
- The node-only mutations (four plan runs, about 30 s each) found N-r2-1 faster than any browser row.
- The browser rows queued behind other lanes for about 7 minutes. Start them first, in the background.
- A 190-skill dealer sweep does not fit in 10 minutes; use a 30-skill name-filtered sample.
