# lf-placevalue critic r4 — narrow re-grade brief (independent critic, Opus medium)

You are an INDEPENDENT critic. You did not build this work. Grade it; do not fix it. Branch `claude/lf-placevalue-r4` at 98fb4236
(do not pull). Hard limit about 25 minutes; render only the pages below.

**Read first (skim):** `design/audit/RUBRIC.md` (C1–C4, caps, "How a page counts as graded"), `design/cards/pv/pv.md`, and the earlier
rounds `design/audit/runs/lf-placevalue/critic-r3b.md` (unit_form G2, G5), `critic-r3c.md` (identify E-A1). Grades in those reports
STAND for every page not listed here.

**What changed (only these):**
- identify E-A1 (owner/lead ruling: pv-owned): the lesson's "ones" vocabulary picture is drawn compact (one cube tall:
  `lesson.js` blocks `compact`, set in `lessons/prereqs.js`), so the lesson pages reflow. The unit_form lesson's "ones" picture too.
- unit_form G2: the rename frames (rename=more, `rowOnly`) take a write line two digits longer at size S only.

**Grade:**
- Part A — `placevalue:identify` lesson S / M / L, every page and the key. Say for E-A1: FIXED / NOT FIXED.
- Part B — `placevalue:unit_form` with `{"rename":"more"}` on independent, more-practice, test, review at S (and one of them at M and
  L as a control); and the unit_form lesson S / M / L (the reflowed vocabulary row). Say for G2: FIXED / NOT FIXED. G5 (error-analysis
  Fix-it frame word, out of bar) — say whether it still holds, as information.

Render one browser command at a time, e.g.
`node tests/scripts/ws-grade-render.cjs --skills placevalue:identify --roles lesson --size S,M,L --out <dir>` and the same with
`--skills placevalue:unit_form --roles independent,more-practice,test,review --size S --opts '{"rename":"more"}'` (check `--help` for the
option flag). Output under `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-r4/`. Look at every
PNG you grade; write measured numbers, not impressions.

**Rulings (lead D3):** engine / role findings are recorded as ENGINE-ROLES and do not hold pv: lesson.js chartPage and page split (the
identify lesson EB-SIDE 31–33 % rows and band 99999 / 999999 overflow), guided / review / scripted-model / error-analysis / opener
layouts, layout.js N8, reason-it / true-false answer lines (unit_form Reason It key overflow), screen numerals. Owner rulings
2026-11-08: fact-probe OUT OF SCOPE; combine band 99 at S side space ACCEPTED (owner-ruled pin). Stretch out of scope.

**Write** `design/audit/runs/lf-placevalue/critic-r4.md`: a grade table (page, C1–C4, cap), the finding status lines, new findings (page,
what, rule, which machine check could catch it), then `VERDICT: PASS` / `VERDICT: FAIL` for identify and for unit_form (counting the r3 /
r3b / r3c grades for unchanged pages). For each PASS list the PNG paths you graded. Do not edit any other file.
