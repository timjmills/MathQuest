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

**Named pages to grade (lead ruling R1, 2026-11-07: pv is the template's FIRST family, so these matrix rows have no approved
sibling to compare against; you grade them).** Each is `skill|kind/row size lint rule (count)` from ws-coverage-matrix, run
`/tmp/mq-precritic/20261107-083738-28224`; render each with `node tests/scripts/ws-coverage-matrix.cjs --skills <skill> --rows <kind/row>` or
read the row's saved document in that run. Judge whether the density finding is a real defect (C2 / H13) on that page:

- `placevalue:combine|mixed/defaults S L-DENSITY PG-23 (2)`
- `placevalue:combine|mixed/defaults M L-DENSITY PG-23 (2)`
- `placevalue:combine|sections/ex-each S L-DENSITY GRID-EVEN (2)`
- `placevalue:combine|sections/ex-each M L-DENSITY DN-2 (2)`
- `placevalue:combine|sections/ex-each L L-DENSITY PG-23 (2)`
- `placevalue:combine|sections/ex-each L L-DENSITY SPREAD (1)`
- `placevalue:combine|sections/ex-group S L-DENSITY DN-2 (2)`
- `placevalue:combine|sections/ex-group M L-DENSITY DN-2 (2)`
- `placevalue:combine|sections/pages-2 S L-DENSITY DN-2 (4)`
- `placevalue:combine|sections/pages-2 S L-DENSITY PAGEFILL (2)`
- `placevalue:combine|sections/pages-2 M L-DENSITY DN-2 (4)`
- `placevalue:combine|sections/pages-2 M L-DENSITY PAGEFILL (2)`
- `placevalue:combine|sections/pages-2 L L-DENSITY DN-2 (2)`
- `placevalue:combine|sections/pages-2 L L-DENSITY LONE (1)`
- `placevalue:combine|sections/pages-2 L L-DENSITY PAGEFILL (2)`
- `placevalue:combine|single/ex-each S L-DENSITY GRID-EVEN (2)`
- `placevalue:combine|single/ex-each M L-DENSITY GRID-EVEN (2)`
- `placevalue:combine|single/more-cols2+afterpage M L-DENSITY H13 (6)`
- `placevalue:combine|single/more-cols2+short M L-DENSITY H13 (3)`
- `placevalue:combine|single/pages-3 L L-DENSITY PAGEFILL (1)`
- `placevalue:expand|mixed/defaults S L-DENSITY PG-23 (2)`
- `placevalue:expand|mixed/defaults M L-DENSITY PG-23 (2)`
- `placevalue:expand|sections/ex-each S L-DENSITY GRID-EVEN (2)`
- `placevalue:expand|sections/ex-group S L-DENSITY DN-2 (2)`
- `placevalue:expand|sections/pages-2 S L-DENSITY DN-2 (4)`
- `placevalue:expand|sections/pages-2 S L-DENSITY PAGEFILL (3)`
- `placevalue:expand|sections/pages-2 M L-DENSITY DN-2 (4)`
- `placevalue:expand|sections/pages-2 M L-DENSITY LONE (1)`
- `placevalue:expand|sections/pages-2 M L-DENSITY PAGEFILL (3)`
- `placevalue:expand|sections/pages-2 L L-DENSITY DN-2 (2)`
- `placevalue:expand|sections/pages-2 L L-DENSITY LONE (1)`
- `placevalue:expand|sections/pages-2 L L-DENSITY PAGEFILL (2)`
- `placevalue:expand|single/ex-each S L-DENSITY GRID-EVEN (2)`
- `placevalue:expand|single/more-cols2+afterpage M L-DENSITY PAGEFILL (1)`
- `placevalue:expand|single/more-cols2+afterpage L L-DENSITY PAGEFILL (1)`
- `placevalue:expand|single/more-cols2+short M L-DENSITY PAGEFILL (1)`
- `placevalue:expand|single/more-cols2+short L L-DENSITY PAGEFILL (1)`
- `placevalue:identify|mixed/defaults M L-DENSITY PG-23 (2)`
- `placevalue:identify|sections/ex-each L L-DENSITY SPREAD (1)`
- `placevalue:identify|sections/pages-2 S L-DENSITY DN-2 (4)`
- `placevalue:identify|sections/pages-2 S L-DENSITY PAGEFILL (2)`
- `placevalue:identify|sections/pages-2 S L-DENSITY SPREAD (1)`
- `placevalue:identify|sections/pages-2 M L-DENSITY DN-2 (4)`
- `placevalue:identify|sections/pages-2 M L-DENSITY PAGEFILL (2)`
- `placevalue:identify|sections/pages-2 M L-DENSITY SPREAD (1)`
- `placevalue:identify|sections/pages-2 L L-DENSITY DN-2 (4)`
- `placevalue:identify|sections/pages-2 L L-DENSITY PAGEFILL (3)`
- `placevalue:identify|sections/pages-2 L L-DENSITY PG-23 (2)`
- `placevalue:identify|single/ex-each S L-DENSITY GRID-EVEN (2)`
- `placevalue:identify|single/ex-each S L-DENSITY SPREAD (1)`
- `placevalue:identify|single/ex-each L L-DENSITY GRID-EVEN (2)`
- `placevalue:identify|single/ex-each L L-DENSITY SPREAD (1)`
- `placevalue:unit_form|mixed/defaults S L-DENSITY PG-23 (2)`
- `placevalue:unit_form|mixed/defaults M L-DENSITY PG-23 (2)`
- `placevalue:unit_form|sections/ex-each L L-DENSITY SPREAD (1)`
- `placevalue:unit_form|sections/pages-2 S L-DENSITY DN-2 (4)`
- `placevalue:unit_form|sections/pages-2 S L-DENSITY LONE (1)`
- `placevalue:unit_form|sections/pages-2 S L-DENSITY PAGEFILL (2)`
- `placevalue:unit_form|sections/pages-2 M L-DENSITY DN-2 (4)`
- `placevalue:unit_form|sections/pages-2 M L-DENSITY LONE (1)`
- `placevalue:unit_form|sections/pages-2 M L-DENSITY PAGEFILL (2)`
- `placevalue:unit_form|sections/pages-2 L L-DENSITY DN-2 (2)`
- `placevalue:unit_form|sections/pages-2 L L-DENSITY LONE (1)`
- `placevalue:unit_form|sections/pages-2 L L-DENSITY PAGEFILL (2)`
- `placevalue:unit_form|single/more-cols2+afterpage S L-DENSITY PAGEFILL (1)`
- `placevalue:unit_form|single/more-cols2+afterpage M L-DENSITY PAGEFILL (1)`
- `placevalue:unit_form|single/more-cols2+afterpage L L-DENSITY PAGEFILL (1)`
- `placevalue:unit_form|single/more-cols2+short S L-DENSITY PAGEFILL (1)`
- `placevalue:unit_form|single/more-cols2+short M L-DENSITY PAGEFILL (1)`
- `placevalue:unit_form|single/more-cols2+short L L-DENSITY PAGEFILL (1)`
- `placevalue:value|mixed/defaults S L-DENSITY PG-23 (2)`
- `placevalue:value|mixed/defaults M L-DENSITY PG-23 (2)`
- `placevalue:value|sections/ex-each S L-DENSITY DN-2 (2)`
- `placevalue:value|sections/ex-group S L-DENSITY DN-2 (2)`
- `placevalue:value|sections/ex-group M L-DENSITY DN-2 (2)`
- `placevalue:value|sections/ex-group L L-DENSITY PG-23 (2)`
- `placevalue:value|sections/pages-2 S L-DENSITY DN-2 (2)`
- `placevalue:value|sections/pages-2 S L-DENSITY PAGEFILL (2)`
- `placevalue:value|sections/pages-2 S L-DENSITY SPREAD (1)`
- `placevalue:value|sections/pages-2 M L-DENSITY DN-2 (2)`
- `placevalue:value|sections/pages-2 M L-DENSITY PAGEFILL (2)`
- `placevalue:value|sections/pages-2 M L-DENSITY SPREAD (1)`
- `placevalue:value|sections/pages-2 L L-DENSITY DN-2 (6)`
- `placevalue:value|sections/pages-2 L L-DENSITY PAGEFILL (3)`
- `placevalue:value|sections/pages-2 L L-DENSITY PG-23 (2)`
- `placevalue:value|single/ex-each S L-DENSITY GRID-EVEN (2)`
- `placevalue:value|single/ex-each M L-DENSITY GRID-EVEN (2)`
- `placevalue:value|single/ex-each L L-DENSITY GRID-EVEN (2)`
- `placevalue:value|single/more-cols2+afterpage S L-DENSITY H13 (20)`
- `placevalue:value|single/more-cols2+short S L-DENSITY H13 (10)`

**Also ruled (lead, 2026-11-07):** ws-card-rulings `--check offered` SKIPPED is green for this card (every §7a option is offered);
capacity pins (owner): expand form=notation, value form=unit / notation, identify response=bank, combine zeroPlace=none.
