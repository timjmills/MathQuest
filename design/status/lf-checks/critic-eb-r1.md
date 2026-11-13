# Critic r1: tests/scripts/ws-empty-band.cjs (lane lf-checks), graded at b180064f (frozen)

Independent critic, Opus medium, 2026-11-08. Every run used a `git archive` of b180064f (/tmp/claude-0/critic-eb/wt), because the
lane's working tree changed during the round (card host selector and pin edited, uncommitted). Those changes were not graded.

**VERDICT: FAIL.** C1 5 · C2 6 · C3 7 · C4 7

## Evidence (runs)
| Run | Result | Time |
|---|---|---|
| bebf5b36 vocab_grade_pictures `--roles guided --sizes S,L --hosts none` (backtest row) | FAIL 4: Model 35.0 / 33.5 %, cell 2 32.4 / 32.5 % (critic r3 found 37 / 34 / 37 / 36 %) | 11 s |
| bebf5b36 vocab_grade_pictures, full card plan | FAIL 12: guided S/M/L, mixed-practice L EB-FOOT, reason-it EB-READ. error-analysis/scripted-model/stretch "not composed"; card 390/820/1280 "no kit cell" | 110 s |
| b28a0867 placevalue:value `{band:9999}` independent L (N5) | FAIL 12 (20.6 mm under 56 mm, 36.8 %). EB-FOOT pairs: footprint 35.1 vs drawn 35.4 | 7 s |
| b28a0867 placevalue:unit_form `{rename:more}` independent S (N6) | FAIL 16 | 7 s |
| b23e418d div_facts `--sizes S --hosts none` | FAIL 119, of which more-practice S EB-BAND 30 (the cited defect). Also fact-probe SIDE 20, opener 14, lesson 20, and L variants | 70 s |
| add_facts raw (`--no-baseline`) | 171 findings, equal to its own pin | 173 s |
| sub_facts with the frozen pin (a passed skill) | **FAIL 177**: no pin rows for it | 162 s |
| sub_2d_1d / add_wp_10 raw (passed skills, not pinned) | **FAIL 154 / FAIL 40** | ~155 s each |
| `ws-precritic --skill division:div_facts --dry-run` | plans `[browser] ws-empty-band ... --skill division:div_facts` | - |
| `ws-backtest --table backtests-empty-band.json --list` | 4 rows, all PENDING (no pass commit) | - |

All four backtests FAIL for the defect each critic cited. The tool reports the bands to within a few points of the critics' raster scans.

## Defects
**D1 (C1): the practice card is never measured at 390, 820 or 1280.** That is 3 of the 5 screen hosts the spec names.
- `measureCells('#visualAid')` looks only for `[data-ws-cell]`. The practice card draws the kit without that attribute (add_facts:
  `#visualAid > .ws-sheet.mq-kit`, with no `[data-ws-cell]` anywhere in `#gameView`; a probe confirmed it).
- So every skill prints `card N: no kit cell on the host (legacy screen item?)` as a *note* and passes. This holds for add_facts,
  sub_facts, sub_2d_1d, add_wp_10 and vocab alike.
