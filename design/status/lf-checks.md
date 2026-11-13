Lane: lf-checks
Title: Lessons-first wave 1: the lesson precritic checks, backtests and gate hygiene
Session: session_013pHDnLVzZVKhyoyiPRYBZA (launched by the lead session_01HVwpAE3g6EZH8idgErP6LP)
Branch: claude/sweet-newton-c8wrv1-lf-checks
Owner of files: tests/lib/ws-lesson-lp.cjs (new), tests/scripts/ws-detailed-lesson.cjs, ws-precritic.cjs (lesson scope), ws-precritic-plan.mjs (lesson rows), ws-deploy-gates.sh (lesson rows, perf slots), tests/fixtures/precritic/backtests.json (rows appended) + lesson-* fixtures, design/lessons-first/units/_TEMPLATE.md, design/lessons-first/patches/lf-checks-to-lf-engine.md
State: paused
Updated: 2026-11-08
Builder profile: — (the lane session builds; Opus 5.5, effort medium per the brief)
Critic rounds: 2, FAIL C1 7 / C2 7 / C3 8 / C4 8 (stopped: rule 7, a defect class survived two rounds)

## Now
- 2026-11-08 (lead, resumed, cap $60): ws-empty-band.cjs - the ONE shared empty-band / footprint check (L25) - built, on `ws-precritic --skill`;
  FAILs on the three critic-failed heads (lf-vocab bebf5b36, lf-placevalue b28a0867 N5 / N6, lf-ops b23e418d div_facts S); add_facts OK against its pin.
  Not independently critiqued yet.
- STOPPED after critic r2 (rule 7): the hand-edited pass fixtures (r1 D4 -> r2 D2) survived two rounds. Root cause and check below.
- Built and wired: LP checks (`ws-detailed-lesson --lp / --sweep`), PC checks (`ws-lesson-samples --check`, phase 0), `ws-precritic --lesson / --unit`,
  `ws-lessons-first-queue --build-only` (BUILD_QUEUE.md), deploy-gate lesson rows, perf run alone; 10 backtest rows PASS + 9 phase-0 rows pending lf-engine.
- The integration head is RED for every lesson lane on app defects (R1-R11 below), not on these tools.
- PR: https://github.com/timjmills/MathQuest/pull/37 (draft, into claude/sweet-newton-c8wrv1).

## Owner go
(none: tools, no owner picture sheet)

## Open questions
- **Q-W1 (owner, hosts lane 2026-11-12):** placevalue:unit_form at rename=more draws a 31.9 % band under its worksheet tile at 1280
  (10.4 mm in a 32.5 mm cell): the tile is stretched to its grid row (a taller tile beside it) and owner ruling CL-4b (2026-10-23,
  css/screen-cell.css "the online worksheet's fitted cell starts at the top of the box") keeps the content at the top, so all the
  spare room is one bottom band. Centring fixes it (tested) but overturns CL-4b. **Suggested answer:** amend CL-4b - a fitted cell
  starts at the top unless its row stretches it by 30 % or more of its height, then it is centred. Not applied until the owner says.
0. (lead ruling 2026-11-08, done) EB-BAND = RUBRIC H13, 30 % of the full cell, the shared rule; lf-placevalue aligns H13-ABS. The four passed
   fact skills (add_facts, mult_facts, sub_facts, div_facts_long) are pinned in design/audit/baselines/empty-band.json (99 keys).

