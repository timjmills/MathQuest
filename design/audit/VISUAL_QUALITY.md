# Visual quality — why some visuals are weak, and how we make every one excellent (2026-10-31)

Owner (2026-10-30): "some of those who have passed I don't like the quality of the visuals… investigate why the visual
choices are not always high quality and using all resources possible revise any MD guidance AND ways we are thinking about
the visuals to make excellent visuals for each problem."

Evidence (Phase 1, three independent explorers): `design/audit/runs/visual-quality/a-renders.md` (17 skills rendered on
print S/M/L and card 390/820/1280, worksheet, quiz), `b-causes.md` (process root causes, census of 659 skills),
`c-research.md` (how strong K–6 materials draw each representation; content model only). Before-screenshots:
`design/status/visual-quality/before/`.

## 1. The two owner examples

**Addition Word Problems (within 20, No Pictures)** — `addition:add_wp_20_plain` (an alias of `add_wp_20`), template
`word-work`. Rated 4/10.
- W1 A `+ − × ÷` sign row on a Grade 1 page that only adds (× and ÷ are not taught yet; the row is noise).
- W2 A 3-column digit grid with a carry row for 13 + 2 (column regrouping is taught in Grade 2; sums to 20 are solved by
  counting on / make ten, 1.OA.6). The work area is a Grade 3 algorithm on a Grade 1 item.
- W3 A unit-word bank with nonsense distractors ("books / boxes / days") floating beside the grid.
- W4 The answer line has no label; on paper the scored place (the heavy bottom row) is not obvious.
- W5 About 40 % of every cell is empty (H13), 4 per page.
- W6 Screen (390): the same grid, with the answer row highlighted inside a 3-column frame; label buttons below a bare line.

**Is It a Fact Family? (+/−)** — `addition:fact_family_sort`, a legacy `_wsCell` HTML cell (no `q.cell`). Rated 3/10.
- F1 No number-family drawing: the three numbers are a bare row in wide-spaced monospace digits. The relation (two parts
  make the whole) is stated in a rule box but never DRAWN, though `cells/bond.js` and `cells/family.js` exist.
- F2 Three response areas for one answer: Yes/No tick boxes, an "Answer:" line, and a "Say: ___ and ___ make ___" frame
  (which also wraps onto two lines).
- F3 I Can title built from the label: "I Can add is it a fact family? +/−".
- F4 Screen card broken: the Yes tick box collapses to a corner, the No row becomes a 2-digit typed input.
- F5 About 35 % of every cell empty.

## 2. The same weaknesses across the app (17 skills, `a-renders.md`)

| # | Class | Skills | Example |
|---|---|---|---|
| P1 | Large empty band in the cell (≥ 30 %) | 11 | even the passed `sub_*_no_regroup` cells are ~45 % empty |
| P5 | Paper ≠ screen | 7 | tape diagram: outlined boxes on paper, solid black bars on screen |
| P2 | Doubled or unlabelled answer area | 6 | box + bare line; chips + "Answer:"; money total with no ¢ |
| P4 | The relation has no representation | 5 | word problems with no bar; arrays with no "× =" sentence; fact family |
| P9 | Weak line weights / type hierarchy | 5 | hairline bond lines, 10 px tick boxes, hands drawn alike |
| P3 | Scaffold that does not fit the item | 4 | × ÷ on an addition page; carry boxes on 1-digit sums |
| P6 | Legacy cell (no kit template) | 4 | carries the worst defects of all |
| P8 | Title / instruction grammar | 4 | "I Can make odd or even?", circle vs check on one cell |
| P10 | Size L does not change the layout | 3 | |
| P7 | The answer or method given away | 2 | "ends in 3" caption on odd/even |
| P11 | Ragged wrap of repeated objects | 2 | coins wrap 3 + 1 |

Census (`b-causes.md` §Measurements, 659 of ~732 skills sampled): **342 (52 %) still emit no kit cell**; of 32 relation
skills (families, bonds, make ten, compare), **21 have no kit drawing** — all 9 `number_families_*`, `fact_family_sort`,
`mult_div_fact_family`, `make_ten`. No fact-family skill uses `family.js` or `bond.js`.

## 3. Root causes — why these were built, and why they read as "passed"

| # | Cause | Evidence |
|---|---|---|
| RC1 | **"Never graded" looks like "passed".** Neither example ever passed the redesign (`redesign-passed.js` holds 7 subtraction ids). They were seen only by the content gate, a template critic grading OTHER skills, and the WRM-tagging critics. | `b-causes.md` §0 |
| RC2 | **Critics may route around a visual defect.** The WRM critic saw the × ÷ bank and the typed yes/no (`R-Y1-critic-r2.md` 65, 72, 135, 199) and fixed it by marking the link "partial"; no defect was filed on the skill. | RC2 |
| RC3 | **One template per problem class, with no band gating.** `word-work.js:2` "ONE cell type for every whole-number word problem": the Grade 3 column algorithm, four signs and a distractor bank are drawn for a Grade 1 story because nothing scales the parts to the skill's grade and band. | RC3 |
| RC4 | **The rubric never asks "is this the right drawing for this relation?"** C2 names ten frame / place-value chart / number line only; no hard cap for a missing representation, a scaffold that does not fit, an unlabelled answer area, or a garbled title. | `RUBRIC.md` §2, §4 |
| RC5 | **New legacy cells are still built.** L7 says "new work goes straight to a kit cell" but its check (`ws-print-lint` INK / FONT) passes a black-and-white legacy cell; `fact_family_sort` was written as `_wsCell` HTML on 2026-10-24. | RC5 |
| RC6 | **Precritic measures geometry, never visual CHOICE.** Every gate checks fit, clipping, density, ink, font; none asks whether every drawn part belongs to the item or whether the relation is drawn. Critics sample, so what no gate measures is caught only by luck. | RC6 |
| RC7 | **A template pass is inherited by every skill on it**, across grades and bands nobody graded (word-work passed on Grade 3–4 stories; Grade 1 copies inherited it). | RC7 |
| RC8 | **The good drawings exist but nothing routes skills to them.** `word-work.js` already has `barLayout` (story + part-whole bar + labelled answer box) and `framesLayout` (number sentence + answer), but only the lesson maker uses them. The graphic library is "PLANNED"; spec cards never name a drawing; 6 of 210 WRM representations are MATCH. | RC8, `word-work.js:993`, `:1050` |
| RC9 | **Research reached thin sources.** Explorer (c) found no official WRM / MW4K / K5 pages without logging in; several drawing specs rest on general convention (marked *conv*). | `c-research.md` |

