# lf-checks — independent critic, round 2

Critic: Opus 5.5, medium effort (did not build this work). I graded fix commit `fbff1a13` on `claude/sweet-newton-c8wrv1-lf-checks`.
During the round the branch moved to `5629a7f4` (two small commits: LP-FALLBACK reads chartSizing, and precritic gained
SKIPPED-NOT-BUILT rows). My live runs used that head. Date 2026-11-07.

## Verdict: FAIL (C1 7, C2 7)

| Criterion | Score | One line |
|---|---|---|
| C1 Catches its class | **7** | D1, D3 and D5 are fixed and proven. PC-RANGE, NAME, SLOTS, SCAFFOLD and H13 fail 8f12b0e85 on the named defects. PC-CLIP **passes** 8f12b0e85, which is the D10 state it claims. D4 is half fixed: the lesson 6 / 7 pass fixtures still are not real states. |
| C2 No false alarms | **7** | No new false alarm on lessons 1, 3a, 4, 5 or 6 (lesson 2 does not build, R1). `ws-lesson-samples --check` is OK on head. The new `lesson-samples-key-L` gate is red on head with 30 CL40-INK findings (nearest_10), a code outside its stated purpose (AK-4, SECTION), and nobody has recorded it. PC-NAME's `checks` clause requires every word, so natural text ("10 more, 10 less", "tens and ones") will fail right items. |
| C3 On the path, wired | **8** | precritic `--lesson` / `--role lesson` plan the 3 new gates, the PARSE.lessonSamples verdict line and the usage line (n9). The phase-0 table rows are PENDING and do not even run their fail side. The PC functions have no self-test. |
| C4 Runtime, maintainability | **8** | Fixture rows take 0.1–0.9 s, and `lp-giveaway` takes 46 s. `ws-lesson-samples --check` takes 39 s on head, but 3 m 34 s wall (88 s for one lesson × 8 seeds) once a Prerequisite Check exists. The code is still dense (300-char lines), and `nm` in nameCheck is dead (`void nm`). |

## Evidence (commands run)
- `ws-detailed-lesson --lp-self-test` → `OK (30 cases)`, which includes the new empty-read, comma-twin, level-not-hint, grey-ring and exchange-box cases.
- `ws-backtest --row e24-family,lp-text-no-x,lp-fallback,lp-numbers,lp-prereq,lp-raster,lp-sweep` → 7 PASS, 3.6 s.
- `ws-backtest --row lp-giveaway` → FAIL 22.7 s / OK 19.1 s, PASS. Run directly at a890f61f, `--only LP-GIVEAWAY` names
  `P3: Guided cells carry no hint (trace / grey ink / grey ring), so Guided = Independent` together with the Say bands. At 8b4ec4ae P3 Guided reads greyLine 3 and Independent 0, so the check is OK. **D1 fixed.**
- `ws-precritic-plan` → OK (47 on path, 31 N/A). `ws-precritic --lesson g3-oa5-mult-properties --dry-run` lists
  lesson-samples-check, lesson-samples-key-L/-S, --lp and --sweep.
- Live `--lp` on head:
  - Lessons 4 and 3a / 5: OK.
  - Lesson 6: FAIL on T3 "4000", the P4-2 near-look and MEASURE 19 %. All three were ruled real in r1. T6 "7000 or 7,000" is no longer flagged: **D2 fixed.**
  - Lesson 1: FAIL on MODELLED combine (real, r1).
- `ws-lesson-samples --check` on head → OK. RANGE, NAME, SLOTS and SCAFFOLD read N/A (no prereqCheck in the tree, 0 items read). H13, CLIP and BUILD pass.
- `MQ_ROOT=wt-p0 … --check` → `FAIL (43)` with PC-RANGE 2, NAME 13, SLOTS 4, SCAFFOLD 6, H13 18 and **CLIP PASS**. Rulings:
  - D3 add Q2 "13, 15, 14 outside within 10": caught.
  - D7 round Q1 "not multiples of 10": caught.
  - D5 round Q4 "1 more than 33 is not what '10 more, 10 less' names": caught.
  - D2 / D12: caught only by the missing-field rule ("no `checks` text", on all 12 items).
  - D1 add Q2 (empty box + Answer line): caught.
  - D6 round Q1 (0 slots on the page, 1 on the key): caught.
  - D8 sub Q3 / Q4 (regroup box ×2, and Q4 has 2 responses): caught. This also proves `lpMeasure` reads the real `data-ws-seg` DOM, which closes **D3** together with the PENDING range note.
  - D4 (55.7 / 53.7 mm gaps, 25 % foot on add S), D9 (31 % / 42 % bands) and D11 (round S sheet 18 %): caught.