**Facts-lane task (for design/STATUS.md, next week's list):** "Passed fact skills (add_facts, mult_facts, sub_facts, div_facts_long):
real empty bands on pages no gate rendered before ws-empty-band - guided 33-41 %, scripted-model 63-67 % (also ws-print-lint H13),
error-analysis bands, and drawn height vs footprint off by more than 10 % on several roles; pinned 2026-11-08 (empty-band.json, 99 keys)
so lanes are not blocked; fix and tighten the pin."
1. LP-MODELLED flags lesson 1 (g2-nbt3, passed r4) exit item "combine" (expanded form -> numeral) that no anchor chart models.
   Suggested answer: a real gap (PEDAGOGY P-1); fix the lesson (a board row in T4 §5 or a chart panel), do not exempt it.
2. LP-NUMBERS: lesson 6's two minors n1 / n2 (critic r3, accepted as minors) now fail a gate. Suggested answer: fix them
   (5 minutes of lesson data) rather than pin; a passed lesson must be clean.

## Real defects found (owning lane in brackets; lead to route)
| # | Defect | Evidence | Owner |
|---|---|---|---|
| R1 | Lesson 2 (g1-oa1-bar-model-wp-20) does not BUILD at seed 4242: `no add_wp_20 item for "wpBridgeHigh,wpBridgeBigFirst,wpPutTogether,wpClean"` | bisected (today's script on old trees, MQ_ROOT): first bad 944afb79 "Visual-quality fix r2 (WIP)" (add_wp_20 generator). Also makes ws-teacher-wrm FAIL ("Timeout waiting for make it built g1-oa1-…") | visual-quality / ops lane (add_wp_20), with lf-engine |
| R2 | Lessons 1 and 6 Practice pages + keys 17-19 % blank foot (E9b, LP-MEASURE) | bisected: first bad 6bc3cbd8 "Merge fact families (Lane D restart)"; 56cf789c (its first parent) is clean. Picture: P4-1 of lesson 6 ends at ~78 % of the body | fact-family (Lane D) merge / lf-engine (detailed builder rows) |
| R3 | Lesson 2 E9 P6 exit slip +5 mm (status lessons-6-7) | still red before R1 hid it (every commit from a3392d38 on); the brief's 10-25 word-work tab spacing | lf-engine |
| R4 | Lessons 4 and 6 do not build at many seeds (L21): lesson 6 fails at seeds 1, 3, 6, 7, 10, 13, 17, 19, 20 (`no value item for "tenTimesMid"` / `"tenThouTenth"`), lesson 4 at seeds 1, 4, 5, 7-12 … (`no mult_chart item for "chartOddOdd"`, `"chartColsOdd,chartIn9"`) | `ws-detailed-lesson --sweep` (seed 4242, the only seed any gate read, builds). A teacher who reprints with another seed gets an error | lf-engine (detailed dealer) |
| R5 | Lesson 3a (g3-oa5-mult-properties, passed) deals the chart example 2 × 3 again, turned, on Practice 1 at 7 of 25 seeds (13, 14, 19, 20, 21, …) | LP-SWEEP / LP-FAMILY-REPEAT; E24's "chart examples never return" reads seed 4242 only | lf-engine (dealer: chart examples in the forbidden pool for every seed) |
| R6 | Lesson 5 (g3-oa9-input-output-rule) P5 / P5-key: the 1.5 pt band rule under the Workspace is lost by pdfium at 72 dpi (present at 144) | LP-RASTER; tests/fixtures/precritic/lesson-raster.fail.pdf (that page) | lf-engine (kit band rule painted under the next band's fill) |
| R7 | Lesson 7 (g3-oa8, critic r1 FAIL): D1, D2, D3 are all caught; LP-MODELLED adds "share then take away" practised on P4-2, never modelled (the critic's n3) | `--lp` on head | lf-ops / lesson 7 owner |
| R8 | Lesson 6 n1 / n2 (critic r3 minors) still open: T3 "4000", T6 "7000", P4-2 92,163 / 92,715 | LP-NUMBERS | lesson 6 owner |
| R9 | Lesson 1 exit item "combine" never modelled on the chart (Q1 above) | LP-MODELLED, every seed | lesson 1 owner |
| R11 | `subtraction:sub_100_regroup#lesson` / `number_sense:nearest_10#lesson`: 30 L-OVERLAP CL40-INK findings (ink in the label keep-out) on the integration head; the new blocking precritic row lesson-samples-key-L / -S is red on them | ws-print-lint --roles lesson --lints L-KEY,L-OVERLAP on the three samples | ops / placevalue lanes (the cells), lf-engine |
| R10 | `ws-precritic --role lesson` red on the integration head: 13 (document, lint, rule) counts over the pin at L and 13 at S (role sample) | at 56cf789c already 11 over (L-OVERLAP SECTION add_fractions_like / perimeter_intro, L-DENSITY SPREAD, L-ANSAREA H8); 6bc3cbd8 adds L-OVERFLOW PG-12 (coordinate_q1 0->10, seq_2 0->6, vocab_grade_K 0->6, f_to_d 2->4, prime_composite 1->2). Real lints (overflow, overlap), not pin drift: NOT re-pinned | the families' lanes; the fact-family merge for the PG-12 rows |

## Step 1 — gate hygiene
1. `placevalue:more_less_10#lesson L-OVERLAP CL40-INK 0 -> 2`: gone on today's head (L and S print-lint: L-OVERLAP 0); only its pinned L-DENSITY PAGEFILL remains. No re-pin needed. (The role is red for R10.)
2. Lesson 2 E9 (P6 +5 mm): confirmed red on every commit from a3392d38 to f70b3d15; since 944afb79 the lesson does not even build (R1). Cause for lf-engine: R1 first, then R3.
3. `ws-deploy-gates.sh` session 1: `ws-detailed-lesson --lesson <id> --check` for every lesson whose data/curriculum/detailed-lessons.json verdict is PASS (6 rows, read from the file so a newly passed lesson joins by itself) + `ws-lessons-first-queue --check` (node). Today 3 of the 6 rows are red (R1, R2) - that is the drift guard working.
4. `ws-chromebook-perf` in session 3 is kind `excl`: run_session runs it after every other gate of the session has finished, through the runner twice (`$RUNNER $RUNNER node …`: the outer takes one slot, the inner waits for the other), so nothing else can start a browser while it measures. `--list` shows it; the budget counts it serially after the parallel span. `--self-test` OK.

## Step 2 — the checks (tests/lib/ws-lesson-lp.cjs, run by ws-detailed-lesson)
| Check | Reads | Fails on (backtest row, kind) | On the passed lessons today |
|---|---|---|---|
| LP-FAMILY-REPEAT | pool places ×/÷ as {a,b,ab}; T3 spaced-retrieval facts; story frames "N object" per page | lesson 7 critic-r1 packet (`e24-family`, fixture) | all 6 clean at 4242; lesson 3a fails at 7 seeds (R5) |
| LP-TEXT | teacher text: page codes, "no X this time/here/today" vs the named page, "Write four answers. A: … D: …", "Steps are at the top" | lesson 7 D3 (`lp-text-no-x`, fixture) | clean |
| LP-GIVEAWAY | Say / Steps band text vs the page's multi-digit key answers (unless the item prints it); Guided hint (trace, grey ink, data-ws-level) > Independent | lesson 4 r1 a890f61f -> r3 8b4ec4ae (`lp-giveaway`, commit-pair) | clean |
| LP-MODELLED | pool `rep` by skill on P4-n / P5 / P6 vs the anchor charts P2*; story situations (groups / share / add / take / together / compare) vs P2* and T4 board stories | lesson 2 r1 43f9483d -> r4 0e1c71a3 (`lp-modelled`, commit-pair); also lesson 1 r1 9aeaf638 fails | lesson 1 "combine" (R9) |
| LP-NUMBERS | teacher pages bare 4+ digits ("80039 for 839" and H T O chart digits excepted); pupil near-looks (same length >= 4, same first two digits, not a digit permutation) | lesson 6 critic-r3 packet (`lp-numbers`, fixture) | lesson 6 n1 / n2 (R8) |
| LP-FALLBACK | `.mq-cdraw` zoom vs the mode's floor (DOM: `.mq-cfinalgrid` final 0.85, `.mq-cfinal` grid3 0.8, else 1); `debug.sizing.mode` once the role returns it | lesson 7 critic-r1 packet (`lp-fallback`, fixture) | clean (lessons 1 and 5 are final / grid3 at 0.91 / 0.84, by design) |
| LP-PREREQ | P0-key: every writing slot filled (choice groups once); P0 cells: no trace / grey ink / Say / Steps | seeded from lesson 3a P0 with the phase 0 D1 and D8 shapes (`lp-prereq`, fixture) | clean |
| LP-MEASURE | rendered: text >= 8 pt (quiet labels excepted), writing slots >= 8 mm, blank foot <= 8 % on pupil pages and keys | 6bc3cbd8 vs 56cf789c (`lp-measure`, commit-pair) | lessons 1 and 6 (R2) |
| LP-RASTER | PyMuPDF paths (dark, solid, >= 6 pt) on pupil pages and keys; pypdfium2 raster at 72 and 93 dpi; >= 60 % of samples inked | lesson 5 P5 page vs lesson 6 P5 page (`lp-raster`, fixture pdf) | lesson 5 (R6), lesson 7 P6 rule |
| LP-SWEEP | `--sweep`: buildSheet at seeds 1-25 (x refresh 0-2 when the builder takes `refresh`; it does not yet), --jobs 3 pages, built HTML parsed in a detached document; FAMILY-REPEAT, GIVEAWAY, MODELLED per seed | lesson 3a seeds 13/14 vs 1/2 (`lp-sweep`, fixture of saved builds) | R4, R5, R9 |

Fixture honesty: the lesson 7 and lesson 6 pass fixtures are the critic-graded packets with the critic's own fix applied by
hand (each edit is listed in the fixture's `note`); re-point those rows to the fix commits when lesson 7 / lesson 6 land.
LP-PREREQ's fail fixture is seeded (phase 0's own check page lives on lf-engine's branch: see the patch). The phase-0-only
parts (sizing.mode, the short lesson's check page, per-part refresh) are in design/lessons-first/patches/lf-checks-to-lf-engine.md.

Scope commands (new): `node tests/scripts/ws-precritic.cjs --lesson <detailed id>` (= `ws-detailed-lesson --check --repeats`
+ `--lp` + `--sweep` + the `--role lesson` gates, which bring ws-teacher-wrm and ws-lesson-link-uses), `--unit <unit-id>`
(every long lesson of the queue unit; a lesson with no long lesson is named in an N/A row), with `--teacher` `--lesson`
keeps its old meaning (a WRM site lesson).

Not done (cap): Step 3 (ws-integrate links operation). LP-RULINGS, LP-TWIN, LP-INK, `--bind-stamps` (plan §6.3) wait for
lesson cards (phase 0 / lf-engine). Lesson 5 r2 D7 (T6 key answers a question P5 no longer asks) and lesson 2 r3 D2
("Steps at the top") have LP-TEXT logic but no commit-pair backtest row.

## Precritic table (ws-precritic --lesson g4-nbt1-ten-times-value --strict, lane branch = integration head + tests only)
| Gate | Scope | Result | Findings vs baseline | Seconds |
|---|---|---|---|---|
| ws-grade-render --roles lesson | role lesson × 20 sample skills | PASS | rendered 20 unit(s), 256 page(s) | 236 |
| ws-print-lint --source kit --roles lesson | role lesson × 20 sample skills | FAIL | 13 counts above the pin (R10) | 171 |
| ws-print-lint --source kit --roles lesson --size S | role lesson × 20 sample skills | FAIL | 13 counts above the pin (R10) | 187 |
| ws-teacher-wrm | every lesson + every detailed lesson | FAIL | make-it timeout on g1-oa1-bar-model-wp-20 (R1) | 894 |
| ws-lesson-link-uses | detailed lessons using a skill twice | PASS | - | 84 |
| ws-detailed-lesson --check --repeats | lesson g4-nbt1-ten-times-value | FAIL | E9b 19 % on P4-1 / P4-2 and keys (R2) | 62 |
| ws-detailed-lesson --lp | lesson g4-nbt1-ten-times-value | FAIL | LP-NUMBERS (R8), LP-MEASURE (R2) | ~40 |
| ws-detailed-lesson --sweep | lesson g4-nbt1-ten-times-value × 25 seeds | FAIL | 9 seeds do not build (R4) | ~60 |
`ws-precritic: FAIL: 6 FAIL, 2 PASS of 8`. Every red row is a defect of the app on the integration head (R1, R2, R4, R8,
R10), none of this lane's tools: this lane changes no app file. The brief's "passed lesson must be clean" gate cannot be
green until R1 / R2 / R4 / R8 / R10 are fixed by their owners.

## Other gates
- `node tests/scripts/ws-backtest.mjs --row <the 10 new rows>`: 10 PASS (fixture rows 0.1-1.7 s; commit-pair rows 13-160 s).
- `node tests/scripts/ws-precritic-plan.mjs`: OK, 47 rows on the lane's path (the 10 new rows and `repeats-lesson` via `ws-precritic --lesson`).
- `ws-precritic-plan --self-test` OK (11); `ws-detailed-lesson --lp-self-test` OK (25); `ws-deploy-gates --self-test` OK; `--list` shows the new rows.
- `node --check` on every touched .cjs; `node --input-type=module --check` on ws-precritic-plan.mjs; `bash -n` ws-deploy-gates.sh.

## Critic rounds
| Round | Commit | Verdict | Defects | Fixed |
|---|---|---|---|---|
| r1 | 6ecddbba | FAIL 7/7/8/8 | D1 Guided=Independent missed (level counted as hint); D2 "(7000 or 7,000)" false alarm; D3 seeded D8 not the real D8, range clause missing; D4 pass fixtures not reachable states; D5 empty read passes | D1, D2, D3, D5 in fbff1a13 (r2 confirmed); D4 half |
| r2 | fbff1a13 (+5629a7f4) | FAIL 7/7/8/8 | D1 PC-CLIP cannot see D10 (DOM order); D2 = r1 D4: lesson 7 keys keep old working, lesson 6 "9 in 49,715" has no right answer; D3 lesson-samples-key gate red on head on CL40 (now R11); D4 PC-NAME checks clause needs every word, no self-test | D1 scope corrected (PC-CLIP = twin geometry + overflow clip; D10 is print-lint SECTION's), D3 recorded as R11, D4 any-word rule + dead code removed, 0-items guard - after r2, NOT re-graded |

**Stop (rule 7) - root cause of the surviving defect:** the fixture rows' pass states are packets edited by hand, and a hand edit cannot
keep every derived page (keys, charts, T6 working) consistent with the edited item. The machine check: a fixture-consistency lint run by
`--lp-self-test` over every `*.pass.json` (story numbers = pool item, key equation = story, a place-value sentence's digit occurs in its
number and the comparison has one right answer) - NOT built. The real fix: re-point `e24-family`, `lp-text-no-x`, `lp-fallback`,
`lp-numbers` to commit-pairs as soon as lesson 7 and lesson 6 are fixed (the fail sides are already the critic-graded commits).
Until then those four rows prove the FAIL side only; their pass side is hand-made.

Remaining (next checks session): the fixture-consistency lint or the commit-pair re-pointing above; PC-NAME known-true corpus
self-test; a backtest row per PC rule that FAILs only that rule (PC-CLIP has none); lf-engine's LR-5 picture key in ws-lesson-check
(after its merge); Step 3 (ws-integrate links). The 9 phase-0 rows in backtests-phase0.json move to backtests.json with lf-engine's fix.

## Cost
Lane session cost_usd $20.33 at 07:56Z (the lead's reading of the session record); ≈ $32 at 08:45Z by scaling my token estimate to that reading, plus two critic sub-agents (~390k tokens) - about $40 in all, ≈ 1.4 % of the weekly limit ($28 ≈ 1 %); cap $100.

## Log
- 2026-11-08 — pin re-generated with every fix (D7 black SVG, D9, EB-FOOT per-row k, lf-ops' card-plan D8 fix): 20 passed skills, 925 band / 214 side / 218 footprint / 12 role findings pinned (add_wp_10 30, was 238 with the D7 bug). State: paused after critic eb-r2 (rule 7); the post-r2 fixes are not re-graded.
- 2026-11-08 — ws-empty-band critic r2 FAIL 6/4/7/6 (critic-eb-r2.md); stopped by rule 7 (host coverage r1 D1 -> r2 D9). Fixed after r2, NOT re-graded: D7 black SVG ink (paints() alpha-only; fixture row eb-fixture-svg-black), D9 a host that does not render is EB-READ, m9 no-card note; pin re-generated from the corrected run. Open: D8 belongs to lf-ops' ws-card-plan.mjs ("(PROPOSED) on" lists, "out of scope" lines) - sent to lf-ops; m1 footprint on guided / lesson; m7 above / between fixtures; m8 EB-SIDE on mult_properties card 820 / 1280 not eyeballed.
- 2026-11-08 — ws-empty-band critic r1 FAIL 5/6/7/7 (critic-eb-r1.md). Fixed: D1 card host measured (.mq-scell); D2 bands above / between blocks of ink, SVG measured shape by shape, worksheet 6 items; D3 an offered role the app cannot compose FAILs (EB-ROLE); D4 the pin is every skill in redesign-passed.js (20); D5 header no longer claims 30 % separates the classes (approved fact pages at 29.8-34 % are the lead's facts-lane debt), compared unrounded, dead Hw removed; D6 runnable fixture row eb-fixture-band (--html, seeded fail / pass page) in backtests.json; m4 variants at the largest size asked. Not changed: m1 footprint on guided / lesson (their cells do not pair with measured items), m2 the pin counts per render, m6 ws-card-plan.mjs is lf-ops' file byte for byte (one file after merge).
- 2026-11-08 — lead rulings applied: sub_facts + div_facts_long pinned (99 keys after the side-rule change); the practice card host is now measured (its B&W screen cell .mq-scell, not a kit cell; before, the card widths read "no kit cell"); EB-SIDE = content pinned to one side (>= 30 % one side, <= 10 % the other), so a centred screen fact is not a band.
- 2026-11-08 — ws-empty-band (EB-BAND 30 % of the cell, EB-SIDE 30 % of the width, EB-FOOT ±10 % on grid roles), roles from tests/lib/ws-card-plan.mjs (lf-ops, taken unchanged), pin design/audit/baselines/empty-band.json (add_facts, mult_facts: 55 keys - the passed fact family's guided / scripted-model / error-analysis pages carry real bands no gate rendered: e.g. add_facts guided S 33-41 %, scripted-model 63-67 %, also flagged by ws-print-lint H13; pinned so lanes are not blocked, listed for the facts lane), backtests-empty-band.json (4 rows, pending each lane's fix), LESSONS_LEARNED L25. Calibration: on today's head lf-placevalue's H13-ABS (35 % of H less Hw) FAILS the approved add_facts / mult_facts / sub_facts L pages (17.0 mm under 56.75 mm cells = 29.96 %); every critic-failed band is 32-57 %; so EB-BAND uses H13's 30 % of the full cell - lf-placevalue may align H13-ABS to it.
- 2026-11-07 — critic r2 FAIL; small fixes after it (not re-graded); stopped per rule 7; hand-over to the lead.
- 2026-11-07 — lead's asks: --build-only BUILD_QUEUE.md (owner order), phase-0 checks D1-D10 (ws-lesson-samples --check, print-lint blocking rows, backtests-phase0.json), lf-engine's (a) ws-lesson-unit / ws-lesson-coverage on the lesson scope, chartSizing[] read by LP-FALLBACK.
- 2026-11-07 — build: LP checks, --lp / --sweep / --packet / --raster, precritic --lesson / --unit, 10 backtests, deploy-gate rows, units template, lf-engine patch; bisected R1 / R2; critic r1 launched.

### 2026-11-12 - task 4 (defaults on precritic's path) and the empty-band pin
- precritic `--skill` now runs ws-empty-band with `--vocab-ink --page-fill` on every skill, plus `--margin 2` on every skill NOT in
  the pin. The pin was written at margin 0, so a run that touches a pinned fact skill keeps margin 0. FIX-WORDS (ws-fixit-words)
  is a default gate. lf-placevalue's opt-in rows for both were removed.
- V-AMBIG is NOT folded: it lives in ws-vocab-unit.mjs, which is only on lf-vocab's branch. It is folded when that branch merges.
- RE-PIN (facts lane debt, the 11-08 ruling): add_facts, mult_facts, div_facts re-pinned with --vocab-ink --page-fill. 44 keys
  rose, 7 fell. The new rule findings on these three skills:
  - screen-cell EB-SIDE (card content pinned to one side, 35-41 %);
  - add_facts lesson between-blocks band 31 %;
  - EB-PAGE: mult_facts lesson p2 32 %, div_facts lesson p1 49 %;
  - div_facts mixed-practice cell 19 EB-EDGE 0.6 mm.
  All of these go to the facts-lane task. The old pin is in git history.
- EB-SIDE: print cells keep the max-gap rule (lf-placevalue's side backtests are green again). Screen cells count a gap only when
  the content is pinned to one side. The between band is skipped on scripted-model (EB-GAP / PT-MOD-3 own that band).
- The EB-BAND message prints the live limit (30 % - margin).
- Verified on 602692b7: the pin is green for add_facts/mult_facts/div_facts (ws-empty-band OK, 358 findings within the pin). 12 backtest rows
  PASS: the pv-*, guided/model facts, eb-fixture-*, mc-make-a-ten-choice. optin-h13-abs is PENDING (on master too, not this lane's).
- lf-engine (11-12): precritic's lesson-samples step gets `--force-check` on their branch (claude/sweet-newton-c8wrv1-lf-engine-pc), lead-approved.
  KEEP it when merging. Their new rule: a feature behind a switch needs a forced-on render gate in the same change.

### Critic eb-r3 (602692b7): FAIL. C1 6 · C2 8 · C3 6 · C4 7 (design/status/lf-checks/critic-eb-r3.md). RULE 7 STOP.
D2 (a blank cell is dropped) was r2's D7 and survived a second round at medium, so the loop stops. Each root cause is now a machine check,
and the measurement work is handed over:
- D1: the band is measured padding box → line box, under-reading by up to 18 points. Check: fixture row `eb-fixture-padding-leading`
  (PENDING, reads OK and must FAIL). Fix: read the bands from the border box, or from the pixels as EB-GAP does (ws-ink).
- D2: a blank cell is dropped (`if (!box) return` in measureCells). Check: fixture row `eb-fixture-blank-cell` (PENDING). Fix: push a blank
  record and judge it EB-READ "cell N has no ink". First sweep the live roles for legitimately blank cells.
- D3 FIXED: eb-fact-roles is scoped `--only EB-BAND,EB-SIDE`, and the row PASSES.
- D4 OPEN (master too): ws-precritic-plan FAILs. Three rows give precritic `--role a,b` (usage error), and `--role guided|scripted-model`
  plans no ws-empty-band.
- D5 OPEN: EB-FOOT, EB-ROLE, EB-READ, the screen EB-SIDE split and the above/between bands have no row yet. The asked-for check: a
  rules[] → backtest-row coverage gate.
- D6 FIXED: EB-SIDE names its limit and the interior width it divides by, and says "pinned to one side" only on screen cells. EB-FOOT
  names its 10 % limit.
- Minors left: a transparent border or fill-opacity 0 counts as ink; --html ignores --report-only/--json/--only; precritic drops
  --margin for the whole run when any one skill is pinned.
Speed: 3 rounds on one tool. Cause: every fix was proved on the defect's own probe, not on a fixture row FIRST. Rule for the next lane:
a critic's "Check:" line becomes a red fixture row BEFORE the fix, and the fix commit flips it.
Cost: session cost_usd $74.96 at 23:23Z (critic r3 ~175k tokens included), ≈ 2.7 % of the weekly limit for the whole session to date.

### ws-empty-band rebuild after critic eb-r3 (fresh builder, Opus medium, rule 7), 2026-11-13
- D1 FIXED: EB-BAND / EB-SIDE read the PIXELS (measurePix): the ink rows / columns darker than 225 inside the BORDER box (the stroke
  and 2 px left out), the tab label masked, every answer slot's box added; the bands run from the border to the ink. Print pages: one
  full-page capture; screen hosts: one capture per cell (no relayout). Row `eb-fixture-padding-leading` re-armed: 73.4 % → FAIL.
- D2 FIXED: a cell with no ink is recorded and judged EB-READ "cell N has no ink". Row `eb-fixture-blank-cell` re-armed. Sweep
  `--skill placevalue:unit_form,addition:add_facts --only EB-READ` (172 renders, 1290 cells): no blank cell, so no exemption.
- D4: precritic `--role R` plans `ws-empty-band --roles R --hosts none` on the lane's skills (else the role sample), with
  --model-states on scripted-model. ws-precritic-plan splits `--roles a,b` per role, takes a no-`--roles` ws-empty-band line as every
  role the signed card offers, and needs the row's rule flags (--model-states, --vocab-ink, --page-fill) on the planned line. Every
  ws-empty-band row is now on the path. Still FAIL there (other lanes, untouched): cc-card-overflow, cc-card-overflow-cbt, cc-tagink,
  cc-keyjoin, cc-size-s, cc-title, cc-title-cbt (ws-cell-checks not planned) and the opt-in lf-placevalue leak onto add_facts.
- D5: new fixture rows eb-fixture-band-above, eb-fixture-band-between, eb-fixture-screen-side; commit-pair eb-foot-div-facts
  (537c2275 → de8e7531, EB-FOOT). EB-ROLE is exempt (it needs the app and a card offering a role the app cannot compose; no such
  commit). `--self-test` now fails any rule of RULES or case of RULE_CASES that has no live row and no exemption.
- Minors: a border is ink only in a colour that paints; fill-opacity / stroke-opacity 0 is not ink; --html honours --only, --json
  and --report-only and reads a screen fixture (#gameView .mq-scell). `--roles none` runs the screen hosts only (with the card variants).
- PIN RE-PINNED (add_facts, mult_facts, div_facts only): 358 → 906 findings. The pixel read is larger because the DOM read under-read
  (padding and leading): rose EB-BAND add_facts +137, mult_facts +131, div_facts +154; EB-SIDE div_facts +160, mult_facts +4. Fell:
  EB-SIDE on the screen card hosts (add_facts −16, mult_facts −22): centred content is no longer read as pinned. Real debt for the
  facts lane, not a tool change to hide.
- Backtest (21 rows): 17 PASS. 4 go RED because their PASS commits are over the limit on the pixels. This is not a tool bug: a
  screenshot of combine S cell 1 at deb9e426 shows 46 of 121 px empty under the "= ____" line (38 %), where the DOM read 29 %:
  pv-combine-side-band (deb9e426: EB-BAND 179, 30.3-40.1 %); pv-unit-form-rename-side (64f70063: 148);
  pv-unit-form-rename-margin (a1c8d595: EB-SIDE 6, 28-31 % at --margin 2); eb-fact-roles (6e962016: 6). They need the pv / facts
  lanes to fix, then a lead ruling to re-point each row's pass commit. Rows were left as they are (append-only).
- CL-4b (lead request): `--skill placevalue:unit_form --roles none --hosts worksheet --no-baseline` FAILs 3 at 35df47d7 (the pixels
  see what the DOM missed: rename=more p2 36.6 % above, p3 46.3 % above, p5 46.3 % under). At 451207ab it STILL FAILs 3: p2 and p3
  are unchanged, and p5 moves from under to above (47.2 %). So row eb-wsheet-cl4b-stretch was NOT added: its pass state does not pass.
- D4 closed (lf-checks 11-13): ws-precritic-plan OK (111 rows on the path).
  - precritic --skill now runs ws-cell-checks --card --card-opts (the 7 cc-* rows). It is a no-op on a skill no signed card lists.
  - At head it is RED for lf-ops: SIZE-S 2, mult_properties independent and arrays_groups independent (S = M layout). This is real,
    not pinned, and routed to lf-ops.
  - The "opt-in leak" probe was wrong: it picked add_facts, which is lf-ops' own opt-in skill. It now picks a skill in no lane's
    opt-in, and a leak is a --rule-skills line naming the lane's skills.
- 2026-11-13 CL-4b stretch fix (fixer, Opus medium): 451207ab's centring worked; the band was INSIDE the content. A kit twin's line
  slot becomes a 48 px host input (touch box, underline only, flex-end beside 33 px digits) and adoptVisualBlank drops the paper
  slot's data-ws-slot, so the pixel read saw ~28 px of "empty" input above the digits (p2/p3 82 px cells, p5 centred too).
  worksheet.js now keeps data-ws-slot="answer" on the input that took the slot. unit_form worksheet: OK; unit_form + div_facts
  card/worksheet/quiz vs head: 0 new, 3 gone. div_facts worksheet keeps 30 pre-existing [eq] bands (33.7 % above), not touched.
