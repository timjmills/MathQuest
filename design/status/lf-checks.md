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
- SCREEN-INK-SIZE (lead 11-13), ws-screen-ink-size.cjs, built by a medium builder (9dba365b, cherry-picked):
  - SIZE-INK: pictures at least their print size, 5 % tolerance. SIZE-WIDTH: a drawing uses >= 60 % of the free width before it
    grows taller.
  - Rows screen-ink-size-ink and -width PASS. 73e96fc1 div_facts FAILs 28: dots 1.77 vs 1.96 mm; the array strip 10.8 x 32.3 mm at
    10-47 % of the width.
  - On precritic --skill; deploy gate `ws-screen-ink-size --passed`.
  - The --passed sweep: 97 findings on 3 skills (add_facts, mult_facts, div_facts), in lf-checks/screen-ink-size-sweep.md. Not
    fixed: the lead routes. The deploy gate is RED until they are fixed.
- The CL-4b fixer's da17b9ba (the worksheet input that adopts a kit slot keeps data-ws-slot) is accepted: in print the slot is
  writing room, not a band. Critic r4 is asked to judge it from a screenshot.

### Critic eb-r4 (53ba39fb): FAIL. C1 7 · C2 8 · C3 7 · C4 7 (lf-checks/critic-eb-r4.md). r3's D1, D2 and D5 and the minors are verified fixed.
- r4 D1, rule-7 STOP: the unit_form worksheet band survived two fixes at medium (my centring, then the fixer's slot label).
  - The label (da17b9ba: the 48 px underline-only input kept data-ws-slot) is REVERTED. It hid a band a pupil sees: 2 of 6
    rename=more tiles are 47.9 % empty above the digits.
  - Row eb-wsheet-cl4b-stretch is set back to pending.
  - Root cause: a line slot becomes a 48 px touch input with only an underline, digits at its bottom.
  - Fix options for a ruling:
    - (a) the tool counts a screen slot as its drawn extent plus one written digit's height (the critic's check);
    - (b) the app sizes that input to the digit plus its underline, keeping the 48 px touch target by padding outside the drawn box;
    - (c) the tile row height.
- r4 D2: placevalue:unit_form at head FAILs 305 (302 EB-BAND at S, 32.5 %, real on the pixels, 0 pinned). The pixel measure moved
  it, and I did not report it. Routed to lf-placevalue. Rule: when a measure changes, re-run every redesign-passed skill the lane
  touches and report the counts.
- r4 D3 FIXED: EB-SIDE prints its % to one decimal ("30 %; limit 30 %" was 30.4 %).
- r4 D4 FIXED: EB-READ names the 225 ink threshold (faint #eee ink is not counted).
- The critic's minor (not scored; it needs a lead ruling): the bands include the kit's mandatory top pad, so a 15 mm strip cell
  fails about 1 mm off centre.
- SCREEN-INK-SIZE pin (lead ruling): design/audit/baselines/screen-ink-size.json, written with --passed on this tree. 25 skills,
  552 renders, 69 findings in 28 keys. The 11-13 sweep's 97 was on the master tree f5c03405, with 26 passed skills. The gate fails
  on a new key or a rising count.
- lf-ops-props' EB-FOOT change (a46344e1..73c2ed14), ruled by the tool owner (lead's request 11-13): ACCEPTED, with a guard, and
  ported into this tool (their base was the old tool). lf-ops reverts its hunk when it merges.
  - (1) EB-FOOT skips the centring offset above a centred cell's first block. That space is the row's shared-out room, not drawn
    height, and EB-BAND still judges it.
  - (2) Pairing by height is used only when every page's ROW heights are non-increasing (the page really sorted its rows) and the
    sorted pairing fits every cell; otherwise cells pair in dealt order.
  - eb-foot-div-facts (a real foot band) still FAILs on its fail commit, and the row PASSes.
  - arrays_groups on this tree: by-height pairing clears 3 renders. The remaining EB-FOOT findings are real (pages not sorted, or
    sizes that do not match), for lf-ops.
  - The --dump option was not taken (unreviewed convenience); lf-ops can propose it separately.

### eb-r4 D1 rule-7 rebuild (fresh builder, Opus medium, 2026-11-13; resumed after a container restart), commit 0f1a0bda
- (b) APP, css/screen-cell.css (additive): a kit LINE slot taken by the host input draws at 1.15em with its underline at the foot;
  the 48 px touch target is transparent padding pulled out by an equal negative margin. Focus, next-box glow and checks are outlines
  set back onto the drawn box. ws-screen-answer (24 skills + unit_form), ws-phone-card (4 skills) and ws-boot-smoke: OK.
- (a) TOOL: a screen slot counts as its inked edges plus one written digit (0.75 x font size); print slots unchanged. Row
  eb-fixture-screen-slot PASSes. Minor: the kit's top pad (3 mm, or label side + 1 mm) comes off the band above the ink; row
  eb-fixture-toppad-real-band PASSes.
- Facts pin re-pinned lower (no count rose): add_facts review S 16->14, M 10->6; dropped add_facts worksheet {across}, div_facts
  pre-skill-check M/L, div_facts worksheet (6 keys). unit_form --skill: EB-BAND at S 302 -> 47 (86 findings in all).
- eb-wsheet-cl4b-stretch STAYS PENDING: 1 EB-BAND left on the worksheet command (33.5 % under a one-line tile centred in a row
  _wsEvenRows sizes for a two-line neighbour, 108 px for ~24 px of ink). That is the row height, option (c): it needs a ruling.
- (c3) lead ruling 11-13, done in 990e66a8: worksheet.js _wsEvenRows stretches a tile's bordered box to its row only while the
  content (to its bottom) fills >= 78 % of it, since the box's padding is white too. The card keeps the row height.
  - Before: a one-line unit_form tile (33 px of ink) was stretched to 108 px.
  - Results: unit_form worksheet host OK; row eb-wsheet-cl4b-stretch re-armed (35df47d7 FAIL → 990e66a8 OK) and PASSES;
    ws-screen-answer OK; ws-phone-card OK (unit_form, div_facts, add_facts); boot-smoke OK; facts pin OK.
- Critic sis-r2 (126106c5): FAIL, C1 8 · C2 7 · C3 8 · C4 8 (lf-checks/critic-sis-r2.md).
  - D1: the "same count, any mark" fallback pairs a ring with dots, which gives a false alarm or a miss.
  - D2: pinned lines print the same as failing ones.
  - D3: the tile/frame marks are a bare "dot".
  - D4: a fixture pass side prints a plain OK.
  - D5: the sweep is not tied to the pin.
