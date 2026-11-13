# lf-partopts step A, critic round 4 (independent)

Branch `claude/sweet-newton-c8wrv1-lf-partopts` @ 5efc60b. I rendered everything myself.
While I graded, the builder pushed e1e7b1b-d0aa37a (precritic path, backtest rows, ledger). `git diff 5efc60b d0aa37a -- js css
index.html` is empty, so the app I graded is the app at the branch tip. The gates ran the 5efc60b copies of the lane's
test scripts.

- **UI:** **Playwright** 1.63 (`/opt/node-tools`, the pre-installed Chromium, device scale 1) drove the real Print screen with
  real mouse clicks (`locator.click`) on the steppers, ticks and size buttons. Library lessons were opened with
  `tvOpenPrintWith([{role:'lesson', lessonId}])`. Skill lessons were opened with the skill, then **Change → Lesson** by
  clicks. Every state was reached by steps, and the screen settled after every click. The 1280 walks used the full-width
  table and the 390 walks used the section.
- **Packets:** the teacher's own **Open in a new tab** document (pupil pages and keys) was captured, rendered in print media
  and measured with `ws-empty-band` `measureCells` / `judge`. For each page I also measured the foot, any overflow, cell
  overlap and the key-to-pupil match (sheet and cell count).
- **Master comparison:** the same script with `MQ_ROOT=<d34311d worktree>` (`NOPARTS=1`; master has no Parts table).
- **Script and raw log:** `critic-A-r4/crit.cjs` and `critic-A-r4/crit.log` (29 walks, every click and every row text, 104
  pages). Screenshots are in `design/partopts/critic-A-r4/`.

Lessons used (29 walks, 9 packets / 104 pages, M and L, all with non-default counts):
- **`skill:multiplication:mult_facts`**, which no earlier round used: M (Practice 32, Mixed ticked on, 60), L (Practice 36),
  and a 390 walk.
- **Y4.B1.S14** `nearest_10`: L (chart 3, Practice 30, Mixed 30, We Do 0); M at 390 (Practice 75, Mixed 42, the largest
  packet); size changes M → L and L → M; tab checks.
- `skill:addition:fact_family_sort` L (Practice 12, Vocabulary 2, Mixed on); M → L → M round trip.
- `skill:subtraction:sub_wp_20` M (Practice 24, Remember off, We Do 0).
- `skill:placevalue:identify` L (Practice 16, Vocabulary 2).
- Y2.B2.S18 M (Practice 12, Vocabulary 2).
- `skill:addition:add_wp_10` M (Practice 8, Mixed on 20, Remember off).
- The R1 defaults: add_wp_10 M/L, fact_family_sort M/L, sub_wp_20 L, identify M, Y4.B1.S14 L Vocabulary step, plus three
  at 390.

## Gates (final lines)

| Gate | Result |
|---|---|
| `node tests/scripts/ws-partopts-unit.cjs` (full) | FILL-BT, ROWFIT-BT, BAND-BT PASS · PO-4 PASS · PO-2w 815 settled states in 52 cases · PO-2a-d, EB-ROWFIT, EB-ROWFIT+ (report-only: **105 states, 94 on changed sheets**), PO-NOROOM, PO-REM, PO-CAP, PO-VOC PASS · PO-2e We Do 7/52, Practice 52/52 · 1835 builds, 4044 s · **`ws-partopts-unit: OK`** |
| `node tests/scripts/ws-partopts-shots.cjs --out <scratch>` (committed shots untouched) | R4 "Practice 75 Mixed 42: the page is 0 px wider than 390"; R2 "mixed 42 -> L 30: Now 30: the most size L holds" · **`ws-partopts-shots: OK`** |
| `node tests/scripts/ws-code-snapshot.mjs` | **`ws-code-snapshot: OK (732 codes, 35 categories, +160 appended since the pinned baseline of 572, no frozen code or position moved, no frozen skill deleted, insertion + retirement stable, 3203 option round trips)`** |
| `node tests/scripts/ws-boot-smoke.cjs` | **`ws-boot-smoke: OK`** |
| Default identity: d34311d worktree (scratch) `ws-lesson-baseline --all-lessons --write`, then `--check` on HEAD | `wrote 1556 hashes` · **`ws-lesson-baseline: OK (1556 hashes identical)`** (worktree removed) |
| `ws-detailed-lesson --check --repeats`, run per lesson (`--lesson <id>`; with no `--lesson` it checks only g2-nbt3) | OK: g2-nbt3, g3-oa5, g3-oa9-input-output-rule, g3-oa9-mult-table-patterns, g4-nbt1. FAIL as on master: g1-oa1 (E9 overflow P6 +5 mm / key +4 mm, E35), g3-oa8 (E35). |