## 4. Fixes

### 4.1 Guidance (Phase 2, this lane)
1. **`WORKSHEET_DESIGN_STANDARD.md` §"Visual quality bar" (VQ-1 … VQ-10)** — the concrete checks every cell meets:
   VQ-1 the relation is drawn (representation map); VQ-2 ONE response area per answer, a defined slot shape, and a label
   or unit beside it; VQ-3 every drawn part is live for THIS item and band (no × ÷ on an add page, no column grid inside
   20, no distractor that is not a story noun); VQ-4 drawings come from the graphic library; VQ-5 numbers set in
   proportional Andika at the working digit size, never letter-spaced; VQ-6 stroke hierarchy (structure 1.5 pt, parts
   0.75–1 pt, never hairline); VQ-7 the answer place is in the same position in every cell; VQ-8 paper = screen drawing;
   VQ-9 the title and instruction are grammatical sentences written for the skill, never built from the label;
   VQ-10 no new legacy HTML cell.
2. **Representation map** (WDS + `EXTENSION_PLAYBOOK.md`): relation → required drawing → library entry (part-whole /
   fact family → number bond or fact triangle; compare → comparison bar; equal groups → array or groups bar; add / subtract
   within 20 story → part-whole bar + number sentence; place value → base-10 / place-value chart; fractions → fraction bar
   or circle; measure → ruler / scale; time → clock).
3. **`RUBRIC.md`**: C2 asks "is the relation drawn with the right representation?"; new hard caps H14 (relation not drawn:
   C2 ≤ 6), H15 (a drawn part that is dead for the item: C3 ≤ 6), H16 (answer area undefined, unlabelled or doubled:
   C1 ≤ 6), H17 (garbled title / instruction: C4 ≤ 6); a skill is graded only on ITS OWN renders (no inheritance across
   grades or bands, RC7); a critic files a defect on the skill, never "partial" alone (RC2).
4. **`LESSONS_LEARNED.md`** L12–L15 and the PRE-FLIGHT line "visual quality bar".
5. **Never-graded register (RC1):** the Skills screen mark already reads only `redesign-passed.js`; the visual-quality
   check prints the TEMPLATE-ONLY / NEVER-GRADED counts so "passed" is never assumed.

### 4.2 Automatic checks (on precritic's path, backtested — failing on the base commit, passing on the fix)
`node tests/scripts/ws-visual-quality.mjs` (node, no browser; `--skill`, `--report-only`, `--self-test`):
- **VQ-REP** — a skill whose id / label / CCSS names a relation (fact family, number family, bond, make ten) emits a
  kit cell whose template draws it (bond / family / family-check / bar). Fails `fact_family_sort` today.
- **VQ-ONEANSWER** — a cell holds one graded response area: no tick list plus an "Answer:" line, no Say frame with
  blanks inside the graded cell. Fails `fact_family_sort` today.
- **VQ-LIVE** — word-work: the sign choices drawn are only the operations the skill's pool can deal (a single-operation
  K–2 page draws none, or + − only); no column grid when every answer is ≤ 20; the unit bank holds no filler words.
  Fails `add_wp_20_plain` today.
- **VQ-TITLE** — the I Can title is a sentence: no "?", no "+/−", no "is it", no label text pasted after "I Can <verb>".
  Fails `fact_family_sort` today.
- **VQ-NOLEGACY** — the pinned list of skills with no kit cell may only shrink (a new legacy skill fails).

### 4.3 The graphic library (start)
`js/modules/sheet/graphics/` — pure ES (SCC-01), token-driven (sizes S/M/L, ink, the one grey, stroke ladder), one
drawing on paper and screen. First entries: number bond, fact triangle, labelled answer area (box + unit), number
sentence frame, part-whole bar. The catalogue is `design/GRAPHIC_LIBRARY.md` (id, what it shows, sizes approved, where
used, critic evidence). Existing approved drawings (ten frame, number line, base-10, clocks, coins, fraction models)
are listed there and re-exported, never redrawn.

### 4.4 The two owner examples
- `add_wp_10/20` (+ `_plain`) and `sub_wp_10/20` (+ `_plain`): a **sentence** layout for stories whose answers are ≤ 20 —
  story, the number sentence `[ ] ◯ [ ] = [ ]` (the pupil writes the sign in the circle), the answer box with the
  unit word printed beside it; the part-whole bar stays an option. No column grid, no × ÷, no distractor bank.
- `fact_family_sort`: a kit template **`family-check`** — the three numbers in a fact triangle (largest at the top, the
  whole), "Yes / No" printed words the pupil circles (tap on screen), and nothing else graded; the Say frame goes to the
  model, not the practice cell. Title "I Can tell if three numbers make a fact family".
