# lf-checks — independent critic, round 1

Critic: Opus 5.5, medium effort (did not build this work). Graded commit `6ecddbba` on `claude/sweet-newton-c8wrv1-lf-checks`
against `design/lessons-first/briefs/w1-lesson-checks.md` and `LESSONS_FIRST_PLAN.md` §6.3. Date 2026-11-07.
(`tests/lib/ws-lesson-lp.cjs` changed on disk during this round. Everything below grades the commit.)

## Verdict: FAIL (C1 7, C2 7)

| Criterion | Score | One line |
|---|---|---|
| C1 Catches its class | **7** | 8 of 9 checks fail on their named state. LP-GIVEAWAY misses lesson 4 r1 D6 (Guided = Independent), which its own backtest row claims. LP-PREREQ's seeded D8 is not the real D8 shape, and its range clause is not built. Two hand-edited pass fixtures are not real states. |
| C2 No false alarms | **7** | On the six passed lessons, every finding I checked is real except one. LP-NUMBERS flags lesson 6 T6 "7000", which quotes both forms on purpose ("7000 or 7,000"). The builder lists it as real, and the pass fixture "fixes" it to "(7,000 or 7,000)". The empty-packet guard and the one-digit giveaway gap leave room for vacuous passes. |
| C3 On the path, wired | **8** | precritic `--lesson`, `--unit`, `--teacher --lesson`, the plan rows, the deploy rows, the `excl` kind and PARSE.detailedLesson all work. The minors are below. |
| C4 Runtime, maintainability | **8** | Fixture rows run in 0.1–1.0 s. `--lp` takes 13–70 s of work, and `--sweep` takes 54 s on lesson 7. The header docs are good. The code is very dense (one-line 300-char functions), there are dead conditions, and the new deploy rows are UNTIMED. |

## Evidence (commands run)
- `node tests/scripts/ws-detailed-lesson.cjs --lp-self-test` → `OK (25 cases)`.
- `node tests/scripts/ws-backtest.mjs --kind fixture` → 35 PASS, 0 FAIL; LP rows: e24-family 0.2/0.2 s, lp-text-no-x 0.2/0.2,
  lp-fallback 0.1/0.1, lp-numbers 0.2/0.2, lp-prereq 0.2/0.2, lp-raster 0.9/1.0, lp-sweep 0.2/0.2.
- `node tests/scripts/ws-backtest.mjs --row lp-giveaway` → FAIL 28.6 s / OK 24.2 s, PASS (57.5 s).
- `node tests/scripts/ws-precritic-plan.mjs` → `OK (47 rows on the lane's path, 31 not applicable)`; all 10 new rows on path.
- `ws-precritic --lesson g3-oa8-two-step-wp --dry-run`, `--unit G3-Y4.B4 --dry-run` (4 long lessons + an honest N/A row naming
  the 13 unbuilt), `--teacher --lesson 3:D4:2 --dry-run` (old meaning kept), `--lesson nope` (clear refusal),
  `--lesson a,b` (2 lessons).
- `bash tests/scripts/ws-deploy-gates.sh --list` → 6 `--check` rows for the six PASS lessons (lesson 7, FAIL, correctly absent),
  `ws-lessons-first-queue --check` (node), `ws-chromebook-perf` as `excl` with `$RUNNER $RUNNER` (nested flock on a new
  open file description takes the second slot: correct).
