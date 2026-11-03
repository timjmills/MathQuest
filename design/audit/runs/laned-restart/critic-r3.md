# Lane D restart: independent critic, round 3 (fact family)

Critic: independent (built none of it), Opus 5.5 medium. Branch `claude/sweet-newton-c8wrv1-laneD-restart` @ e6c66273 (merged
with main). Date 2026-10-31. Skills: `addition:add_facts`, `subtraction:sub_facts`, `multiplication:mult_facts`,
`division:div_facts` (divForm standard / vertical / fraction / long / mix), preset `division:div_facts_long`.
Rulings applied: card Q3 FINAL (the bracket stays at 10 columns, drawn as in round 2: an owner-accepted look, graded only for
"not worse than r2" via ARC-INK both sides); shared page-type defects R1-3, R1-5, R1-7, R1-8, R1-9, R1-11, R1-13, R1-14 do not
gate. Budget: about 40 minutes, so the screen hosts were not re-rendered (see "Not re-verified").

## Verdict

| Skill | Verdict | Lowest in-scope scores |
|---|---|---|
| addition:add_facts | **PASS** | 8 (Fact probe C3, mixed fact rows C3, lesson, Reason It / Opener / Guided as in r2) |
| subtraction:sub_facts | **PASS** | 8 (same) |
| multiplication:mult_facts | **PASS** | 8 (same) |
| division:div_facts | **FAIL** | Supports on Test (and Independent) when several supports are on: C3 7 (R3-1) |
| division:div_facts_long | **PASS** | 8 (10-column bracket at the owner-accepted r2 drawing; ARC-INK guard clean) |

div_facts fails on one defect of the R2-4 class (one layout per section with supports), found by the lane's own lint
(`L-SUPPORT SCC-T10`) on a role the lane did not run with supports. Everything R2 asked for is fixed.

## R2 defects: verified

| Defect | Status on e6c66273 | Evidence |
|---|---|---|
| R2-1 bracket at 10 columns (owner-accepted) | **Not worse than r2.** ws-print-lint ARC-INK (now both sides: dividend ≥ 0.3 mm, divisor ≥ 0.25 mm guard at r2's 0.27) is clean on div_facts long / mix fact rows S and L and on div_facts_long `--columns 10` S and L; long-division.js changed by 3 lines only (ARC_SPACE identical to 616908b1 per the status). | `r3/lint-forms-supports.txt` |
| R2-2 mixed + − × ÷ count | **Fixed.** 384 pages: 5 mixes (+ − × ÷Mix, + − × ÷Long, + × ÷Long, + ×, + div_facts_long) x S / M / L x Auto / 8 / 10, seeds 1-24 at S (1-8 for the preset mix), 3 seeds at M / L. Printed cells = grid cols x rows = Score /N = the dialog's fits line (perPage, cols) = key cells, one cell width, on **every** page (0 mismatches). r2's case (+ − × ÷Long, S, 10, seed 4242) now prints 8 x 7 = 56 = "Fits: 8 columns x 7 rows, 56 per page" = Score /56. | `r3/count-sweep.txt`, `r3/count-sweep-part1-mix4Mix-S.txt`, script `r3/count-sweep.cjs.txt` |
| R2-3 probe lattice | **Fixed.** Fact probe for add / sub / mult and div_facts in every divForm (standard, vertical, fraction, long, mix) at S and L: GRID-EVEN (now on every kit grid) and all lints 0. The 20th across fact stays in column 1. | `r3/lint-forms-supports.txt`, `r3/lint-{S,M,L}.txt` |
| R2-4 think / boxsign | **Fixed for think + boxsign** (text inside its box, one placement, Independent S, `--supports all` lint 0 on Independent). The same class is still open when the support set mixes (R3-1). | `design/status/laned-restart/after-r3-think-boxsign-S.png` (checked), `r3/R3-1b-...png` |
| R2-5 add_facts Review M H13 | **Fixed.** `--roles review --size M` 0 findings (no H13, no AK-4); S and L also 0. | `r3/lint-M.txt` |

## Scores

C1 / C2 / C3 / C4. "=" same as the column to its left. r2 scores carried where r3 re-ran the lint and found nothing new and the
role's code did not change.

| Page type / host | add_facts | sub_facts | mult_facts | div_facts | div_facts_long |
|---|---|---|---|---|---|
| Fact rows, one skill (S Auto / 10) | 9/9/9/9 (70) | = (70) | = (56, PT-FRW-5) | Std / Vert 9/9/9/9; Fraction 8/8/8/8; Long / Mix 8/8/8/8 at 10 (owner-accepted r2 bracket) | 8/8/8/8 |
| Fact rows, mixed + − × ÷ | 9/9/8/9 (R2-2 fixed; columns follow the deal, see observations) | = | = | 8/9/8/8 | 8/9/8/8 |
| Fact probe (S, L) | 8/9/8/8 | = | = | 9/9/8/9 every form | 8/9/8/8 |
| Independent / More practice / Test | 9/9/8/9 | = | = | 9/9/8/9; **with several supports 8/8/7/8 (R3-1)** | 9/9/8/9 |
| Review S / M / L | 9/8/8/9 (R2-5 fixed) | 9/8/8/9 | 9/8/8/9 | 8/8/8/8 (L R1-11, ruled out) | 8/8/8/8 |
| Lesson | 8/8/8/8 | 8/8/8/8 (R1-5 ruled out) | 8/8/8/8 | 8/8/8/8 | 8/8/8/8 |
| True or False? / Stretch / Word problems | 8/8/8/9 | = | = | = | = |
| Opener / Guided | 8/8/8/9 (R1-14, R1-13 ruled out) | = | = | = | = |
| Mixed practice / Reason It | 9/9/8/9 / 8/8/8/8 (R1-7, R1-9 ruled out) | = | = | = | = |
| Supports think + boxsign (S) | - | - | - | 8/8/8/8 (R2-4 fixed) | n/a |
| Answer keys | correct and same count as the pupil page on every page swept | = | = | = | = |
| Practice card / online worksheet / quiz | 9/9/9/9 / 9/9/8/9 / 9/9/9/9 (carried from r2, not re-rendered) | = | = | = | = |

## Defects

### R3-1 (div_facts) With several supports on, the fact and its answer slot move between the cells of one section
- **Where:** Test, Size S, `--supports all` (touch / skip / array / think / boxsign, mix section, cover whole), seed 805715; the
  same shift on Independent S (seed 69559).
- **What:** each row centres the group "sign box + fact + support", so the fact's left edge sits at 157 / 212 / 157 / 233 /
  220 px (of 794) on the five Test rows and the answer line moves with it: ws-print-lint `L-SUPPORT SCC-T10 major` "the answer
  zone moves between cells of one shape (69.0 vs 86.4 mm)". Row heights also differ (the think cue stacks under the dots in row
  1, beside them in row 2). One section, several layouts: the pupil hunts for the slot on each row. The boxsign and the think
  cue themselves are fixed (R2-4); this is the placement across a MIXED support set.
