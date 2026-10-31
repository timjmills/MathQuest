Lane: ansbox
Title: Answer boxes option (`ansBox`, 6Q) — rebuild after critic r1
Session: https://claude.ai/code/session_013pHDnQH6J4KjmE36BoiAsM
Branch: claude/sweet-newton-c8wrv1-ansbox-wip
Owner of files: js/modules/screen-cell.js + css/screen-cell.css (answer-box rules), css/sheet-kit.css (answer-box rules), js/modules/print-sheet.js legacyKeyFill / markSectionAnsBand, js/modules/print-generate.js wsStackHTML / "= ?" slot, js/modules/skill-options.js offeredAnsBox, tests/scripts/ws-ansbox-*.{cjs,mjs}
State: fix (r2 built, waiting for critic r2)
Updated: 2026-10-31
Builder profile: mq-opus-medium (rebuild after a failed critic round)
Critic rounds: 1, FAIL (lowest O6 = 3; print P = 5 on the fact template)

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
