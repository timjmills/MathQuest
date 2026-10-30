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
