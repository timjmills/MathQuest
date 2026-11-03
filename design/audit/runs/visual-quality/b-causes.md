# Visual quality: why poor visuals get built and are read as "passed" (explorer b, 2026-10-31)

Reading investigation, Opus low. No code changed. Examples: `addition:add_wp_20_plain` (word-work cell) and
`addition:fact_family_sort` (legacy `_wsCell`). Census script and output:
`/tmp/claude-0/-home-user-MathQuest/cea1479a-7e02-5121-b21e-92a04002c02f/scratchpad/census.mjs` / `census.txt`.

## 0. The facts: neither example ever passed the redesign

- `js/modules/redesign-passed.js:7-15`: the ONE pass register holds **7 ids, all `subtraction:*_no_regroup` / `sub_2d_1d`**
  (lane S3). No addition skill is in it. Neither example was graded by a redesign critic.
- `add_wp_20_plain`: `design/catalogue/addition.md:158`: verdict "merge → `addition:add_wp_20` | alias | inherits", and
  `add_wp_20` (:157) is verdict **fix** ("three items, all the same template, and the page is two-thirds blank").
  `generate-question.js:106` routes it to `add_wp_20`. The skill was never re-audited after the word-work migration.
- `fact_family_sort`: not in the family audit at all (built 2026-10-24, `git log -S` → 876633d, after the audit). The
  only places it was ever looked at are the **WRM tagging** critics: `design/audit/runs/wrm-tagging/R-Y1-critic-r2.md:135`
  "R8: response mode ... B2.S13 `fact_family_sort` ("Write yes or no", typed) | FAIL in R". The remedy there (:199) was
  "Mark `fact_family_sort` in Y1.B2.S13 **partial**" — the link was downgraded; the skill was not filed as a defect.
- The same tagging critic saw the word-work defect: R-Y1-critic-r2.md:65, :72 "word-work cell ... an operation bank
  + − × ÷ and a unit-word bank ... That is not a Reception response", remedy (:199) "Make ... partial". Tagging rounds then
  went on to PASS (R-Y1-critic-r12.md "Verdict: PASS").

So "passed" for these two means: content gate (`ws-content-audit`: the items match the name), the template's own critic
on other skills, and a WRM tagging PASS that grades links, not pictures. All three read to the owner as "passed".

## Root causes

### RC1. No register of "graded", only "passed" — so ungraded live skills look finished
Evidence: `redesign-passed.js` header: "a skill is marked as redesigned only here"; nothing records "never graded" or
"template-only graded". The Skills screen shows every other skill with no mark at all, and lessons/WRM pages list them as
direct links (`data/curriculum/links/*.json`).
Gap: the owner cannot tell a skill graded 8 from one nobody has looked at; a WRM PASS or a template PASS is read as a
skill PASS.
Fix: rule "a skill is shown to the owner as one of PASSED / TEMPLATE-ONLY / UNGRADED"; generate
`design/status/visual-state.md` from census + `redesign-passed.js`. Check: `ws-redesign-passed.mjs --report` prints the
three counts; backtest: both examples must print UNGRADED today.

### RC2. Critics that see a visual defect are allowed to route around it
Evidence: R-Y1-critic-r2.md:199 (above): the defect becomes "mark the link partial". The tagging BRIEF grades
"response mode" (R8) as a link-fit criterion, so the fix lands in the JSON, not the generator.
Gap: no rule that a visual/response defect seen by ANY critic is filed against the skill.
Fix (LESSONS_LEARNED process rule): "Any critic finding about how a skill looks or is answered is ALSO appended to
`design/audit/defects/<family>.md` with the skill id; a link downgrade never closes it." Check: a script greps every
`design/audit/runs/**/critic*.md` for `` `skill_id` `` near R8/visual words and fails when the id has no open defect row.
Backtest: fact_family_sort and add_wp_10/20 would fail today.

