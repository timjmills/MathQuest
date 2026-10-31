# Lane D restart (work order item 3, 2026-10-30)

Branch `claude/sweet-newton-c8wrv1-laneD-restart`, cut from `claude/sweet-newton-c8wrv1` @ fbeaa332.
Source of the old work: `claude/sweet-newton-c8wrv1-wip-a3256e8dfc9684535` @ 235d44b4 (Lane D r12d, 2026-10-17;
merge base with today e53677e0; 118 lane commits vs 1272 on main since). Last critic: r8 FAIL (ffbe879f); r9–r12d unverified.
The 4 WIP commits after 235d44b4 (16406407 73f504ab 414f743a a31555a6) are not taken.

## Plan

| Step | Who | What |
|---|---|---|
| A | builder mq-opus-medium (rebuild of critic-failed work) | Port Lane D r3–r12d code onto today's kit; resolve the 19 conflicting files; today's behaviour wins where newer |
| B | builder mq-opus-medium (first build of a new drawing) | ÷ facts 10 columns in all three notations (fraction, ÷ sign, long-division bracket); sub_facts S H13; fact-family spec card draft |
| C | lead | merge A + B, clean before critic (precritic --strict per skill + unit gates on branch merged with main) |
| D | critic mq-opus-medium | one round, whole family, every page type and screen host |

## Log

- 2026-10-30: lane started; repo unshallowed (the conflict count needs the real merge base).
- 2026-10-30 (builder A): port of 235d44b4 js/ css/ tests/ + WORKSHEET_DESIGN_STANDARD.md rule text (`git diff e53677e0 235d44b4 | git apply -3`); no render/run files taken.

## Port: how each conflict was resolved

