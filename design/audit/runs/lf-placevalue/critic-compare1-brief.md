# lf-placevalue critic compare r1 (independent critic, Opus medium)

You are an INDEPENDENT critic. Grade only; do not fix anything. Work on branch `claude/lf-placevalue-w2` at b250883f; do not pull. Limits: 30 minutes, about $12.

**Read first:**
- `design/audit/RUBRIC.md`: C1–C4, the caps, and "How a page counts as graded".
- `design/cards/pv/pv.md`: PV-04 compare; step 5 "far, same length → close → different lengths; '=' one item in six"; M6.
- `CLAUDE.md`, the design contract section.
- `design/audit/runs/lf-placevalue/precritic-compare-r2.md`: the machine state, 4 FAIL rows, explained below.

**Skill:** `placevalue:compare`. Options: band 99 / 999 / 9999 / 99999 / 999999, closeness, lengths.

**Grade every page type at S, M and L, each pupil page with its key:**
- independent, more-practice, test, review;
- true-false, reason-it, error-analysis;
- opener, scripted-model, guided;
- mixed-practice, pre-skill-check;
- lesson.

Also grade:
- the screen hosts: practice card at 1280 / 820 / 390, the online worksheet, and the quiz;
- the option values, at S and L at least: band=99 and band=999999, closeness=close, lengths=mixed.

Use `node tests/scripts/ws-grade-render.cjs --skills placevalue:compare --roles <list> --size S|M|L` for print and the same tool without `--roles` for the screen hosts; check `--help`. Write output under `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-compare1/`. Run one browser command at a time, through `tests/scripts/mq-browser-run.sh`.

**Judge the teaching, not only the layout:**
- Does the deal follow step 5?
- Is '=' about one item in six, and do the "=" items land in different places on each page?
- Are the signs < > = unambiguous to write in the circle?
- Is M6 ("89 > 312 because 8 > 3") the error used on error-analysis, true-false and reason-it pages?
- Does the lesson's chant "More digits, bigger number." match what it deals?
- Are the keys right?

**Rulings in force:**
- Lead D3: engine / role layouts are graded and recorded as ENGINE-ROLES, but are NOT held against compare. These are the empty bands on guided / opener / error-analysis S / scripted-model, and PG-23 / DN-2 page balancing on mixed-practice and worked-example sections.
- SCREEN-DIGIT on the worksheet grid (29 px) is the hosts lane's, the same on every passed pv sibling.
- Two pv-owned page shapes are open and await a lead ruling: a teacher-set 2 columns at S (24 % strip under the grid), and pages-3 at L page 2 (22 % strip). Grade them and say whether they cost a point.

**Write** `design/audit/runs/lf-placevalue/critic-compare1.md` with:
- a grade table (role × size, and host → C1–C4);
- findings with page, size and numbers;
- for each finding, the automatic check that would have caught it;
- `VERDICT: PASS` / `FAIL`;
- the PNG paths you graded.

Edit no other file. Do not commit.
