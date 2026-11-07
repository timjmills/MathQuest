# Detailed lesson 6 (g4-nbt1-ten-times-value): fix round 4

Builder: Opus 5.5, medium effort, 2026-10-30. This round re-fixes after critic rounds 1 and 2 failed.
It runs on branch `claude/sweet-newton-c8wrv1-lessons-6-7` (today's main, plus lessons 6 and 7).
Round 3 (`447beaff`) fixed D1, n11 and n13 in code. This round:
- checks every critic-r2 finding on the rendered pack;
- closes D2 and the open minors;
- makes the gates green on today's main.

Pack: `design/lesson-samples/detailed/g4-nbt1-ten-times-value/`, seed 4242.

## Critic r2 findings: how each is fixed, and the evidence

| Finding | Fixed how (file:line) | Evidence on the r4 pack |
|---|---|---|
| **D1** T4 §6 states the wrong relation for Guided cell 2 | **Round 3:** the note is now `{we.1.bigSmall}, so [[{we.1.rel}]]`. The Guided deal keeps its declared order (cell 1 `tenTimesGuided`, cell 2 `tenTenthGuided`, `roles/lesson.js` CASE_TESTS). `validateDescription` fails a literal ring word (`lessons/detailed/index.js` `ringWords`). **This round adds the rendered gate the critic asked for:** **E41** in `tests/scripts/ws-detailed-lesson.cjs` (`relationCheck`). Every relation a teacher page states must be true of the numbers it names. A "Bigger / Smaller, so …" line must match the pair stated just before it. | T4 §6:<br>- Cell 1 is 9,515 / 2,968: 9,000, 900, 10 times.<br>- Cell 2 is 830 / 8,377: "30 and 300, one tenth of". The next line reads "Smaller, so one tenth of".<br>- E41: 18 statements, all true.<br>Backtest row `e41-relation`: FAIL on the r2 text, OK on the r4 text. |
| **D2** The Check Question's A–D form is not dealt online | New option `tenChoice` (codec **4J**, values two / four) on `placevalue:value` form times:<br>- `skill-options.js:648`, `skill-option-keys.js:201,358`.<br>- `gen-pv.js:311` `TEN_CHOICES4` is ONE fixed set of four words (10 times · one tenth of · the same as · 100 times) for every item and both directions, so the set never gives the answer away. Used at `gen-pv.js:322,385,394` (`q.options` and the cell's `choices`).<br>- The provider's wrong answers (`sheet/providers/pv.js:168`) use only those four words.<br>- The Check Question ref is `TEN({tenValues: false, tenChoice: 'four'})` (lesson file line 202).<br>- A Check Question row is added to the coverage record: `data/curriculum/detailed-lessons.json` `skills.coverage` and RESEARCH §6. | `generateQuestionFor` with these options deals the 4 options on both directions, and the twin draws 4 tiles.<br>`ws-screen-answer --opts {form times, tenValues false, tenChoice four}`: card ok, worksheet 3/3, quiz 3/3.<br>The board (T5 §7) still reads A one tenth of · B the same as · C 100 times · D 10 times. |
| n2 P5 "Draw it." has no frame for 6,000 | `wordProblem.workChart`: `print-sheet.js:4293`.<br>- The Workspace prints an empty Th H T O chart with a row of boxes for each amount.<br>- The key writes 6000 / 600 in key ink.<br>- Lesson file line 136. | Pages 13 and 21. |
| n3 T6 P0 row printed "4000" | Description hook `answerShow` (lesson file line 80) adds the comma to any bare 4+ digit answer. | T6 glance P0 now reads "800 · 4,000 · 50 · …". |
| n4 P0 place words "ones tens hundreds" | Open by the r2 ruling: this is the shared `identify` generator, and it is not below 8. It belongs with that skill. | — |
| n9 T5 Watch printed "3078" | Description hook `lastName(q)` (lesson file line 73) names each last-row pair as printed, with its place pair and direction. | T5 §8 Watch: "Practice 1: 349 and 3,682 (thousands and hundreds, one tenth); Practice 2: 3,078 and 51,657 (tens and ones, 10 times)". |
| n10 P4-2 direction 3 : 1 | **Tried and kept as r3.**<br>- Making Practice 2 end on a one-tenth ones edge (`tenOnesTenth`) gave P4-2 a 2 : 2 split.<br>- But the deal moved, and it brought back a near-look pair on one page: 92,163 and 92,715. r2 had fixed exactly that.<br>- The critic ruled the r2 split not below 8 (pack overall: Practice 5 : 3, exit 1 : 2).<br>- The trial case test was removed, so `roles/lesson.js` is unchanged. | — |
| n11 one digit twice on a P4-2 page | Round 3 (`spreadPage`, and `refAccepts` one-a-page). | P4-2 digits 2, 6, 9, 7: each once. |
| n12 Guided cell 2 a T / O edge | Round 3: part of the D1 deal (`tenTenthGuided` excludes ones pairs). | Cell 2 is 830 / 8,377 (T / H). |
| n13 P4-1 b near the chart's 95; retrieval reused 934 | Round 3 (`tenNoOnes` on Practice 1; retrieval unit form to 9,999). | P4-1: 1,606/128, 5,286/829, 2,178/7,253, 349/3,682. |
| n14 P6 "Write the top value." | The critic said leave it (12-word limit). | — |
| n15 T3 "crossing a hundred" | Round 3: "Band B: the same five kinds, harder numbers." | T3 §2. |
| n16 no lesson 6 entry in `detailed-lessons.json` | Added: `skills.used` (every page role), `skills.coverage` (no `partial` row), presets, and status "in review". | `data/curriculum/detailed-lessons.json` |