- A host that is not rendered, or that has no cells, must FAIL (EB-READ), as a print role does. Measure the screen cell (`.mq-scell`) when there is no
  kit cell. (The lane's uncommitted tree starts this; it is not graded here.)

**D2 (C1): the band measure is narrower than RUBRIC H13, so worksheet-host bands of the kind critic r3 found are missed.**
- The tool measures only below the lowest ink and beside the ink's bounding box. H13 asks for any single empty band of 30 % or more,
  and `ws-print-lint` H13 takes the largest empty band wherever it sits. So a band at the top, or one between blocks (critic r3 #4,
  worksheet-1280 tile 5 at 38 %, Pick 3 tiles about 45 %), is invisible.
- The worksheet host also deals only `problemCount = 2`.
- On bebf5b36 the worksheet host passes for both vocab skills with 2 items and with 6 (checked with a 6-item copy).
- An `<svg>` counts as ink over its whole box, so white space inside a drawing is never a band.
- Fix: take the largest empty band inside the cell from a row and column ink profile (top, between and bottom, as print-lint H13
  and critic r3's row-ink scan do). Deal the host's real item count. Measure inside an SVG by its painted children.

**D3 (C1/C3): a role that is "not composed" passes silently.**
- It is a note, never a failure, even when the signed card marks the role **offered**. On bebf5b36 the vocab card offers
  error-analysis, scripted-model and stretch, and all three are "not composed". The run ends OK on those roles.
- `--roles error-analysis` printed `ws-empty-band: OK`, with only the hosts measured.
- An offered role that does not compose is a contradiction (card against provider) that a gate should report.
- Fix: FAIL with EB-ROLE, or require a "hidden" line on the card.

**D4 (C2): the frozen pin does not cover the passed skills, and the shared-role bands make precritic --skill red for every lane.**
- The pin holds add_facts and mult_facts only. The other two passed fact skills fail at b180064f: sub_facts FAIL 177, and
  div_facts_long is not pinned either.
- Every passed skill I tried fails raw, on bands drawn by the role composers. These were checked by eye and are real:
  - scripted-model step cells, 63–67 % empty;
  - stretch M, 48 % under the table;
  - reason-it L, 46 % under each A/B pair;
  - fact-probe row cells, 59 % beside the ink.
- No skill lane owns those composers. A per-skill pin therefore makes the check block every lane until someone pins each
  skill. That trains lanes to pin, and it is the opposite of L25's intent.
- Fix: pin the composer-level defects once per (role, template, rule), owned by the facts or engine lane, and judge a skill
  only on what it adds. At minimum, pin every skill in `redesign-passed.js`, with a STATUS note per role, for the lane that owns it.

**D5 (C2): the calibration claim in the header is wrong, and the threshold sits on the approved pages.**
- The header says approved fact pages sit at 29.96 % and that 30 % separates the two classes.
- Measured without rounding on add_facts:
  - independent L 29.78 %, 0.22 points from failing;
  - test M 30.08 %, which fails;
  - test L 33.92 %;
  - review S/M/L up to 34.07 %.
- The vocab backtest fails at 32.4–35 %, the same level as the pinned approved test L. The classes overlap. They are not separated.
- `belowMm` is rounded to 0.1 mm before it is compared with an unrounded limit (test M: 17.2 ≥ 17.19).
- `hwMm` (the writing-height allowance that H13-ABS subtracts) is computed and never used.
- Fix:
  - correct the header (the approved test and review pages carry 30–34 % bands and are pinned as real);
  - compare unrounded values;
  - use or delete `hw`;
  - say plainly that the threshold is RUBRIC H13's 30 %, not a calibrated value.

**D6 (C3): the backtests cannot run, and the known-good control is circular.**
- All 4 rows are `pending` in a side table (`backtests-empty-band.json`). That table is not in `backtests.json`, and
  `ws-precritic-plan` does not see it.
- The "pass on add_facts" control passes only because add_facts's own 171 findings are its pin.
- Fix: add one executable row now, for example a commit-pair whose PASS side is a clean measurement. That can be a fixture page with
  the band removed, or vocab guided with the hint row reserved. Leave the lane rows pending as well. Give the control a skill or
  fixture that is clean raw (`--no-baseline`).

## Minors
- m1: EB-FOOT judges only grid roles. Guided, lesson and error-analysis are skipped, yet lf-vocab's root cause was "the footprints
  are not the drawn heights per role" on guided. An unpaired footprint is noted only for an independent run with no opts; with
  `--opts` (the pv backtests) nothing is printed.
- m2: the pin is a count per render. If a band moves from one cell to another, or one cell is fixed while another breaks, the
  count does not change and the check passes. Variants are sampled by position in the card's value list, so a card edit renames
  the pinned keys.
- m3: the card's §7a **Screen hosts** decisions are ignored. A host the card marks hidden is still judged, and every host is
  always rendered.
- m4: the variants always render at L, even with `--sizes S`. The row "div_facts S" is partly an L result (constant: 3, constant: 8).
- m5: EB-READ on vocab reason-it ("markup changed?") is a different defect class (a role with no kit cell). Its message should name it.
- m6: `tests/lib/ws-card-plan.mjs` is a byte-identical copy of lf-ops's file (6e54004a). It is safe to merge, but say so in the
  file header until one branch owns it.

## Scores
- **C1 catches its class: 5.** All four backtests fail for the cited defect. But the practice card is never measured on any
  skill (D1). Top and internal bands, and the worksheet tiles, are missed (D2). Roles that do not compose pass silently (D3).
- **C2 no false alarms / honest pin: 6.** The findings I checked are real, and EB-FOOT pairs correctly (pv 35.1 against 35.4). But
  the pin leaves 2 of the 4 passed fact skills, and all 16 other passed skills, red on composer bands (D4). The calibration claim
  is false and the threshold sits on the approved pages (D5).
- **C3 wired: 7.** precritic `--skill` plans it, the OK/FAIL line parses, and the pin resolves under MQ_ROOT, so old heads run raw.
  The L25 row is present. But no backtest row can run, the table is off ws-precritic-plan's path, and the control is circular (D6).
- **C4 runtime and maintainability: 7.** A full skill takes 150–175 s in a slot (under 4 min), and a lane of 5 skills takes about 13 min.
  The header is clear. But this is a third ink and band measure beside print-lint H13 and lf-placevalue's H13-ABS rather than a
  reuse of either. `hw` and `innerMm` are dead fields.

## Rule 00: automatic checks that would have caught each finding
1. D1: a host-coverage assertion. Every host in the plan reports at least 1 cell measured, or FAILs (EB-READ on hosts).
2. D2: a self-test fixture set measured by the tool: a band at the top, a band between blocks, an SVG with an empty lower half, and a
   6-tile worksheet with one sparse tile. Each must FAIL.
3. D3: a card/provider consistency check. Every §7a **offered** role composes for the skill (or the gate FAILs).
4. D4: before any pin is written, run the tool raw on every id in `redesign-passed.js`. Report the keys by (role, template), so
   composer defects show up as shared before they are pinned per skill.
5. D5: calibration as a test. The tool prints unrounded percentages of the approved pages and of the critic-failed pages, and its
   self-test asserts the stated margin.
6. D6: `ws-precritic-plan` reads every `tests/fixtures/precritic/backtests-*.json`. A new check with 0 runnable rows FAILs.

## Rule 00: speed-ups
1. Freeze the branch for the critic: the lane edited the graded files mid-round, and that cost a rerun. Lanes stop editing when
   a critic launches, or work in a separate worktree.
2. Measure from a raster row and column profile shared with print-lint H13 (one module, `tests/lib/`). One measure means one
   calibration and one place to fix.
3. Add `--json` per-cell dumps (all cells, not only findings). Critics re-instrumented the script to see unflagged cells and footprint pairs.
4. Run hosts once per skill, not after each `--roles` subset, and allow `--hosts none` by default inside the backtest rows. That
   saves about 10 s a row.
