# lf-placevalue critic nwf r3 — composing:number_word_form, narrow (independent critic, Opus medium)

You are an INDEPENDENT critic. Grade; do not fix. Branch `claude/lf-placevalue-w2` at 0fe802c4 (do not pull). Hard limit ~20 minutes.
Read `design/audit/runs/lf-placevalue/critic-nwf2.md` (N10, N10b, N11, N12; every other page graded there STANDS) and RUBRIC C1–C4.

**Changed since r2 (5a4ca828):** every name on a band-1,000 page keeps the two-line box (`twoLine` from the generator: "one thousand" and
lesson 1's refs included) - N10 / N10b; numeral to words stands two across at S where its 70 mm line fits - N11.

**Grade only:** the lesson S / M / L (number_word_form) pages; independent with `{"band":1000,"zeroPlace":"always"}` at S and L (with
keys); independent and more-practice with `{"wordform":["to_words"]}` at S, M and L; band 1000 independent at M; the live detailed lesson 1
pages with number-name cells (`node tests/scripts/ws-detailed-lesson.cjs --check --out <dir>`; at least p13 and the Practice 2 page). Say
for N10 / N10b / N11: FIXED / NOT FIXED; whether N12 (minor) still holds. Render with ws-grade-render (check `--help` for `--opts`), one
browser command at a time, under `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-nwf3/`.

D3 ENGINE-ROLES stay as in r2 (incl. the guided Model tab row, guided.js). **Write** `design/audit/runs/lf-placevalue/critic-nwf3.md`:
grade table, finding status, any new finding (with the check that would catch it), then `VERDICT: PASS` / `FAIL` for
composing:number_word_form counting r2's grades for every page not re-graded. On PASS list the PNG paths of r2 (main/, opt-*/, hosts) that
stand plus the ones you graded. Edit no other file.