## Gates on today's main (the brief's step 2)

**E29: P6 has no item a / b / c.** The cause is CL-11a (owner, 2026-10-23): every item label is now a black number tab, so the exit slip prints 1, 2, 3. The fixes:
- T5 §10 quotes "1. … · 2. … · 3. …".
- T6 rows say "(exit 1/2/3)".
- T2 routine says "exit 2".
- Shared: T6's P6 glance row printed `a. b. c.` for every lesson. It now prints `1. 2. 3.` (`print-sheet.js:4435`).

**E9b: P0 9 %.** The cause is local to lesson 6.
- The description asked for 4 items per prerequisite. The page fits 2 per band, so the role cut each band to 2 items, and its fill estimate then counted 2 rows per band: grow = 1, nothing filled.
- A second cause added to it: the header lost its tab box (owner, 2026-10-23), so the body is 3 mm taller than `headerHeightMm` budgets. `layout.js` still counts `rowTab` 14 mm for a header with tab metadata. That is a kit-wide estimate; it is not changed here.
- Fix: `items: 2` per prerequisite (what P0 always printed). The bands now grow to the body: P0 is at 4 %.

**E11: P4-1 / P4-2 cells at 33 %.** This is a SHARED cause.
- CL-4b (owner ruling 2026-10-23, "top of the box is the default") top-starts every `[data-ws-cell]` cell of a `.ws-grid` (`css/sheet-kit.css:392`). So a cell taller than its item keeps writing room below it.
- `ws-print-lint` was updated for the ruling the same week (L-DENSITY: under a top cell the band below is writing room, judged against its row, H13-ROW). `ws-detailed-lesson` E11, "the site sheetCheck line for line", was not.
- The fix ports the print-lint rule into E11 exactly:
  - A top cell is a template cell that is not write-above, not a workspace template, and has `justify-content: flex-start`. For a top cell the vertical band is the one above the item.
  - The horizontal band and every non-top cell are unchanged.
  - H13-ROW is added: a top cell whose band below exceeds its row-mates' smallest by 30 % of its height fails.
- This is not a loosening beyond the site lint. It is the same rule the deploy gate already applies, plus H13-ROW.
- The same cause put the P5 equation strip (an unnamed `data-ws-cell`) at its top. It was 32 % in lessons 1, 2, 4 and 6. An additive rule centres it again: `.ws-page .ws-grid.dl-wpeq>.ws-cell{justify-content:center!important}` in `roles/detailed-lesson.js:467`.

**Lessons 1–5 with this fix:**
- 1, 3a, 4 and 5 are green (`ws-detailed-lesson: OK`).
- Lesson 2 (`g1-oa1-bar-model-wp-20`) still fails one row, E9: P6 overflows by 5 mm (key 4 mm). That is a separate cause. On today's main the word-work cells get the CL-40 tab keep-out spacer (2026-10-25, `sheet-kit.css:434`), and two stories in a 132.5 mm half no longer fit. It is not touched here (lesson 2's own exit-slip sizing).

## Gate table (branch HEAD, seed 4242)

