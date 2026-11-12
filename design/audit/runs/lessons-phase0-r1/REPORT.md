# lessons-phase0 critic r1 (2026-10-30)

Independent critic (mq-opus-medium), branch `claude/sweet-newton-c8wrv1-lessons-phase0` @ b8ba85bd. Grades: `grades.jsonl`
(committed by the critic; it could not write this file, so the lead saved its report here verbatim in substance).

**VERDICT: FAIL (min score 3)**

Node gates run by the critic: ws-lesson-unit OK (79), ws-lesson-coverage OK (0 passed / 3 stale / 7 draft), ws-layout-unit
OK (542), ws-lesson-seed --check OK. Every content defect below passed all four.

| Item | C1 | C2 | C3 | C4 | min |
|---|---|---|---|---|---|
| add pupil-p1 (check) | 7 | 6 | 6 | 6 | 6 |
| add key-p1 | 7 | 6 | 6 | 6 | 6 |
| add key-p2 (routing) | 8 | 6 | 6 | 7 | 6 |
| add pupil-p3 + key-p4 (sheet) | 8 | 8 | 8 | 8 | 8 |
| sub pupil-p1 | 6 | 6 | 6 | 7 | 6 |
| sub key-p1 | 7 | 7 | 6 | 7 | 6 |
| sub key-p2 | 8 | 7 | 6 | 7 | 6 |
| sub pupil-p3 + key-p4 | 7 | 8 | 6 | 7 | 6 |
| round pupil-p1 | 6 | 4 | 5 | 6 | 4 |
| round key-p1 | 6 | 3 | 5 | 5 | 3 |
| round key-p2 | 8 | 4 | 6 | 7 | 4 |
| round pupil-p3 + key-p4 | 8 | 8 | 7 | 8 | 7 |
| Engine (correctness / design fit / maintainability / gates) | 6 | 7 | 7 | 6 | 6 |

Caps: H1 (round key-p1 Q1, AK-4) C2 ≤ 3; H3 (round Q4 "1 more" under a "10 more, 10 less" route) C2 ≤ 4; H8 (add Q2
doubled slot) C4 ≤ 6; H13 measured bands ≥ 30 % C3 ≤ 6.

Right: one `pre-skill-check` role, routes optional, detailed lessons byte-identical (0/140); the teacher tag is small, grey,
one line and reads as teacher-only; questions in curriculum order; the lesson.js extraction and the library / schema /
coverage model are clean; the add lesson sheet without its Warm-up is classroom-ready at L and S.

## Findings

| # | Where | Rule | Defect | Fix | Machine check |
|---|---|---|---|---|---|
| D1 | add Q2 | H8 | "12 13 [ ] 15 16" box plus an "Answer: ___" line; key fills only the line | one slot (the box) | slots-per-cell vs key answers lint |
| D2 | add Q3 | content | item asks Same / Not the same; table says "Step 1 starts with the bigger number" | pin `compare_groups` to "which has more", or rewrite the row | per-question `checks` text + name-read of the dealt item |
| D3 | add Q2 | range | counts 12–16, routes to Y1.B1.S6 (within 10) | `opts: {band: 10}` | coverage: item numbers within the step's range |
| D4 | check page | H13 | separate boxes with up to 40 mm gaps (`gapAdd`), add S ≈25 % blank foot, paired cells misaligned | one grid growing to the body, or routing table in the spare room | page gap / blank foot / paired-row alignment lint; make ws-lesson-samples H13 blocking |
| D5 | round Q4 | H3 | "1 more than 33" under the "10 more, 10 less" route; `placevalue:more_less_10` unpinned (`families/placevalue.js:72`) | pin the 10-more / 10-less forms; audit every prereq ref for unpinned pools | deal N seeds per prereq, content-audit name reader against the prereq title |
| D6 | round key-p1 Q1 | H1 / AK-4 | key prints "Answer: 77" on an extra line, blank left empty (7 key slots vs 6) | `seq_10` through a kit cell with one boxed slot | ws-print-lint AK-4 exists: make it blocking in precritic for the 3 sample skills |
| D7 | round Q1 | standard | two instructions, legacy text line, 120 mm answer line; route "Count in 10s" is multiples of 10, not 67, 77 … | same kit cell as D6, multiples-of-10 sequence | doubled-instruction lint + D3 range check |
| D8 | sub Q3, Q4 | PAGE_TYPES 2.10 "No supports" | exchange box on 16 − 8; `check: true` adds a second task for one point | scaffold level 0, drop `check: true` (`families/addsub.js:213-214`) | precritic: pre-skill-check cells carry no scaffold and one response |
| D9 | sub Q1, round Q2 | H13 | full-width cell ≈31 % blank each side, ≈32–33 % foot bands | pair short items two-up | ws-lesson-samples H13 blocking |
| D10 | sub pupil-p3 L | H2-class | Guided band clips "Independent Practice: Subtract."; key unclipped (pupil ≠ key geometry); came with the Warm-up removal | let the strip move / rows reflow | L-OVERLAP on strip text + pupil/key twin geometry diff |
| D11 | round S sheet | density | ≈17 % (≈50 mm) blank foot after the Warm-up removal; step 4 wraps a widow | rows grow into the freed height | blank-foot lint on lesson sheets at every size |
| D12 | key-p2 | job | "What it checks" prints the design `why`, not what the question asks; page 45–55 % blank; titled "I Can …" on a teacher page | `checks` field per prereq; table in the check key's spare room | schema rule on `checks`; key-page fill lint |
| D13 | titles | consistency | "Prerequisite check" vs "Prerequisite Check"; sub L title wraps | one shared string | string-constant check |
| D14 | detailed T6 | D1 claim | T6 (`detailed-lesson.js:190`) still builds its own table | T6 calls `routingTableHtml`, or correct the claim | one-export grep gate |
| D15 | pre-skill-check | contract | `routeTagHtml` / `routingTableHtml` hard-code 9 pt, #949494, borders, paddings | CSS classes emitted only with routes (keeps D3) | literal-style lint on roles output |
| D16 | routed `planCheck` | maintainability | magic numbers (1.6 mm/char, 0.5 em, 0.7 / 0.75, 40 mm), no unit tests of routes / routePlan / routeTagLines | ws-layout-unit cases | — |
| D17 | gates | process | D2 D3 D5 D7 D8 pass every gate; AK-4 / H13 known but not blocking; `--bind-stamps` re-bound passes to changed renders | prereq item checks; sample skills in precritic with AK-4 / H13 blocking; `--bind-stamps` refuses a changed render | — |
| D18 | registry | D2 | `buildLesson` hard-codes the five core part ids; only lesson-role parts are plug-in | a build hook per registry part | dummy-part unit test |
| D19 | sub pupil-p4 (not scored) | frame | last grid row has no bottom rule; Check lines on the footer; probably pre-existing | trace | ws-print-lint frame closure |
| D20 | round order | LR-17 | Q3 (closest to rounding) before Q4: order follows lesson id, not closeness | swap, or state curriculum order as the rule | — |

Engine: correctness 6 (D5 D6 D8 D10), design fit 7 (D1 and D3 hold; D14 D15 D18 short), maintainability 7 (clean
extraction; D16), gates and tests 6 (D17).

Speed note: D6 and D9 were already measured by the builder's own tools; had those checks blocked, the round would have
started two defects lighter. D2 D3 D5 D8 are ≈20 min of data edits in `js/modules/lessons/families/*.js`.