- `--only sub --seeds 1 --rules PC-CLIP --debug` on wt-p0 → PASS. The heading "Independent Practice:" is at 193.8 mm on both the pupil page and the key, and `covered: null`.
  `ws-print-lint --lints L-OVERLAP --skills subtraction:sub_100_regroup` on wt-p0 → `SECTION major (p3) a fill printed after the heading "Independent Practice:" (at 15.5, 195 mm) covers it`. So D10 is caught by print-lint and missed by PC-CLIP.
- `ws-print-lint --roles lesson --size L --lints L-KEY,L-OVERLAP --skills <3 samples>` on head → FAIL with
  `number_sense:nearest_10#lesson L-OVERLAP CL40-INK ×30 (p3,6)`.
- `ws-backtest --table backtests-phase0.json --row pc-d8-scaffold` → PENDING / PENDING, 0.0 s. Neither side runs.
- Lesson 7 pass fixture: I compared it with r1 through a JSON diff. Lesson 6 pass fixture: I read it the same way.

## Defects
**D1. PC-CLIP passes the D10 state it claims.**
- *What:* the header says "PC-CLIP (D10)". On 8f12b0e85 sub L, PC-CLIP reads `covered: null` and equal pupil/key tops, so it PASSes. print-lint
  SECTION finds the covering fill (41 × 68 mm). `stripMeasure` searches only elements *later in the DOM* (`all.slice(idx + 1)`).
  D10's fill comes earlier in the DOM but is painted later (it is positioned). No backtest row proves PC-CLIP fails anything, because pc-d10-overlap
  runs print-lint.
- *Why:* it is the same class as r1 D1: a rule passes vacuously on its named state, and a sibling check hides this.
- *Fix:* test the cover with `document.elementsFromPoint` at the heading's centre (painted order, not DOM order), or drop the cover
  clause and name L-OVERLAP SECTION as the D10 check. Add a `--rules PC-CLIP` row whose fail side is 8f12b0e85 sub L.

**D2. D4 is half fixed: the pass fixtures still are not real states.**
- *What:*
  - `lesson-lp-l7.pass.json`: the pupil stories and the pool now agree (48÷6, 54÷6, 50÷5, 40÷5, 27÷3). The **key pages kept the old working**:
    - P0-key "Ben has 48 stamps … 30 ÷ 6 = 5";
    - P3b-key "Ana has 54 buttons … 4 + 3 = 7";
    - P4-2-key "Tom has 40 marbles … 4 − 3 = 1";
    - P6-key "Leo has 27 buttons … 24 ÷ 3 = 8".
  - `lesson-lp-l6.pass.json`: the P4-2 sentence now reads "The 9 in 49,715 is 10 times / one tenth of the 9 in 9,781". Both 9s are worth
    9,000, so the item has no right answer. Its own chart row still holds the digits 9 2 7 1 5, and the key still writes 90,000.
- *Why:* no build could produce these packets, so the pass side still does not prove the check accepts a real fixed state.
- *Fix:* edit each key with its page, and choose a lesson 6 number whose 9 is in the ten-thousands place and does not look like 92,163 (e.g.
  95,817). Build r1's fixture lint: story totals vs pool, key equation vs story, a place-value sentence's digit and its value vs its chart row.

**D3. New precritic gate red on head for a finding outside its purpose.**
- *What:* `lesson-samples-key-L` is described as "AK-4 and SECTION blocking". It runs the whole of L-KEY plus L-OVERLAP with no
  baseline, and head fails it with 30 CL40-INK findings on nearest_10#lesson. The status file says nothing about it (R10 covers the pinned
  role sample only). Every `--role lesson` precritic is now red for that reason, and the lane's own description of the gate does not explain it.