### RC3. One template per problem class, with no grade/band gating of its parts ("ONE cell type for every whole-number word problem")
Evidence: `js/modules/sheet/cells/word-work.js:2` "ONE cell type for every whole-number word problem (owner ruling
2026-09-25)"; :10 "the sign row a SMALL row of four boxes + − × ÷"; :13-15 "+ and − a digit-box stack ... and a regroup
row on top when that item can regroup"; :24 "a regroup row on every + / − item (a structural scaffold)"; :20 "a bank of
three label words to copy from"; :213 "the answer's unit and two nouns of the story (else neutral fillers)".
So a Grade 1 sum-to-20 story gets a × ÷ choice, a 3-track carry grid and two distractor nouns, because the template is
tuned for its hardest client (Grade 4 multi-op) and nothing scales its parts down.
Gap: PEDAGOGY P-1 (one new thing per step) and the structural/hint split are applied per template, never per band. No rule
says "a part of a cell that cannot be the answer for this skill is not drawn" (× ÷ in an addition-only skill; a hundreds
track for sums ≤ 20; distractor words in K–1).
Fix (WORKSHEET_DESIGN_STANDARD, new RP rule): "Every choice row, bank and track drawn in a cell must be live for the skill:
the sign row offers only the operations the skill's pool can produce (taken from ws-content-audit's declared union) plus at
most one contrast operation from Grade 2 up; tracks = digits of the largest answer in the band (+1 regroup track only when
the band can regroup); banks in K–1 hold no distractors." Check: new print-lint `L-LIVE` reads the cell payload: sign-row
ops ⊆ declared ops ∪ allowed contrast; track count ≤ digits(max answer)+carry; fails `add_wp_20_plain` today.

### RC4. The rubric has no anchor for "is this the right drawing for this relation"
Evidence: RUBRIC.md:87-88 C2 "The representation fits the maths (ten frame for making ten, place-value chart for place
value, a number line where the skill is about position)" — three examples, no part-whole / fact-family / comparison /
bond rows, no "a skill whose relation has a drawing must show it". C4 (:119-139) checks ink, font, frame, stacking — not
representation. The hard caps (:161-182) have nothing on representation or answer-area polish (unlabelled answer line,
tick boxes AND an Answer line, floating banks).
Gap: a bare-numbers fact-family item can score 8 on every criterion; nothing makes the critic ask "where is the bond?".
Fix: RUBRIC new hard cap H14 "The relation the skill names has a representation in the library (PROBLEM_TYPES §3 /
WORKSHEET_DESIGN_STANDARD 11.8-11.9) and the cell does not draw it at any rung (concrete/pictorial/bridging) → C2 ≤ 6";
H15 "Two answer places for one answer (tick + line), an unlabelled write line, or a bank detached from its slot → C1 ≤ 6".
And a REPRESENTATION MAP table: relation → required drawing (part-part-whole → bond RP-60 or part-whole bar; fact family →
family triangle/bond (`sheet/cells/family.js`, `bond.js`); comparison → compare bars/ number line; equal groups → group
outlines). Check: `ws-rep-map` (node) reads each skill's relation tag (from SKILL_STANDARDS: 1.OA.6 / K.OA.3 / 1.OA.4 ...)
and the templates its items emit; fails when no item at any rung uses a mapped template.

### RC5. Legacy `_wsCell` items can still be BUILT new, and nothing fails them
Evidence: CLAUDE.md "do not add new handlers ... add a kit template instead"; LESSONS_LEARNED L7 "New work goes straight
to a kit cell". Yet `fact_family_sort` (gen-operations.js ~1493-1541, added 2026-10-24) writes
`q.visual = _wsCell(_wsRuleBox(...) + bare numbers + _wsTickList(['Yes','No']))` with no `q.cell`, while `family.js` and
`bond.js` existed. `_wsCell(` occurs 16 times in gen-operations.js. L7's check is `ws-print-lint` INK/FONT, which a B&W
legacy cell passes.
Gap: the rule is prose; the check measures colour and font, not "is it a kit cell".
Fix: gate `ws-no-new-legacy`: the list of skills emitting no `q.cell` (census) is pinned; any NEW id on it fails
(baseline gate like code-snapshot). Backtest: pin at the commit before 876633d; fact_family_sort fails.

### RC6. Precritic measures geometry, never visual choice
Evidence: ws-precritic.cjs:22-40 lists node-lint, providers, content-audit, options-verify, coverage-matrix, print-lint
(`L-ANSAREA L-OVERFLOW L-DENSITY L-PAGEFILL L-SIZE L-SPLIT L-INK L-FONT L-EMOJI ...`), screen-slots, slot-clip,
phone-card, sibling-compare. Every one is about fit, clip, density, ink. None asks: is the drawing the right one, does
every drawn part belong to the item, is the answer area single and labelled, is the cell ≥ 60 % used (H13 is only ≥ 30 %
empty band, and the ~40 % empty word-work cell sits under it when the empty area is split).
Gap: "clean before critic" says nothing about representation; critics then sample (Batch critic / 20 % sample, RUBRIC
:227-241), so a skill outside the sample is never looked at.
Fix: add `L-LIVE` (RC3), `ws-rep-map` (RC4), `L-ONEANSWER` (one scored place per item, a label word or unit beside every
write line), and `L-FILL` (content bounding box ≥ 60 % of the cell area, measured, not only the 30 % band rule) to the
`--skill` plan. Backtest each on the two examples (fail) and on an S3 subtraction skill (pass).

