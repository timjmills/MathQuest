<!-- spec-card
{"card":"function-table","kind":"template","template":"function-table","families":["algebra"],"match":{"templates":["function-table"]},"config":"design/cards/function-table/card.json","indexSha":"9ad4eb57ab31f4193fcb2c0f8ffd3adbc6a4cc76","bodySha":"c4ee6bea1aa8efa6","format":2,"configSha":"2f3c021fc400"}
{"cited":"AX-4 E36 H1 H5 H13 L1 L3 L11 LR-5 LR-6 P-1 P-3","rules":"AK-1 a0cc12 2 d4709f H13 36f579 VQ-1 dea36a 2 f15b47 3 db17cc 6 cc6e7e 8 6d0278 9 0b5532 10 2ed85c CL-40 2a6dbb SL-6 7a1453 11 183e7a SP-1 87c2cc SCC-01 8aa70b P-1 5a3076 7 aa3040 H1@RUBRIC bf4b29 H2@RUBRIC f5bba0 H3@RUBRIC d7f21f H5@RUBRIC b3892d H9 fd82d1 10 fbd802 L1 799b66 3 901e56 6 6e19d8 10 d2ca35 11 9ebe19 AX-4 2eb6c1 P-3 833e8c INK-5 631a6d P-LC-9 bc47bd TY-2 510243","entries":"R%3AR-EASY-20 d0472c R%3AR-L5-ADD-100 50dce7 R%3AR-L5-MUL-20 730ee8 R%3AR-L5-FACTOR 789377 R%3AR-L20-OUT db1257 R%3AR-HARD-100 7b457d N%3AN-PICTURES-FUNCTION-TABLE-EASY 258e48 D%3AftTask%3Doutputs bcefeb D%3AftTask%3Drule bcefeb D%3AftTask%3Dinputs bcefeb D%3AftTask%3Dmixed bcefeb D%3AftTask%3Dmake bcefeb D%3AftTask%3Doutputs-check bcefeb D%3AftTask%3Drule-check bcefeb D%3AftTask%3Dinputs-check bcefeb D%3AftTask%3Dmixed-check bcefeb D%3AftRules%3D%2B bcefeb D%3AftRules%3D- bcefeb D%3AftRules%3Dx bcefeb D%3AftRules%3D%2F bcefeb D%3AftRules%3Dx%2B bcefeb D%3AftRules%3Dx- bcefeb D%3AftRules%3D%2F%2B bcefeb D%3AftRules%3D%2F- bcefeb D%3Aband%3D10 bcefeb D%3Aband%3D20 bcefeb D%3Aband%3D50 bcefeb D%3Aband%3D100 bcefeb D%3Aband%3D1000 bcefeb D%3AftTable%3D31 bcefeb D%3AftTable%3D32 bcefeb D%3AftTable%3D41 bcefeb D%3AftTable%3D42 bcefeb D%3AftTable%3D51 bcefeb D%3AftTable%3D52 bcefeb D%3AftTrap%3Dtrue bcefeb D%3AftTrap%3Dfalse bcefeb D%3AftFactors%3Dany bcefeb D%3AftFactors%3D2-5-10 bcefeb D%3AftFactors%3D2-3-5-10 bcefeb D%3Asupport%3Dframe bcefeb D%3Asupport%3Dframe-bare bcefeb D%3Asupport%3Dline bcefeb D%3Asupport%3Dline-bare bcefeb D%3Acalculator%3Dtrue 04b8b3 D%3Acalculator%3Dfalse 04b8b3 D%3AskipAfter%3D* 04b8b3 D%3Arole%3Aindependent bcefeb D%3Arole%3Amore-practice bcefeb D%3Arole%3Atest bcefeb D%3Arole%3Alesson bcefeb D%3Arole%3Ascripted-model bcefeb D%3Arole%3Aguided bcefeb D%3Arole%3Aopener bcefeb D%3Arole%3Aerror-analysis bcefeb D%3Arole%3Areview bcefeb D%3Arole%3Apre-skill-check bcefeb D%3Arole%3Amixed-practice bcefeb D%3Arole%3Atrue-false bcefeb D%3Arole%3Areason-it bcefeb D%3Arole%3Astretch bcefeb D%3Arole%3Aword-problems 04b8b3 D%3Arole%3Afact-rows 04b8b3 D%3Arole%3Afact-probe 04b8b3 D%3Ahost%3Apractice-card bcefeb D%3Ahost%3Aonline-worksheet bcefeb D%3Ahost%3Aquiz bcefeb D%3Ahost%3Aboss 04b8b3 D%3Ahost%3Arace 04b8b3 D%3Ahost%3Amap 04b8b3 D%3Ahost%3Amode-dark 04b8b3 D%3Ahost%3Amode-bigboard 04b8b3"}
-->
<!-- rulings
{"v": 1, "card": "function-table",
"skills": ["algebra:function_table_easy","algebra:function_table_hard"],
"rulings": [
 {"id":"R-EASY-20","source":"§1 (easy default: numbers to 20)","skills":["algebra:function_table_easy"],"assert":"range","of":"a","min":1,"max":20},
 {"id":"R-L5-ADD-100","source":"§5.2 (lesson #5: + / - rules to 100)","skills":["algebra:function_table_easy"],"opts":{"ftTask":"rule","ftRules":["+","-"],"band":100},"assert":"range","of":"a","min":1,"max":100},
 {"id":"R-L5-MUL-20","source":"§5.2 (lesson #5: x / / with every number to 20)","skills":["algebra:function_table_easy"],"opts":{"ftTask":"rule","ftRules":["x","/"],"band":20},"assert":"range","of":"a","min":1,"max":20},
 {"id":"R-L5-FACTOR","source":"§5.2; §9.2 (x 2 to x 5 on a 4-row table at 20: table facts)","skills":["algebra:function_table_easy"],"opts":{"ftTask":"rule","ftRules":["x","/"],"band":20},"assert":"range","of":"b","min":2,"max":5},
 {"id":"R-L20-OUT","source":"§5.3 (lesson #20: outputs, + / -, numbers to 20)","skills":["algebra:function_table_easy"],"opts":{"ftTask":"outputs","ftRules":["+","-"]},"assert":"range","of":"a","min":1,"max":20},
 {"id":"R-HARD-100","source":"§1 (hard default: numbers to 100)","skills":["algebra:function_table_hard"],"assert":"range","of":"a","min":1,"max":100}
],
"notOffered": [
 {"id":"N-PICTURES-FUNCTION-TABLE-EASY","source":"§3 (one black-and-white look: no picture themes)","skills":["algebra:function_table_easy"],"option":"pictures"}
],
"todo": [
 {"id":"T-5.1","source":"§5.1","text":"Function tables from the owner's sample sheet: 'Find the rule for each function table' ..."},
 {"id":"T-5.4","source":"§5.4","text":"Top of the box is the default (CL-4b); content never shrinks to fit; one answer place p..."},
 {"id":"T-5.5","source":"§5.5","text":"F1 The rule is written IN the machine box at S and M, under the table at L (one rule pl..."},
 {"id":"T-5.6","source":"§5.6","text":"F2 × 6 is allowed on 3-row tables at band 20 for lesson #5 (the rows are table facts; f..."},
 {"id":"T-5.7","source":"§5.7","text":"F3 Check rows and 5-row tables count as adding a drawing (options-render capacity)."},
 {"id":"T-5.8","source":"§5.8","text":"F4 Two-step rules stay offered on function_table_easy, off by default."},
 {"id":"T-5.9","source":"§5.9","text":"Every PROPOSED decision of section 7a is accepted as written."}
]
}
-->
# Spec card: Function tables: In / Out tables ruled by a rule (`function-table`)

