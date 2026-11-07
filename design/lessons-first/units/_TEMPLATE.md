# Unit <unit-id> — speed reflection record

<!--
The per-unit speed reflection record of design/LESSONS_FIRST_PLAN.md §6.2 (template made by lane lf-checks, 2026-11-07).
Copy this file to design/lessons-first/units/<unit-id>.md when the unit closes (every CCSS lesson passed, or the lane
stopped). The AUDITOR writes it (stage 7: an independent Opus-medium agent, never the lane), from the lanes' status files,
design/status/defect-tally.csv, tests/fixtures/precritic/backtests.json, design/lessons/grades.jsonl and the sessions'
cost_usd. Every field is filled; "n/a" needs its reason. Then the auditor appends the round rows to
design/status/speed-audit.md and metrics.md and regenerates the queue (`node tests/scripts/ws-lessons-first-queue.cjs`).
Money: every $ figure also as % of the weekly limit ($28 ≈ 1 %, CLAUDE.md "Usage budget").
-->

## Summary

| Field | Value |
|---|---|
| Unit | <unit-id> (<grade>, <WRM block>, <name>) |
| Lanes | <skill lanes>, <lesson lane> |
| Dates | <first lane start> → <unit closed> (<n> calendar days) |
| Products passed | <passed> / <planned> (<short> short, <long> long<, n recompiled>) |
| Critic rounds (skills / lessons) | <median per family> / <median per lesson> (target: ≤ 2 by round 2, 1 from round 4) |
| Findings by class; machine-measurable share | <total>; <measurable> (<pct> %) (target < 20 % by round 3) |
| Checks added (id, backtest row) | <LP-… (row id)>, … |
| Cost (skills / lessons / lead share), % of the limit | $<a> / $<b> / $<c> → <pct> % |
| Cost per lesson pair, per skill | $<per pair>, $<per skill> |
| Hand-written lines per long lesson | <median> (target < 100) |
| Auditor | <session id>, Opus medium, <date> |

## Products

| CCSS lesson (step) | Short | Long | Skills it needed (passed before? round) | Critic rounds | Grades (min C1/C2/C3/C4) |
|---|---|---|---|---|---|
| <Y?.B?.S?> <title> | <pass / fail / not built> | <pass / fail / not built> | <cat:skill (r?)> | <n> | <8/8/8/8> |

## Critic findings by class

One row per class (`design/status/defect-classes.md`). "Machine could measure" = a check could have found it on the
rendered page or the built data, whether or not one existed then.

| Class | Findings | Machine could measure | Check that exists now (id) | Caught by precritic before the critic? |
|---|---|---|---|---|
| <repeats> | <n> | <n> | <LP-FAMILY-REPEAT> | <yes / no: why> |

## Checks added this unit

Each must have a backtest row (FAIL on the commit the critic failed, PASS on the fix) and be on precritic's path
(`node tests/scripts/ws-backtest.mjs`, `node tests/scripts/ws-precritic-plan.mjs`). A measurable finding with no check by
the next unit's critic is a process defect of the lane that received it (plan §6.1).

| Check | Finding it came from | Backtest row | On the path (precritic scope) |
|---|---|---|---|
| <LP-…> | <lesson, critic round, D#> | <row id> | <--lesson / --unit / --skill> |

## Lost rounds and hours

Every critic round that failed and every hour lost to waiting, re-runs, flakes, red main, merge conflicts or unclear
briefs: the cause, the fix (a check, a rule, a tool change, a brief change) and who owns it. "Fix" is never "be more
careful".

| # | What was lost (round / hours) | Cause | Fix | Owner | Done? |
|---|---|---|---|---|---|
| 1 | <lesson X critic r1, ~2 h> | <cause> | <check / rule / tool> | <lane> | <commit or open> |

## Cost

| Session | Lane | cost_usd | % of the weekly limit | What it bought |
|---|---|---|---|---|
| <session id> | <lane> | $<n> | <pct> % | <skills passed, lessons passed, checks> |
| **Total** | | $<sum> | <pct> % | |

## Targets (plan §6.4) this unit

| Measure | This unit | Previous unit | Target |
|---|---|---|---|
| Lesson critic rounds per lesson | <n> | <n> | ≤ 2 by round 2; 1 from round 4 |
| Skill critic rounds per family | <n> | <n> | ≤ 2 |
| Findings a machine could have measured | <pct> % | <pct> % | < 20 % by round 3 |
| Cost per CCSS lesson pair | $<n> | $<n> | −30 % by round 3 |
| Hand-written lines per long lesson | <n> | <n> | < 100 |

## What the next unit does differently

1. <one concrete change, with its owner and where it is written down (brief, rule, check)>