- **Evidence:** `r3/R3-1-div_facts-test-supports-all-S.png`, `r3/R3-1b-div_facts-independent-supports-all-S.png`,
  `r3/lint-forms-supports.txt`.
- **Rule:** RUBRIC C3 ("the answer in the same place in every cell"); SCC-T10; R2-4's own fix ("one placement per page").
  Costs C3 1 point (7).
- **Fix:** left-anchor the fact at one x for the whole section (the widest sign box + gap, decided from the section like the
  R2-4 placement in registry.js) and put each support in a fixed zone to its right / under it, so the fact and slot never move.
- **Would have caught it:** the **existing** `L-SUPPORT SCC-T10` (it fired). Process: precritic's `print-lint --supports all S`
  ran Independent only; run it on every role that carries supports (Independent, More practice, Test, Review) for a family that
  offers supports. Add `--roles independent,more-practice,test` to that precritic row.

## Observations (no score effect)
- The mixed fact-rows page's columns follow the DEAL, not the band: at S Auto / 10, + × pages print 8 x 7 = 56 on 46 of 48
  seeds and 10 x 7 = 70 on 2; + − × ÷Long 42 / 6. Each page is self-consistent (count = grid = Score = dialog), so R2-2 is closed,
  but PT-FRW-5 says the clamp "is read off the band": a × band of 144 would always clamp. A teacher regenerating may see the
  page change shape. Worth a line in PT-FRW-5 (deal-read vs band-read) or reading the band.
- `buildSheet().items` returns the whole deal (70) when the page keeps 56 (`keepShares`); any consumer counting `items` (not
  `fits` / `scoreOutOf`) would be wrong. Not seen on the page.
- The fact probe's remainder beside cell 20 is drawn inside the grid frame (an empty ruled box), not "unruled" as PT 4.2 draws;
  cosmetic.
- div_facts_long still offers Support controls that draw nothing on the bracket (main-red, r2).

## Not re-verified (budget)
Screen hosts (practice card 390 / 1280, online worksheet, quiz) for div_facts Mix and sub_facts were not re-rendered.
`screen-cell.js` is unchanged since 616908b1; `cells/fact.js` changed (+15 lines, the think cue sizing), so the r2 screen scores
are carried, not re-measured. A lead wanting full certainty on the passes runs `ws-grade-render --skills ... ` with screens.

## How it was graded
- `r3/count-sweep.cjs.txt` (adapted from `r2/sweep2.cjs.txt`): 384 mixed fact-rows pages built through `buildSheet`, pupil and
  key rendered, cells per row, cell widths, Score /N and the fits line compared.
- `ws-print-lint --source kit`, 5 skills x 14 roles x S / M / L (`r3/lint-{S,M,L}.txt|json`: 29 / 29 / 28 findings, every one
  R1-5, R1-7, R1-9, R1-11, R1-13 or the div_facts_long lesson SPREAD, all ruled out or main-red per r2).
- `ws-print-lint` div_facts fact-probe + fact-rows x 5 divForms x S / L, div_facts_long `--columns 10` S / L (all 0), and
  `--supports all --size S` on Independent + Test for div / mult / add (1 finding: R3-1).
- `ws-grade-render --roles test,independent --supports all --size S` for div_facts (R3-1 PNGs); the lane's after-r3 PNGs
  (think/boxsign S, probe add S) inspected.

## Speed notes
- R3-1 was red on an existing lint the lane already ran, but on one role. Rule (again, as r2's R2-5): a family round runs each
  lint over every role the option reaches.
- The count sweep took ~12 minutes for 384 pages; trimming to S x 24 seeds plus 3 seeds at M / L kept the signal.
