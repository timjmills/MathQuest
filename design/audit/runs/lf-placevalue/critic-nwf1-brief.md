# lf-placevalue critic nwf r1 — composing:number_word_form (independent critic, Opus medium)

You are an INDEPENDENT critic. Grade; do not fix. Branch `claude/lf-placevalue-w2` (do not pull). Hard limit ~30 minutes.

**Skill:** `composing:number_word_form` (number names ↔ numerals, 2.NBT.A.3; the last skill BUILD lesson 2 needs). Template `words`,
provider `sheet/providers/pv.js`, generator `gen-algebraic.js`. Signed card: `design/cards/pv/pv.md` (PV-03, M10; options wordform,
band, zeroPlace, answerSlot). Read `design/audit/RUBRIC.md` (C1–C4, caps, "How a page counts as graded"), `WORKSHEET_DESIGN_STANDARD.md`,
`PEDAGOGY_STANDARD.md` as needed, and `design/audit/LESSONS_LEARNED.md` lf-placevalue sections.

**Render** (one browser command at a time; output under
`/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-nwf1/`):
`node tests/scripts/ws-grade-render.cjs --skills composing:number_word_form --roles independent,more-practice,test,review,true-false,guided,scripted-model,error-analysis,reason-it,opener,lesson --size S,M,L --out <dir>`
(it also writes card 1280 / 820 / 390, worksheet and quiz). Option pages on independent S and L: wordform to_words, band 20 / 100 /
1000, zeroPlace some / always, answerSlot hto. Look at every PNG you grade; write measured numbers.

**This round changed:** the words cell is answered in place (rows pack to the ink, columns capped 4 / 3 / 3 at S / M / L, 5 / 6 / 7 mm
over the answer line, names of 3-digit numbers keep two lines so the row's lines align); a lesson (`lessons/families/placevalue.js`
routine `pv-number-words`, `skill:composing:number_word_form`).

**Known reds the lane did not fix (grade them; say if each holds the skill):**
- band=20 at S: 20 items four across leave 45 % under the line (only ten names exist; the layout stretches 5 rows) — pv-owned.
- wordform=to_words: 9 (S) / 6 (L) items a page against 28 / 15 by default (a 70-100 mm write line per item) — pv-owned capacity.
- Lead ruling D3 (ENGINE-ROLES, graded, recorded, do not hold the skill): test.js / review.js row bands (31-33 %), guided /
  scripted-model / opener / error-analysis / reason-it / mixed-practice row layouts, lesson.js page fill and warm-up side bands,
  screen numerals (SCREEN-DIGIT on card / worksheet / quiz: hosts lane), the legacy worksheet / quiz cells.
- Stretch, fact-probe, fact-rows, word-problems: out of scope (card).

**Write** `design/audit/runs/lf-placevalue/critic-nwf1.md`: a grade table (page type × size, option pages, hosts; C1–C4; cap), numbered
findings (page, what, rule id, the machine check that would catch it), the ENGINE-ROLES list, then `VERDICT: PASS` or `VERDICT: FAIL`
with the failing (page, criterion) list; on PASS list the PNG paths. Edit no other file.
