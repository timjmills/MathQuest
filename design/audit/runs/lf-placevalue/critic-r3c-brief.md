# lf-placevalue critic r3c — targeted re-grade brief (independent critic, Opus medium)

You are an INDEPENDENT critic. You did not build this work. Grade it; do not fix it. Branch `claude/lf-placevalue` at ce9a2fc4 (grade this commit; do not pull).
Hard limit: about 30 minutes; be lean (render only the pages named below).

**Read first (skim what you need):** `design/audit/RUBRIC.md` (criteria C1–C4, caps H1–H17, "How a page counts as graded"),
`design/cards/pv/pv.md`, and the earlier rounds: `design/audit/runs/lf-placevalue/critic-r3.md` (identify F3/F4, combine F1/F2)
and `critic-r3b.md` (value G1). Their grades STAND for every page not listed below: a page-hash comparison (graded commit aacae5ea
vs HEAD, seed 7, pupil + key HTML) shows those pages are byte-identical.

**Changed pages to grade (the only ones):**
- Part 0 (FIRST, lead 2026-11-08) — `placevalue:expand` quick re-check: it PASSED r3 / r3b, and since then only the DEAL changed (gen-pv:
  the zero place's position is drawn in the fresh deal with a cap, not fixed by the item's index; layout code unchanged). Render
  independent, more-practice, test, review, true-false, guided, error-analysis at S / M / L and band 99 at S / L. Confirm: zero items keep
  their box, the zero position is spread (no page with only zero-tens), no repeated number or near-repeat leading parts on a page, no page
  of a new size class, every grade still >= 8. Write the expand verdict FIRST in the report.
- Part A — `placevalue:identify` lesson S/M/L and `placevalue:value` lesson S/M/L. Say for F3, F4 (identify) and G1 (value): FIXED / NOT FIXED.
- Part B — `placevalue:combine`: independent L, more-practice L, test M/L, review L, true-false S/M/L, guided S/M/L, error-analysis S/M/L,
  scripted-model S/M/L, opener M/L, lesson S/M/L; plus option band 99 at S and M on the independent page. Say for F1, F2: FIXED / NOT FIXED.

Render, one browser command at a time, e.g.:
```
node tests/scripts/ws-grade-render.cjs --skills placevalue:identify,placevalue:value --roles lesson --size S,M,L --out <dir>
node tests/scripts/ws-grade-render.cjs --skills placevalue:combine --roles independent,more-practice,test,review,true-false,guided,error-analysis,scripted-model,opener,lesson --size S,M,L --out <dir>
```
(use `--opts '{"band":99}'` or the tool's option flag for band 99; check `--help`). Use the scratchpad
`/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-r3c/` for output. Look at every PNG you grade.
Write measured numbers (empty band %, items, digit size), never impressions.

**Rulings (lead D3):** findings in engine / role files are graded and recorded as ENGINE-ROLES but do NOT hold a pv skill: lesson.js
(chartPage, page split, step states), guided.js / review.js / scripted-model.js / error-analysis.js / opener row layouts, layout.js
resolveSectionLayout (N8, TWO_COL_ROWS stretching combine band 99 at M), test.js bands, reason-it.js / true-false.js answer lines, screen
numerals. Stretch, fact-probe and fact-rows are OUT OF SCOPE. A pv-owned page passes only at ≥ 8 on all four criteria.

**Write** `design/audit/runs/lf-placevalue/critic-r3c.md`: a grade table per page (C1–C4, cap), the finding status lines, any new
findings (page, what, rule id, which machine check could catch it), ENGINE-ROLES list, then `VERDICT: PASS` / `VERDICT: FAIL`
for each of expand, identify, value and combine (counting r3 / r3b grades for unchanged pages). For each PASS list the PNG paths you graded.
Do not edit any other file.