## Scores

| Criterion | UI 1280 | UI 390 | Packets (9 lessons, M/L, 104 pages) |
|---|---|---|---|
| Clarity (UI) / C1 Ease of use | 8 | 8 | 9 |
| Correctness (UI) / C2 Educational value | **8** | **8** | 8 |
| Layout (UI) / C3 Spacing and layout | 8 | 8 | 8 |
| Consistency with mock and tokens (UI) / C4 Standard fidelity | 8 | 8 | 8 |

**VERDICT: PASS.** All 12 cells at 8 or better. The two r3 UI-correctness 7s (R1, R2) are fixed on the real screen at
both widths. No new lane defect. Every FOOT≥30 / under-half page and every ≥30 % cell band I measured is in the standard
(default) lesson render, which `ws-lesson-baseline` proves byte-identical to master d34311d, so by the rule "defects already
on master are not scored" none of them counts against this lane.

## R1-R4 re-checked (the r3 findings)

| r3 | Status | Evidence |
|---|---|---|
| **R1** (MEDIUM regression: a not-printed row read "Needed to fill the sheet") | **Fixed.** On the default Parts table of add_wp_10 (M, L), fact_family_sort (M, L), sub_wp_20 L, identify M, and Y4.B1.S14 L after Vocabulary 2, the no-room rows row now reads only "Lesson practice rows / Not on this lesson sheet (no room)" with no tick and **no** lock text. My walk's R1-lint (a row with no tick, or "Not on this lesson sheet"/"Not added", carrying `.tv-part-lock`) fired **0 times** across all 29 walks. A locked tick that IS printed (Vocabulary/We Do fixed) still shows "Needed to fill the sheet" — correct. | `r1-wp10-L-ui.png`, `r1-id-M-390-ui.png`, `crit.log` (no `!! R1-LINT`) |
| **R2** (MINOR: a clamp reported as a rounding with a false "under half full") | **Fixed.** Y4.B1.S14 M, Mixed 42 → Size L now reads "Now 30: the most size L holds" (`part-opts.js:251` `snapNote`, the `asked > max` branch), no "under half full". A clamp up to the minimum (L → M, Mixed 15 → min 21) reads "Mixed 21 … 1 page of 21" with no false note. A **true** rounding between two offered values (fact_family_sort M, Practice 45 → 27) still reads "Rounded to 27 so no page is under half full" — correct. | `r2-sizechange-ui.png`, `r2-practice-ML-ui.png`, `crit.log` |
| **R3** (MINOR C3, report-only: a planner-fixed rows count leaves a row-sized foot) | **Reproduced, report-only reasoning is sound.** fact_family_sort M, by steps Vocabulary 2, Remember off, We Do 0, prints one Independent row and a **60.7 mm (25 %)** foot while rows read "Fixed: 1". A second row of its own cells (~58.8 mm) fits in print, but the teacher cannot add it. This is under the 30 % EB-PAGE line, so it is not a gate failure; the only fix is a lane-wide row-packer change (DESIGN §8d "R3"), rightly routed to lf-engine, with EB-ROWFIT+ left as a report-only tripwire. I agree it should stay report-only this round. | `r3-ffs-M-p2.png` |
| **R4** (MINOR, mostly pre-existing: 390 page tabs push the screen sideways) | **Fixed.** The `#tvPageTabs` wrap at ≤640 px (`css/teacher.css`, additive) holds. At 390 px: standard packet `scrollWidth − innerWidth = 0 px`; after the **largest** packet (Y4.B1.S14 M, Practice 75 + Mixed 42) still **0 px**, and `scrollX` after `scrollTo(2000)` is 0. The tab strip caps at 8 tabs and wraps to two rows. On master d34311d the same packet scrolled 10-31 px (r3 measurement); the lane's own `ws-partopts-shots` R4 check reports "0 px wider than 390". | `r4-390-max-tabs.png`, `r4-390-max-ui.png`, `crit.log` 390 lines |