- *Fix:* either filter the gate to codes AK-1..AK-4 and SECTION (an `--codes` filter, or a PARSE that keeps only those), or keep the gate
  whole, record the CL40-INK finding as R-n with its owner, and say so in the gate's label.

**D4. PC-NAME `checks` clause: likely false alarms, and no self-test.**
- *What:* `nameCheck` fails when *any* of WORDS in `checks` is missing from the item. That is AND, while the title rule uses OR (`want.some`).
  The natural checks text for the sample steps is "10 more or 10 less" (Y2.B2.S13) or "the tens and the ones" (Y2.B1.S4). That text fails a right
  item that asks only for one of the pair. Today the clause has never run on real data, because no `checks` field exists, so D2's content side
  is unproven. `rangeCheck` / `nameCheck` are called "Pure" but have no self-test. `nm` is computed and thrown away.
- *Fix:* treat "X or Y" / "X and Y" groups as alternatives (or let each prereq carry an explicit `checksWords`). Add a `--self-test`
  with the D2 / D3 / D5 / D7 items plus known-true items for every sample prerequisite. Delete `nm` or use it.

## Minors
- n1. `ws-lesson-samples --check` has no empty-read guard. If `prereqCheck` exists but no item has `part === 'prereq'` (a rename), it reads 0 items and
  RANGE / NAME print PASS. The same holds when 0 pages are measured. This is r1 D5's class in the new tool. Fail when `pre` is set and `read === 0`.
- n2. PC-H13 flags `add S pupil-p3: 9 % blank at the bottom` on 8f12b0e85, but the phase-0 critic scored that sheet 8 at L and S. The threshold is at its edge, so
  rule on it with the lead before lf-engine chases it.
- n3. The LP-NUMBERS comma-twin exemption fires when the comma form appears anywhere within ±24 characters ("4. 4000 · 5. 4,000" is skipped).
  Require "or" or a bracket between the two forms.
- n4. PENDING rows in backtests-phase0.json run neither side, so the "FAIL on 8f12b0e85" claim is not machine-reproducible. Let ws-backtest
  run the fail side of a pending row and report `FAIL-ONLY OK`.
- n5. PC-NAME catches D2 and D12 only because the field is missing. Once lf-engine adds `checks`, D2's content will rest on D4 above.
- n6. The branch moved twice during the round (84bcf080, 5629a7f4). They are small, but a critic should be told the head is frozen.

## Runtime (C4)
| Run | Measured |
|---|---|
| LP fixture rows (7) | 3.6 s in all |
| `lp-giveaway` commit pair | 46 s |
| `--lp` lessons 4 / 6 / 3a / 5 / 1 | 29 / 19 / 33 / 42 / 11 s |
| `ws-lesson-samples --check` head / 8f12b0e85 | 39 s / 3 m 34 s wall (user 12 s) |
| `--check --only round --seeds 8` on wt-p0 | 88 s |

## Automatic checks that would have caught each finding
- D1: every rule named in a tool header must have a backtest row whose command runs only that rule (`--rules PC-X`) and FAILs.
  ws-precritic-plan can parse the header's rule list and require one row per rule.
- D2: the fixture-consistency lint from r1 (story vs pool, key equation vs story, place-value digit vs chart row), run on every
  `*.pass.json` by `--lp-self-test`.
- D3: a gate whose label names codes must filter to those codes. Better still, any new blocking gate must be run once on head before
  commit, and the result recorded in the status file (red → R-n with owner).
- D4: a known-true corpus self-test for PC-NAME / PC-RANGE (items that are right by hand, including "10 less than 47" under "10 more, 10 less").
- n1: the "read nothing" self-test applied to ws-lesson-samples (`pre` set, 0 items → FAIL).

## Speed-ups this round revealed
- The fix rounds re-run browser commit pairs for evidence. Saving the fail-side packets of the phase-0 rows (as `--packet-out` does for
  LP) would let a critic re-judge PC-RANGE / NAME / SCAFFOLD offline in under a second, instead of 3.5 min per run.
- `ws-lesson-samples --check` builds 8 seeds × 3 lessons serially in one page. Running the content seeds without layout in parallel
  pages (jobs 3) would cut it to about 1 min.
- Freeze the head (or tag the graded commit) before the critic starts. Two pushes mid-round made me re-check which tree each run graded.
