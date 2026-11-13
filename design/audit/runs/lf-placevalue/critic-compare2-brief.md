# lf-placevalue critic compare r2 (independent critic, Opus medium)

You are an INDEPENDENT critic. Grade only; do not fix anything.

## Setup
- Branch `claude/lf-placevalue-w2` at 0a078a732. Do not pull.
- Write PNGs under `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-compare2/{after,before}/`.
- For BEFORE pages, make a read-only worktree: `git worktree add <scratchpad>/wt-c2-before fb05bcb1` for the passed pages, or 16748cd8 for compare r1. Remove it when you finish with `git worktree remove --force <path>`.
- Run one browser command at a time, through `tests/scripts/mq-browser-run.sh`. Use `node tests/scripts/ws-grade-render.cjs`; see `--help`.

## Read first
- `design/audit/RUBRIC.md`: C1–C4 and the caps.
- `design/audit/runs/lf-placevalue/critic-compare1.md`: the r1 FAIL, F1–F11.
- `design/cards/pv/pv.md`: PV-04, step 5, M6.
- WORKSHEET_DESIGN_STANDARD CL-2c, CL-4b, CL-4d (new), and the PT-ENG-6 ruling in PAGE_TYPES.md.

## Rulings in force (they cost no point)
- **Lead D3:** engine / role layouts are graded and recorded as ENGINE-ROLES, but not held against pv. Today that means:
  - the opener, scripted-model, review, mixed and pre-skill-check bands;
  - PG-23 / DN-2 pagination (lf-engine is fixing it);
  - the error-analysis "Name wrote:" PUPILTAG;
  - the opener L band 999,999 overflow;
  - worksheet SCREEN-DIGIT 29 px.
- **CL-2c:** teacher-set columns may leave up to 25 % under the grid.
- **PT-ENG-6:** a middle-page strip of up to 25 % is excused.
- **CL-4d (lead 2026-11-13):** a one-line cell whose row stretches it by 30 % or more is centred. H13 exempts the white above and below such a cell when a taller sibling (the worked twin) sets the row, with each band at most 40 %.

## Grade
### A. placevalue:compare, the full re-grade after r1
- Every page type at S, M and L, each with its key:
  - independent, more-practice, test, review;
  - true-false, reason-it, error-analysis;
  - opener, scripted-model, guided;
  - mixed-practice, pre-skill-check;
  - lesson.
- The option values: band=99 and band=999999, closeness=close, lengths=mixed. Reason-it at band=999999 is required: it must stack or lay out under, with no overflow.
- The hosts: practice card 1280 / 820 / 390, worksheet, quiz.
- Say FIXED / NOT FIXED for each of F1–F6 and F9. Judge the teaching:
  - the chant "More digits wins. Then first different digit." against what is dealt;
  - the worked steps mark the deciding digits;
  - M6 is the error shown, with a first-digit case on lengths=mixed;
  - "=" is not pinned and is never the Model;
  - the deciding place spreads on close items;
  - mixed lengths differ by one digit.

### B. Passed pages this round changed. Grade each BEFORE (fb05bcb1's parent 023cafca, or master) vs AFTER. Passed pages may change only as a fix, and each must still be at least 8.
1. **Guided S/M/L** of expand, unit_form and value, identify S, and combine S and L: 12 pages, measured by lf-roles.
2. **placevalue:identify Review / Test / pre-skill-check at S/M/L.** The T/O place heads are now removed (lead ruling PEDAGOGY 4.1a: unaided pages). The chart place names are removed too: judge whether that is right. Test L now holds 12 items, not 10. Also check the quiz, where the online test has no heads.
3. **composing:number_word_form:** the worked-step text now reads "1 one" / "1 ten" instead of "1 ones". Check lesson 1 (detailed g2-nbt3) and the scripted model / guided at band 1000.

## Write
`design/audit/runs/lf-placevalue/critic-compare2.md`, containing:
- a grade table (skill × role × size → C1–C4, plus hosts);
- the r1 findings FIXED / NOT FIXED;
- new findings, each with page, size, numbers and the automatic check that would catch it;
- `VERDICT: PASS` / `FAIL` for compare, and PASS / FAIL for each changed passed group (B1, B2, B3);
- the PNG paths you graded.

Edit no other file. Do not commit.