- lf-roles 4e8eca14 (EB-FOOT: pair each cell with the measure of its own grid's column count), ruled by the tool owner on 11-13:
  ACCEPTED and ported, because their base was the old tool.
  - footCols(c, cells) gives the laying grid's column count. With no grid read, it falls back to the cells across the row, which
    is the old rule: wrong for a lone last-row cell of a 2-column grid.
  - --self-test "EB-FOOT columns" holds 3 cases. eb-foot-div-facts still PASSES.
  - Row eb-foot-gridcols-patterns is PENDING: pattern_features exists only on lf-algebra's branch, so it is armed on that merge.
  - This also answers lf-algebra's "bridge 2 columns vs cell max 1" item. lf-roles reverts its hunk.
- precritic mention matcher (lf-vocab, 11-13): a skill key is bounded by space or list punctuation, so "a:b, c:d ... OK" on one line names both. `ws-precritic --self-test` holds 6 cases. precritic-plan OK.

### Next-round queue (lead, 11-13; cap next round)
0. TOP (lead to all lanes, owner 11-13: "make sure you are saving everything to automatic checks as well"): every finding (critic / owner / lead ruling) becomes an automatic check BEFORE its fix lands: (1) FAIL on the bad commit, PASS on the fix; (2) a backtests.json row ws-backtest proves; (3) on precritic's path; (4) a row in design/lessons-first/CHECKS_FROM_CRITICS.md. lf-checks also builds the SWEEP that enforces it: ws-backtest (or ws-precritic-plan) FAILS when a CHECKS_FROM_CRITICS row has no backtest id or its id is not on precritic's path. Then list today's findings still missing a row.
1. The practice card honours ?seed in the render tool, plus a check that the same seed gives the same card twice (lf-ops).
2. Backtest rows name their check ids and run only those: the 12 rows red from check growth (lf-engine log on master).
3. lf-algebra r1 speed reflection, L25: the precritic plan takes roles and hosts from each card's OFFERED roles and hosts (top
   item). Then:
   - HINT-ON-TEST: hints stripped at scaffold 0, ideally in the kit;
   - a text-over-slot probe, plus a digit-px floor per screen host;
   - a scripted-model / guided render gate at S/M/L, plus a text-clip probe;
   - PAGEFILL on scripted-model;
   - an anchor state-diff check;
   - node-lint STEPS-FOLLOW-PRESET;
   - VQ-TITLE: both verbs take -ing;
   - option-panel screenshots as a gate.
   Coordinate the kit- and role-level items with lf-roles.
4. V-AMBIG into precritic once lf-vocab merges.
5. The font-load race (lf-engine, 11-13): ws-detailed-lesson E2 ("Andika 700/400 not loaded") flakes under load, because document.fonts.check runs before the web font arrives (g2-nbt3, g3-oa8, g4-nbt1). Fix: await document.fonts.load for both faces with a bounded retry; a font that never loads is an ERROR, not a page FAIL. Apply to every browser gate that checks fonts.
7. Precritic print-lint over every role the SIGNED CARD offers (lf-ops 11-13): mult_properties more-practice was never run, so CL40-INK x4 (an array dot inside the 7 x 7 mm label keep-out, cells 1 and 5 of p1/p2) went unseen. Backtest row: fail claude/sweet-newton-c8wrv1-lf-ops-props fc981d0c7, pass c1c54b5c4 (lf-ops row pl-cl40-arrays-turn-mp, added in 584c43ac8, already PASSES: point to it, and check that precritic plans it). This joins the queue-3 top item (roles and hosts from the card).
8. PT-MOD-5 (lead ruling, PAGE_TYPES; from lf-roles): on a ONE-page beside Scripted Model, ws-empty-band skips the step-text cell (.mq-stepcell) in EVERY pass (EB-BAND, EB-SIDE, EB-GAP: today only EB-GAP skips it, which gives 5 false EB-SIDE on compare scripted-model), with a self-test pair and a backtest row;; state cells stay under H13. Fixture row: a real band in a state cell still FAILs.
9. From lf-algebra (lead, 11-13):
   - (a) EB-FOOT pairs cells with items[i] by POSITION, not with their own item. This blocks arming eb-foot-gridcols-patterns, and it is the same fix as r5 m1: data-eb-item written by the kit.
   - (b) the precritic screen-support-eq gate misses 5 of 6 skills in its output: check its output or the mention matcher.
   - (c) adopt their HINT-ON-TEST check into precritic; backtest FAIL 47b1f2a86 / PASS 796952c03.
