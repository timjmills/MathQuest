Lane: ansbox
Title: Answer boxes option (`ansBox`, 6Q) — rebuild after critic r1
Session: https://claude.ai/code/session_013pHDnQH6J4KjmE36BoiAsM
Branch: claude/sweet-newton-c8wrv1-ansbox-wip
Owner of files: js/modules/screen-cell.js + css/screen-cell.css (answer-box rules), css/sheet-kit.css (answer-box rules), js/modules/print-sheet.js legacyKeyFill / markSectionAnsBand, js/modules/print-generate.js wsStackHTML / "= ?" slot, js/modules/skill-options.js offeredAnsBox, tests/scripts/ws-ansbox-*.{cjs,mjs}
State: fix r3 (re-brief after the r2 loop stop): built, NOT ready for critic (full cross product still red, see r3)
Updated: 2026-10-31
Builder profile: mq-opus-medium (rebuild after a failed critic round)
Critic rounds: 2, FAIL (r1 O6 = 3; r2 C2 = 3, loop stopped); r3 = fresh builder, mq-opus-medium

## Now
- r2 fixes and the six new checks are committed; every check is backtested (fail on b63c075, pass on the fix).
- Next: an independent critic r2 on the same sample as r1 (design/audit/critic/2026-10-30/ansbox.md), scoped to the r1 findings + regressions.

## Owner go

