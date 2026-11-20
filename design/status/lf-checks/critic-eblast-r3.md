# Critic eblast r3 — declared role ceilings (EB-LASTPAGE / CAP-PARITY)

Independent critic, Opus medium, 2026-11-20. Graded: `git diff a55ce281f..b45413816` (branch
claude/sweet-newton-c8wrv1-lf-tools-eblast). Round 3, after the round cap.

## Verdict: FAIL (C2 7). One narrow fix, then the rules can block.

| Criterion | Score | Why |
|---|---|---|
| C1 rule correctness | 8 | Every ceiling is right against WDS §12.1 / PAGE_TYPES PT-PRE-2, and every entry cites its source. |
| C2 checks prove it | **7** | The table is a hand copy of 8 role constants, and nothing compares the two (G1). |
| C3 no collateral | 8 | No new false red on 3 more passed skills. The mixed-practice and scripted-model false reds are gone. |
| C4 clarity | 8 | The not-judged notes name the role kind and the §12.1 line. The EB-LASTPAGE message does not name the ceiling (N1). |

## What I ran

- `ws-empty-band --self-test`: OK (r3 declared ceilings: 13 cases). `--capacity-check`: OK (17 roles, 32 passed skills).
- `ws-backtest --row` on the 7 rows (eb-lastpage-cbt-pre-skill-check, cap-parity-cbt-pre-skill-check,
  eb-lastpage-fixture-pre-skill-check, cap-parity-fixture-row-gap, eb-lastpage-fixture-test-pg23, eblast-advisory-fixture,
  eblast-role-capacity-declared): 7/7 PASS.
- `ws-precritic-plan --checks-from-critics`: OK (351 pass, 90 exempt, 0 fail).
- `role-capacity.js`: syntax OK. It is pure (no window, DOM, state or Math.random) and exported once from `sheet/index.js`.

## Values against the standard

All 17 entries agree with WDS §12.1 at M and L. These are guided 8/6, error-analysis 4/4 (L "2-4"), review 12/12
(L "8-12"), test 16/12, true-false 6/4, reason-it 3/2, word-problems 3/3, mixed-practice 7/5 rows, stretch 2/1,
fact-probe 20/20 and opener 5/5 (L "1-2 + 2-3").

Pre-skill-check is 20/16. That matches PT-PRE-2 ("totals at most 20 / 20 / 16"). It has no constant in code; its
quadrant size is `PER_QUAD = 4`.

No role used by a passed skill is missing (`--capacity-check`).

## G1 (C2, must fix): the table is a copy, and nothing checks it against the roles

`ROLE_CAPACITY` restates numbers that the roles already hold as private constants:

- the `CEILING` constants in guided, error-analysis, review, test and true-false;
- `ROWS` in reason-it, `PER_PAGE` in word-problems and `MAX_SHELVES` in mixed-practice.

No role imports the table (grep: only `index.js` and `ws-empty-band.cjs` reference it). `--capacity-check` proves only
that each entry is present and cited, not that its values match.

I compared all 8 by hand-written probe. **They match today.** But a change to `guided.js` CEILING, say, would leave the
rule judging against a stale number, with no gate turning red. That is the same class of failure as the round-cap root
cause: the rule's capacity is not the role's designed capacity. Once the rules block, that becomes a false red or a
false green.

Fix it either way:

- (a) The 8 roles import their ceiling from `role-capacity.js`. This makes the table the ONE source.
- (b) `--capacity-check` parses each role's constant and fails on any M/L difference, with a self-test case that
  plants a difference and expects FAIL.

Option (a) is cleaner. Option (b) is about 12 lines. My probe was this regex over
`roles/<role>.js` for `CEILING|ROWS|PER_PAGE|MAX_SHELVES = {…}`.

## Re-measured reds (rendered myself)

- **add_facts pre-skill-check M and L p1: 78 % empty.** Measured 187.4 / 185.4 mm, a 42.6 mm row fits, 4 items
  against a ceiling of 20 / 16. **Real.** A first skill checks itself in one quadrant. PT-PRE-1 asks for four quadrants
  on one page, and PT-PRE-3 says the teacher picks four skills.
- **placevalue:value pre-skill-check L p2: 45 % empty.** It runs to 2 pages, and CAP-PARITY gives 3 vs 6 items.
  **Real** against PT-PRE-1/2: at most 16 items at L belong on one page. Critic r1 judged it the same way.
  Lead ruling R13 (lf-roles.md) only governs how a check that does spill is split. It does not license the spill.

## New skills swept (`--page-fill --only EB-LASTPAGE,CAP-PARITY`)

- **subtraction:sub_1m_no_regroup** (test, true-false, reason-it, error-analysis, review, guided): clean.
  - The long-procedure test L at 8 items passes as a full page.
  - Reason-it passes on "L at its declared ceiling".
- **subtraction:sub_100_no_regroup**: two reds, both pre-skill-check.
  - L spills to 2 pages: p2 39 %, and p1 holds 6 items against 16 at M.
  - Every other role is clean or not judged with a correct note.
- **placevalue:compare**: two reds, both pre-skill-check.
  - L spills to 2 pages: p2 59 %, and p1 holds 2 items against 8 at M.

Both new pairs are the same systemic pre-skill-check composer defect at L (stacked bands spill past one page). Critic r2
G4 already routed it to the role. They are not false reds by the standard. Every pre-skill-check render I have seen is
red, so the lead should route the composer fix before blocking. Otherwise every passed skill's run goes red at once.

## Exclusions

- **Teacher-count roles (independent, more-practice):** justified. PG-23 lets a last page end short, and the count is
  the teacher's.
- **Scripted-model:** justified. §12.1 says "1 problem, 3-6 frames, same" at every size, so its frames are not a capacity.
- **Fact-rows:** justified. §12.1 says "by ladder table, 25-90", so there is no single ceiling.
- **N2:** fact-probe is marked `fixed`, but §12.1 gives it a real count of 20 at every size. sub_100_no_regroup's
  fact-probe printed L 9/page, M 20, and the rule does not judge it. This is probably a narrowed probe for a non-fact
  skill, so it is out of scope here. Note it for the fact-probe owner rather than leave it silently unjudged.

## Notes (not blocking)

- **N1:** The EB-LASTPAGE message says "the role fixes its count, so the page must fill", but not "below its declared
  ceiling N". CAP-PARITY's message does say it. Add the ceiling to both, and cite R13 when the page spills.
- **N3:** If `require()` of `role-capacity.js` fails, `CAPK` falls back to null and the rules quietly return to
  white-space inference. The self-test case "the capacity table loads" and `--capacity-check` catch this. Make sure one
  of them runs on the gate path that blocks.

## Checks this round adds

- `--capacity-check` must compare values, not only presence (G1), with a planted-difference self-test case.