10. The practice-card inputs at 390 are 40x44 px on master (lf-builds word-stories critic F3, lead 11-13). Each needs a >= 48 px touch target, kept as transparent padding outside the drawn box (as the slot fix did). Add a check across every host at 390.
11. SCREEN-DIGIT on the online worksheet host (lf-placevalue, 11-13): `ws-screen-slots --screen-digit` reads the worksheet grid cell's digits (.mq-grid-cell) at about 29 px. It hits placevalue:compare (3 findings), and the passed pv siblings are the same: identify 30.4, combine 29, unit_form 29. The card and quiz pass. Critic r3b ruled it a hosts / engine item. Rerun: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-screen-slots.cjs --skills placevalue:compare --screen-digit` (branch claude/lf-placevalue-w2 e8371e69).
12. On merge with lf-placevalue w2: carry over ws-empty-band's `--grid-foot` (EB-GRIDFOOT) and `--columns N` (the CL-2c teacher-columns tolerance). The pv side-band rows are already re-pointed on this branch (dc75d1d9).
13. LP-RASTER (rasterise the PDF, page overrun) on ROLE pages (lf-roles, 11-13): lf-algebra's F3 (a Scripted Model overruns the page by 6 mm) shows only in the printed PDF; screen and emulated print are clean. Fail case: patterns:number_patterns_rule scripted-model L at 47b1f2a86. Backtest it. After (i)-(iii).
14. (low) ws-screen-ink-size SIZE-REF (lf-vocab, 11-13): the paper reference is an Independent M seed-7 page that may never deal the word the screen host dealt, so 4 vocab words (distributive, equal groups, pattern, set 4's hundred chart) read as false SIZE-REF. Build the reference page for the SAME word/item the host dealt; backtest.
15. ws-screen-ink-size SIZE-WIDTH false positives (lead, 11-13): 9 term drawings on the growing-shape-patterns worksheet at 1280. A one-dot-wide column is taller than wide BY THE MATHS. For shape-pattern / array term drawings, judge the unit size (dot / square mm, screen vs print), not the bounding width. Backtest: a real too-small pattern FAILs; the current growing worksheet PASSes.
16. G9 (lf-algebra critic r2, lead 11-13): growing-pattern QUIZ labels at about 8.6 pt, below the floor. Fix it in the quiz host, and add a label-size rule to the screen ink-size gate. Backtest.
17. TEXT-SIZE rule for ws-screen-ink-size (lf-algebra critic r2 G1, via lf-ops / lead). Count-row card digits on number_patterns_rule / count_by_tables render at 18-20 px against the 40-56 px card floor, and the tool reads OK: SIZE-INK judges only repeated picture marks, so plain digit / slot text is never seen. Add a rule: the computed font-size of answer-slot and digit text in a screen cell is >= the host's digit floor (or >= print pt x 96/72). Fold item 16 (G9 quiz labels at 8.6 pt) into it. Backtest: fail = lf-ops-props head on number_patterns_rule card 390; pass commit from lf-ops.
18. SCREEN-DIGIT on by default (lf-ops correction to 17): ws-screen-slots --screen-digit (40 / 48 / 56 px at 390 / 820 / 1280) already catches the count-row digits, but it is opt-in (lf-placevalue only). Fold it into precritic's default --skill path, and check sibling pins first. Fail states at -props 8d7343c0f: number_patterns_rule worksheet at 29 px (one --mq-digit per sheet, worksheet.js:1052; joins item 11) and the count_by_tables arcs train at 26-29 px on every host. Pass commits from lf-ops. Item 17 keeps the quiz-label (G9) text rule in ws-screen-ink-size.
19. ebitem-r1 critic minors (not blocking the deploy): m1 print an "unmeasured at k" note when fpOf falls back to the first-fit column count; m2 a note when a multi-item cell matches only some indexes (ebItem.length !== qs.length); m3 make the parity check and the key-order check gates, with a backtest row each.
20. Screen parity (lf-ops divarray critic, lead 11-13): the mult_facts practice CARD host renders no [data-ws-cell], so every card-host check reads nothing there (worksheet and quiz are covered). Make the card host emit [data-ws-cell] like the other hosts. Guard: ANY host check (ws-screen-ink-size, ws-screen-slots, ws-screen-answer, ws-empty-band ...) that finds 0 cells for a skill with items FAILs, never passes. ws-empty-band already gives EB-READ; audit the rest. Backtest on mult_facts card.
21. lf-ops pass commits (11-13):
    - npr / count_by_tables count-row digits pass SCREEN-DIGIT on card and quiz from -props 85c694896. The arcs train passes their new TRAIN-FIT (ws-screen-slots --train-fit; row ss-train-fit-cbt) from 85c694896.
    - Row screen-digit-npr-worksheet still CANNOT be armed: the WORKSHEET host stays at about 29 px because worksheet.js:1052 sets one --mq-digit per sheet. That is OURS (item 11): a per-cell digit floor. mult_properties arrays-turn numerals are also 29 px. Arm the row with pass = the item-11 fix commit, once 85c694896 is merged in.
    - The CL40-INK more-practice row (pass c1c54b5c4) is already recorded (item 7).
22. On merge with lf-placevalue w2 (claude/lf-placevalue-w2 fb05bcb1), carry into ws-empty-band:
    - --grid-foot / --columns (item 12);
    - EB-FOOT measures a CL-4d centred `ws-rowstretch` cell as pads + tab clearance + the line's box (lead ruling 11-13, CL-4d: a one-line cell its row stretches >= 30 % is centred; it raised 234 false findings before);
    - an OPT_IN_FLAGS literal near the top. The builder's 5a8e27ec already names the opt-in flags in the first 80 lines; reconcile the two. Plus a GUARD: precritic should not rely on an 80-line source scan for flags (a self-test that every flag precritic passes is accepted).
    Info: compare's pixel totals went 337 → 93 (lesson 17, opener 30, scripted-model 17, review 10, mixed 18, pre-skill-check EB-PAGE 1): lf-placevalue's.
23. Host items from lf-algebra's two-step build (branch claude/sweet-newton-c8wrv1-lf-algebra @ 8438ca59d, lead 11-13); checks first, each with a backtest:
    - (a) phone-card first-box focus FAILs on all 7 two-step skills (the _plain ones too);
    - (b) GRADING PARITY: on screen the letter equation and the estimate are only "typed", not scored, while paper grades both. Add a check that every slot paper scores is scored on every screen host, then fix the hosts;
    - (c) screen-support-eq: the log says OK but precritic's gate says FAIL. A parser / verdict mismatch: fix it, and add a self-test that the parsed verdict equals the tool's last line.
6. Empty-band r5 D1 (faint slot edge), D2 (the focus ring touches "tens"), m1 (pair by data-eb-item).
- Critic eb-r5 (3cea85a7): FAIL, C1 7 · C2 8 · C3 8 · C4 7 (lf-checks/critic-eb-r5.md). Queued for next round:
  - D1: a faint slot edge (#eee) counts as drawn, so it hides a band. Count an edge only when it is darker than the 225 ink
    threshold; fixture row.
  - D2 (legibility): the focus ring of the unit_form slot touches the next word "tens" (0 px). From 0f1a0bda's CSS. Check:
    ws-screen-answer focus ring >= 4 px from the nearest word.
  - D3: the CL-4b centring branch can never trigger inside the (c3) cap (blank under 22 % < 30 %). Remove it with a recorded ruling,
    or keep a row that sets it.
  - m1: the row-sort guard treats equal row heights as sorted. Pair by a kit-written data-eb-item index.
  - Noted: (c3) box bottoms in a row no longer line up at 820/1280. Honest, but ask whether the owner minds.
  - Verified: self-test, precritic-plan, ws-screen-answer, ws-phone-card OK. 11 of 12 eb-* rows PASS; eb-fact-roles is routed to
    the facts lane.
- r5 D3, ruled by the lead: KEEP the centring branch; recorded in WORKSHEET_DESIGN_STANDARD CL-4b (it rarely fires under the cap). Top-aligned boxes with unequal bottoms are fine (lead default, put to the owner).
- SCREEN-INK-SIZE critic sis-r3 (138f43d9): PASS, 9 · 9 · 9 · 8. Deploy branch claude/sweet-newton-c8wrv1-lf-checks-inksize @ fd7b4cc2 (master ebd565c8 merged). Its gates are green; precritic-plan's 21 failing rows are master's own. Sent to the lead. Queued: r3 D1 (the SIZE-REF wording for a screen-only ring), m1-m4.
- eb-r5 fix round (builder, Opus medium, 11-13; commits 2af22377, dc75d1d9 + this one):
  - D1: a screen slot's edge counts only when it is darker than the 225 threshold. Row eb-fixture-faint-slot (probe p3: OK before, FAIL 35.0 % now; a black box passes).
  - D2: additive css/screen-cell.css gives the kit LINE slot 9 px side margins beyond the drawn box. ws-screen-answer FOCUS-GAP checks that the focused `input.mq-slot` ring is >= 4 px from the nearest word. Row sa-focus-gap-unit-form: 0f1a0bda FAIL (0.5 px to "tens"), 2af22377 OK.
    - `--focus-gap-all` judges every box. It finds arrays_groups -0.2 px (.mq-cellslot / .ib-cell), function_table_hard 1.4 px and elapsed_find_duration 3.3 px. Route these to their lanes.
  - m1: the kit writes data-eb-item on each grid cell (buildSheet tagItemIndex -> answer-key gridPart -> grid -> cell()). EB-FOOT pairs by that index (pure footFindings, self-test "EB-FOOT pairing"); by-height and position pairing stay only as the fallback. The scope is unchanged: one section, cells = items.
    - For the lead: a Review page deals 28 items and draws 16 cells. By index, add_facts review S/M/L reads 17-23 % over its footprint (12 cells). It is not judged; widening the rule needs a ruling.
  - eb-foot-gridcols-patterns stays PENDING, because pattern_features is still not on master (8a7c5d43).
  - The pv rows are re-pointed (fail 16014137, pass 668f6a8c / 1f18505d) and PASS. Both EB-PARITY rows PASS.
  - Backtests: 27 of 28 live rows PASS. eb-fact-roles is still red (facts lane). Self-test, precritic-plan, ws-screen-answer, ws-phone-card, boot-smoke and the facts pin are OK (no re-pin).
  - The pv debt (combine, unit_form, expand): EB-BAND 205, EB-SIDE 16 (221 in all; the shown lines are combine and expand).
- Lead rulings 11-13 (a) FOCUS-GAP and (b) EB-FOOT scope (builder, Opus medium; commits 2a25a4c58, f546697be, 6cd9668cc + this one):
  - (a) All three --focus-gap-all findings came from the SHARED ring styling, not per-skill markup, so they are fixed centrally (additive css/screen-cell.css, end of file). --focus-gap-all is now clean.
    - Online worksheet: `.online-edition .problem-card.mq-wscard .mq-scell input:focus` (css/screen-cell.css:663, offset 1 px) outranked the in-box cell-slot rule `.mq-scell [data-mq-cell] > input.mq-cellslot:focus` (line 676, offset -4 px). So every boxed cell slot drew its ring 3 px outside its box: arrays_groups -0.2 px, function_table_hard 1.4 px, elapsed_find_duration 3.3 px. The fix keeps the -4 px offset on that host. Row sa-focus-gap-cellslot-ws.
    - Practice card: the inline-blanks box `.mq-scell input.ib-cell` (line 693; 6 px side margin, its own border) drew its ring 4 px outside it, 2 px from "rows of" (arrays_groups). It now thickens inward (offset -3 px). Row sa-focus-gap-ibcell-card.
    - Both rows: FAIL 8dc176e6, OK 2a25a4c58.
    - Nothing goes to lf-ops or lf-algebra.
  - (b) EB-FOOT now judges EVERY cell of a grid-role page against the items it holds (data-eb-item). The kit may write a list ("3,4") for a plan item holding several questions (`qs`).
    - A multi-item cell is judged against the bridge's measure of that combination. The bridge gives none today, so such a cell is a NOTE, never a silent pass. So are an unindexed cell and an index out of range.
    - gridCols reads a re-laid grid's real column count.
    - Self-test: 15 pairing cases.
    - No fix commit exists, so row eb-foot-review-add-facts is PENDING until lf-ops fixes the cells.
    - The facts pin run (add_facts, mult_facts, div_facts; every role and host) raised no EB-FOOT note: every grid-role cell on those pages is indexed.
  - add_facts Review EB-FOOT findings, REAL by lead ruling, for lf-ops (12; drawn vs footprint at 2 across):
    - review S p1 cells 13, 14, 15, 16 (items 25-28): drawn 14.6 mm, footprint 12.5 mm (+17 %);
    - review M p1 cells 7, 8, 9, 10 (items 19-22): drawn 18.2 mm, footprint 15 mm (+21 %);
    - review L p1 cells 7, 8, 9, 10 (items 19-22): drawn 19.7 mm, footprint 16 mm (+23 %).
    - S cells 13-16 are the page's last four cells (the Mixed Review band comes last). The M and L bands are not yet confirmed: lf-ops should check them.
  - Re-pin (facts-lane debt, lead ruling): only `addition:add_facts review S|EB-FOOT`, `review M|EB-FOOT` and `review L|EB-FOOT`, at 4 each. The facts pin is then OK. Its "tighten the pin" notes were there before this change and are left alone.
- Critic eb-r6 (8dc176e6): FAIL, C1 7 · C2 9 · C3 8 · C4 8 (lf-checks/critic-eb-r6.md).
  - D1: a slot counts as ink across its WHOLE WIDTH even with no or a faint edge, so EB-SIDE misses a 103 mm side (probes q5/q6).
    Fix: unless the slot draws a dark side edge or underline, count one digit's width.
  - m1: the EB-FOOT fallback is silent. Print a note when the pairing is not by index.
  - m2: FOCUS-GAP only looks along the line. Also measure text above and below.
  - m3: the critic did not re-run backtests-empty-band.json.
  - What holds: r5's D1/D2/m1; the index pairing is stated honestly; 28 of 31 rows pass.
  - Lead plan for a FAIL unrelated to the pairing: port m1 (data-eb-item plus index pairing) to master's tool as a narrow deploy for
    lf-ops.
- eb-r6 fix round (builder, Opus medium, 11-13; commits 2e947661, 10a53821, 255dfe95 + this note):
  - D1: a SCREEN slot's WIDTH is ink only where it draws a dark (< 225) top or bottom line (an underline or a closed box: its whole
    width) or a dark left / right edge (that edge). Otherwise it is ONE written digit (0.6 x its font size) at the slot's text start,
    by its computed text-align on the content box (an input writes at its start by default; centre / end when so aligned). The
    vertical rule is unchanged. Fixtures wide-slot-faint / wide-slot-invisible (the critic's q5 / q6): OK on 8dc176e6's tool, FAIL
    EB-SIDE 61 % now; rows eb-fixture-wide-slot-faint / -invisible (pass side screen-side.pass.html); case 'EB-SIDE (slot width)'.
  - m1: footFindings names its mode in a note whenever it is not a fully judged index page ('position' fallback, by order or by
    height; '' not paired; 'index' with N cells not judged). 6 new self-test cases (21 in all).
  - m2: FOCUS-GAP also judges text above and below the ring that overlaps it horizontally, measured to the GLYPH INK (canvas metrics,
    calibrated against pixels in `--focus-gap-self-test`, 10 cases + 3 calibrations). To the text box instead, --focus-gap-all read
    21 false touches (column digits, area-model headers: 9-11 px of paper in fact). The critic's "another line" probe is now a
    finding: the wrapped line's ascenders sit under the ring (screenshot).
  - m3: the 4 rows of backtests-empty-band.json are still PENDING (no fix commits). Their fail sides, re-run with today's tool via
    MQ_ROOT: vocab bebf5b36 FAIL 4, pv value b28a0867 FAIL 12, pv unit_form b28a0867 FAIL 16, div_facts b23e418d FAIL (361, --no-baseline, all roles).
  - Gates: self-tests OK; precritic-plan OK (136); ws-screen-answer OK; --focus-gap-all OK; ws-phone-card OK (12/12); boot-smoke OK;
    the facts pin OK (no count rose, no re-pin, no EB-FOOT mode note). Backtests: 35 rows calling ws-empty-band or ws-screen-answer: 32 PASS (both new rows included), eb-fact-roles FAIL (facts lane, as before), 2 PENDING.
- SCREEN-DIGIT on by default (lead, 11-13): precritic's screen-slots gate passes --screen-digit for every skill; lf-placevalue's opt-in entry removed (its --rule-skills would have narrowed it). Row screen-digit-npr-worksheet: FAIL proven on lf-ops-props 8d7343c0f (3 screen-digit misses); pass commit TBD from lf-ops (row PENDING). precritic-plan OK (136). Reds go to the owning lane, never a pin.
- EB-FOOT item-pairing MASTER PORT (branch lf-checks-ebitem @ bbaa8d91): critic ebitem-r1 PASS 9/9/8/9. Sent to the lead to deploy; it unblocks lf-ops. Critic minors queued below.
- CRITIC eb-r7 (720e5af6): PASS, C1 9 · C2 8 · C3 8 · C4 8 (lf-checks/critic-eb-r7.md). The pixel ws-empty-band (+ FOCUS-GAP, SCREEN-DIGIT default, Review pairing, --slot-ink port) LANDS.
  - m2 fixed before landing: rows eb-vocab-match3-guided (--only EB-BAND) and vocab-r9-gdpcap (--only EB-GDPCAP) scoped to their own rules; both PASS.
  - Queued (minors): m1 FOCUS-GAP per text line, not per text node (a 2-line wrap false alarm); m3 print the --slot-ink mode note + the legacy note %, and document that the top pad stays excluded under off; m4 multi-item cells are noted, not judged (no b.combo measure) - produce it or say so; m5 an interior side-to-side gap beside a one-edge slot.
- CHECKS_FROM_CRITICS SWEEP (builder, Opus medium, 11-13; queue item 0): `ws-precritic-plan --checks-from-critics` (also in its default run; `--no-sweep` skips). Lives in ws-precritic-plan because "on the lane's path" is decided there: the per-row verdict is now one function (rowPath) that the path check and the sweep share; a no-skill fixture row is on the path when its tool is a precritic or deploy gate. Each ledger row's "Backtest row" cell names ids in backticks (older bare ids still read; free text reads as an unknown id), or `exempt:` / `not machine-measurable:` / a process rule. Self-test: 12 planted rows (missing, unknown, off-path, exempt, good, legacy, same row, process rule, free text, empty reason, column kept) - 37 cases. On every precritic plan (node gate checks-from-critics) and deploy session 1. Ledger: 29 lf-checks rows added (eb-r3..r7, sis-r1..r3, ebitem-r1) + ids filled on the 11-07 and owner SCREEN-INK-SIZE rows. Today: 43 pass, 12 exempt, 16 FAIL (lf-checks 3 queued minors with no row yet; other lanes 13) - the gate is RED until the owning lanes fill their ids.
- Sweep HYBRID (lead 11-13): precritic --skill/--role runs --checks-from-critics --skills <its skills> and BLOCKS on rows naming them (div_facts: 2 open, unit_form: 1 open); deploy session 1 / the default plan judge every row but WARN until the ledger header's 'Blocks globally from: 2026-11-14 13:00 UTC', then block (MQ_NOW overrides for tests). Self-test 43 cases.
- NO DROPPED ROW (lead / lf-ops 11-13): ws-precritic-plan --checks-from-critics now FAILS, always (past the warning date), when the tree lacks a backtest row id the baseline held (origin/master, or --rows-before <file>). It runs in deploy session 1 on the deploy tree. Row no-dropped-row (fixtures in tests/fixtures/precritic/no-dropped-row/) PASS; ledger row added; self-test 46.
- OPEN LEDGER ROWS CLOSED (builder, Opus medium, 11-13; commits 7bd6f3d31, 96ba50e36, c484ffca7, 5a8e27ec9 + this note):
  - eb-r6 m2: ws-screen-answer `--focus-gap-html <file>` judges a saved page. Row `sa-focus-gap-fixture-below`: "tens" 1 px under the ring gives no finding with 8dc176e6's FOCUS_GAP (proven by running that commit's function on the fixture) and FAILs now; 10 px clear is OK.
  - eb-r7 m1: FOCUS-GAP reads text above and below the ring LINE BY LINE (a Range per character on each line box). Self-test: 12 cases. Row `sa-focus-gap-wrap-line`: its pass fixture ("wer once" 5 px clear over "Tall") read 0 px at 7bd6f3d31 and is OK now.
  - eb-r7 m3: each run prints `note: slot ink on|off` (and each skill's note names it). The legacy note gives its band and %. Under off the kit's top pad STAYS EXCLUDED from the band above, as under on; the tool header says so. Self-test: 3 cases. Ledger: exempt (note lines, no verdict).
  - eb-r7 m4: HONEST LIMIT. Multi-item cells are NOTED, NOT JUDGED. The bridge measures items one by one, `b.combo` has no writer, and no live grid role draws such a cell (the facts pin raises no note). The tool header says so. Ledger: exempt with that reason.
  - eb-r7 m5: EB-SIDE (between) judges the widest column run with no ink from top to bottom between two pieces of ink, at >= 30 % of the width. Row `eb-fixture-interior-hole` (u3): OK at 96ba50e36, FAIL 93.4 mm (58.6 %) now; the centred pass side is OK.
  - ebitem-r1 m1: EB-FOOT uses an item's measure only at the cell's own column count. When that is missing, the note is "item N fallback (unmeasured at k across ...)", and the cell is not judged. Self-test: 3 cases. Ledger: exempt (a note).
  - ebitem-r1 m2: the kit's pure `ebItemOf` (sheet/cell.js) gives a part-matched multi-question cell `ebPartial` "k/n"; cell() writes `data-eb-partial`, and EB-FOOT notes "partly indexed" without judging it. Self-test: 2 note cases and 7 ebItemOf cases on the kit's own function. Ledger: exempt (a note).
  - ebitem-r1 m3: two new gates on every grid role of every --skill run. EB-ITEMKEY: the pupil's data-eb-item order equals the key's, and no index appears twice on a page. EB-ITEMPARITY: the pupil page and key, with the tags removed, are byte-identical to the same sheet built with `ebItem: false` (a new buildSheet switch). Rows `eb-fixture-item-key` and `eb-fixture-item-parity`; the pass fixture is arrays_groups independent L as built.
  - Tool fix found on the way: the header's new lines pushed `--vocab-ink` / `--screen-parity` past line 80, so ws-precritic's srcHas dropped them from the plan (precritic-plan FAILed 2 rows). The opt-in flags are now named at the top.
  - The owner row "saving everything to automatic checks" and the lead-deploys row named the sweep as pending lf-checks work. Both now carry exemptions naming the built sweep and `no-dropped-row`.
  - Sweep: no lf-checks row fails (47 pass, 22 exempt, 12 fail, all in other lanes). Facts pin: OK, 276 renders, 828 within the pin (unchanged), 9 "tighten the pin" notes (unchanged). EB-SIDE (between), EB-ITEMKEY and EB-ITEMPARITY raise NO count, so no re-pin. The run took 505 s, because each grid role is now built twice.
  - Backtests: 46 rows call ws-empty-band or ws-screen-answer. 42 PASS, including all 5 new rows. 2 PENDING, as before (eb-foot-gridcols-patterns, eb-foot-review-add-facts). 2 FAIL:
    - eb-fact-roles: the known facts-lane red.
    - guided-tight-rows: a NEW red, on lf-roles' row from the master merge (b98b0f28a, not in r7's table). Its pass state 8307219c FAILs `--only EB-BAND` (53 pv guided bands of 34-36 %) under this branch's PIXEL read, which reads the visible band (critic eb-r3 D1). Master's DOM read passed it. EB-BAND is untouched in this round. ROUTED to lf-roles / the lead: re-point the pass commit to a fix, or accept the bands as pv debt. Not pinned.
  - Other gates: self-tests OK (ws-empty-band; FOCUS-GAP 12 + 3; precritic-plan 46 cases); ws-precritic-plan OK (150 rows on the path); --focus-gap-all OK; boot-smoke OK.
- Queue 14-17 (ws-screen-ink-size, builder Opus medium, 11-13; commits ca096176, 2c3d574e, + the re-pin):
  - 14: worksheet cards are also matched with the kit's print cell of the item they DEALT (`renderCell` at the print size, `[data-mq-dealt]`), before any geometric fallback. The 4 vocab SIZE-REF are gone. Row `screen-ink-size-dealt`.
  - 15: a pattern TERM ("Term n", `.mq-gp-term`, `[data-ws-term]`) is judged by its unit (SIZE-INK, 1+ marks) and never by SIZE-WIDTH. The growing worksheet at 791c8418 passes; a too-small pattern fails. Rows `screen-ink-size-term`, `screen-ink-size-growing`.
  - 16 / 17: TEXT-SIZE (new). Labels must be >= the same item's print size (5 %) and >= 8 pt. Non-slot digit text must be >= the digit floor: card / quiz 40 / 48 / 56 px (read from ws-screen-slots); worksheet 29 px (SP table; 56 px flagged every worksheet); a count row on a phone 29 px (TY-10b). The cell's largest numeral is left to SCREEN-DIGIT. G9 fails at 791c8418 (quiz "Term 1" 8.3 pt vs 11 pt). G1 fails at 662c6bbe and passes at 85c69489. Rows `screen-ink-size-text-label`, `-text-fixture`, `-text-countrow`.
  - Re-pin: the 42 old keys are unchanged. There are 29 NEW TEXT-SIZE keys (55 findings, 71 keys / 154 in all); `--passed` is OK against the pin. Route these to the owning lanes:
    - lf-ops: add_facts / sub_facts {support line} number-line labels at 7.6 pt, under 8 pt at 390; mult_facts {skip} strip labels at 96 % of print; div_facts {boxsign} "divide" at 8.9 pt vs 10 pt.
    - lf-placevalue: identify card / quiz secondary digit 30.4 px vs 40-56; unit_form / value worksheet words 14 pt vs 16 pt.
  - Not on master (route): growing quiz G9 goes to the quiz host; number_patterns_rule is fixed on -props.

### Queue moved to lf-hosts (lead, 11-13, session_013pHDnQ4fgVajj5vZ6fwpwV)
lf-hosts now owns: the host 0-cell guard + card [data-ws-cell] (20); the 390 touch targets (10); G9 quiz labels (16/17); the two-step host items (23); SIZE-REF same-word (14); and SIZE-WIDTH by unit (15). Builders A and B were already mid-way on these; their commits are offered to lf-hosts as a hand-off, pending the lead's ruling. lf-checks keeps: the checker tools, LP-RASTER for role pages (13: done, ws-grade-render --raster-fit), the -r2 narrow critic, and tool support for lf-hosts.
- 2026-11-13 queue 13 DONE (builder, Opus medium): LP-RASTER on role pages = `ws-grade-render --raster-fit` (a mode, not a new
  script: grade-render already builds each role through buildSheet and prints it to a real PDF; the reader is
  tests/lib/ws-role-raster.cjs). RR-PAGES (PDF pages = plan pageCount / keyPageCount), RR-EDGE (ink within 5 mm of the paper
  edge), RR-CLIP (each text span's tall glyphs inked at cap and foot: F3's Say band cut by the frame never left the page, so
  edge/page alone would miss it). `--raster-pdf <pdf> [--expect-pages N]` and `--raster-self-test` (6 cases, no browser, ~1 s).
  Precritic: --skill runs scripted-model + guided at S/M/L (`raster-fit`, ~10 s a sheet); --role R runs R on its sample at L
  only (`raster-fit-role-R`). ws-precritic-plan carries `--raster-fit` as a required flag (GR_FLAGS). Row `rr-clip-npr-model-l`:
  FAIL 47b1f2a86 (RR-CLIP x2) -> OK 7c1e3dbb4 (master; lf-roles' Model re-plan, 2 pages; lf-algebra had no fix of its own).
  False-positive sweep on head: 84 sheets (7 skills x 4 roles x S/M/L) all OK, 796 s.
- no-dropped-row baseline FIXED (lf-checks 11-13): it compared with origin/master's tip, so a lane branch behind master read master's newer rows as dropped (13 false drops on -r2). Now the merge base of HEAD and origin/master; a deploy tree (master merged in) is unchanged.
- The -r2 narrow critic was STOPPED by the weekly usage limit before its verdict; its partial report is committed as PARTIAL. Resume after 2026-11-19 22:00 UTC. All lf-checks work is paused until then.
- CRITIC r2-narrow (aa214cc4): PASS, C1 9 · C2 8 · C3 8 · C4 8 (lf-checks/critic-r2-narrow.md). PR #47 is deploy-ready.
  - m2 fixed before handing over: the ledger's duplicate owner / lead-deploys rows (old "pending" copies beside their exempted rows) are removed; the sweep is back to 11 fail (other lanes).
  - Queued (minors): m1 FOCUS-GAP should keep only characters that overlap the ring sideways (a line's metrics still read "Tall" beside "wer"; no live hit); m2b the sweep flags DUPLICATE ledger rows and a FAIL count above the merge base's; m3 RR-CLIP skips spans lighter than the ink threshold (a #d0d0d0 self-test PDF); m4 a self-test on a pure baselineRef for the merge-base fix.

### lf-tools-nos: print size S dropped (owner 2026-11-13, CLAUDE.md plan item 9) - builder, Opus medium
- Guard first: `tests/scripts/ws-no-size-s.mjs` (node, < 1 s). APP-PICKER (a size control offers S), APP-RESTORE (a stored
  size kept as S), APP-ALIAS (the kit's `offeredSize` reads S as M, `OFFERED_SIZES` = M,L, the S token kept so old settings
  decode), GATE-DEFAULT (an arg default, literal size list, planned `--size(s)` or deploy line with S). A reasoned allow-list
  (buildSheet's explicit-S bridge, kit-token unit tests, 9 dated lane scripts on no gate path); a stale entry fails. On every
  ws-precritic run and in deploy session 1. Row `no-size-s-76bc` (76bc11c6 FAIL 52 -> a3b128cd1 OK, ws-backtest PASS).
- App: teacher print, simple print, worksheet sheet (+ fact Columns row) and print settings offer M and L. A stored S
  (print defaults, simple-print prefs, saved quick prints, recent printouts in buildAll, the legacy kit ctx, buildSimple)
  prints at M. "All 12 tables on one page" still forces the kit S internally (12 rows fit only there); its locked Size
  control now shows M / L with "Size fixed" - a lead decision whether that option should move to M.
- Gates default to M,L (precritic S runs -> M with the M pin; empty-band, cell-checks, capacity-pin, fixit-words, slot-clip,
  options-verify, lesson-samples/-hash/-check, coverage-matrix, simple-print, columns, sheet-*). Every backtest row that
  relied on an old default now names it (`--sizes S,M,L` etc., 49 rows, text edits; none dropped).
- Pins: capacity / empty-band S keys removed; lesson-baseline S keys RENAMED M (lesson at S always printed at M; the M
  hashes equal the S keys, 30/30 checked), deploy session 4 runs `--sizes L,M`; print-lint.M.json gains the 22 lesson pages
  from the S pin; print-lint.S.json kept for old `--baseline` rows.
- Fact sheets: `ws-fact-cols-m` (FCM-COLS / FCM-PT / FCM-FIT: 9 and 10 picked columns at M, 16 pt, teacher + simple print),
  on precritic's fact-skill path; row `fact-cols-m-fixture`.
- Screenshots (before 76bc11c6 / after, dsf 2): design/status/lf-checks/no-size-s/.
- Verified: ws-no-size-s OK (76bc11c6 FAIL 52); ws-code-snapshot OK (nothing moved); ws-boot-smoke OK; ws-content-audit
  add_facts OK; ws-simple-print (default, now M,L) OK; ws-fact-cols-m OK (x facts at their own cap of 8 - the same at S on
  76bc11c6); ws-precritic-plan OK + --checks-from-critics (15 old warnings, unchanged; none dropped); ws-print-lint kit
  add_facts + combine at M and L OK; ws-backtest no-size-s-76bc and fact-cols-m-fixture PASS.
- Open (not caused here): add_facts#lesson L-TOPSTART CL-4b 0 -> 32 against the M pin, identical on 76bc11c6 at S with the
  S pin (a lesson at S is the M page) - the precritic lesson-M row will show it until lf-ops / lf-engine fixes or re-pins it.

### lf-tools-nos r2 (2026-11-13, Opus medium rebuild after critic r1 FAIL: C1 6, C2 6, C3 9, C4 7)
Checks first; each finding FAILs on c81e70178 and PASSes on 6b59329af.
- F1 (blocker) fixed: `applyPrintSettings` (saved set from the Library, tray snapshot / Undo, `&set=` link opened),
  `decodeSetParam` (the link's imported set), the worksheet sheet's build request and the Library's set words all read the
  size through `offeredSize`. Recent printouts (`buildAll`), the simple print / quick prints (`cleanPrint`), the stores and
  Settings already did. Grep found no URL size parameter, no cookie size and no size in saved quizzes.
- F2: `ws-no-size-s --browser` (new; ~15 s). It seeds S in 3 localStorage keys, a saved set, a `&set=` link and a quick
  print, then calls `tvSheetPrint.set`. It then opens Settings, Library > My sets, the worksheet sheet, the Print screen and
  the simple print (stored, and from a quick print). Each must read M, with no S option, M checked and no preview page at S.
  On every ws-precritic run and in deploy session 1. Row `no-size-s-browser-c81` (FAIL 17, then OK).
  The static guard now flags any S tuple list, a regex restore (`/^[SML]$/`, `/^(S|M|L)$/`) and a forced `'S'` (APP-FORCE).
  Self-test: 30 lines, including the critic's mutations, which I also re-ran on a mutated copy (both FAIL now). Row
  `no-size-s-r1-mutations` (fixture, via the new `--lines` mode).
- F3, measured (buildSheet, count_by_tables onePage, forced to M on a scratch copy): A4 fits 12 rows on 1 page at 22 pt
  with no slack. Letter fits 11 rows, so 2 pages plus a 2-page key. The rows do not fit at M on every paper, so per the
  lead's ruling the layout stays compact for this ONE layout. The allow-list reason is "ruled exception (lead, owner
  informed)".
  - One label everywhere: `COMPACT_LABEL` = "Compact (12 tables on one page)" (sheet/tokens.js). It is used on the Print
    screen Setup, in the section note, in the worksheet sheet's Size row and in the simple print.
  - No M/L control is drawn for this layout. The option help says "compact layout", and `ONE_PAGE_WHY` now names the
    option's real label ("All rows on one page").
  - The browser gate's COMPACT checks: one label, no Size control, every radiogroup has exactly one checked, no "Small"
    caption.
  - For the lead: the owner may prefer M on A4 only (it fits), with compact on Letter.
- F4: LESSONS_LEARNED PRE-FLIGHT 1-2 (M and L; card hosts 1280/820), the L1/L2/L25 rules, the template-first rule and the
  family-round rule now say M and L. The same change was made in RUBRIC scope, PAGE_TYPES PT-DLG-5 / PT-CMP-4, EXTENSION_PLAYBOOK #27
  and TEACHER_SCREENS. Dated history rows and the signed cards are kept as records. `ws-no-size-s --docs` (DOC) scans RUBRIC,
  the PRE-FLIGHT section, the PT-DLG rows and .claude/agents; precritic and deploy pass `--docs`, so the old row
  `no-size-s-76bc` stays valid. Row `no-size-s-docs-c81` (FAIL 4, then OK).
- Verified:
  - ws-no-size-s --docs OK, plus --self-test OK and --browser OK (41 checks).
  - ws-backtest rows no-size-s-browser-c81 / -r1-mutations / -docs-c81 / -76bc all PASS (347 rows, none deleted).
  - ws-precritic-plan OK; --checks-from-critics 104 pass / 24 exempt / 15 fail (the 15 are the same old rows, none dropped).
  - ws-code-snapshot OK (734, nothing moved); ws-boot-smoke OK.
  - node --check on every edited module.
  - ws-node-lint FAIL 50, identical on the base.

### lf-tools-nos r3 (2026-11-13, ROUND CAP: fresh builder, Opus medium; critic r1 and r2 both failed on reintroduced S)
- **Root cause.** The static and doc guards listed PHRASINGS with regexes, so every new spelling ('SML'.split(''), "at size S
  and at L", "Small and Large") slipped through. The browser gate read ATTRIBUTES (`hidden`, `aria-label="Size"`), not what
  is VISIBLE, so a CSS rule (`.sp-root .sp-sizes { display: grid }`) that put a hidden picker back on screen passed (N1).
- **Checks first** (each FAILs on 4a8e539b4 or on a planted mutation):
  - `ws-no-size-s --browser` judges visibility: computed style up the tree, a box, and elementFromPoint at the centre. It
    finds a size option by what it does (data-act/sp/k "size") or says (S M L Small Medium Large Big under a size label),
    not by aria-label. Surfaces: Settings, the worksheet sheet, the Print screen, and simple print (fact rows, quick print,
    cells, compact). In each it asserts no visible or clickable S option, no visible picker where the layout is fixed, and
    that every visible option, clicked with the mouse, changes the preview page's data-ws-size. 4a8e539b4: FAIL 3 (N1). The
    head passes 73 checks.
  - TOKEN rules replace phrase lists: APP-TOKEN, GATE-TOKEN, and DOC over every non-record *.md (records: DOC_RECORDS with
    reasons). Exemptions are explicit: dropped / alias / compact token / history wording, or a `<!-- nos: why -->` marker
    (one line, one block, or a `nos-section` for a dated findings log).
  - A MUTATION corpus of 29 rows: the critic's r1 code mutations, r2 A-F and E, the six N2 doc phrasings, and our own (a CSS
    display override, a new picker array, an S built with String.fromCharCode, a renamed label, S defaults in a gate, plus
    doc lines in CLAUDE.md, an agent brief and PEDAGOGY). Every run of this tree plants the static rows (precritic and deploy
    session 1), so the self-test is on precritic's path. `--self-test --browser` plants the 9 browser rows in a copy of the
    served tree. All 29 are caught.
  - Backtest rows (text insertion; none deleted, 347 -> 350): `no-size-s-n1-4a8e` (browser), `no-size-s-r3-static-4a8e` and
    `no-size-s-r2-mutations` (fixture). Three older rows had a pass commit that the stricter check now rightly fails:
    a3b128cd1 (fitsNotes "Small") and 6b59329af (N1, N3). Their pass side moves to 32689e907, and each row's state says so.
  - CHECKS_FROM_CRITICS: 3 rows (N1, N2, N3 + nit).
- **Fixes.** N1: additive `.sp-root .sp-sizes[hidden] { display: none; }`. Screenshot:
  `design/status/lf-checks/no-size-s/r3-simple-print-compact.png` shows the one label, with no picker. N3: WDS:22 and
  EXTENSION_PLAYBOOK:72 now say "S dropped as a choice; the token stays as the decode alias and the compact layout". L2 now
  reads "M and L". The other live docs: instructions are rewritten to M / L, and token values are marked. The nit:
  fitsNotes maps S to the compact label, never "Small".
- **Owner file.** CLAUDE.md:60 ("Size S ignored") and :461 ("Tokens (sizes S/M/L ...") fail the DOC rule. They are not
  edited, are reported to the lead, and are allow-listed with that reason. These entries go stale, and so FAIL, once the
  owner rewrites the lines.
- **Coordinator item.** ws-simple-print's student-view COLSFIT/OPTKEY step now runs at 1024, not 390. ws-simple-print OK.
- **Verified:**
  - ws-no-size-s (default, --docs, --self-test, --self-test --browser, --browser): all OK.
  - Backtests: no-size-s-76bc / -docs-c81 / -r1-mutations / -browser-c81 / -n1-4a8e / -r3-static-4a8e / -r2-mutations all
    PASS.
  - ws-precritic-plan --checks-from-critics: 107 pass / 24 exempt / 15 fail. The 15 are the same older rows; none dropped.
  - ws-code-snapshot OK (734, nothing moved); ws-boot-smoke OK; node --check on teacher-print.js and both scripts.

## 2026-11-13 — no size S after critic nos r3 (round cap): NOS-DOCS-ADVISORY

- Critic nos r3 (df9682751): FAIL C1 9 / C2 7 / C3 9 / C4 9; the app change and the browser gate pass; the text guards miss
  phrasings (third round on doc phrasing).
- Lead decision NOS-DOCS-ADVISORY: precritic and deploy session 1 run `ws-no-size-s --docs-advisory` (doc findings report as
  ADVISORY, never block). `--docs` alone still blocks (the old rows keep their meaning). The --browser visibility gate and the
  app / gate code guard stay blocking. New `--plant <row|none>` runs one browser mutation in a copy of the served tree; row
  `nos-runtime-s-button` proves the browser gate FAILs an S button added by JS at runtime and is OK unplanted.
- KNOWN HOLE (D2), beside the browser gate: the code guard reads lines, so a gate default built another way
  (`Object.keys({S:1,M:1,L:1})`, `String.fromCharCode(83)`) passes it; the browser gate covers the behaviour (every Size control
  offers M / L only), not a gate's own --sizes default.
- PARKED under FOCUS (D1-D4): one shared SIZES constant every gate reads, checked on the resolved `--dry-run` sizes (D2);
  per-span DOC exemptions instead of line-wide (D3); case-insensitive size words (D1); per-line expects in the docs rows and the
  `--lines` fixtures (D4). Then lift NOS-DOCS-ADVISORY.
- CLAUDE.md lines 60 / 461: the lead fixes them at deploy (their allow entries then go ALLOW-STALE under `--docs`).
