# lf-placevalue critic r2 — brief (independent critic, Opus medium)

You are the INDEPENDENT critic of lane lf-placevalue (lessons-first wave 1). You did not build this work. Grade it; do not fix it.

**Scope (batch 1, CCSS BUILD lesson #1 "Read and write numbers to 1,000", 2.NBT.A.3):**
`placevalue:identify`, `placevalue:value`, `placevalue:expand`, `placevalue:combine`, `placevalue:unit_form`.

**Read first:** `design/audit/RUBRIC.md` (all of it, especially "How a page counts as graded", the hard caps H1–H17 and
§6.1 the visual-quality questions), `WORKSHEET_DESIGN_STANDARD.md`, `PEDAGOGY_STANDARD.md`, `design/PAGE_TYPES.md`,
the signed spec card `design/cards/pv/pv.md`, `design/audit/LESSONS_LEARNED.md` (classes L1–L18), and the lane's
precritic table `design/audit/runs/lf-placevalue/precritic-r3.md`.

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

**Write** `design/audit/runs/lf-placevalue/critic-r2.md`: a table (skill × page type × size, and skill × host) with the four
grades and the cap applied; then numbered findings `F1 …` each with the page, what is wrong, the rule id, and whether a
machine could have measured it (name the check). End with `VERDICT: PASS` (every graded page ≥ 8 on every criterion)
or `VERDICT: FAIL` and the list of failing (skill, page, criterion). Do not edit any other file.

**Round 2 (rebuild after r1 FAIL).** Read `design/audit/runs/lf-placevalue/critic-r1.md` (the r1 findings F1–F23). Re-grade every page
and host you graded in r1, and say for each r1 finding: FIXED / NOT FIXED / ENGINE (below). Grade the same matrix rows you sampled
in r1 (first family, lead ruling R1) at one size each.

**Rulings since r1 (lead / owner, 2026-11-07):**
- Stretch is OUT OF SCOPE on the card (owner): do not grade it.
- ENGINE findings (lead D3): opener layout (r1 F2, F18 opener half), Reason It's response areas and its answer-line width (F17,
  combine L / unit_form key overflow), sections × pages / ex-group pagination (F21), the lesson's page split and identify lesson DN-2 /
  H13 (lesson.js), scripted-model / lesson step states (F14), screen value box for writeValue (F4 screen), quiz answer kind (F6),
  screen numeral px (F7), review draw zone (F15), test-role bands (test.js). GRADE them and record them as findings, marked ENGINE;
  they do NOT hold a pv skill. The pv verdict counts every other page and host.
- Capacity pins (owner): expand form=notation, value form=unit / notation, identify response=bank, combine zeroPlace=none.
- Opt-in checks now on precritic's path for these skills: H13-ABS (35 %), GRID-EVEN-ALL, WRONG-FITS-SLOTS / WRONG-FILL,
  SLOT-W-EQUAL, DRAW-CAP, SCREEN-DIGIT (weight only for place value), options-render --bands.
- New option: identify `writeValue` (default on) — the owner's 2026-10-10 ruling; grade it on and off.

Write `design/audit/runs/lf-placevalue/critic-r2.md`; end with `VERDICT: PASS` / `VERDICT: FAIL` per skill (engine findings listed
separately, not counted).

**Round 2 builder (2026-11-07, 9f483f78 / 9b67cd84):** every pv cell fits every §7a option value on its own pages (ws-cell-checks:
combine 196 → 0, value 48 → 0, expand 32 → 24, unit_form 22 → 10; combine band=999999 at L clean). Grade the option values too.

**Red rows that are NOT pv's (lead ruling D3; named here, graded, recorded as findings, not holding pv):**
- identify lesson S/M/L at band 99999 / 999999, places [10000] / [100000] and writeValue=false; expand lesson band=999999 —
  `sheet/roles/lesson.js` `chartPage` (zoom never below 1 without a tail item; dH measured at 2 columns): lf-engine.
- identify#lesson DN-2 at L / H13 at S (the value line's taller cells, lesson pagination): lf-engine.
- unit_form Reason It key overflow S/M/L — `sheet/roles/reason-it.js` `prepare` sizes "The answer is ___" by digit count: shared roles.
- SCREEN-DIGIT (identify / expand screen numerals): host files, hosts lane next week.
- the two-skill sections sheet PAGEFILL / PG-23: engine sections pagination (r1 F21).
- precritic r4 (design/audit/runs/lf-placevalue/precritic-r4.md): every remaining red is one of the rows above, sibling-compare (first
  family, lead R1: you grade the rows), or the fact-rows layout crash "Cannot access 'opEm' before initialization" in
  `sheet/roles/fact-rows.js` (integration-branch code; fact-rows is OUT OF SCOPE on the pv card - do not grade it).
