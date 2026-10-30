# Lane: lessons-phase0 (work order item 5, design/IMPROVEMENT_PLAN.md "Work order from 2026-10-30")

Branch `claude/sweet-newton-c8wrv1-lessons-phase0`, from `claude/sweet-newton-c8wrv1` @ fbeaa332 (2026-10-30).
Source: `claude/sweet-newton-c8wrv1-wip-lessons` (branch point 859782bd, 2026-09-26). Mined commits: 588d053f (r5: lesson
rules + `ws-lesson-check`, phase 0's first item), 669df31a..0e40332e (phase 0.1–0.9), ebcf82e7 (LR-18), cf428e41 + ea22a97f (LR-17).
Not mined: everything the wip branch merged from sweet-newton before 2026-09-26 (main has newer versions).

## Lead decisions (2026-10-30)

**D1 — one Prerequisite Check.** Today's code already has the newer design: `sheet/roles/pre-skill-check.js` (PAGE_TYPES
2.10), which the detailed lessons use as P0 (`perQuestion`, 3–4 questions) with the routing table on the teacher key
(T6, `detailed-lesson.js`). LR-17's page builder `lesson-pages/prereq-check.js prereqPlan` is NOT ported (it would be a
second page doing the same job). What LR-17 had that today lacks is brought into the one concept:
- the lesson LIBRARY's `prereqs` data, validated (`lessons/schema.js`: 3–4, most basic first, real lesson ids or a NEEDS
  entry, live skills, not itself, no cycle) and its gate (`ws-lesson-coverage`);
- the standard (non-detailed) lesson packet's `prereq` part, drawn BY `pre-skill-check.js` (one question per
  prerequisite), replacing that packet's Warm-up only for a lesson that declares `prereqs`;
