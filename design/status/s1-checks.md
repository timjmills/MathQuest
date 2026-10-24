# Lane S1 — card gate ("hosts and roles") and the 11 generic checks

Lane: S1 · branch `claude/sweet-newton-c8wrv1-wip-s1-checks` · lead session_01HVwpAE3g6EZH8idgErP6LP · started 2026-10-24 05:15 UTC
Base: origin/claude/sweet-newton-c8wrv1 (e371ec9) + merge of `-wip-wave0-gates` (the 5 pilot-lesson checks, critic r7 7/9/7) → 4fbc80c.

## Builders (mq-opus-medium: new checks and tools, Q-S1/Q-S7)

| Builder | Scope | Start | End |
|---|---|---|---|
| A node checks | 1 zero-case predicates, 2 dealer uniformity, 5 lesson-data presence, 6 option-help truth, 9 presets item check, 10 wrongAnswer fits slot | 05:21 | 06:10 (450 k tokens, merged 4cb3825) |
| B print-lint rules | 3 L-ANSAREA 4.4 mm, 4 L-OVERLAP, 11 operator line end, 8 H13 on lesson roles, D1 attribution | 05:21 | 08:47 (368 k tokens, merged 42f9140) |
| C card tool + options render | Task A (hosts and roles, --check-signed, 02c5308e, D2), 7 options-verify render | 05:21 | 06:14 (408 k tokens, merged 02eedf5) |

## Lead integration notes
- 06:20 ws-content-audit card rulings: an unscoped / --category / --family sweep (the deploy gate) enforces SIGNED cards only;
  a --skill run (precritic) enforces every card that rules on the skill. Without this, merging S1 turned the full content-audit
  gate red on main for the six SU-C skills, whose unsigned card describes the unmerged pilot. Verified: `--category subtraction`
  OK, `--skill sub_50_no_regroup` FAIL (3 card-ruling).
- 08:55 builder B merged (backtests.json unioned by row id: 36 rows); branch merged with origin/claude/sweet-newton-c8wrv1 75a6a25.
  Node self-tests and unit gates green on the merged tree (spec-card 76/76, index current, card-rulings, dealer-uniform,
  node-lint self-test + full, content-audit self-test, sibling-compare, envelope, layout 535, anchors 322, panes, supports,
  providers, wrm-page-unit, code-snapshot 722, standards, search-terms).
- Known, accepted: the coverage-matrix pins are NOT re-pinned for the new rules (L-ANSAREA TY-21, L-OVERLAP, L-WRAP, H13-ROW).
  A matrix row that hits a pre-existing true positive goes RED, and rule 0b's sibling comparison decides whether it blocks the
  lane (it does only where the lane's skill is worse than its approved siblings, which show 0 for every new rule). print-lint's
  per-size pins carry the pre-existing findings per skill (never the pilot skills).
- 09:50 ws-backtest on the merged tree: 34 PASS, 2 FAIL in 2746 s; the 2 (text-generator-wrm-tagging, repeats-lesson, both
  pre-existing rows) failed only because the cloud clone was shallow (commit not present). After unshallow + fetch of every
  branch: 2/2 PASS (221 s) → **36/36 PASS**. ws-backtest now names the shallow clone and the fix instead of a bare git error.
- 09:50 ws-precritic could not find Chromium (it looked for chrome-linux/, this container has chrome-linux64/): fixed to read
  both layouts like tests/lib/ws-harness.cjs.
- 10:05 **Cross-lane, routed to the lead:** precritic --strict on the APPROVED `subtraction:sub_100_regroup` on main 75a6a25
  fails rule 0b in 7 matrix rows (single/layout-fact-rows S PG-12 x180; single/ex-each S/M TY-11 28, S/M/L H13 6;
  sections/ex-group; mixed/defaults L H13 4; more-cols2+... H13). The SAME counts come out of main's own tools (a worktree of
  75a6a25, ws-coverage-matrix on the same rows): app state on main, not an S1 check.
- 10:05 ws-precritic: `ws-grade-render` (no --golden) prints `done, N units`, never OK/FAIL, so the --role / --template
  render rows were always "unparsed" FAIL: new PARSE.gradeRender (PASS when every unit rendered with no ERROR line).
- 10:05 Lesson role pages pinned (they were in no pin, so --role lesson could never be green): the 20 role-sample skills
  `#lesson` at L (382 findings) and S (368) appended to print-lint.json / print-lint.S.json, on main 75a6a25. Largest classes:
  TY-1 150, TY-7 70, TY-2 36, INK-7 32, H13 26 / 16, AK-4 26 / 22, PG-12 15, WRAP-OP 13.
- 10:05 D1 on REAL data (lead's pointer: the 7 sections/ex-each RED rows on the pilot ids come from the partner
  algebra:tape_diagram): every finding of a real Sections row carries skill "" (bySkill {"": ...}), so partner findings still
  block; the fixture row passed only because its fixture had skills filled in. Builder B fix round 1 (medium).
