# lf-placevalue critic r1 — brief (independent critic, Opus medium)

You are the INDEPENDENT critic of lane lf-placevalue (lessons-first wave 1). You did not build this work. Grade it; do not fix it.

**Scope (batch 1, CCSS BUILD lesson #1 "Read and write numbers to 1,000", 2.NBT.A.3):**
`placevalue:identify`, `placevalue:value`, `placevalue:expand`, `placevalue:combine`, `placevalue:unit_form`.

**Read first:** `design/audit/RUBRIC.md` (all of it, especially "How a page counts as graded", the hard caps H1–H17 and
§6.1 the visual-quality questions), `WORKSHEET_DESIGN_STANDARD.md`, `PEDAGOGY_STANDARD.md`, `design/PAGE_TYPES.md`,
the signed spec card `design/cards/pv/pv.md`, `design/audit/LESSONS_LEARNED.md` (classes L1–L18), and the lane's
precritic table `design/audit/runs/lf-placevalue/precritic-r2.md`.

**Renders:** produce them yourself from this tree (branch `claude/lf-placevalue`), one browser command at a time:
```
node tests/scripts/ws-grade-render.cjs --skills <the five> --roles independent,more-practice,guided,scripted-model,error-analysis,test,review,true-false,reason-it,stretch,opener,lesson --size S,M,L --out <your dir>
```
(it also writes card-1280 / 820 / 390, worksheet-1280 and quiz-1280 for each skill). Look at every PNG you grade.
Also open the option panel values the card offers (§7a) on at least the independent page: band 99 / 999 / 9999,
zeroPlace none / some / always, support chart / labels / none, identify response circle / bank, value form value / unit /
notation, expand frame boxes / line and form notation, unit_form rename more, combine order scrambled.

**Grade:** every page type × size × skill, and every screen host × skill, on the four criteria C1–C4 of RUBRIC, with
the hard caps applied. A page passes only at ≥ 8 on all four. Write numbers you measured (items a page, largest empty
band, digit size), never impressions (L9). Pedagogy: does each page teach the skill named, one new thing per step, the
zero place kept, nothing in the drawing giving the answer away, instructions / steps / Say lines following the item?

**Write** `design/audit/runs/lf-placevalue/critic-r1.md`: a table (skill × page type × size, and skill × host) with the four
grades and the cap applied; then numbered findings `F1 …` each with the page, what is wrong, the rule id, and whether a
machine could have measured it (name the check). End with `VERDICT: PASS` (every graded page ≥ 8 on every criterion)
or `VERDICT: FAIL` and the list of failing (skill, page, criterion). Do not edit any other file.