| Gate | Result |
|---|---|
| `ws-detailed-lesson --lesson g4-nbt1-ten-times-value --seed 4242 --check --copy` | `ws-detailed-lesson: OK`: 49 / 49 PASS. This includes the new E41 (18 statements, all true): E9b max 4 %, E11 worst 28 % (72 top cells), E29 18 quotes. |
| `ws-detailed-lesson --repeats` | `ws-detailed-lesson --repeats: OK`: 35 places, 0 findings. |
| The same `--check` on lessons 1, 3a, 4 and 5 | OK on all four. |
| The same `--check` on lesson 2 | FAIL, E9 only: P6 +5 mm. It is pre-existing on main and has its own cause (see above). |
| `ws-backtest --row e41-relation` | `ws-backtest: OK`: FAIL on the r2 text, OK on the r4 text. `ws-precritic-plan: OK`. |
| `ws-precritic --role lesson --strict` | FAIL (2 of 3 rows), on one finding only: `placevalue:more_less_10#lesson L-OVERLAP CL40-INK: 0 -> 2`, in both the L row and the `--size S` row.<br>- That finding reproduces on today's main (`fbeaa332` exported clean, same command), so it is NOT from this lesson.<br>- The S row finished this time: 796 s, of which 370 s were spent waiting for a browser slot. Its earlier 580 s timeout was the slot wait, not a hang; the run itself is a real FAIL, on that same pre-existing finding.<br>- `ws-grade-render` PASS. |
| `ws-precritic --skill placevalue:value --strict` | FAIL. 15 rows PASS (2 on their baseline).<br>The red rows, sorted:<br>(a) **Fixed by this round:**<br>- options-verify gen: the ten* controls read as "does nothing" because they were tried with form value. Each now declares `appliesTo` / `appliesBase`. The run now gives `ws-options-verify: OK`.<br>- options-render: form "times" capacity. The form now declares `addsDrawingValues: ['times']`.<br>(b) **Identical on today's main (pre-existing):**<br>- options-render support="chart" @S and form unit / notation @S/@L;<br>- the lesson-page print-lint for value (WRAP-OP 0 -> 4, PAGEFILL 0 -> 1);<br>- node-lint LESSON-DATA (no `lessons/prereqs.js` entry for value);<br>- sibling-compare: no approved sibling measured.<br>(c) Card rulings were SKIPPED: value has no spec card. |
| `ws-options-verify --skill value --category placevalue` | OK. All 7 ten* values change the items against their own base. |
| `ws-options-verify --render --skill placevalue:value` | FAIL on 5 pages, the same 5 as main. |
| `ws-content-audit --category placevalue` | OK: 23 skills, 0 failing. Two fixes were needed:<br>- the audit's name reader took "one tenth" in the new presets' names for the tenths place. "one / a tenth" is now read as the relation; the `--self-test` gives OK on 141 assertions.<br>- the story said "1 stickers" at Max Number 100. It now uses the singular. |
| `ws-boot-smoke` | OK |
| `ws-code-snapshot` | OK: 726 codes, 35 categories, with Y7–Y9 appended. |
| `ws-presets-unit` | OK: 118 presets. |
| `ws-standards` | OK |
| `ws-search-terms` | OK: 239/239 queries. |
| `ws-wrm-page-unit` | OK: 1067 lessons. |
| `ws-wrm --report-only` | FAIL (report only: exit 0), as designed. |
| `ws-screen-answer` on the forms the lesson prints | Card, worksheet and quiz are all OK for:<br>- P2/P3/P4-1 {times, 9999, both, values};<br>- P4-2 {99999};<br>- P5 {story};<br>- P6 {tenWrite top, times}, and the same with tenth;<br>- the Check Question {values off, tenChoice four};<br>- the three presets. |
| `node --input-type=module --check` | OK on every JS module touched. `node --check` on every touched .cjs. |

## Automatic checks (LESSONS_LEARNED process rule 00, per round)

| Finding | Class | A check that catches it now | Existed before? |
|---|---|---|---|
| D1 relation word in a script vs the dealt item | script ≠ page | `validateDescription` `ringWords` (static: no literal ring word), and **E41** (rendered: every stated relation is true; Bigger/Smaller matches the pair before it). Backtest `e41-relation`. | No: E29 compares numbers only. |
| options-verify read the ten* controls as inert (form value) | gate context | `appliesBase` on the def; ws-options-verify tries the control on it and compares with that base | No |
| D2 board item type with no skill option online | paper ≠ screen (skill coverage) | None automatic yet. **Proposed:** `ws-detailed-lesson` reads `checkQuestion.ref`, deals it through `generateQuestionFor`, and fails when `q.options.length` ≠ the number of board letters (4). Owner: checks lane. | No. |
| n2 "Draw it." with no frame | pedagogy | Critic judgement; no machine check proposed. | — |
| n3 / n9 numbers without commas on teacher pages | notation | **Proposed:** an E30-style scan of teacher text for bare 4+ digit numbers outside codes and seeds. Owner: checks lane. | No. |
| E29 / E9b / E11 red on main after the CL-11a / CL-4b rulings | gate drift after an owner ruling | Running `ws-detailed-lesson --check` for the passed lessons in the change that lands a kit ruling. **Proposed:** add the five passed lessons' `--check` to `ws-deploy-gates.sh` / precritic `--role lesson`. | No. |

## Speed-ups

- The kit rulings of 2026-10-23 (CL-4b, CL-11a, no tab box) turned three self-check rows red in every detailed lesson, and no lane saw it. A green passed-lessons sweep in precritic would have caught it the day it landed (see the last row above).
- Precritic `--role lesson` waits on the shared two-slot browser runner. Its `--size S` row hit the 580 s wall before; run that row alone when it times out (see the table).