- Live `--lp` (all via /tmp/mq-browser-run.sh, seed 4242): lesson 1 g2-nbt3 (FAIL: MODELLED combine, MEASURE P4-1 17 %),
  lesson 3a (OK), lesson 4 (OK), lesson 5 (FAIL: RASTER P5), lesson 6 (FAIL: NUMBERS, MEASURE 19 %), lesson 2 (does not build:
  `no add_wp_20 item … want 4000`, the builder's R1), lesson 7 (FAIL ×5, as expected). Lesson 4 at a890f61f via MQ_ROOT.
- Lesson 7 `--sweep`: 54 s, `FAIL (42)`.

## Sample of the claimed real defects: my rulings
| Claim | Ruling | How verified |
|---|---|---|
| L1 P6 "combine" (100 + 40 + 8 = ?) never modelled | **Real** | The chart P2 models numeral → expanded form only. Expanded → numeral appears only on P4m (mixed) and P5. The T4 board has no combine row. Same class as lesson 1 r1 D1. |
| L1 / L6 Practice blank foot 17–19 % | **Real** | Looked at the lesson 1 P4-1 render (pdf p14): 9 rows end at about 80 % of the body, with about 41 mm of empty foot. |
| L6 T3 "4. 4000" | **Real** | Critic r3 n2. The P0 key prints 4,000. |
| L6 T6 "7000" | **FALSE ALARM** | T6 reads `A value written with or without its comma (7000 or 7,000) is right.` The bare form is quoted on purpose (D2). |
| L6 P4-2 92,163 / 92,715 | **Real** | Critic r3 n1. |
| L5 P5 band rule lost at 72 dpi | **Real** (L20 precedent) | pypdfium2 render of lesson-raster.fail.pdf: rows y = 438–445 px are all 255 at 72 dpi and have ink at 93 dpi. The black fill (441.0–442.5 pt) is covered by the snapped white inner fills. |
| L3a seeds 13 / 14: chart 2×3 back as 3×2 / 2×3 on P4-1 | **Real** (E24 class) | `--sweep-packets lesson-sweep.fail.json`, plus the pool items printed. |
| L4 / L6 do not build at many seeds; L2 does not build at 4242 | **Real** (app, not tool) | L2 reproduced. These are reported to the owners (R1, R4). |

## Defects
**D1. LP-GIVEAWAY misses the D6 it claims (Guided = Independent).**
- *What:* the `lp-giveaway` row (backtests.json) names lesson 4 r1 D1, D2 and D6. On a890f61f, `--lp` fails only on the Say
  bands ("So 28 is", "So 12 is"). P3 reads Guided `0/0/2` against Independent `0/0/1` (traces / grey / level).
  `hint = traces + greyInk + level` (`ws-lesson-lp.cjs` giveaway) counts `data-ws-level` as a hint. Guided level 2 > 1, so the pair
  passes, even though critic r1 D6 says the Guided cells carry no hint.
- *Why:* the check's second clause passes vacuously on the exact state it was built for. The row still PASSes on D1 / D2, so
  the backtest hides it.
- *Fix:* count only drawn hints (trace, ghost, grey ink, a pre-filled first step), not the level attribute. Add a fixture row
  with the a890f61f P3 packet: `--only LP-GIVEAWAY` must name "Guided … no hint".
- *Check that would have caught it:* a backtest's FAIL must name each defect the row cites (match on a per-defect substring
  in `expect.failNames`), not just print "FAIL".

**D2. LP-NUMBERS false alarm on a deliberate bare number, and the builder classed it as real.**
- *What:* lesson 6 T6 "Accepted answers: … (7000 or 7,000) is right". The exemptions cover "N for M" and H T O chart rows,
  not "N or N,NNN". The pass fixture `lesson-lp-l6.pass.json` edits it to "(7,000 or 7,000)", which is nonsense. The status
  file's R8 sends "T6 7000" to the lesson 6 owner as a defect.
- *Fix:* exempt a bare number that sits next to its own comma form (`7000 or 7,000`, or `7,000 (7000)`). Restore T6 in the pass
  fixture. Drop "T6 7000" from R8.
- *Check that would have caught it:* add a self-test case built from every passed lesson's live text (a "known-true" corpus).
  Every exemption class the lessons print must stay green.

**D3. LP-PREREQ: the seeded D8 is not the real D8, and the range clause is missing.**
- *What:* phase 0 r1 D8 is an **exchange box** (plus `check: true`, a second task) on a check item. The fail fixture seeds
  `traces: 1`. `lpMeasure` counts only `.ws-trace`, `[data-ws-trace]`, `.ws-ghost`, grey ink, Say and Steps, so a real
  exchange box would pass. The brief's third clause, "its items inside the step's range" (phase 0 D3), is not built, and the
  header does not say it is deferred.
- *Fix:* count structural scaffolds on P0 cells too (exchange / regroup boxes, part-whole frames, `data-ws-level > 0`). Read the
  step's band from `queue.json` / the WRM step (or mark the clause PENDING with a reason). Re-seed the fixture with the real
  D8 DOM shape (an exchange-box node), not a count.
- *Check that would have caught it:* "seeded fixtures seed the DOM, not the packet". A seeded row runs `lpMeasure` on seeded
  HTML, so the extractor is part of the proof.

**D4. Two hand-edited pass fixtures are not real states.**
- *What:* `lesson-lp-l7.pass.json` has "Ana has 63 buttons … equally among 6 friends" (not whole), "Tom has 32 shells … How
  many marbles" (pool 32÷8, text "among 5 friends"), and "Ben has 54 stamps … 6 equal groups" (pool 54÷9).
  `lesson-lp-l6.pass.json` has "The 9 in 47,715" (47,715 has no 9). `lesson-raster.pass.pdf` is a different lesson's page
  (lesson 6 P5), not lesson 5 P5 fixed.
- *Why:* the brief asks that a hand-edited pass be the critic's fix and nothing more. These edits pass the check, but no build
  could produce them, so they do not show the check accepts a *real* fixed state.
- *Fix:* edit to valid fresh items (e.g. 54 ÷ 6, with pool and text in agreement). For the raster, re-render the same page with
  the fixed rule (or with the panels butted 0.75 pt apart), or say plainly in the row's `pass.state` that it is a sibling page.
- *Check that would have caught it:* a fixture lint. In each packet, every story's numbers must match its pool item (a ÷ b
  whole) and every place-value sentence must name a digit that occurs in its number.

**D5. Vacuous pass on an empty read.**
- *What:* `lpChecks({pages: [], pool: null})` gives PASS on 7 of 8 checks. With `--sweep`, which runs no MEASURE, a DOM rename
  (`section.ws-page`, `#v21-pool`, `data-dl-page`) makes every seed OK. With `pool: null` and pages present, LP-FAMILY-REPEAT
  silently reads 0 families.
