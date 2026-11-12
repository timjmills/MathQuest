# lf-placevalue critic r5 — narrow re-grade brief (independent critic, Opus medium)

You are an INDEPENDENT critic. Grade; do not fix. Branch `claude/lf-placevalue-r5` (do not pull). Hard limit 20 minutes; render only the
pages below. Earlier grades (`design/audit/runs/lf-placevalue/critic-r3*.md`, `critic-r4.md`) STAND for every page not listed.
Read `design/audit/RUBRIC.md` (C1–C4, caps) and `critic-r4.md` (N-r4-1, G5, E-r4-1).

**Changed (only these):**
1. unit_form rename=more at S: the write line is now 3 digits longer after the skill's fixed width (N-r4-1 margin).
2. error-analysis Fix-it words for a pv words frame come from the frame ("[ ] hundreds"), not the singular answer (G5).
3. identify lesson: Guided cells two across under the wide chart (lesson data `guidedCols`), so L is 3 pages, not 4 (E-r4-1).

**Grade:** (a) `placevalue:unit_form` `{"rename":"more"}` independent / more-practice / test / review at S (measure the worst side band;
it must clear 30 % by about 3 points); (b) `placevalue:unit_form` error-analysis S / M / L (G5 fixed? key right?); (c)
`placevalue:identify` lesson S / M / L, every page and key. Use `node tests/scripts/ws-grade-render.cjs` (check `--help` for options),
output under `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-r5/`, one browser command at
a time. Lead D3 still holds (engine / role layouts are ENGINE-ROLES, not held against pv); the unit_form worksheet host's legacy-cell
band is NOT in this round.

**Write** `design/audit/runs/lf-placevalue/critic-r5.md`: grade table, N-r4-1 / G5 / E-r4-1 FIXED or NOT, new findings, then
`VERDICT: PASS` / `FAIL` for identify and unit_form, and the PNG paths you graded. Edit no other file.