### RC7. Template critics grade a template on chosen clients; copies inherit the pass
Evidence: CLAUDE.md agents rule "Copies on an approved drawing ... go back to low"; word-work.js:18 "round-4 critic, H8"
— the template was graded on its sample skills; `add_wp_20_plain` is an alias of `add_wp_20` and never appears in a
critic file under its own id. The per-family audit verdicts (`design/catalogue/addition.md:157`) were never re-run after
migration.
Gap: "approved drawing" is treated as "approved for every skill that uses it", across grades and bands it was never
graded at.
Fix: rule "a template pass covers only the (skill, band) pairs graded; every other client is TEMPLATE-ONLY until its own
contact-sheet row scores ≥ 8". Check: `ws-redesign-passed --report` (RC1) counts TEMPLATE-ONLY per template; a batch
contact-sheet critic per template covering ALL clients (one row each, the lowest band and the highest) before any client
is marked passed.

### RC8. The visual library exists but nothing routes skills to it
Evidence: `design/wrm-visuals/INDEX.md:23` "MATCH 6 · PARTIAL 103 · GAP 101" — only 6 of 210 representations are MATCH.
IMPROVEMENT_PLAN.md:1299 "A graphic library (owner rule): every drawing ... that has passed 8/10 is saved once and reused"
— marked PLANNED (:1285). Builders choose a drawing per skill from memory; `family.js` / `bond.js` were not used by the
fact-family-sort builder.
Gap: no lookup from a skill's relation/standard to the approved drawing; the catalogue is a to-do list, not an input to
building.
Fix: the spec card (`ws-spec-card --check-signed`) must name the representation id (`V###` / RL id) for each rung, taken
from the RC4 map; the check fails a card whose relation has a mapped drawing but whose rungs name none.

## Measurements

Census: `generateQuestionFor` at range 20, 3 seeded items per skill, node with a DOM shim
(`/tmp/claude-0/-home-user-MathQuest/cea1479a-7e02-5121-b21e-92a04002c02f/scratchpad/census.mjs`, rows in `rows.tsv`, per-family in
`fam.txt`, relation skills in `rel.txt`). It reached 659 of ~732 skills: it hangs in node on `number_theory:divisibility_sort`
(the categories after it are not counted), so the figures are a floor.

1. **No `q.cell` on any sampled item: 342 of 659 (52 %).** A further 19 mix kit cells with legacy/text items; 298 are
   kit cells throughout. Highest no-cell counts: fraction_operations 29, algebra 27, coordinates 23, fractions 21,
   conversions 19, shapes_early 17, multiplication 17, measurement 16, area_perimeter 16, order_of_operations 14,
   decimals 14, addition 14, patterns 13, subtraction 12, number_theory 12, division 12.
2. **Relation skills (ids naming family / bond / compare / make ten / number families): 32 found; 21 have no kit
   drawing at all** (legacy `q.visual` or text only): `addition:fact_family_sort`, `comparison_word`,
   `number_families_add{,_med,_hard}`, `multiplication:mult_div_fact_family`, `number_families_mult{,_med,_hard}`,
   `number_ops_mixed:number_families_mixed{,_med,_hard}`, `composing:make_ten`, `comparing:compare_objects`,
   `decimals:compare_decimal`, `compare_thousandths`, `fractions:compare_frac_lcd`, `integers:compare_int`,
   `order_of_operations:compare_expressions` (plus the 3 partly-text ones). The other 11 use a kit cell (frac-model, pv,
   coins, word-work, family/bond for 5); the word-work compare stories (`sub_wp_compare`, `mult_comparison*`) draw the
   bar only when the option is on. Not one family skill uses `sheet/cells/family.js` or `bond.js` by default outside
   those 5.
3. **Grading history of the two examples:** neither is in `redesign-passed.js` (7 ids, all subtraction). Neither id
   appears in any redesign critic file; only the WRM tagging critics saw them and downgraded the links (section 0).
   "Passed" meant: content gate + template critic on other skills + WRM tagging PASS.