- *Fix:* fail (or ERROR) when a packet has 0 pupil pages, 0 key pages, or no pool for a lesson whose generator deals one. Add a
  self-test case for it.
- *Check that would have caught it:* a "read nothing" self-test for every check that reports a count (the class LESSONS_LEARNED
  calls a check that passes on 0 items).

## Minors
- n1. LP-TEXT backtests cover only clause (b). The brief also names lesson 2 r3 D2 ("Steps at the top") and lesson 5 r2 D7 as
  fail states for clauses (c) and (d). Only the self-test exercises them.
- n2. LP-TEXT (b) reads only the first word after "No" and only before "this time | here | on this page | today". "No more steps this
  time" checks "more" and passes. "Don't use the step boxes" is never read.
- n3. LP-GIVEAWAY skips every one-digit key answer (`digits(a).length < 2`). For K–1 lessons (answers within 10) the band clause
  is then empty. Consider skipping one-digit answers only when the band also prints item numbers or step numbers.
- n4. LP-NUMBERS near-look reads only "same first two digits". Lesson 6 critic r3 n6 (3,545 / 5,465 / 5,855: the 5 in every place)
  is a near-look the rule cannot see.
- n5. LP-MODELLED keys stories on the joined feature string. Lesson 7 live fails "share+take" while the chart models share+add
  and groups+take. That may be right, but it needs a ruling (pair-level or step-level). Rep variants (`skill:variant`) are only a
  note, so a new task variant never fails.
- n6. The LP-MODELLED header says "anchor chart P2*, the board rows of T4, or Guided P3*". The code takes reps from P2* only, and
  T4 only for stories.
- n7. LP-PREREQ with no P0 returns `pass: true` with "(N/A)" in the message, so the precritic table shows PASS, not N/A.
- n8. LP-RASTER maps packet page *i* to PDF page *i*+1. A teacher page that overflows to two PDF pages shifts every later page.
  Assert `pdf.pageCount === pages.length`.
- n9. The precritic usage line still lists only `--skill | --template | --role | --teacher`. `--lesson` and `--unit` are in the
  header only.
- n10. The 6 new `--check` deploy rows and `ws-lessons-first-queue` are UNTIMED, so they count 0 s in the session-1 budget. Lesson
  2's `--check` row is red on the base (R1). Pin it or name it so a deploy does not read it as new drift.
- n11. Dead or redundant code. In `numbers()`, `/^20[2-3]\d$/ && /\b(19|20)\d\d\b/` repeats itself. In `giveaway.has`,
  `d.length < 1` after `!d` is redundant. `lpMeasure` lines run to about 300 characters, which is hard to review.
- n12. `design/status/lf-checks.md` was written during this round (it is untracked at 6ecddbba). `design/lessons-first/patches/` is
  untracked as well.

## Runtime (C4)
| Run | Measured |
|---|---|
| `--lp` lesson 7 / 4 / 5 / 6 | 13 s / 33 s / 42 s / 70 s wall. Lessons 1 and 3a took 141 s and 239 s, which includes slot waits behind other lanes' browsers. |
| `--sweep` lesson 7 (25 seeds, jobs 3) | 54 s |
| LP fixture rows | 0.1–1.0 s each |
| `lp-giveaway` commit pair | 57.5 s |

## Automatic checks that would have caught each finding
- D1: backtest rows list `failNames`, one substring per cited defect. ws-backtest fails a row whose FAIL output lacks any of them.
- D2: a known-true corpus self-test, i.e. LP-NUMBERS / LP-TEXT on every PASSED lesson's saved packet. A new FAIL there must be
  ruled real by the critic before it is accepted.
- D3: seeded rows seed HTML and run `lpMeasure` (`--packet-html <file>`), so the extractor is in the proof. The brief-clause
  checklist parses the brief's table "What it asserts" column and requires a check or PENDING row per clause.
- D4: a fixture-consistency lint (story numbers vs pool item; place-value sentence digit occurs in its number; ÷ whole).
- D5: an empty-read self-test for every check (0 pages, no pool → FAIL / ERROR).
- n1: ws-precritic-plan asks for a backtest row per named fail state in the brief table, not per check.
- n8: an assertion that the PDF page count equals the packet page count.

## Speed-ups this round revealed
- Other lanes' browser runs held both slots. My 6 live `--lp` runs spent about 4 of their 9 minutes waiting. A critic for a tool
  lane could grade from the builder's saved packets (`--packet-out` of every passed lesson, committed as fixtures) and run live
  only for a sample.
- `--kind fixture` took 21 min because the older pilot fixture rows (sibling-compare, slot-clip) launch browsers. A
  `--row-prefix lp-` / `--fast` filter (rows with no `browser: true`) would give this round's proof in under 5 s.
- Adding `--packet-out` to the precritic `--lesson` gate's command would let the critic re-run the pure checks offline in
  0.2 s instead of re-rendering.
