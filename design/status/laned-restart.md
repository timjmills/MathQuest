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