- the owner's §8b print rule: each question's small teacher tag "If missed → Lesson <id> <title>" (an optional
  `routes` input of `pre-skill-check`, marked `data-ws-teacher`) and the routing table on the key (one shared builder,
  the same table the detailed lesson's T6 prints). The detailed lessons pass no `routes`, so their pages stay
  byte-identical.

**D2 — vocabulary.** The extracted `sheet/lesson-pages/vocab.js` keeps today's vocabulary band byte-identical; lesson
pages are looked up by part id from one registry (`lesson-pages/index.js`), so the vocabulary redesign adds its pages by
registering a part, without editing `roles/lesson.js`. No new vocabulary page is built in this lane.

**D3 — byte-identical.** Every refactor step (library, `lessonId`, page extraction, parts/refresh at refresh 0) keeps the
three sample packets AND the detailed lessons byte-identical (render hashes before/after). Only LR-17 changes the
samples' sheets (Warm-up → Prerequisite Check), on purpose, and that is what the critic grades.

**D4 — coordination.** The lessons 6–7 session (`claude/sweet-newton-c8wrv1-lessons-6-7`) owns lesson CONTENT
(`js/modules/lessons/detailed/*`, `design/lesson-samples/detailed/*`). This lane keeps to library / engine files and
touches `print-sheet.js` `buildLesson` / `buildDetailedLesson` only where the part / lessonId plumbing needs it.

## Builders

| Builder | Profile | Scope | Branch |
|---|---|---|---|
| A | mq-opus-medium (first build of the library engine) | node-only: library, schema, families, seed-db, prereq-db, status-db, lesson-rules, ws-lesson-check / seed / coverage / hash, build-list NEEDS, browser-lock | worktree → merged here |
| B | mq-opus-medium (first build of the page engine) | render: hash baseline, lesson-pages extraction, parts + refresh (LR-18), lessonId, LR-17 through pre-skill-check | worktree → merged here |

## Times

### Builder A (node side), 2026-10-30, 17:28-18:05 UTC (about 37 min wall)
- 17:28-17:32 read + port `sheet/lesson-rules.js`, `tests/lib/browser-lock.cjs` (+ harness, lock tested: stale holder broken,
  waiter gets it on release, file gone) - commit e8409ccd.
- 17:32-17:42 library: `schema.js`, `library.js`, ten family files (all ten lessons of today's `prereqs.js`), `prereqs.js`
  as the view (deep-compare OK), `ws-lesson-seed` (curated links first), `ws-lesson-coverage`, `ws-lesson-hash` - e6b18f8c.
- 17:42-17:44 build-list NEEDS + `ws-lesson-unit.mjs` (79 checks) - 457bea20.
- 17:44-17:50 `LESSON_RULES.md`, plan §7/§8b notes, `ws-lesson-check` on today's engine (probe of the plan shape, 1 run) - 6ccf9938.
- 17:50-18:02 gates (browser gates one at a time; render identity 6 min, lesson-warmup 5 min, lesson-check 3 min).

### Builder A: what was ported, what was skipped
- **Ported:** 588d053f lesson-rules.js, LESSON_RULES.md, ws-lesson-check (adapted: the packet check computed in the page
  when the engine gives no `lesson.check`; LR-18 parts only where `window.lessonPartSeed` exists); 669df31a ws-lesson-hash
  (no stamps file - B takes the baseline); 28a202a5 / c5847d4a library, schema, families, prereqs.js view (with TODAY's
  data, all ten lessons, not the r5 data); 99607315 ws-lesson-seed -> seed-db.js + prereq-db.js (now from the curated
  `data/curriculum/links` `pre` lists first: 391 of 557 fallbacks); aaa67de9 ws-lesson-coverage -> LESSON_COVERAGE.md,
  status-db.js, passed-stamps.json (stamps empty until B's baseline; `--bind-stamps` fills them); 786f60a1 build-list
  NEEDS + ws-standards line; 0e40332e browser-lock + harness; cf428e41 / ea22a97f / ebcf82e7 data, library, schema,
  coverage, doc hunks (LR-17 per D1).
- **Skipped (engine, not Builder A's):** 588d053f print-sheet / stack / pv / mixed-practice / tokens / teacher-print /
  lesson.js / lesson-css / sheet/index hunks (r5: one avoid set, noNearTwin, maxUnder10, LESSON_PACKET_SIZE, stackMinSize /
  atLeastSize, `lesson.check`, third chart example for the double and the answer under 10) - not on main; listed in
  LESSON_RULES.md "Status on the main branch"; `ws-lesson-check` reports their findings against today's packets.
  cf428e41 `lesson-pages/prereq-check.js` (D1), its print-sheet / lesson-css / teacher-print hunks (B). ebcf82e7 engine
  hunks (B). The branch's ws-layout-unit lesson checks moved to `ws-lesson-unit.mjs` (no shared-file conflict with B).
- **Data decisions:** the r5 data changes to the samples (third example `double`, `underTen`, `maxAnswer` / `ansDigits` on
  partners) are NOT taken - today's records are kept byte-for-byte (D3); only the library-only `cases` / `caps` (gate data)
  come from r5. The seven SU-C no-regrouping lessons share ONE routine (`sub-column-no-regroup`) with per-lesson `teach`
  fields; they declare `prereqsPending` and `casesPending` (listed in LESSON_COVERAGE.md; `--strict` fails on them).

### Builder B (render side), 2026-10-30, 17:28-19:50 UTC (about 2 h 20 min wall)
- 17:28-17:50 read; `tests/scripts/ws-lesson-baseline.cjs` (260 page hashes: 3 samples x L/M x seeds 4242/1001, 5 detailed
  lessons). Two false starts: puppeteer's 180 s protocol timeout on a detailed lesson (fixed: the page reconnected with
  no timeout), and the detailed doc's css links carrying the test server's port (fixed: normalised). ~25 min lost.
- 17:35-18:20 extraction (scripted line-range moves, a missing-import check, then the hash run: 9-10 min a run) -
  a0ba0331, hashes identical.
- 18:20-18:50 parts + refresh (LR-18) - 13ebeb93, hashes identical, `--parts` OK.
- 18:50-19:05 pre-skill-check routes - aec55f46, hashes identical.
- 19:05-19:50 merge A (eab21f55, clean); lesson by id + the Prerequisite Check part (LR-17) - 847c332b, then the
  check-page fixes from print-lint (two-up rows, wrapped strips, tag flex, routing page in key mode).

### Builder B: what was built, deviations
- `sheet/lesson-arch/` has EIGHT archetypes, not three: today's CASE_TESTS also hold the detailed lessons' cases (pv,
  story, array, grid, table); `index.js` merges them and throws on a duplicate case name.
- The Warm-up band is `lesson-pages/warm-up.js` (the branch's `prereq-check.js` name is not used: D1).
- The registry (D2) holds parts (prereq 5, chart 10, sheet 20, practice 30, mixed 40) AND the lesson sheet's bands
  (vocab 10, warm-up 20, guided 30); the role lays out the registry's bands and hands an unknown lesson-role part to its
  `plan`; buildLesson builds every registered part.
- Refresh avoidance uses today's `avoidTexts` (soft) instead of the branch's `avoidHard` / `avoidSoft` (stage 3 r5 hunk).
- The routing table is a key page of its own (`ws-keyextra`): `arrangeKey` and `ws-print-lint` (AK-4 count, HD-30
  footer pick) leave it out of the pupil/key pairing. Its styles are inline, so the shared sheet stylesheet (embedded in
  every page) and every other page stay byte-identical.
- A quadrant / stacked check with routes whose cells fill the page can take a second page (the tags need ~6 mm a band);
  the lesson packet's check (perQuestion 1) fits one page.

### Builder B fix round (2026-10-30, 19:55-21:50 UTC)
- Prerequisite Check page: cells keep CL-4b's top start (owner 2026-10-23; an inline centring tried first raised
  L-TOPSTART CL-4b 0 -> 6 on add_facts#lesson, so it was dropped: `mq-lvcenter` loses to CL-4b on the Warm-up too).
  The spare height goes into the rows only while a cell's foot band stays under ~25 % (the measured cell less 3 mm,
  over 0.75); the rest spaces the questions apart (at most 40 mm a gap). Tags wrap (never clipped, TY-12) and take the
  lines they need; the routing page is titled by the lesson (`checkFor`).
- `placevalue:more_less_10#lesson` CL40-INK 0 -> 2: the same 2 findings on origin/claude/sweet-newton-c8wrv1
  (a3392d38, temporary worktree, `ws-print-lint --source kit --roles lesson --skills placevalue:more_less_10`) -
  PIN DRIFT, not this lane (that skill has no library lesson; its packet path is unchanged).
- `tests/scripts/key-options.cjs`: PRE-EXISTING DEFECT (flake) - on origin/claude/sweet-newton-c8wrv1 a3392d38 too,
  every combination line prints, then a puppeteer `Runtime.callFunctionOn timed out` (180 s protocol timeout) ends it
  with `key-options: FAIL`. Recorded in design/status/defect-tally.csv.
- `ws-detailed-lesson.cjs --check`: FAIL on all five detailed lessons, E11 (H13 in the P0 check cells, 30-51 %) and E15
  (instruction strings). Every detailed page is byte-identical to the pre-lane baseline (`ws-lesson-baseline`: 0 of
  140 changed), so this is not this lane's; the lessons 6-7 session owns that content.
- Open on the lesson Prerequisite Check page (`ws-lesson-samples` sheetCheck, H13 >= 30 %): add S cell 4 32 % tall and
  a 25 % foot; sub S cells 1-2 31-33 % WIDE (one narrow item per full-width row); round L/S cell 1 41-42 % tall (the
  legacy count-in-10s cell is measured taller than it draws, even unstretched), round S cell 2 31 % wide and cell 4
  40 % tall. `ws-print-lint` (the precritic judge) is clean on add_facts#lesson at L and S; for sub_100_regroup and
  nearest_10 (not in the precritic set) it reports, beside pre-existing practice-page findings, the H13 width band
  (sub S) and AK-4 on the check's key for nearest_10 (7 answer slots vs 6 - an item's key slot, not yet traced).
- `ws-lesson-coverage --bind-stamps` bound the three samples' earlier critic passes to the NEW renders (they now open
  with the Prerequisite Check, which no critic has graded). The lead reset them (b8ba85bd): they read STALE (re-grade due).

## Gates

Builder B, merged tree (e6fe3c61 + the fix round), 2026-10-30:
- `ws-precritic --role lesson --strict`: FAIL only on `placevalue:more_less_10#lesson L-OVERLAP CL40-INK: 0 -> 2` (L and S),
  which pinned main has too (above); ws-grade-render PASS (20 units, 259 pages).
- `ws-wrm-page-unit`: OK - 1067 lessons, 894 mapped. `ws-wrm --report-only`: FAIL (report only: exit 0), 359 steps
  without a full skill (by design).
- `ws-detailed-lesson --check`: FAIL x5 (E11 / E15, pre-existing, above).
- `ws-layout-unit`: OK (542). `ws-lesson-unit`: OK (79). `ws-boot-smoke`: OK. `ws-code-snapshot`: OK (723 codes, 35 categories).
- `ws-lesson-baseline`: detailed lessons 0 of 140 changed; the 120 sample hashes change (LR-17, intended). `--parts`: OK.
- `ws-lesson-hash --write`: 18 stamps; `ws-lesson-coverage`: OK (10 lessons: 0 passed, 3 stale, 0 failed, 7 draft) after the lead's reset.

### Critic-ready pages (Builder B, LR-17 + LR-18 samples)
The three packets, seed 4242, PNGs at 110 dpi: `design/lesson-samples/<packet>/` (L) and `design/lesson-samples/<packet>/S/`
(S, printed at M), for <packet> = `add-within-10`, `subtract-2-digit-regroup`, `round-nearest-10`:
- pupil: `pupil-p1.png` Prerequisite Check (new) · `pupil-p2.png` anchor chart · `pupil-p3.png` lesson sheet (no Warm-up
  now) · `pupil-p4.png` Practice · `pupil-p5.png` Mixed; `chart-grey.png` the chart in greyscale
- key: `key-p1.png` Prerequisite Check key · **`key-p2.png` the ROUTING TABLE page** · `key-p3.png` chart · `key-p4.png`
  lesson sheet · `key-p5.png` Practice · `key-p6.png` Mixed

## Critic rounds

| Round | When | Verdict | Report |
|---|---|---|---|
| r1 | 2026-10-30 ~21:55-22:01 UTC (critic ≈6 min) | **FAIL, min 3** (round key-p1 H1; round Q4 H3; H13 on every check page; engine 6/7/7/6). The add lesson sheet without its Warm-up passed (8 8 8 8). | `design/audit/runs/lessons-phase0-r1/REPORT.md`, `grades.jsonl` |

**Owner decision (via the lead, 2026-10-30 20:28): pause after the current pieces — one critic round, then stop.** No fix
round has been started. Screenshots for the owner are kept for the pass (the PNGs the critic graded are under
`design/lesson-samples/<packet>/`).

## Per-round findings (automatic checks · speed-ups)

### r1 — automatic checks (each critic finding a machine could have measured)
- D1 doubled slot (H8): NEW check — answer slots per cell vs key answers (ws-print-lint), backtest on add Q2.
- D2 / D12 route text ≠ item: NEW — schema field `checks` per prerequisite + name-read of the dealt item (content-audit reader).
- D3 / D7 range: NEW — ws-lesson-coverage deals each prereq ref and holds its numbers to the step's range.
- D5 unpinned prereq pool: NEW — deal N seeds per prereq ref, content-audit name reader against the prereq lesson title.
- D6 AK-4: EXISTS (ws-print-lint) but not on precritic's path for these skills — add the three sample skills to
  `ws-precritic --role lesson` and make AK-4 blocking.
- D4 / D9 / D11 H13 and blank feet: EXISTS (ws-lesson-samples sheetCheck) but non-blocking — make it a gate.
- D8 supports on a check: NEW — precritic rule "pre-skill-check cells: no scaffold elements, one response".
- D10 clipped strip: EXISTS in part (L-OVERLAP) — extend to strip text + pupil/key twin geometry diff.
- D13 / D14 / D15: NEW cheap greps (one title constant; one routing-table export; no literal styles in roles output).
- D17 `--bind-stamps` re-binding changed renders: NEW — the tool refuses when the render hash changed since the grade.

### r1 — speed-ups
- The builder knew D6 and D9 from its own tools and handed over anyway (the lead accepted known reds to fit the owner's
  one-round instruction): a known red machine finding goes to the critic only with the owner's say-so.
- Builder B lost ~25 min to the baseline script (puppeteer protocol timeout, css port) and ~1 h to 3-4 layout
  iterations at ~8-10 min a render: a single-page render mode for the check page (one lesson, one size, one part)
  would cut each iteration to ~1 min.
- Content defects D2 D3 D5 D8 were data choices in `families/*.js` made without dealing the items: the prereq-item checks
  above would have caught them at build time.

## Hand-over (for when the owner resumes)

**Done (on this branch):** library / schema / ten family files / prereqs.js as a view (A: e8409ccd e6b18f8c 457bea20
6ccf9938 b4e5f2ee); seed-db, prereq-db, status-db and their generators; ws-lesson-coverage, ws-lesson-seed,
ws-lesson-hash, ws-lesson-check, ws-lesson-unit; build-list lesson NEEDS; browser-lock (merge eab21f55). Page extraction
into `lesson-pages/` (registry) + `lesson-arch/` (a0ba0331, byte-identical); parts + refresh LR-18 (13ebeb93);
pre-skill-check `routes` + routing table (aec55f46); lessonId + LR-17 Prerequisite Check part (847c332b); fix round
(merged df2e2147). Main merged at e6fe3c61.

**Half-done:** the LR-17 check page and routing page (critic r1 FAIL: D1-D13, D20); D14 (detailed T6 not on the shared
table); D15 (inline styles); D16 (no unit tests of the routed plan); D18 (parts registry only half plug-in).

**Remaining (in order):** (1) fix round r2 on Opus medium (a failed round's rebuild): data fixes D2 D3 D5 D8 D20 in
`families/*.js`; seq_10 kit cell D6/D7; one grid layout for the check page D4 D9; `checks` field + routing table in the
check key's spare room D12; title constant D13; D10 / D11 sheet reflow; (2) the automatic checks above, with backtests,
before the r2 critic; (3) critic r2 (≥ 8 everywhere), then screenshots under `design/status/lessons-phase0/` and
`--bind-stamps` on the graded render; (4) follow-up lane: the r5 engine hunks of 588d053f (one avoid set, noNearTwin,
maxUnder10, LESSON_PACKET_SIZE, stackMinSize / atLeastSize, `lesson.check`, the chart's third example) to bring
ws-lesson-check (81 findings) to 0 — out of item 5's commit list, not approved for this lane; (5) the vocabulary
redesign registers its pages in `lesson-pages/index.js` (D2) — not built.

**Open decisions:** whether the check's question order is curriculum order or closeness to the lesson (D20); whether the
routing table belongs on the check key (D12) or its own page; whether detailed T6 moves to the shared table (D14, changes
passed detailed pages — needs the lessons 6-7 session).

**Pre-existing reds (not this lane):** `placevalue:more_less_10#lesson` CL40-INK pin drift; `key-options.cjs` protocol
timeout; `ws-detailed-lesson --check` E11 / E15 on all five detailed lessons.

**Cost:** ≈ $95 estimated (builders A + B + critic + lead ≈ 1.7 M tokens); ≈ 3.4 % of the weekly limit at $28 ≈ 1 %.