Generated by `node tests/scripts/ws-spec-card.mjs --template function-table` from `design/cards/function-table/card.json` and the repo. Do not edit by hand: edit card.json and regenerate. Builders read this card; critics keep reading the full standards and RUBRIC.

One kit cell, five tasks: an In / Out table under a black-and-white function machine (In -> [rule] -> Out). Use the rule (write each Out), find the rule (every row printed; the pupil writes the sign and the number IN the machine's box where it fits a third of the page, else in the frame under the table), work the rule backward (write each In), mixed blanks, or make your own table. A Check row can follow any task but make. function_table_easy defaults to one + / - step with numbers to 20, four rows in order, filling the Out column; function_table_hard to every rule kind, numbers to 100, three rows out of order, find the rule then Check. Paper, key and the three screen hosts are one drawing.

## 1. What it teaches

Use and find the rule of an input-output table (3.OA.D.9 arithmetic patterns, 4.OA.C.5 generate a pattern that follows a given rule, 5.OA.B.3; EE M.EE.3.OA.8, M.EE.4.OA.5). Owner's lessons: #5 'Find the rule in an input-output table' (Y4 links, G3, W05: ftTask rule, + / - to 100 and x / / to 20) and #20 'Follow a given rule to extend a number pattern' (Y5 links, G4, W09: related, ftTask outputs with + / -).

**Skills on this template** (2; listed in card.json + 2 listed):

- **algebra** (2): `function_table_easy`, `function_table_hard`

**CCSS** (SKILL_STANDARDS of those skills): 3.OA.D.9, 4.OA.C.5, 5.OA.B.3, 6.EE.C.9

**Essential Elements:** M.EE.3.OA.8, M.EE.4.OA.5, M.EE.5.OA.3

**WRM small steps** (SKILL_WRM): Y6.B7 S1, S2 (part)

## 2. Problem types and progression

*From repo sources: the owner's sample sheet ('Find the rule for each function table', 'Complete each function table', 2026-09-25, gen-function-table.js header), EXTENSION_PLAYBOOK 4.15 PF-M3 / PF-M5, the detailed lesson g3-oa9-input-output-rule (its research section 4), data/curriculum/links/Y4.json and Y5.json notes. MW4K / IXL not opened this round (budget); the design standards outrank them.*

**Problem types**

- outputs: the rule is given (machine box), the In numbers printed, write each Out (the worked column 'n + 7' beside each In prints on Model / first Guided rows only: a hint that fades)
- rule: every row printed; write the rule as a sign in a circle and a number in a box (two pairs for a two-step rule), in the machine's box at S / M, under the table where the machine row would not fit a third of the page
- inputs: the rule is given, the Out numbers printed, write each In (the rule worked backward)
- mixed: each row has one blank, some In and some Out
- make: the rule is given and a note says which In numbers to use; the pupil chooses the In numbers and writes their Outs (any rows that follow the rule are right)
- -check: one more In number in a Check row under (or beside) the table; write its Out

**Progression** (one new thing per step, P-1)

1. outputs with + / - to 20 (easy default) -> outputs with x / / to 20 (table facts) -> inputs (backward) -> mixed -> rule (+ / - to 100, then x / / to 20, lesson #5) -> rule with a first row that fits two rules (ftTrap) -> two-step rules (x then +) -> make your own
2. one change a step (P-1): the task, the rule kind or the number size changes, never two at once; the worked column and the machine picture are the hint scaffolds that fade (support frame -> frame-bare -> line -> line-bare)

**Build-list entries on this template** (standards, ladder and full spec of each in `design/BUILD_LIST.md`)

- `add_or_mult` (new) Add or Multiply? — host `algebra:add_or_multiply`
- `formulae` (new) Formulae — host `algebra:use_formulae`
- `function_machine` (new) Function Machines — host `algebra:function_machines`
- `pairs_values` (new) Pairs of Values and Two Unknowns — host `algebra:pairs_of_values`
- `two_variables` (new) Two Quantities That Change Together — host `algebra:two_variable_relationships`

## 3. The drawing

Template `function-table` — `js/modules/sheet/cells/function-table.js`; also js/modules/gen-function-table.js deals the item (every option read there); js/modules/sheet/providers/function-table.js supplies strings, worked steps, wrong answers and misconceptions; screen-cell.js draws the same cell on the practice card, online worksheet and quiz (one input per slot, checked by ftAnswerMatches).

**Sizes S / M / L:** XP-D-15: heavy outer rule, hairline inner rules, heavy rule under the head row, head row bold on the single grey (white when photocopy-safe). Row height Hw + 4 mm (10 / 12 / 14 mm S / M / L); every writing box at least 14 / 14 / 16 mm wide and the same width in every blank (no length leak); numbers at the digit size, heads and rule text at the text size. The machine: 'In', a 4.5 mm arrow, a heavy box, a 4.5 mm arrow, 'Out', 1 mm gaps. Footprint 56 x 61 mm at S (outputs, 4 rows), 55 x 62 mm find-the-rule at S (frame in the machine), 56 x 81 / 56 x 93 mm at L.

- Capacity: Independent / test page, 4-row tables: S 9 (3 x 3), M 9, L 6 (3 x 2) for outputs, inputs, mixed and rule (rule at S / M with the frame in the machine). A Check row or a 5-row table is a bigger drawing: S 6, L 4 (skill-options addsDrawingValues).
- payload: {task, rule [{op, n}], rows [{x, y, hide: null|in|out|both}], check {x, y}|null, support frame|line, machine bool, note?, trap?}; slots in reading order r<i>in / r<i>out, s0 n0 [s1 n1] (frame) or rule (line), chk; q.ans joins them ', '.
- find the rule: exactly one rule of the rule space (+k, -k, xk, /k, xa +/- b, /a +/- b) fits the rows (rulesFitting === 1), so + and x can never both be right; at least three rows.
- Numbers to N (band) caps EVERY number in the table, the rule's own numbers and the Check row included; Max Number lowers it only when set below the band (pvCap). Division is always exact.
- Key (AK-1): the same table with every blank written; a make table shows one right set and accepts any rows that follow the rule on screen.
- Lesson (detailed g3-oa9-input-output-rule and the packet): the anchor chart's step states write the tried rule in the machine's box (machineText), so the chart never puts the frame in the box.

## 4. Rules that apply

From the rule-id index (`design/cards/rule-index.json`, sha `9ad4eb57ab31`). An id written `ID@SRC` is defined in more than one standard.

### 4a. Core rules — apply every one (3 rules; ✱ = quoted in full, the rest cut at a sentence)

**Key and the one answer place (quoted)**

- **AK-1** (WDS) Every generated page has an answer key, and the key is a **facsimile**: the same page, same paper, same cells, same labels, same geometry, with answers overlaid in the pupil's answer slots. A teacher marks by position.
- **AK-2** (WDS) Answers are Andika **700**, black, at the slot's working size, placed exactly where a pupil would write. Working is shown where the page teaches it: regroup digits in carry boxes (on EVERY key - practice, mixed, independent - over VA-13's scratch rule, owner ruling 2026-09-25), partial products, division work rows, quotient and remainder, hands drawn on clocks, shaded parts shaded, plotted points …
- **H13** (RUBRIC) Wasted space inside cells (owner ruling 2026-09-25): a cell whose content leaves an empty band of ≥ 30 % of the cell's height (or width), or a row/section of a mixed sheet sized for a taller item than it holds. Measure it; do not eyeball it past. — C3 ≤ 6

### 4b. Also applies — ids only (30 rules)

Each id's full text is in `design/cards/rule-index.json` (look it up by id) and in the standard it names; open it when the rule is in play. Grouped by the heading that defines them:

- WDS · 3.1 Family — `TY-2`
- WDS · 4.1 Ink — `INK-5`
- WDS · 6.1 Blank width function — `SL-6` `SL-11`
- WDS · 7.4 Keep-out and label options — `CL-40`
- WDS · 15.1 What must match — `SP-1`
- WDS · 16. Accessibility — `AX-4`
- WDS · 18. Visual quality bar — `VQ-1` `VQ-2` `VQ-3` `VQ-6` `VQ-8` `VQ-9` `VQ-10`
- PED · 2.1 The Opener: bands in fixed order — `P-LC-9`
- PED · Sequencing — `P-1` `P-3` `P-7`
- SCC · 0.4 Module map and layers — `SCC-01`
- RUBRIC · 4. Hard caps — `H1@RUBRIC` `H2@RUBRIC` `H3@RUBRIC` `H5@RUBRIC` `H9` `H10`
- LL · The recurring failure classes — `L1` `L3` `L6` `L10` `L11`

## 5. Owner rulings

- **2026-09-25** — Function tables from the owner's sample sheet: 'Find the rule for each function table' and 'Complete each function table' (In (x) | x + 7 | Out), rebuilt as one kit cell and extended: missing In numbers, mixed blanks, make your own, a function-machine header, a Check row, a rule frame that fades to a line, In numbers out of order. (`owner request 2026-09-25 (gen-function-table.js header)`)
- **2026-11-07** — Lesson #5 (Y4 links, G3, W05, 3.OA.D.9): function_table_easy {ftTask: rule} with + / - rules to 100 and x / / rules with EVERY number to 20, so every row is a table fact (x 2 to x 5, / 2 to / 5); two-step rules left out at W05. (`owner's BUILD lesson list, data/curriculum/links/Y4.json note`)
- **2026-11-07** — Lesson #20 (Y5 links, G4, W09, 4.OA.C.5): function_table_easy {ftTask: outputs, ftRules: [+, -]} is the related skill: the same given rule applied to each In number. (`owner's BUILD lesson list, data/curriculum/links/Y5.json`)
- **2026-10-23** — Top of the box is the default (CL-4b); content never shrinks to fit; one answer place per answer (VQ-2). (`WORKSHEET_DESIGN_STANDARD.md, owner ruling 2026-10-23`)
- **2026-11-07** — F1 The rule is written IN the machine box at S and M, under the table at L (one rule place). (`owner 2026-11-07, all as suggested (via lead)`)
- **2026-11-07** — F2 × 6 is allowed on 3-row tables at band 20 for lesson #5 (the rows are table facts; ftFactors restricts). (`owner 2026-11-07, all as suggested (via lead)`)
- **2026-11-07** — F3 Check rows and 5-row tables count as adding a drawing (options-render capacity). (`owner 2026-11-07, all as suggested (via lead)`)
- **2026-11-07** — F4 Two-step rules stay offered on function_table_easy, off by default. (`owner 2026-11-07, all as suggested (via lead)`)
- **2026-11-07** — Every PROPOSED decision of section 7a is accepted as written. (`owner 2026-11-07, all as suggested (via lead)`)

## 6. Misconceptions

For answer keys, `wrongAnswer`, error analysis, True or False? and Reason It (P-TH-13).

- **M-FT1** adds instead of multiplies: reads the rule off one row as the gap (add-for-times) — e.g. 2 -> 6, 3 -> 9: writes + 4
- **M-FT2** reads down the Out column, not across the row: the gap between neighbouring Outs (neighbour-outputs) — e.g. Outs 6, 9, 12: writes + 3 for a x 3 table
- **M-FT3** uses the rule backwards: does the rule forward to an Out to find its In (backwards) — e.g. x 3, Out 12: writes In 36
- **M-FT4** applies the rule twice: to the In and then to the Out (rule-on-output) — e.g. + 4, Check In 5: writes 13
- **M-FT5** sign flipped: + when the Out is smaller (sign-flip) — e.g. 9 -> 5: writes + 4
- From the build list (entries hosted on algebra): 3 times as many = 3 more; uses the first pair only; adds instead of multiplying where letters touch (2l = 2 + l); ignores the brackets; applies the rule forwards when working backwards; reads a two-step machine in the wrong order; stops before listing every pair; lists a pair twice (3,5 and 5,3 when order does not matter); swaps dependent and independent; adds the rate instead of multiplying

## 7. Options and presets

- Every option is read by gen-function-table.js (ftOptions); the five panel controls (Task, Rules, Numbers to, Table, Support) plus ftTrap and ftFactors (lesson 5). Old ids fold on decode (_ftFold).
- addsDrawingValues (lf-algebra r1): ftTask *-check and ftTable 51 / 52 add a drawing (the Check row, a fifth row), so a page of them may hold fewer tables.
- Preset skills: algebra:function_table_find_rule {ftTask: rule}, algebra:function_table_find_inputs {ftTask: inputs} (skill-presets.js).

What the repo offers today (every option value, role and screen host, each with its decision) and the options and preset skills declared in the repo are listed after the Signed line (§7b, informational, not signed).

### 7a. Hosts, roles and options — the decisions (signed)

What the critic grades and the panel may show. Each live line in §7b needs one of: **offered** (shown and graded on every page type and host it reaches), **hidden** (must not be offered on these skills: becomes a notOffered entry of the rulings block, checked by ws-card-rulings --check offered), **out of scope** (offered by the app but not graded on this card; say where it is graded). PROPOSED = pre-filled for the lead from existing rulings and status; signing the card accepts it.

**Option values (offeredOptionsFor)**

- `ftTask=outputs | rule | inputs | mixed | make` — **offered** — the five tasks; one task a page so the instruction says one thing (owner request 2026-09-25; lesson #5 / #20)
- `ftTask=outputs-check | rule-check | inputs-check | mixed-check` — **offered** — a Check row: one more In number to test the rule on; adds a drawing (S 6 a page) (skill-options.js; lf-algebra r1 addsDrawingValues)
- `ftRules=+ | - | x | /` — **offered** — one-step rules; lesson #5 deals + / - and x / / (lesson #5)
- `ftRules=x+ | x- | /+ | /-` — **offered** — two-step rules, off on easy by default (lesson #5 leaves them out at W05); hard deals them (skill-options.js; §9.4)
- `band=10 | 20 | 50 | 100 | 1000` — **offered** — Numbers to N caps every number in the table (pvCap); lesson #5 deals 100 and 20 (skill-options.js; lesson #5)
- `ftTable=31 | 32 | 41 | 42` — **offered** — 3 or 4 rows, In numbers in or out of order (skill-options.js)
- `ftTable=51 | 52` — **offered** — 5 rows: a taller drawing (fewer a page) (skill-options.js; lf-algebra r1 addsDrawingValues)
- `ftTrap=true | false` — **offered** — first row fits a + rule and a x rule, so the pupil tests every row (lesson 5) (detailed lesson 5)
- `ftFactors=any | 2-5-10 | 2-3-5-10` — **offered** — x and / only by the facts the class has learned (lesson 5 r2) (detailed lesson 5 r2)
- `support=frame | frame-bare | line | line-bare` — **offered** — the rule frame and the machine picture: a fading support (skill-options.js (option panel round 3))
- `calculator=true | false` — **out of scope** — a play control on every skill; graded by ws-options-verify BEHAVIOUR, not by this card (skill-options.js play controls)
- `skipAfter=*` — **out of scope** — a play control on every skill; graded by ws-options-verify BEHAVIOUR (skill-options.js play controls)

**Page roles (buildSheet)**

- `role:independent` — **offered** — the pass bar (RUBRIC scope) (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:more-practice` — **offered** — the pass bar (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:test` — **offered** — the pass bar (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:lesson` — **offered** — the pass bar; function_table_easy has lesson data (prereqs.js, lf-algebra r1); function_table_hard still falls back (its lesson data is a follow-up) (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:scripted-model` — **offered** — provider workedSteps real (derived from the item) (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:guided` — **offered** — provider workedSteps real (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:opener` — **offered** — any skill on any page type (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:error-analysis` — **offered** — provider wrongAnswer real (five misconceptions); the cell draws its own Fix places (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:review` — **offered** — any skill on any page type (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:pre-skill-check` — **offered** — any skill on any page type (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:mixed-practice` — **offered** — any skill on any page type (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:true-false` — **offered** — provider wrongAnswer real (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:reason-it` — **offered** — provider workedSteps and wrongAnswer real (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:stretch` — **offered** — any skill on any page type (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:word-problems` — **out of scope** — no stories for a table; function_table_story is the story skill (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:fact-rows` — **out of scope** — not a fact skill: the role reports unsupported (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)
- `role:fact-probe` — **out of scope** — not a fact skill: the role reports unsupported (CLAUDE.md (any skill on any page type); RUBRIC scope notes 2026-09-26)

**Screen hosts**

- `host:practice-card` — **offered** — one drawing with print; the pass bar (RUBRIC (every screen host))
- `host:online-worksheet` — **offered** — one drawing with print; the pass bar (RUBRIC (every screen host))
- `host:quiz` — **offered** — one drawing with print; the pass bar (RUBRIC (every screen host))
- `host:boss` — **out of scope** — game host draws the same card; graded by ws-chromebook-fit, not by this card's critic (RUBRIC scope)
- `host:race` — **out of scope** — game host draws the same card; graded by ws-chromebook-fit (RUBRIC scope)
- `host:map` — **out of scope** — draws the same card; graded by ws-screen-slots (RUBRIC scope)
- `host:mode-dark` — **out of scope** — display mode of the same card; graded by ws-chromebook-fit, ws-screen-slots (RUBRIC scope)
- `host:mode-bigboard` — **out of scope** — display mode of the same card; graded by ws-chromebook-fit, ws-screen-slots (RUBRIC scope)

## 8. Gates

Each runs as `node tests/scripts/<script> …`.

- `ws-precritic.cjs --skill algebra:function_table_easy --strict` — and algebra:function_table_hard
- `ws-detailed-lesson.cjs --lesson g3-oa9-input-output-rule --check --repeats` — the passed long lesson that deals function_table_easy
- `ws-card-rulings.mjs --skill algebra:function_table_easy` — the rulings block (bands, x / / at 20)
- `ws-content-audit.cjs --skill algebra:function_table_easy` — every row fits the rule, numbers inside the band, one rule fits
- `ws-options-verify.cjs --render --skill algebra:function_table_easy` — no value costs the page items without a drawing

## 9. Open questions (recommended answers)

(none)

Signed: owner, 2026-11-07

<!-- informational: not signed. Not hashed, not compared, never read by any check. -->
## 7b. What the repo offers today (informational, not signed)

Listed from the repo at generation. The decisions are signed in §7a; `--check-signed` re-derives this listing from the repo and FAILS on any line without a decision (`[UNDECIDED]`). Not part of the signed card.

**Option values (offeredOptionsFor)** (40 lines; 0 undecided)

- `ftTask=outputs` Task [difficulty], default on function_table_easy (all 2) [offered]
- `ftTask=outputs-check` Task [difficulty] (all 2) [offered]
- `ftTask=rule` Task [difficulty] (all 2) [offered]
- `ftTask=rule-check` Task [difficulty], default on function_table_hard (all 2) [offered]
- `ftTask=inputs` Task [difficulty] (all 2) [offered]
- `ftTask=inputs-check` Task [difficulty] (all 2) [offered]
- `ftTask=mixed` Task [difficulty] (all 2) [offered]
- `ftTask=mixed-check` Task [difficulty] (all 2) [offered]
- `ftTask=make` Task [difficulty] (all 2) [offered]
- `ftRules=+` Rules [difficulty], default (all 2) [offered]
- `ftRules=-` Rules [difficulty], default (all 2) [offered]
- `ftRules=x` Rules [difficulty], default on function_table_hard (all 2) [offered]
- `ftRules=/` Rules [difficulty], default on function_table_hard (all 2) [offered]
- `ftRules=x+` Rules [difficulty], default on function_table_hard (all 2) [offered]
- `ftRules=x-` Rules [difficulty], default on function_table_hard (all 2) [offered]
- `ftRules=/+` Rules [difficulty], default on function_table_hard (all 2) [offered]
- `ftRules=/-` Rules [difficulty], default on function_table_hard (all 2) [offered]
- `band=10` Numbers to [difficulty] (all 2) [offered]
- `band=20` Numbers to [difficulty], default on function_table_easy (all 2) [offered]
- `band=50` Numbers to [difficulty] (all 2) [offered]
- `band=100` Numbers to [difficulty], default on function_table_hard (all 2) [offered]
- `band=1000` Numbers to [difficulty] (all 2) [offered]
- `ftTable=31` Table [difficulty] (all 2) [offered]
- `ftTable=32` Table [difficulty], default on function_table_hard (all 2) [offered]
- `ftTable=41` Table [difficulty], default on function_table_easy (all 2) [offered]
- `ftTable=42` Table [difficulty] (all 2) [offered]
- `ftTable=51` Table [difficulty] (all 2) [offered]
- `ftTable=52` Table [difficulty] (all 2) [offered]
- `ftTrap=true` First row fits two rules [difficulty] (all 2) [offered]
- `ftTrap=false` First row fits two rules [difficulty], default (all 2) [offered]
- `ftFactors=any` × and ÷ by [difficulty], default (all 2) [offered]
- `ftFactors=2-5-10` × and ÷ by [difficulty] (all 2) [offered]
- `ftFactors=2-3-5-10` × and ÷ by [difficulty] (all 2) [offered]
- `support=frame` Support [support], default (all 2) [offered]
- `support=frame-bare` Support [support] (all 2) [offered]
- `support=line` Support [support] (all 2) [offered]
- `support=line-bare` Support [support] (all 2) [offered]
- `calculator=true` Calculator [play] (all 2) [out of scope]
- `calculator=false` Calculator [play], default (all 2) [out of scope]
- `skipAfter=*` Skip appears after [play] (all 2) [out of scope]

**Page roles (buildSheet)** (17 lines; 0 undecided)

- `role:independent` — the skill's own items (all 2) [offered]
- `role:more-practice` — the skill's own items (all 2) [offered]
- `role:opener` (also lesson-opener) — the skill's own items (all 2) [offered]
- `role:scripted-model` (also model) — provider workedSteps: real 2/2 (all 2) [offered]
- `role:guided` — provider workedSteps: real 2/2 (all 2) [offered]
- `role:error-analysis` (also check-it) — provider wrongAnswer: real 2/2; provider misconceptions: real 2/2 (all 2) [offered]
- `role:review` — earlier skills: data.js order (print-sheet.js earlierSkills) (all 2) [offered]
- `role:test` (also test-a, test-b) — the skill's own items (all 2) [offered]
- `role:pre-skill-check` (also pre-skill) — earlier skills: data.js order (print-sheet.js earlierSkills) (all 2) [offered]
- `role:word-problems` — provider stories: real 0/2 (default on function_table_easy, function_table_hard) (all 2) [out of scope]
- `role:fact-rows` — provider stories: real 0/2 (default on function_table_easy, function_table_hard) (all 2) [out of scope]
- `role:fact-probe` — the skill's own items (all 2) [out of scope]
- `role:mixed-practice` (also mixed) — provider stories: real 0/2 (default on function_table_easy, function_table_hard) (all 2) [offered]
- `role:true-false` — provider wrongAnswer: real 2/2 (all 2) [offered]
- `role:reason-it` (also reason) — provider workedSteps: real 2/2; provider wrongAnswer: real 2/2 (all 2) [offered]
- `role:stretch` — the skill's own items (all 2) [offered]
- `role:lesson` — lesson data: prereqs.js 1/2 (FALLBACK, warm-up from the earlier skills in data.js order, on function_table_hard); provider stories: real 0/2 (default on function_table_easy, function_table_hard) (all 2) [offered]

**Screen hosts** (8 lines; 0 undecided)

- `host:boss` — driven by ws-chromebook-fit (all 2) [out of scope]
- `host:map` — driven by ws-screen-slots (all 2) [out of scope]
- `host:mode-bigboard` — driven by ws-chromebook-fit, ws-screen-slots (all 2) [out of scope]
- `host:mode-dark` — driven by ws-chromebook-fit, ws-screen-slots (all 2) [out of scope]
- `host:online-worksheet` — driven by ws-chromebook-fit, ws-envelope, ws-screen-answer, ws-screen-slots, ws-support-ladder (all 2) [offered]
- `host:practice-card` — driven by ws-chromebook-fit, ws-envelope, ws-screen-answer, ws-screen-slots, ws-support-ladder (all 2) [offered]
- `host:quiz` — driven by ws-chromebook-fit, ws-envelope, ws-screen-answer, ws-screen-slots, ws-support-ladder (all 2) [offered]
- `host:race` — driven by ws-chromebook-fit (all 2) [out of scope]

**Options declared today** (`js/modules/skill-options.js`; id, label, values, skills that declare it):

- `band` Numbers to: 10 / 20 / 50 / 100 / 1000 (2)
- `ftFactors` × and ÷ by: any / 2-5-10 / 2-3-5-10 (2)
- `ftRules` Rules: + / - / x / / / x+ / x- / /+ / /- (2)
- `ftTable` Table: 31 / 32 / 41 / 42 / 51 / 52 (2)
- `ftTask` Task: outputs / outputs-check / rule / rule-check / inputs / inputs-check / mixed / mixed-check / make (2)
- `ftTrap` First row fits two rules: free (2)
- `ops` Operations: + / - / x / / (2)
- `order` In numbers: inorder / scrambled (2)
- `pictures` Machine picture: free (2)
- `response` Check row: standard / check (2)
- `step` Steps: 1 / 2 (2)
- `support` Support: frame / frame-bare / line / line-bare (2)
- `task` Task: outputs / rule / inputs / mixed / make (2)
- `tiles` Rows: 3 / 4 / 5 (2)

**Preset skills on these hosts** (`js/modules/skill-presets.js`): `algebra:function_table_find_inputs` → `algebra:function_table_easy` {"ftTask":"inputs"}; `algebra:function_table_find_rule` → `algebra:function_table_easy` {"ftTask":"rule"}
<!-- /informational -->
