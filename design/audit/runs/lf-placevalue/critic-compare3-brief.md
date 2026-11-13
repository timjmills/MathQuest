# lf-placevalue critic compare r3 (independent critic, Opus medium)

This is the last round under round cap 2 (CLAUDE.md, the fastest-implementation plan): grade it strictly.

You are an INDEPENDENT critic. Grade only; do not fix.
- Branch `claude/lf-placevalue-w2` at a5d1cb2d (master 4044b0b8 merged in). Do not pull.
- Output goes under `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-compare3/`.
- Use one browser command at a time, through `tests/scripts/mq-browser-run.sh`, including the very first `--help`. Use `node tests/scripts/ws-grade-render.cjs`.
- For the quiz host, pass `--quiz-builder`, which deals through the real quiz builder.
- For BEFORE comparisons, make a read-only worktree (`git worktree add <scratchpad>/wt-c3 6d1ffb80`) and remove it when you finish.
- **Screen hosts (new owner rule):** print, the card at 1280 and 820, the worksheet, and the quiz. **No 390 px.**

**Read:** `design/audit/RUBRIC.md`, `design/audit/runs/lf-placevalue/critic-compare2.md` (N1–N8, F9), `design/cards/pv/pv.md` (PV-04, step 5, M6), WORKSHEET_DESIGN_STANDARD CL-2c / CL-4b / CL-4d, PAGE_TYPES PT-TOF-1.

**Rulings in force; they cost no point.** These are lead D3 engine / role layouts, graded and recorded but not held against compare:
- opener, scripted-model, review, mixed and pre-skill-check bands;
- PG-23 / DN-2 pagination;
- the error-analysis "Name wrote:" PUPILTAG;
- the opener L band 999,999 overflow;
- the worksheet's 29 px digits;
- N5, the Reason It panel geometry.

Also in force: CL-2c (teacher columns, 25 %), PT-ENG-6 (middle page, 25 %), CL-4d (centring, plus the H13 twin-row exemption).

## Grade
### A. placevalue:compare: every page type at S/M/L, each with its key
- Page types: independent, more-practice, test, review, true-false, reason-it, error-analysis, opener, scripted-model, guided, mixed-practice, pre-skill-check, lesson.
- Option values: band=99, band=999999, closeness=close, lengths=mixed.
- Hosts: as listed above.
- Mark each r2 finding FIXED or NOT FIXED: N1, N2, N3, N4, N6, N7, the wrap, F9, N8.
- Check the teaching:
  - TOF is 40–60 % false;
  - the deciding-digit mark clears its neighbours;
  - the signs are not patterned;
  - the Model is an item M6 gets wrong;
  - "=" appears at most ceil(n/6) times and is never item 1 of a Test or quiz;
  - the chant and the Remember line fit what the page deals;
  - the keys are right.

### B. Changed passed pages: before (6d1ffb80) vs after (a5d1cb2d). Each must stay at least 8, and change only as a fix.
1. Lesson 1 (detailed g2-nbt3): the Number sense compare items on P1, which the builder changed to minNum 21.
2. placevalue:identify Review / Test at S and L:
   - with support=chart, the heads come back (a teacher's choice);
   - by default, no heads;
   - screen: the card and quiz numeral is now 40 / 48 / 56 px.
3. unit_form and value: the screen word size on the worksheet, card and quiz, now at least 16 pt.

## Write
`design/audit/runs/lf-placevalue/critic-compare3.md`, containing:
- the grade table;
- the r2 findings, FIXED or NOT FIXED;
- new findings, each with page, size, numbers and the check that would catch it;
- `VERDICT: PASS` / `FAIL` for compare, and for B1, B2 and B3;
- the PNG paths you graded.

Edit no other file. Do not commit.
