# lf-placevalue critic nwf r2 — composing:number_word_form (independent critic, Opus medium)

You are an INDEPENDENT critic. Grade; do not fix. Branch `claude/lf-placevalue-w2` at 706d940a (do not pull). Hard limit ~35 minutes.

**Read:** `design/audit/runs/lf-placevalue/critic-nwf1.md` (your predecessor's report: N1-N9, the pages that already graded >= 8),
`design/audit/RUBRIC.md` (C1–C4, caps), the signed card `design/cards/pv/pv.md` (PV-03, M10).

**Since r1 (builder r2, design/audit/runs/lf-placevalue/builder-nwf2-brief.md):** N1 named 2-digit wrong answers; N2 the True or
False? claim written one digit a box; N3 true steps under 100; N4 / N8 name box and line breaks; N5 the model's last state shows the
answer (grey); N6 chant "Every box gets a digit." and the lesson deals its own practice options; N7 the space at the highlight split;
N9 the card / worksheet / quiz draw the kit `words` cell (screen-cell.js `wordsTwin`), legacy visual dropped; band 20 deals 0-20 three
across at S; numbers under 100 get T O boxes only.

**Grade:** every page type the r1 report failed (lesson, scripted-model, guided, true-false incl. answerSlot hto, reason-it, opener,
error-analysis at S / M / L), the option pages (band 20 / 1000, zeroPlace, to_words, hto at S and L), and the hosts (card 390 / 820 /
1280, worksheet, quiz). Re-check independent / more-practice / test at one size each (r1 graded them >= 8). ALSO look at the live
detailed lesson 1 (`node tests/scripts/ws-detailed-lesson.cjs --check --out <dir>` renders it): 14 of its pages changed with this
round (its number-name cells) - say whether any regressed.
Render with `node tests/scripts/ws-grade-render.cjs --skills composing:number_word_form --roles <...> --size S,M,L --out <dir>`, one
browser command at a time, under `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-nwf2/`.

**Known, graded, and the lane's position (say if you agree):** the card's EB-SIDE 36-42 % (a short name centred in a wide card; host
width - the screen-numeral class, D3 hosts); to_words capacity 9 / 6 a page (a 70-100 mm write line per item). D3 ENGINE-ROLES (graded,
recorded, do not hold the skill): test.js / review.js row bands, guided / scripted-model / opener / error-analysis / reason-it /
mixed-practice row layouts, lesson.js warm-up side bands and page fill, SCREEN-DIGIT numerals.

**Write** `design/audit/runs/lf-placevalue/critic-nwf2.md`: grade table, N1-N9 FIXED / NOT FIXED, new findings (page, what, rule, the
check that would catch it), ENGINE-ROLES list, lesson 1 verdict, then `VERDICT: PASS` / `FAIL`; on PASS list PNG paths (one per page
type x size, option pages, hosts). Edit no other file.