## Regression sweep (nothing that passed in r3 has broken)

Walked by steps, M and L, all with non-default counts:
- **`skill:multiplication:mult_facts`** — a lesson **no earlier round used**. M: Vocabulary down, We Do fixed (locked, "fills
  the band"), Practice 32, Mixed ticked on then 60. L: Practice 36, Remember tick not clickable (none). 390: locked parts,
  Practice 32. Packet: no overflow, no overlap, keys match and are correct (the scripted "Steps:" model and guided row draw
  the same on key). The anchor chart's 44 % cell band and the L lesson-sheet fact cell's 33 % band are in the **standard**
  render (baseline-identical to master), so master-only — the same class as the div_facts anchor chart (r3 P4).
- **Y4.B1.S14** L and M/390 — size changes both ways, chart step, We Do 0 (rows unlock to 2), the largest packet. Keys match
  pupils, item 4 key "55 → 60", item 8 "62 → 60" etc. are correct (`r14-L-p8.png`).
- **fact_family_sort** L (Practice 12, Vocabulary 2, Mixed on) and the M → L → M round trip — the snapNote stays truthful
  through every re-limit. Its L Mixed last page is 72 % empty, but that is **byte-identical on master d34311d** (I rendered
  the same packet with `MQ_ROOT=<d34311d>`: same 72 % / 179.5 mm), the known master Mixed last-page class.
- **sub_wp_20** M (Practice 24, Remember off, We Do 0 → rows unlock to Fixed 3), **identify** L (Vocabulary locked at 2),
  **Y2.B2.S18** M, **add_wp_10** M (Mixed on 20, Remember off). No overflow, no overlap, every caption matched the preview's
  lesson-sheet page count, keys correct.

Across all 29 walks: 0 console/page errors, 0 cell overlaps, 0 page overflows, 0 key-to-pupil mismatches, 0 R1-lint hits.

## Findings

No lane-introduced defect at or above a 7 on any criterion. Two minor lane findings (cost no point) and three master-only
observations.

**F1 · MINOR · process / docs: DESIGN §8d understates how often EB-ROWFIT+ fires.** `design/partopts/DESIGN.md` §8d "R3"
says the check "flags 2 states today (both this fact_family_sort case)" and calls R3 "a single sub-threshold case". The full
unit run on HEAD prints `EB-ROWFIT+ (report-only): 105 state(s) … (94 on changed sheets)`, which the lane's own status row
also records. The decision still holds (PO-2d passes, so every one of those feet is under the 30 % EB-PAGE line), but the
proportion argument is written on a wrong count. **Fix:** correct the count in §8d and list the lessons the 94 changed
sheets come from, so lf-engine sizes the row-packer work on the real number. **Check:** `ws-partopts-unit` prints the
EB-ROWFIT+ lessons grouped by case, and a doc lint (or the status row) quotes the gate's own line, not a hand count.

**F2 · MINOR · UI correctness (nit): a size round trip loses the teacher's count.** fact_family_sort M, Practice + to 45,
Size L (30, "the most size L holds"), Size M → **27**, "Rounded to 27 so no page is under half full". 45 fits at M, but the
screen re-snaps from the clamped 30, not from the 45 the teacher asked for. Each note is true for the value it snapped, so
this is a nit, not a false caption (`r2-practice-ML-ui.png`). **Fix:** keep the teacher's asked count next to the snapped one
(`s.partAsk`) and re-snap from it on each re-limit (`teacher-print.js` near `:1238`). **Check:** PO-2w, size M → L → M
restores every count that M offers.

**P6 · master code, reachable on master too: the preview shows at most 8 page tabs.** `teacher-print.js:1336`
`tabs.slice(0, 8)`. Y4.B1.S14 L with Practice 75 + Mixed 30 builds 10 pages: the tabs read Page 1-8, and Page 9, Page 10 and
**Answer keys** cannot be previewed on screen (`tabs-L-max-tabs.png`). M with Practice 60 + Mixed 42 (8 pages) also loses the
Answer keys tab. Master d34311d has the same slice, and its lesson Practice select (0-5 pages) + Mixed reaches 9 pages too,
so it is not scored. This lane does make long packets easier to reach. **Fix:** show every tab (they wrap at phone width
already) or add a "More" tab. **Check:** in `ws-partopts-shots`, after the max packet, the tab count equals pupil pages
(+1 with keys). The observations below are all **master-only** (byte-identical
to d34311d, `ws-lesson-baseline` 1556 hashes identical) and are **not scored** against this lane; recorded so the lead can
route them.

Master-only, not scored:

**M1 · master-only · C3 · the `multiplication:mult_facts` M lesson sheet prints a 32 % (75.6 mm) foot.** Standard render,
We Do fixed 3 + rows fixed 2 under a Guided/Steps/Independent band. Same class as the div_facts anchor chart. Not this lane:
the standard lesson is baseline-identical to master. Route to lf-engine with the other fixed-band feet. Evidence: `mf-M-p2.png`,
`crit.log` mf-M page 2. Check that would see it: EB-PAGE already flags it in a full detailed render; it is excused here only
because it equals the master packet.

**M2 · master-only · C3 · fact_family_sort L Mixed last page 72 % empty.** The shared mixed engine's last-page rebalance;
byte-identical on d34311d (I rendered both). The lane's caption is honest ("two pages, the last under half full"). Route to
the mixed-engine lane. Evidence: `crit.log` ffs-L page 6 vs `master2.out` master-ffs-L-mixed page 6.

**M3 · master-only · C3 · practice/anchor cell bands ≥ 30 %** (lesson-practice pv 37 %, mult_facts anchor chart 44 %,
mf-L lesson-sheet fact 33 %, add_wp_10 word-work side band 36 %). All in the standard render, baseline-identical. The r3
report listed the same pv and chart classes. Not this lane.

## The R3 report-only reasoning (§8d) — sound

I reproduced the exact case (fact_family_sort M, Vocabulary 2, Remember off, We Do 0: one row, 60.7 mm / 25 % foot, rows
"Fixed: 1"). The three reasons the lane kept EB-ROWFIT+ report-only all hold:
1. **Not a gate failure** — 25 % is under the 30 % EB-PAGE line.
2. **Nothing to withdraw** — "Fixed: 1" is already the only offered value, so the "don't offer it" remedy does not apply.
3. **The only real fix is a row-packer change** — the planner packs from its *planned* free height, which reads 1.5-15.9 mm
   less than print (the ROWFIT_SLACK_MM gap), so on its own figures the plan is correct; adding the second row means
   budgeting the row loop with the print-matching height, which touches every lesson sheet's row packing and risks both the
   1556-hash baseline and a print overflow. That is a lane-wide engine change with a worse failure mode than a 25 % foot,
   rightly routed to lf-engine, with EB-ROWFIT+ as the tripwire that flips to gating when the row packer is reworked.

The judgement to carry it forward as report-only is correct for this step. One caveat (F1): the doc's "2 states" is wrong;
the gate flags 105 (94 on changed sheets), all under the 30 % line. That makes routing to lf-engine more important. It does
not argue for gating it in this lane.

## Checks the fixes rest on (verified present and correct)

- **R1** — `ws-partopts-shots` textLint converse: a row with no tick or "Not on this lesson sheet"/"Not added" carries no
  `.tv-part-lock`. My own 29-walk R1-lint is the same assertion and fired 0 times.
- **R2** — PO-4 (snapNote: "half full" only between two offered values; a clamp past max/min says "the most/fewest") plus
  the `ws-partopts-shots` Y4.B1.S14 size-change walk ("Now 30: the most size L holds").
- **R3** — `ws-partopts-unit` EB-ROWFIT+ (report-only; `--gate-rowfit-plus` flips it) flags the planner-fixed rows count
  whose printed foot holds one more of its own rows.
- **R4** — `ws-partopts-shots` whole-page `documentElement.scrollWidth − innerWidth` on the standard packet and after the
  largest packet (not only `.tv-section`).

All four are on `ws-partopts-shots` / `ws-partopts-unit`, both green on HEAD (below).