| File | Resolution | Why |
|---|---|---|
| WORKSHEET_DESIGN_STANDARD.md | combined | the lane's CL-9a (numbers by default) added above today's CL-10 text, which keeps its "superseded by CL-11a" note; CL-2a / CL-2b came in clean |
| css/sheet-kit.css | kept today | today's CL-4b top start and CL-40 / CL-41 spacers win; the lane's r11 rules (equation w2/w3 padding, seqstrip / counters / remainder step right or down, parity inset) and its clean-applied CL-40 "top band" (padding-top max(3 mm, keep-out) on every labelled cell) are dropped; its `--ws-ko` / `--ws-koin` variables, box clear height and fact-box rules are kept |
| js/modules/gen-algebraic.js | combined | today's skip-count imports + the lane's `onNewPage` import |
| js/modules/gen-fractions.js | took lane, then today's pools | the lane's kit drawings of fraction_number_line (5 kinds, `forms`) and whole_as_fraction; every denominator pick goes through today's `_fDenPool` (the `denoms` option), kind 3 never narrowed below 4 parts |
| js/modules/gen-operations.js | combined | mult_properties commutative: today's `arrays-turn` kit cell (lane only shrank the old SVG); distributive keeps today's `printSlot`; lane's removal of the duplicate "Distributive Property" title and the giveaway "Any number × 1" caption taken |
| js/modules/generate-question.js | combined | today's `setRedraw` import + the lane's `renderCell, wordWorkTwin` import |
| js/modules/print-sheet.js | combined (15 hunks) | imports unioned; generateRun: today's lesson `pass()` with the lane's late-retry index shift, pool one-look and `want` checks inside it; measureItems: lane's batched / cached measure, its context keyed by today's `wrapToCell` / `tightRows`; today's side-by-side measure helpers and HEIGHT CLASSES kept beside the lane's `fineSplitOf`; layoutOf counts with the lane's three groups, today's number-line squeeze kept for a band page with no column-work group; capFromL takes today's sideFit + the lane's page cap; markSectionWriteAbove kept on the lane's pool deal; the lane's build queue (`buildSheet` -> keyedSheet), with today's detailed-lesson redirect outside the queue and today's nested lesson sheet built with `keyedSheet(..., buildSheetCounted)` (a queued nested build would wait for itself); today's `buildSheetCore` calls renamed to the lane's `buildSheetDeal`; result fields unioned (`numberLine`, `narrowCells`, `hClass`, `sig`) |
| js/modules/sheet/cells/word-work.js | combined | today's `barLayout` (lesson bar form) kept and dispatched first inside the lane's `renderWork` (neutral frame, caption, KO inset) |
| js/modules/sheet/contract.js | combined | both instruction strings kept (today's story-rcdws / story-bar, the lane's story-work-ring / story-work-div) |
| js/modules/sheet/index.js | combined | OPS_TEMPLATE_IDS: today's `arrays-turn` + the lane's `area-model-div` |
| js/modules/sheet/layout.js | combined | the lane's `legacyH` / `evenRows` with today's `fillRefH` (number-line band) argument |
| js/modules/sheet/paginate.js | combined | today's default label `tab` (CL-11a) + the lane's `pageOf` (no restart inside a page) |
| js/modules/sheet/roles/practice.js | combined (5 hunks) | today's `resolveBandedLayout` with the lane's `pageCap` / `freeRows`; label style forced to tab (CL-11a) but `let` for the lane's later reassignment; the lane's part cell height + `fillRefH`; the lane's SPREAD / widen-last / fill with today's side-by-side columns and number-line header; the lane's "mq-spread centres every cell" CSS dropped (CL-4b) |
| js/modules/sheet/tokens.js | kept today | both set `label: 'tab'`; today's CL-11a comment |
| tests/scripts/ws-content-audit.cjs | combined | the lane's times-as-many story sweep runs before today's MC sweep |
| tests/scripts/ws-layout-unit.mjs | kept today | today's CL-11a assertions (same checks); the lane's CL-13 pageOf test now names the letter style |
| tests/scripts/ws-print-lint.cjs | combined (9 hunks) | today's doc list / attribution / `absent` form; the lane's pool judge (`pool` flag), `--letters`, `--seeds` / `--seed-list` moved into `kitDocList` (kind single); the lane's DN-2 self-test written in today's `absent` form |
| tests/scripts/ws-share-options.cjs | kept today | same change both sides (label stripped before reading a cell's text) |

Also fixed after the port: `amEdges` / `amForm` option keys moved 5P / 5Q -> 5V / 5W (main had given 5P / 5Q to answerSlot / winRows; ws-code-snapshot caught the collision).

Later port fixes (each its own commit): the pool dealer's page check (`pageCheck`) judges a top-started cell as
today's lint does (CL-4b + H13-ROW), not as a centred one (it re-dealt almost every pool page); one-line equations /
facts on a grid numbered past 9 start below the wide tab's keep-out (CSS, fact rows excepted); the lane's own
L-OVERFLOW CL-40 lint is dropped for today's L-OVERLAP CL40-INK (same rule, ink measure; the lane's fired on
div_facts fact rows that pass today's); an across fact hosted by a fact cell on fact rows (add_sub_10s) clears the tab;
whole_as_fraction `forms` matchers read the lane's item text, narrowed `denoms` deal the den/den form.
`js/modules/sheet/roles/fact-rows.js` is untouched.

## Merge of main 9d6f07b8 (merge-and-gates builder, 2026-10-30)

`git merge origin/claude/sweet-newton-c8wrv1` (9d6f07b8, 55 commits) onto 43e6fe35. Six files conflicted:

| File | Resolution | Why |
|---|---|---|
| css/sheet-kit.css | both | additive blocks: the lane's CL-40 grid-past-9 top pad and fact-rows across-fact pad, then main's lesson 7 r2 `.mq-wwframes` no-spacer rule |
| js/modules/print-sheet.js | combined | main's measuring frame (`MDOC` / `measureDocument()`, awaited in buildSheetDeal and the detailed lesson) with the lane's batched + cached `measureItems` / `measureFresh` / `MEASURE_CACHE`: both functions now take `document` = the frame document (app page as fallback), and `measureFresh` reads `getComputedStyle` through the frame's own window, as main's measureItems did. Main's own batching (one pass per column count and state) is dropped for the lane's, which batches the same way and also caches; main changed nothing else in the function |
| js/modules/screen-cell.js | both | `kitCellTwin`: main's `pv-times` twin first, then the lane's `equationKitTwin` |
| js/modules/sheet/cells/word-work.js | combined | lane's `renderWork` split kept; main's new `twoStepPart`, `framesLayout`, `chooseLabels`, `chooseLayout` placed before it; main's dispatch (choose, bar, frames) at the top of `renderWork`; main's `factDiv` margin in the full-width body; stepBlock: lane's `st.fact` (no working rows) AND main's `factDiv` skip of step 1's rows |
| js/modules/sheet/contract.js | both | the lane's story-work-ring / story-work-div and main's story-steps / story-letter / story-check instruction strings |
| js/modules/word-work.js | combined | the lane's sign-ring / no-sign print and screen instructions as the default; main's `choose` early return and its letter / check / frames overrides after them |

Syntax: every module under js/ passes `node --input-type=module --check`; ws-boot-smoke OK on the merge.

### Fixes after the merge (each its own commit)

- `cells/long-division.js`: `rowTrack` was used in `render` and `footprint` after builder B moved it into `trackOf`
  (ReferenceError on EVERY division cell since 43e6fe35; ws-layout-unit 9 of 885 red). Defined again in both from `trackMm`.
- `css/sheet-kit.css` CL-40 under wide tabs (the port's "grid numbered past 9" rule): a top pad of the keep-out + 2.6 mm
  on every one-line equation / fact cell. The measuring cell carries no wide tab, so rows were never sized for it:
  stacked facts (more-practice, test, mixed, lesson) and across facts (Fact Probe, div_facts Mixed / Lesson, add_facts
  Review) ran 0.2-2.1 mm out of their cells (PG-12, 40-60 cells a page). Now: stacked facts take no pad (their ink
  starts right of the keep-out already); one-line equations and across fact cells clear the keep-out SIDEWAYS (left
  inset of the w2 keep-out + 0.3 mm), at the cell's own top pad. Fact rows (`.facts`) untouched.

## Gates on the merge (fact family: add_facts, sub_facts, mult_facts, div_facts; main = worktree of 9d6f07b8)

| Gate | Merged branch | Main 9d6f07b8 (same scope) | Verdict |
|---|---|---|---|
| syntax (every js/ module), ws-boot-smoke, ws-layout-unit (885), ws-code-snapshot (731 codes), ws-content-audit x4, ws-share-options, ws-screen-answer x4, ws-sheet-determinism x4 | OK | - | green |
| ws-print-lint --roles fact-rows, S and L x Columns Auto / 5 / 6 / 8 / 10 | 0 findings (all 10 runs) | - | green |
| ws-print-lint fact-rows, div_facts at 10 columns, divForm standard / long / fraction / mix, S and L | 0 findings (8 runs) | mix L red | green |
| ws-div-facts-forms | FAIL 8 | FAIL 13 | pre-existing: every one of the 8 is in main's 13 (same check names) |
| ws-print-lint kit, 4 skills x 17 roles, S / M / L | 57 / 61 / 51 findings | 44 / 64 / 108 | see "still red" |
| ws-precritic --skill (the 4) --role fact-rows --strict | FAIL 6 of 28 | - | see below |

Precritic gates red: ws-dealer-uniform, ws-node-lint S1 (LESSON-DATA / OPTION-HELP), ws-sibling-compare (no approved
siblings) - all known pre-existing; spec card INCOMPLETE (unsigned) - known; ws-options-verify --render 16 value pages
(main 25 on the same four skills: the lane's set is main's less 9, plus none new after the CL-40 fix); ws-slot-clip 3 rows
(div_facts sections L and fade-page S - the boxsign / think supports on the equation cell, also red on the lane tip
43e6fe35, green on main; mult_facts fade-page L - red on main too); ws-lessonfit (composing:fraction_number_line, a lane
port skill, fails main's NEW lessonfit gate - not fact family).

Still red on the fact family (none caused by the merge):
- sub_facts scripted-model (AK-2 critical, H13 x8) and reason-it (CL40-INK): sub_facts moved onto the kit fact cell
  (builder B) and now carries the same defects add_facts / mult_facts / div_facts have on main.
- add_facts Review M: H13 x6 (an add_sub_10s-style across item pinned left in a full-width cell); present at the lane tip.
- div_facts supports boxsign / think on equation cells (fade-page S, options-verify): overflow 2.6-5 mm and CL40-INK;
  lane tip and main both red on think / boxsign, the fade-page row only on the lane.
- notation "across" at 4 columns: S capacity 16 vs 25 (main too); mult_facts L CL40-INK x8 (main x18): a 38 mm across
  fact does not fit beside a w2 tab in a 46 mm cell - needs fewer columns, not a smaller inset.
- add_sub_10s (not fact family) Test S: H13 x40 once the top pad went (the row is sized for more than the one line).
- missing_mult_div (not fact family) More practice L: CL40-INK x2 ("100" under tab 16: the item is wider than its cell less
  the inset, so it spills left into the keep-out; at a w3-sized inset it was clear but the fact family's across facts ran
  0.5 mm out of 46 mm cells instead).

Evidence (design/status/laned-restart/, 150 dpi): fact rows Size S, 10 columns (mult_facts 8), pupil page -
after-{add_facts,sub_facts,mult_facts}.png, after-div_facts-{standard,fraction,long}.png and the same from main as
before-*.png; practice card card-div_facts-{standard,fraction,long}-{390,1280}.png, card-sub_facts-{390,1280}.png.

## Gates on the port (builder A, 2026-10-30; main = scratchpad worktree of fbeaa332)

| Gate | Branch | Main (same scope) |
|---|---|---|
| syntax (every changed module), ws-boot-smoke, ws-layout-unit (570), ws-code-snapshot (723 codes), ws-share-options, ws-search-terms, ws-content-audit (full), ws-key-letters, ws-sheet-determinism S+L, ws-screen-answer (23 lane skills), ws-print-lint --self-test (75) | OK | - |
| fact rows S/L (+, − at 10, × at 8, ÷ auto, Auto) | same grid, cells, pages and fit notes as main; HTML differs only in 3 dealt facts (page-deal) | - |
| ws-print-lint kit, 23 lane skills, IND + MP, M | 0 findings | - |
| ... S | 8 (TY-21 4.06 mm missing-digit box, mixed_multiplication) | pre-existing: same TY-21 on main |
| ... L | 8 (number_families_add / _mult H13-ROW: a doubles family, 2 sentences, beside a 4-sentence one under CL-4b) | NEW, open |
| ws-print-lint fact-rows L / S (div_facts, add_facts, sub_facts, mult_facts, add_sub_10s) | 0 | 0 (add_sub_10s n/a on main) |
| ws-sheet-timing --seeds 10 | FAIL 10 of 20 (p90 3-9 s, max up to 17.9 s; 0 pages kept without a passing deal); the lane tip measured here at median 0.7-1.5 s | lane tip OK on the same 2 pools; open |
| ws-precritic --strict (lane skills + 4 fact skills + fact-rows) | FAIL (15 of 28); see the builder A report for each gate against main | many pre-existing |

## HAND-OVER (2026-10-31, owner pause: "finish the piece you are on, one critic round, then stop")

Branch head: see `git log -1 claude/sweet-newton-c8wrv1-laneD-restart` (critic r1 at ecb1a5c4, on 31a856fd). Merged with main
9d6f07b8. NOT deployed, NOT in redesign-passed.js. Lane cost at stop: about $164 of session cost (≈ 5.9 % of the weekly limit at $28 ≈ 1 %).

### Done
- Lane D r3–r12d code ported onto today's kit (builder A; conflict table above). Today's behaviour kept where newer.
- ÷ facts reach 10 columns on fact rows in all three notations (builder B): ÷ sign stacked like + − × (Standard and Vertical),
  fraction a/b with the answer line under it, compact long-division bracket; digits ≥ 16 pt; ink ≥ 1 mm clear each side.
  + − × fact rows byte-identical (10 / 10 / 8). New rule id VA-2a; PAGE_TYPES PT-FRW-9; layout-unit block PT-FRW-9.
- sub_facts on the kit fact cell (H13 at S/M fixed; root causes: left out of `_KIT_FACT_SKILLS`, and a 1.2× dense-room double count).
- Facts spec card `design/cards/facts/` written, UNSIGNED (5 open questions; the lead puts them to the owner).
- Main merged; long-division `rowTrack` ReferenceError and a CL-40 pad overflow fixed; evidence PNGs in `design/status/laned-restart/`.
- Critic r1 (independent, mq-opus-medium): `design/audit/runs/laned-restart/critic-r1.md` — **all four skills FAIL**.
  Scoring ≥ 8: fact rows + − × 9/9/9/9, ÷ Standard/Vertical 9/9/9/9, ÷ fraction 8/8/8/8; Independent, More practice, Test, Fact probe,
  Word problems, True or False?, Stretch 8–9; practice card (390/820/1280) and quiz 9 for every ÷ form.

### Remaining, in order (next round runs at Opus medium: rebuild of critic-failed work)
1. R1-1 bracket arc touches the first dividend digit ("4)8" reads 48) at 5–10 columns: open the gutter / draw the arc clear; add
   L-OVERLAP ARC-INK (arc to first digit ink ≥ 0.3 mm; backtest fails on 31a856fd, passes on main 9d6f07b8). Card Q3 answer depends on it.
2. R1-6 regression from the port: add_facts lesson page 2 warm-up overflows, loses its 4th item, covers "Guided Practice".
3. R1-2 Mix fact rows last row widened (uneven grid); R1-16 Mix online worksheet (three digit sizes, uneven cards).
4. R1-15 div fraction numerator "110" in the tab keep-out at L (Opener, Review, Reason It); R1-4 div supports think/boxsign break the page (main as bad).
5. Shared-role defects, mostly pre-existing on main, that block every fact skill: R1-3 Scripted model (blank key, repeated fact, H13),
   R1-5 lesson Steps panels vs guided items, R1-7 Mixed practice S < M, R1-8 Pre-skill check (own skill, 80 % blank), R1-9 Reason It
   CL40-INK, R1-10 add Review M H13, R1-11 div Review L count-by strip, R1-12 across CL40-INK, R1-13 guided cells 46 % empty, R1-14 Opener "Use the dots".
   These are role-engine work: decide with the lead whether the fact family waits for them or they go to the owning lanes.
6. Ported Lane D work OUTSIDE the fact family is not critic-ready (builder A's open list): pool build time vs ws-sheet-timing
   (10/20 fail), number_families L H13-ROW (doubles beside 4-sentence families under the top start), mult_comparison card focus and
   wpBank/wpBar no-ops, div_zero_in_quotient / remainder_interpret 2–3 px clip at 390, odd_even range no-op, pool options no-ops,
   div_zero_in_quotient dealer-uniform (ruling or pin), whole_as_fraction / number_families_mult REPEATS, composing:fraction_number_line lessonfit.
   Plus after the merge CSS: add_sub_10s Test S H13 ×40, missing_mult_div More practice L CL40-INK ×2.
7. `ws-stamp-assets` before any deploy.

### Open decisions (owner)
- Sign `design/cards/facts/facts.md` (Q1–Q5; critic: Q3 not acceptable as drawn until R1-1 is fixed).
- div_zero_in_quotient: keep the 1-in-4 ones-zero deal (pin dealer-uniform) or deal uniformly.
- Whether shared-role defects (item 5) gate the fact family or move to their own lanes.

## Round 2, fix builder F1 (2026-10-31, Opus medium: rebuild of critic-r1-failed work)

Scope: R1-1, R1-2, R1-15, R1-16 and the owner ruling of 2026-10-31 (mixed fast-facts page). F2 holds the lesson role,
the ÷ supports, fraction_number_line lessonfit, the long-division preset skill and the dealer-uniform pin.

| Defect | Fix | New check (backtest row: fails on 31a856fd, passes on f9482c43) |
|---|---|---|
| R1-1 bracket arc on the dividend's first digit | `cells/long-division.js` `compactArc`: the arc placed from the glyphs' INK (white a, stroke, bow, white b; b aims 0.7 mm, floor 0.3 mm), each fact its own gutter within the column's room (`factRowRoom`), `DIGIT_INK_EM` re-measured at 1000 px; fact-rows `rowGeometry` refuses a track that keeps less than the floor or whose box leaves the cell | ws-print-lint **L-OVERLAP ARC-INK** (self-test pair); row `arc-ink-laned` |
| R1-2 Mix last row widened | fact rows keep the lattice (`grid.js` `relay: false`, plumbed in `answer-key.js`) and deal whole rows (Mix thirds within one: 70 = 24/23/23) | ws-print-lint **L-DENSITY GRID-EVEN** on fact-rows grids (self-test pair); row `grid-even-laned` |
| R1-15 fraction numerator in the L tab keep-out | `cells/equation.js`: a ÷ fact's fraction starts below the keep-out on every page type (paper) | ws-precritic plans `ws-print-lint --opts divForm=<each> x 12 fact-family roles x S/L` for div_facts; row `frac-keepout-laned` (Opener L) |
| R1-16 Mix online worksheet | `worksheet.js`: one digit size per sheet (the touch-floor digit on every card), equal paper cells per row; `screen-cell.js`: Mix across slot inline | ws-screen-slots **--uniform** (`worksheet:digits`, `worksheet:rows`), planned by ws-precritic; row `screen-uniform-laned` |
| Owner 2026-10-31: mix ÷ forms with + − × ÷ facts | `fact-rows.js` `mixedForms`: a fact-rows section mixing operations with div_facts forms is one grid, one cell width, each stacked fact on its own tracks, columns = the narrowest form's fit (10 when all fit; a × answer over 99 keeps PT-FRW-5's 8); title "Facts" | ws-layout-unit block (5 mixes x S/M/L x Auto/5/6/8/10); ws-print-lint `--kind sections` takes fact-rows |

Arc white (arc ink to the dividend's first digit ink, measured in the browser at 20x canvas resolution): 10 columns 0.62-0.70 mm
(S, M and L; worst 10 ) 110), 8 columns 0.69-0.78, 6 columns 0.92-1.05, 5 columns 1.08-1.54. Before (31a856fd, same 20x
measure): 10 columns -0.09 (into the digit) to 0.26, 8 columns 0.14-0.41 (1x measure), 5 columns 0.57-1.09. Divisor ink to arc
ink >= 0.27 mm.

Mixed fast-facts page (fact rows, seed 11; cols x rows @ digit pt), one grid, one cell width, ws-print-lint clean at S/M/L x
Auto/5/6/8/10 for add+sub+mult+div (Mix), add+sub+mult+div (Long), add+sub+div (Fraction), mult+div (Standard):

| Mix of | S Auto | S 10 | M Auto | M 8 | M 10 | L Auto | L 8 | L 10 |
|---|---|---|---|---|---|---|---|---|
| + − × ÷(Mix) | 10x7 @16 | 10x7 @16 | 6x5 @24 | 8x6 @18 | 10x7 @16 | 5x5 @28 | 8x6 @18 | 8x6 @18 (a 12 x 11 = 132 dealt: PT-FRW-5) |
| + − ÷(Mix) | 10x7 @16 | 10x7 @16 | 6x5 @24 | 8x6 @18 | 10x7 @16 | 5x5 @28 | 8x6 @18 | 10x6 @16 |
| + ÷(Long) | 10x7 @16 | 10x7 @16 | 6x5 @24 | 8x6 @18 | 10x7 @16 | 5x5 @28 | 8x6 @18 | 10x6 @16 |

5 and 6 columns: 5x5 @28 and 6x5 @24 at every size. When the dealt page comes out smaller than its count (the PT-FRW-5 clamp
after the probe), each operation keeps its share (`keepShares`), so the ÷ facts are never the ones cut.

Byte-identical (buildSheet pupil + key HTML, seed 11, vs 76bc3700): fact rows + − × and ÷ Standard / Vertical / Fraction at S/M/L x
Auto/5/6/8/10. Changed by design: ÷ Long and Mix fact rows; the ÷ fraction off fact rows (R1-15).

Evidence (150 dpi): `design/status/laned-restart/after-r2-*.png`, `before-r2-*.png`.

Open (not F1's files): the instruction "Look at the _sign_. Solve." prints "thesign" (the `.ws-instrline` flex box drops the space
before `<u>`; practice.js `instructionHtml`, pinned by ws-layout-unit BD-14); the fact probe (fact-probe.js) still re-lays its
short last row in Mix / Long / Fraction (H13 31 % band at S and L, pre-existing on 76bc3700).

## Round 2 closing builder (2026-10-31, Opus medium)

Fixes (on eee6dcbc):
- **CL-40, supports pages** (`css/sheet-kit.css`, additive): a supported problem whose first ink is the sign box (`boxsign`,
  the 'before' pane) starts at the label keep-out edge (`--ws-koin` + 0.3 mm), beside a picture or not, and never shrinks to
  make room (min-width: max-content); a grid-past-9 cell already padded right of the w2 keep-out publishes `--ws-koin: 0`.
  `ws-print-lint --supports all --size S` (4 fact skills): add_facts CL40-INK x10 (main x8), div_facts CL40-INK x6 + H13 x2
  -> **0 findings** (main: 19 findings in 3 docs). boxsign at L (sub / mult / div): unchanged from HEAD (div boxsign L H13-ROW x2,
  on main). div_facts fade-packet: L CL40-INK x14 + PAGEFILL -> PG-12 x6 (see open row: the fade allocation is not measured).
- **"Look at thesign"** (`practice.js instructionHtml`): a line with an underlined word keeps its text in one inline span (the
  flex line dropped the space before `<u>`); ws-layout-unit BD-14 pin updated with it (1397 assertions OK). Lines with no `<u>`
  are byte-identical.
- **OPTION-HELP** (`skill-options.js` supportsOption help / helpShort): "None ticked ..." named the value `none`, which no fact
  skill offers -> "Leave every box unticked ...". node-lint s1 on the 5 skills: 14 -> 4 (the 4 left are LESSON-DATA, below).
- **Pins** (owner 2026-10-31: shared-role defects -> page-types lane), `design/audit/baselines/print-lint.json` (L) and
  `print-lint.S.json` (S), each finding carrying a `pin` note: div_facts Review L CL40-INK 6 (R1-11); div_facts / div_facts_long
  Reason It CL40-INK 4 at L, 6 at S (R1-9); div_facts / div_facts_long Guided H13 14 / 16 at S (R1-13); sub_facts Lesson S
  WRAP-OP 4 (R1-5). Max over the five written forms.

### Round 2 precritic (`--skill add_facts,sub_facts,mult_facts,div_facts,div_facts_long --role fact-rows --strict`)

Run /tmp/mq-precritic/20261031-125119-32542 (40 gates: 22 PASS, 1 PASS (baseline), 2 SKIPPED no rulings), then the role
print-lint gates, supports-S, options-render and node-lint re-run on the final tree. Main = `git worktree` of
origin/claude/sweet-newton-c8wrv1 5c6063a5, same command.

| Gate | Finding | Same on main? (proved by) | Status |
|---|---|---|---|
| print-lint --supports all S | CL40-INK sign box in the keep-out (add x10, div x6), div H13-ROW x2 | main red (19 findings, different cells) | **FIXED** (0 findings) |
| print-lint --roles (divForm x5) L/S | Review CL40-INK (R1-11), Reason It CL40-INK (R1-9), Guided H13 (R1-13) | shared roles | **PINNED** (owner ruling) |
| print-lint --roles lesson S | sub_facts WRAP-OP 4 (R1-5) | shared role | **PINNED** (owner ruling) |
| print-lint --roles lesson S | div_facts_long Lesson SPREAD 1 (page 3, 43 %) | **main red under the lane's lint**: the preset's lesson IS div_facts {divForm: long}'s (same SPREAD 43 % p3 on this tree); main's tree prints the same page 3 (identical 4 x 4 grid, cells and heights) and main's own lint passes it, the lane's ws-print-lint.cjs run against main's tree (r2 final, 5c6063a5) reports the same SPREAD 1. A lint the lane tightened, not a page it changed | main-red (proved, r2 final) |
| print-lint --roles divForm=long L, mix L | Mixed practice H13 x2 (div_facts), x4 / x2 (div_facts_long), cell 8 31 % band | **main red**: `ws-print-lint --roles mixed-practice --opts divForm=long --size L` on main: same H13 x2 cell 8, 28.5 mm | main-red (documented) |
| print-lint --roles divForm=mix S/L | Fact Probe H13 x2 cell 20: the form grid's short last row is re-laid 1.5 columns wide | main **ok** (same command) | **FIXED** (r2 final): fact-rows.js formGrid lays a fixed count in a column count that divides it (5 or 4; 2 x 10 left to the fallback, it pins the across facts, H13 x20 at S), the rung the Standard rows' 20 pt where it fits, else the next ladder rung (the 144 / 12 bracket is 49 mm at 20 pt, a quarter page 46 mm). fact-probe mix S and L 0 findings; long / fraction S and L stay 0 |
| options-verify --skill | div_facts_long support=touch/skip/array/think/boxsign/all: no support drawn | **host red on main**: div_facts {divForm:long, support:[skip]} draws 0 supports on main (buildSheet probe; standard 18, fraction 12, vertical 9, mix 8). The long-division cell is not in support-draw.js canDraw | main-red (documented; the fix is drawing supports on the bracket, or the preset not offering them - ws-presets-unit requires the host's controls) |
| options-verify --render | 15 value pages worse than default (across capacity at S, array H13, divForm capacity, div boxsign L H13-ROW, ...) | **main red**: 25 value pages on main, every branch page among them | main-red |
| node-lint s1 | LESSON-DATA: sub / mult / div_facts and div_facts_long have no lessons/prereqs.js entry | **main red** (same 3 + the preset inherits) | main-red |
| dealer-uniform | add 7, sub 18, mult 1, div 3, div_facts_long 1 | **main red**: add 7, sub 18, mult 1, div 3 (same command) | main-red |
| slot-clip | div_facts sections/defaults L `ws-eq-below` 6.2 mm under the row (19.3 mm rows; measured[3] = 30.6 mm, the sections layout sizes the row from a one-line height) | **main red**: 8.2 mm, rows 17.3 mm | main-red (not small: practice/print-sheet sections row height, not equation.js) |
| slot-clip | mult_facts fade-page L PG-12 x8 | **main red**: x8 at L (and S x10, M x8 on main) | **cleared** by the layout.js hMin fix above (r2 final run: ok) |
| slot-clip | div_facts fade-packet L PG-12 x6 (cells 6-8 of p2: 3 sign-box cells in a 31.3 mm row, measured 52.6 mm at 3 columns) | main red differently: L CL40-INK x14 + DN-2 / H13 / PAGEFILL (26 findings) | **FIXED** (r2 final). Root cause was not the measure (the measuring cell already carries the keep-out; it read 52.6 mm): layout.js resolveSectionLayout's DENSE step moved the narrow part from 1 to 3 columns but kept hMin at the 1-column height (26.1 mm, the sign box beside its fact), so practice.js splitCellH drew its row at 26.1 x 1.2. hMin now takes the height at the columns the dense step chose. fade-packet S/M/L 0; the same fix cleared mult_facts fade-page L PG-12 x8 (main red) |
| sibling-compare | 162 counts with no approved sibling | structural: no approved fact-family sibling exists on main either | not blocking a fix; needs siblings |
| content-audit (full) | algebraic_all make-a-ten multiple-choice pair NEW | **main red**: identical NEW line on main | main-red |
| composing:fraction_number_line lesson | not in this scope's plan (role sample lesson not run by --role fact-rows) | - | not run |

Not red: node-lint, providers, content-audit --skill, presets-unit, lessonfit, coverage-matrix (47 rows OK vs baseline),
print-lint kit S/M/L, lesson L (baseline), divForm standard S, supports-S, screen-slots, screen-answer, chromebook-fit,
code-snapshot, boot-smoke, phone-card, spec-card signed, grade-render + print-lint fact-rows S/L. Unit gates: ws-layout-unit OK
(1397), ws-code-snapshot OK (732), ws-search-terms OK, ws-standards OK, ws-share-options OK, ws-redesign-passed OK (7, unchanged),
ws-spec-card --check-signed facts.md OK, ws-backtest 5 lane rows PASS (arc-ink-laned, grid-even-laned, frac-keepout-laned,
screen-uniform-laned, section-overlap-lesson-warmup).

**Final run (r2 final)** /tmp/mq-precritic/20261031-144721-27556: 29 PASS (7 on the baseline), 9 FAIL, 2 SKIPPED (no rulings).
Every FAIL is a row above: options-verify --skill (div_facts_long supports, main-red), print-lint-lesson-S (sub_facts WRAP-OP
pinned + div_facts_long SPREAD main-red), print-lint divForm=long L and divForm=mix L (both `div_facts_long#mixed-practice` H13 0 -> 2,
cell 8, 28.5 mm band: the documented main-red Mixed practice row; Review / Reason It CL40-INK pinned; fact-probe now ok),
sibling-compare (no siblings), slot-clip (only div_facts sections/defaults L CLIP 6, main-red), dealer-uniform (main-red, same
counts), node-lint-s1 (LESSON-DATA main-red), options-render (15 value pages, main 25: main-red). No open lane row remains.
ws-layout-unit OK (1397), ws-boot-smoke PASS (in the run).

Seen, not gated: the think box "Think: 11 × ☐ = 121" crowds its own frame at S (both trees).

## HAND-OVER 2 (2026-10-31, after critic r2)

Branch head: critic r2 at 66a6ef23 (on 616908b1, merged with main 784eeff8). Card SIGNED 2026-10-31. NOT deployed, NOT in
redesign-passed.js. Cost: round 2 ~$118 (≈ 4.2 %); lane total ~$282 (≈ 10.1 % of the weekly limit). Report: design/audit/runs/laned-restart/critic-r2.md.

### Fixed in round 2 (critic-verified)
R1-1 dividend side (0.62–1.08 mm), R1-2 Mix fact rows even, R1-4 supports no longer break the page, R1-6 add_facts lesson,
R1-15 fraction keep-out, R1-16 Mix online worksheet; mixed + − × ÷ fact-rows page (owner ruling) works; preset
division:div_facts_long (code ZF); + − × rows unchanged; screen hosts 9/9/8–9/9 in every form; 5 new checks backtested.

### Remaining (round 3, Opus medium; STOP-LOOP on the arc: fresh builder, root-cause brief, check first)
1. R2-1 arc 0.27 mm from the divisor's last digit at 10 cols (no white pixel at 100 %). Root cause: the arc is placed from the
   dividend's ink only. Fix: place it from BOTH neighbours' ink; if 10 columns cannot hold ≥ 0.5 mm both sides at 16 pt, ask the
   owner (the ruling keeps 10 columns). Check first: ARC-INK both sides + 96-dpi raster separation, backtested on 616908b1.
2. R2-2 mixed fact-rows page with × prints 56 in a 10-column grid on 3–7 of 24 seeds: choose columns from what is DEALT (or
   deal within the column rule). Check: L-DENSITY COUNT-FITS over seeds 1–24.
3. R2-3 fact probe widens its last row (+ − × cell 20; div long/fraction/mix at L, div_facts_long at L). Check: GRID-EVEN on every grid.
4. R2-4 think support text overruns its box at S; sign box beside vs under inconsistent. Check: L-OVERLAP TEXT-FRAME.
5. R2-5 add_facts Review M H13 ×6 (R1-10): fix, or the owner moves it to the page-types lane.
6. Then precritic `--role all` at S/M/L + `--skill` for all five, merged with main, before critic r3.
Not gating (owner ruling a): R1-3, R1-5, R1-7, R1-8, R1-9, R1-11, R1-13, R1-14 → page-types lane. Card Q5 (short class) → layout lane.