## Open questions
- Default (Automatic) keys of the LEGACY skills still write 0.8 em digits (add/sub_10/_20 stacks, divide, multiply,
  sub_facts). They are left byte-identical on purpose: a passed skill's review page (sub_50_no_regroup review) deals legacy
  review items, so changing them would move a passed page. Fixing them needs a decision (and a re-grade of the passed
  skills' review pages). The teacher's explicit values write at full size.

- **Lead decision 2026-10-31 (resolved): the 7 skills that still failed `ws-ansbox-shape` after r2 are this lane's.**
  - `addition:add_three`, `subtraction:missing_add_sub`, `division:missing_mult_div`: their screen hosts cannot draw 'Off'
    cleanly (the counters cell's box; the missing-number sentence answered in the practice card's main input), so
    `offeredAnsBox` no longer offers "Off" on them (`ANSBOX_NO_OFF`); print still draws it and old codes still decode.
  - `addition:mixed_addition`, `subtraction:mixed_subtraction`, `division:mixed_mult_div` (layouts with "+") and
    `division:mixed_division` (its pool also deals long division): no single value is honoured uniformly across the pool's
    drawings, so `offeredAnsBox` offers no answer-box control on them (Automatic); the option stays in the model.
  - Automatic (default) legacy pages, held byte-identical, carry their own pre-existing findings: the legacy stack band follows
    each item (add_20_*: 2 / 3 boxes; sub_20_*: 1-place items one box), key digits 0.8 em, and sub_1m_no_regroup at S draws
    25.6 px digit boxes on 27.7 px tracks. Checks c, d, e therefore run on the teacher's values only.

## Times
Times: fix r2 (rebuild after critic r1), start 2026-10-31T10:40Z, end 2026-10-31T12:55Z, profile mq-opus-medium

## r1 findings → what changed → the check that now catches it

| r1 finding | Cause | Fix (r2) | Check (backtest row) |
|---|---|---|---|
| 1. Legacy stacks: One box = One box per digit on the practice card and quiz (O6 = 3) | The class `mq-ans-one` WAS on the strip; the next-box glow (`.mq-active-box`, an inset 3 px ring, specificity 3,3,2) outlined the one digit it marks, and the 'one' focus rules were scoped to `.mq-kit` + `:focus` only. In a 2-digit strip the only seam is on the marked box, so the two values looked the same. | screen-cell.css (additive, end of file): on every host a 'one' strip keeps its top / bottom / outer edges and an 'off' strip none while a digit is the next box or focused; the cue is the yellow fill (no ring, no outline). | ws-options-verify ansBox, frozen animations, as shown + at rest (`ansbox-a-unfocused`); ws-ansbox-shape f on card / worksheet / quiz (`ansbox-f-panel`) |
| 2. Fact digit: key overlays an orange full-width box; digits spill | `.ws-key [data-ws-key-mark] { border-color: key ink !important }` repainted the zone outline that `ws-factans--digit` hides. The digit boxes are one per FACT_TRACK (0.72 em = the digit column, measured 26.9 px = 26.9 px at L). | sheet-kit.css (additive): the hidden outline stays hidden on the key. | ws-ansbox-shape b (`ansbox-b-key-pupil`), c (`ansbox-c-digit-width`, fixture: boxes 0.5 em under 0.72 em tracks) |
| 3. Fact off: key draws a box the pupil page lacks | the same key-ink rule on `ws-factans--off` | the same additive rule | ws-ansbox-shape b (`ansbox-b-key-pupil`) |
| 4a. add_sub_10s / multiply: key digits about half the question size | legacyKeyFill wrote 0.8 em (`ws-slot`, digit strips) or min(1 em, 0.82 × 8 mm) (legacy fact zone) | With a teacher's value: key digits at 1 em; the digit strip and the fact zone keep their height (`grid-template-rows: 100%`); a legacy fact's zone is max(8 mm, 1.15 em) (the kit fact's zone). The automatic page is unchanged byte for byte. | ws-ansbox-shape d (`ansbox-d-key-digit-size`) |
| 4b. multiply: 3 boxes for 12 × 7 beside 2 for 2 × 5 (SL-2) | the legacy formatter sizes each item's strip from its own operands | `markSectionAnsBand` (print-sheet.js, called wherever `markSectionWriteAbove` is): the section's widest answer is every legacy fact's box count | ws-ansbox-shape e (`ansbox-e-one-band`) |
| 5. Labels: Automatic = One box per digit on stacks; Automatic: one box ≠ One box on add_sub_10s | the panel offered a duplicate of Automatic on every layout; explicit 'one' on a "= ?" sentence dropped the "?" | `offeredAnsBox` (skill-options.js): a column-only skill does not offer "One box per digit", a skill with no column work does not offer "One box" (both stay in the model, so old codes decode and draw what Automatic draws); explicit 'one' on "= ?" draws what Automatic draws | ws-ansbox-shape f (`ansbox-f-panel`) |

## The checks (Step 1)

- **a** `ws-options-verify` (ansBox): the card's answer places are compared with every animation frozen
  (`document.getAnimations()` paused at 0; `animation: none !important` alone loses to the glow's own `!important`), as
  shown and at rest unfocused (`data-mq-no-pulse`, blur), same seeded item for every value; only offered values are tried.
- **b–f** `tests/scripts/ws-ansbox-shape.cjs`: measures the rendered pupil page + key at S and L (computed borders, box
  geometry, digit runs, font sizes) and the three screen hosts. b key = pupil box set per cell; c digit box ≥ digit track;
  d key digits ≥ 0.9 × question (teacher's values); e one digit-box count per section; f no two offered values alike on
  pupil / key / card / worksheet / quiz (as shown and at rest). `--fixture` runs b–e on a saved sheet.
- Wired: `ws-precritic --skill` adds the row `ws-ansbox-shape` for every scope skill in `skill-ansbox-skills.js`;
  backtest rows `ansbox-a…f` in `tests/fixtures/precritic/backtests.json`; `ws-precritic-plan` OK (all on the path).
- `tests/scripts/ws-ansbox-default-parity.mjs`: hashes the automatic pupil page + key (independent, more-practice,
  review × S, L) and the practice card of the passed skills; `--write` / `--check` a baseline.

## Gates (Step 4, on the lane branch = main b63c075 merged + r2)

- `ws-boot-smoke`: OK
- `ws-code-snapshot`: OK (731 codes, 35 categories, no frozen code or position moved, 3200 option round trips)
- `ws-content-audit`: FAIL - mc-all: 1 new pair `algebra_mixed:algebraic_all [make-a-ten/multiple-choice]`; **pre-existing**: the
  same FAIL line on b63c075 (MQ_ROOT run), not touched by this lane
- `ws-options-verify` (14-skill lane sample, every option): OK after r2 (595 values; the legacy fact's 1.15 em zone read fixed)
- `ws-ansbox-shape` lane sample (14 skills): OK; full answer-box list (70): 63 clean, 7 pre-existing (Open questions)
- `ws-ansbox-default-parity --check` (7 passed skills, 91 documents): OK; the 9 touched skills' automatic pages (117 documents): OK
- `ws-stamp-assets` stamp, then `--check`: OK (297 modules and every stylesheet stamped)
- `ws-backtest --row ansbox-a…f`: 6 PASS (fail on b63c075, pass on f83caa6); `ws-precritic-plan`: OK (every row on the path)
- `node --input-type=module --check`: skill-options.js, print-sheet.js, print-generate.js OK
- `ws-precritic --strict --skill` (add_10_regroup, add_100_regroup, add_facts, mult_facts, add_sub_10s, multiply, div_facts):
  **FAIL: 8 FAIL, 16 PASS, 3 SKIPPED / INCOMPLETE**. Every ansBox row is green (options-verify 286 values 0 failing; ws-ansbox-shape
  PASS; screen-slots, screen-answer, chromebook-fit, phone-card, print-lint L / S / M PASS). The 8 red rows are not this lane's:
  coverage-matrix + sibling-compare + slot-clip (add_100_regroup ex-each / ex-group / layout-fact-rows: the SAME 4 red rows on
  b63c075, re-run with MQ_ROOT), print-lint --roles lesson L / S (lesson pages), dealer-uniform (generation), node-lint-s1 (no
  lesson data, Support help names "none"), options-verify --render (notation / support / divForm values; no ansBox value). The
  automatic pages are byte-identical to b63c075 and the option never changes generation, so none of these can come from r2.
  The spec cards (stack, fact, ...) are unsigned (INCOMPLETE).
- `ws-precritic --strict --role lesson`: FAIL: 2 FAIL, 1 PASS. Both red rows are `placevalue:more_less_10#lesson L-OVERLAP CL40-INK:
  0 -> 2` (L and S), the known main finding (speed-audit, lessons-6-7 row); grade-render PASS.

### After the lead decision (2026-10-31)
- `ws-ansbox-shape` over all 70 answer-box skills: **OK** (70 measured; the 4 mixed pools report "not offered")
- `ws-ansbox-default-parity --check` (7 passed skills): **OK (91 documents byte-identical)**
- `ws-options-verify` (the 7 skills + the 7 touched): FAIL, 4 values, all on options other than ansBox and all already pinned
  in design/audit/baselines/options-verify.json (mixed_addition nlOn=true; mixed_subtraction poolSize="harder", poolSupport=1,
  nlOn=true); every ansBox value passes
- `ws-code-snapshot`: OK (731 codes); `ws-boot-smoke`: OK

## Evidence (design/status/ansbox/, before = b63c075, after = r2)
- legacy-stack-add_10_regroup-card-quiz-digit-vs-one-{before,after}.png (row 1 card, row 2 quiz; left digit, right one)
- fact-mult_facts-digit-off-pupil-key-{before,after}.png (digit pupil, digit key, off pupil, off key)
- equation-add_sub_10s-key-digit-off-{before,after}.png
- legacy-fact-multiply-digit-section-{before,after}.png (whole section, pupil then key)

## Log
- 2026-10-31: r2 rebuilt at medium (critic r1 FAIL, O6 = 3). Checks first (c1bd60a), fixes (f83caa6), backtests 6/6 PASS.

## Critic r2 (2026-10-31): FAIL. Loop STOPPED (same defect survived two rounds)

Report: `design/audit/critic/2026-10-31/ansbox-r2.md`. PNGs: `design/status/ansbox/critic-r2/`. Lowest scores C2 = 3 and C1 = 4, both on the fact template with notation=across at Size S and "One box per digit".

The r1 fixes held on the cells r1 sampled. Three of r1's defect classes reappeared on combinations r1 did not sample:

| Defect | Where it survived | r1 | r2 |
|---|---|---|---|
| Digit box narrower than its digit; key overflows | fact, notation=across, S | #2 | #1 |
| Box count varies within a section | legacy multiply, online worksheet | #4 | #3 |
| Two values look alike on screen | fact and equation 'off' on card and quiz (4-sided focus ring) | #5 | #2 |

r2 also found three new problems:
- **#4:** legacy stack with One box / Off jumps to the top of the cell (H13: 43 % empty).
- **#5, BLOCKING:** the default pages of the 7 passed skills are **not** byte-identical to main. 28 of 91 documents changed: review-role word-problem unit lines and legacy stack rows. The cause is lane commit 8c21ca1 (SL-3 "every slot a full box"), and r2's parity baseline was taken at b63c075, which already contains 8c21ca1.
- **#6:** options-render has two red findings that main lacks: add_facts S across L-KEY, and add_sub_10s L capacity.

### Root cause
1. **There is no single answer-slot model.** ansBox is implemented as a separate patch for each template × notation × host: kit CSS, screen-cell CSS overrides, the legacy formatter and the key fill. Each critic round samples some of those combinations, and the builder fixes exactly those. The other combinations stay unfixed until a critic happens to sample them.
2. **The checks enumerate the same sample the critic used.** They do not cover the option space. `ws-ansbox-shape` runs only the default notation, `ws-options-verify --render` skips ansBox without saying so, `ws-coverage-matrix` has no ansBox rows, and check e does not run on the worksheet host.
3. **Parity and "pre-existing" were measured against a lane commit, not main**, so a regression on passed skills was invisible.

### What must happen before r3 (a re-brief, not another fix round)
- **Decide (owner or lead):** SL-3 on the review pages of passed skills. Either keep the old line/ansrow drawing when ansBox is untouched, or accept the change and re-grade those 7 skills.
- **Checks first:** `ws-ansbox-shape` iterates every notation / divForm / layout value × every offered ansBox value × S/M/L × all four hosts (pupil, key, card+quiz, worksheet). Check f counts a 4-sided focus ring as a box. Add an H13 band check on teacher values. `ws-options-verify --render` lists ansBox, or reports it as SKIPPED. `ws-ansbox-default-parity` measures against `git merge-base HEAD origin/claude/sweet-newton-c8wrv1` and refuses `--write` on any other base.
- **Then** one answer-slot function per template that takes (ansBox, notation, size, host) and returns the box geometry. Pupil, key and screen all render from it, replacing the per-host CSS overrides.

## r3 (2026-10-31, fresh builder, mq-opus-medium, re-brief after the r2 loop stop)

Lead decisions applied: **SL-3** - Automatic (option untouched) draws the OLD drawing (line / open answer row / the screen's
own box), byte- and pixel-identical to `git merge-base` (5c6063a). Parity is a gate against merge-base, never a lane commit.

### What changed
- **One answer-slot model**: `js/modules/sheet/ans-slot.js` (pure). `offeredAnsValues(layout, key)` (a value is offered only
  where it draws something Automatic does not, on every host), `effectiveAnsBox` (a value not offered draws Automatic; stamped
  on the item in `generate-question.js`), `ansSlot(value, {digits, band, hwMm, blankMm})` (box count, box width >= 0.82 em and
  >= 0.75 x writing height, height >= 1.15 em, key ink 1 em), `ansSlotEm` (the across fact's fit), `ansBoxApplies(look, key)`
  (long division and a stacked add_three: the option draws nothing; checks print N/A). Print pupil (`print-generate.js`
  wsStackHTML / wsAnswerLine, `cell.js` styledAnswerSlot, `fact.js`), print key (`print-sheet.js` legacyKeyFill one-box
  branches) and screen (`screen-cell.js` withAnsBox: Automatic returns the old kind unchanged) read it.
- **Offered now**: kit column = One box (+ Off on the 7 columns whose generator draws the strip itself); legacy column = One
  box; fact / equation / legacy fact = One box per digit; add_three, missing_* = One box per digit; mixed pools none.
  "One box" on a fact / equation equals the screen's own box and "Off" equals paper's plain line, so they are not offered
  (this drops the owner's SL-3 paper box on facts / equations while Automatic stays the old drawing: **lead decision needed**).
- Lane rules that restyled Automatic were scoped to a teacher value's class or removed (sheet-kit.css `.ws-line` box, fact
  zone box, legacy horizontal box; screen-cell.css `.mq-scell input.mq-slot` box + grey wash, `.answer-blank-inline`,
  `.ws-line`, kit-twin slot box). word-work.js, frame.js and layout.js are main's again. Main's rules untouched.
- r2 #1 fact across S: boxes from ans-slot.js (1.15 em tall, >= 0.82 em wide); #2 Off ring: Off not offered where it equals
  Automatic on a host; #3 worksheet band: `worksheet.js` `_wsDealAndDraw` deals a 'digit' set first, `_wsMarkAnsBand` gives
  every card the set's widest strip (Automatic keeps the old deal-draw order); #4 H13: the legacy one-box keeps the zone's
  place and height (gap taken from the zone); #5 parity: OK (below); #6 render findings: within main (below); #7 no wrap
  before "=" (`.ws-eq.mq-eq:has(.mq-eqdigits)` nowrap).

### Checks (step 1)
- `ws-ansbox-shape`: cross product (every notation / divForm / layout value x every offered value + Automatic x size x
  host); f reads AS SHOWN, FOCUSED (first box) and AT REST, a 4-sided outline or outer ring counts as a box; c also needs a
  digit box >= 0.85 em tall (undersized boxes are read as boxes); e runs on the online worksheet (one count per set) and
  flags a wrap before "="; new g = H13 band vs Automatic; N/A looks printed. `--full` = all 70 skills, S/M/L, screen hosts
  on every look; default = the lane sample.
- `ws-options-verify --render` now loads `skill-ansbox-skills.js` (ansBox was silently absent) and lists a non-offered
  ansBox as skipped (rule h).
- `ws-ansbox-default-parity`: renders merge-base in a temp worktree and this tree; HTML + screenshot of every page (roles
  independent / more-practice / review x S/M/L, pupil + key), the practice card, the online worksheet card and the quiz cell;
  `--write` refused unless HEAD is on main; on `ws-precritic --skill` as `ansbox-parity`.
- `ws-render-delta` (new): options-render findings of the tree within merge-base's; on precritic as `render-delta`.
- Backtests (`ws-backtest --row ansbox-r3-*`, fail 9d5c221 -> pass 34c960f): r3-1 fact across S FAIL->PASS (after the c
  height rule), r3-2 off ring FAIL->PASS, r3-3 worksheet band FAIL->PASS, r3-4 H13 FAIL->PASS, r3-5 parity FAIL->PASS,
  r3-6a render across FAIL->PASS, r3-6b render capacity FAIL->PASS, r3-7 no wrap FAIL->PASS. `ws-precritic-plan`: OK (34 rows
  on the path).

### Gates (step 3; main has not moved: merge-base = origin main 5c6063a)
- `ws-ansbox-default-parity --skills ansbox` (70 skills): **OK (2310 documents byte-identical to merge-base 5c6063a)**;
  default (7 passed skills): OK.
- `ws-boot-smoke` OK; `ws-code-snapshot` OK (731 codes); `ws-stamp-assets` stamp + `--check` OK; `node --input-type=module
  --check` on every changed module OK.
- `ws-ansbox-shape` lane sample: OK (14 skills). **`--full`: FAIL (194)** on 7c491cc - NOT FIXED, see below.
- `ws-render-delta` add_facts + add_sub_10s S/L: OK after the 0.75 box width (at 0.95: add_sub_10s L digit H13 rise).
- precritic: see the r3 precritic line below.

### Not fixed (the full cross product, `ws-ansbox-shape --full`, 194 findings on 7c491cc)
- f, 144: notation=across on column skills - the across item's screen answer is already one box, so "One box" equals
  Automatic there (and `addition:add` across: per digit not drawn on screen). Needs a decision: an across look offers no
  "One box", or the panel is per look.
- f, 18: one-place answers at rest (Automatic's strip of ONE box = "One box"); an exemption like the (one, digit) pair's.
- f, 8: div_facts divForm=mix screen, mult_zeros stacked screen (per digit not honoured on screen).
- g, 17: legacy columns 'one' on add/sub_10/20_no_regroup and equal_sign, multiply / missing_* 'digit': emptier band than Automatic.
- e, 7: div_facts divForm=mix (long-division items keep their vinculum: 0 digit boxes), missing_mult_div notation=fraction 2/3.

### r3 HAND-OVER (budget stop, 2026-10-31)
**Done (committed):** slot model `js/modules/sheet/ans-slot.js`; Automatic = main everywhere (parity OK on all 70 answer-box
skills, 2310 documents, HTML + pixels, card / worksheet / quiz); checks (shape cross product, f focus ring, c height, e worksheet,
g H13, h render listing), `ws-ansbox-default-parity` (merge-base worktree, `--write` refused off main), `ws-render-delta`, both on
`ws-precritic --skill`; backtests r3-1..7 all FAIL (9d5c221) -> PASS (34c960f); `ws-precritic-plan` OK; evidence PNGs in
`design/status/ansbox/r3/`; ws-screen-slots back to main's (its "every slot a box" rule contradicted SL-3); content-audit and
options-verify read the r3 markup.

**Precritic r3 (`--strict --skill` the 7, started before the last three test fixes; logs /tmp/mq-precritic/20261031-163357-17001):**
PASS providers, node-lint, code-snapshot, lessonfit, presets, ansbox-parity, print-lint kit L/S/M (baseline), screen-answer,
boot-smoke, phone-card. FAIL on main too, with IDENTICAL finding lines (diffed against the lead's main run 20261031-132149-21153):
print-lint-lesson-L/S, dealer-uniform, node-lint-s1. FAIL then fixed in a later commit (re-run each alone: OK): content-audit
(could not load ans-slot.js), options-verify (one-box regex), screen-slots. FAIL, NOT FIXED: ansbox-shape g (3: div_facts
divForm=fraction digit S 49 % vs 33 %; multiply digit L 34 % vs 29 %, default and stacked). options-render, coverage-matrix,
sibling-compare: red as on main; the findings diff vs main was NOT done for these three (run the commands below). slot-clip and
chromebook-fit had not reported when the budget stopped.

**Not done / next steps (in order):**
1. g on multiply / div_facts fraction: the legacy fact zone grows to 1.15 em (`print-generate.js` wsStackHTML 'digit') and the
   fraction-form digit strip at S; keep Automatic's band. Check: `node tests/scripts/ws-ansbox-shape.cjs --skill multiplication:multiply,division:div_facts --check g --looks`.
2. The full cross product (`node tests/scripts/ws-ansbox-shape.cjs --full`, about 1 h; 194 findings on 7c491cc, classes listed in
   "Not fixed" above). The across look of column skills needs a LEAD DECISION (offer no "One box" on an across look, or a per-look panel);
   the one-place (auto strip of one box = "One box") pair needs an exemption like (one, digit).
3. LEAD DECISION: fact / equation now offer only "One box per digit" (One box = the screen's own box, Off = paper's line under SL-3).
4. Findings ⊆ main for the remaining shared reds: `node tests/scripts/ws-render-delta.mjs --skill addition:add_100_regroup,addition:add_10_regroup,addition:add_facts,multiplication:mult_facts,addition:add_sub_10s,multiplication:multiply,division:div_facts --sizes S,L`
   and diff coverage-matrix / sibling-compare / slot-clip logs against /tmp/mq-precritic/20261031-132149-21153.
5. Then `node tests/scripts/ws-precritic.cjs --strict --skill addition:add_100_regroup --skill addition:add_10_regroup --skill addition:add_facts --skill multiplication:mult_facts --skill addition:add_sub_10s --skill multiplication:multiply --skill division:div_facts`
   (now also runs render-delta) and `node tests/scripts/ws-ansbox-default-parity.mjs --skills ansbox`.

### r3b (owner decisions a + b applied, 2026-10-31 evening) - HAND-OVER at the budget stop
**Owner rule, check f (replaces "no two values alike on any host"):** every offered value draws what its LABEL says on every
host; two offered values may coincide on one host only where both labels stay true there (One box on a fact screen that already
shows one box; Off on paper where Automatic is already the plain space). Recorded as LESSONS L22.
**Done:** `ans-slot.js` offers all four values on facts / equations / legacy facts / columns (b); `offeredAnsValues(layout, key, look)`
drops "One box per digit" on an across look (a) and the stamp (`generate-question.js`) passes the look, so a value the look cannot
draw draws Automatic; `ws-ansbox-shape` measures each look with ITS offered values and applies the label-truth f.
**Gates on 7a…(HEAD before this note):** parity `ws-ansbox-default-parity: OK (2310 documents byte-identical to merge-base 5c6063a, 70 skills)`;
boot-smoke OK; code-snapshot OK (731); stamp --check OK. Precritic r3b (logs: newest /tmp/mq-precritic/2026*): PASS providers,
node-lint, code-snapshot, content-audit, lessonfit, ansbox-parity, presets, print-lint kit L/S/M, screen-slots, screen-answer,
boot-smoke; FAIL as on main: dealer-uniform, node-lint-s1, print-lint-lesson-L/S; FAIL new: options-verify, ansbox-shape,
render-delta (below). options-render / coverage-matrix / sibling-compare / slot-clip had not finished: ⊆-main diff NOT done.
`ws-ansbox-shape --full` was cut at 20/70 skills: 108 f + 2 g.

**Not done (next builder, in order):**
1. Draw the re-offered values on the legacy paths I had gated off in r3: 'off' on `print-generate.js` wsAnswerLine (today it
   falls back to Automatic's line - options-verify "ansBox off: the pupil page draws no off answer place" on add_sub_10s) and the
   legacy key (add_10_regroup off key; add_sub_10s off key writes 12 px, check d); 'one' on the kit fact stacked zone
   (`ws-factans--one` exists in CSS; options-verify add_facts one says no one place: the MARK regex in ws-options-verify.cjs
   needs `ws-factans--one`); div_facts S 'one' key ink crosses its box (render-delta NEW L-KEY AK-2: give the across/fraction
   'one' slot the ansSlot height in styledAnswerSlot).
2. Check f's label-truth class reads the WHOLE cell's boxes, so a column's carry strip makes an open answer row look "one box"
   (add_100_regroup auto vs off on paper): classify from the answer place only (`m.pupil[i].digits` / the answer-row element),
   not every box in the cell (tests/scripts/ws-ansbox-shape.cjs, `truthful`).
3. g: multiply digit L (34 % vs 29 %), div_facts fraction digit S (49 % vs 33 %).
4. Panel per look in the UI (skill-options-ui.js re-reads offeredAnsValues(…, look) when notation changes); today the panel
   shows the union and the model maps an undrawable value to Automatic.
5. Commands: `node tests/scripts/ws-ansbox-shape.cjs --full` (~1 h, run in a worktree), `node tests/scripts/ws-ansbox-default-parity.mjs --skills ansbox`,
   `node tests/scripts/ws-precritic.cjs --strict --skill addition:add_100_regroup --skill addition:add_10_regroup --skill addition:add_facts --skill multiplication:mult_facts --skill addition:add_sub_10s --skill multiplication:multiply --skill division:div_facts`,
   then diff options-render / coverage-matrix / sibling-compare / slot-clip logs against /tmp/mq-precritic/20261031-132149-21153.
