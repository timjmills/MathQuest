# Critic r2: SU-C pilot (six no-regroup subtraction skills and the `sub_2d_1d` preset)

Critic: independent, mq-opus-medium, round 2, 2026-10-23. Branch `claude/sweet-newton-c8wrv1-wip-pilot-su-c` at e3435b9. I did not build this and I am not the r1 critic. I edited no source file and made no commit.

Before grading I read CLAUDE.md, the RUBRIC in full, LESSONS_LEARNED (rules 00, 0a, 0b), the signed card `design/cards/subtraction/subtraction.md`, critic-r1.md, `design/status/pilot-su-c.md` (the engine-class table), rate.cjs and the defect classes. I read WDS INK-30 (the lesson accent) as needed. For the benchmark I used the approved stack siblings `sub_100_regroup`, `sub_1k_regroup`, `sub_1m_regroup` and `add_100_regroup`, rendered beside ours under `render-r2-S/siblings` and `render-r2-L/siblings`.

## Verdict: FAIL

Many things are now right: D1-D12 are fixed or nearly fixed, and the default Practice pages and the screen hosts are classroom-ready from 3 digits up. Four defects still fail the bar:

- **N4 (H2).** The panel offers an "Across" option on the 2-digit skills, and it breaks the page.
- **N2 (H13).** The lesson Warm-up row wastes half its fact cell.
- **N3.** The option panel's Support-level help is untrue.
- **N1.** The new 2-digit dealer skews and repeats items.

None of these is in a pinned engine class.

## Score table (minimum per criterion, over every version graded)

| Skill | C1 | C2 | C3 | C4 | Where the minimum comes from |
|---|---|---|---|---|---|
| sub_50_no_regroup | 4 | 7 | 6 | 7 | Across option page (H2, H13); every page C2 7 (N1); lesson C3 6 (N2); side anchors at L C3 6 (N5); panel C1 7 (N3) |
| sub_100_no_regroup | 4 | 7 | 6 | 7 | Across option page; C2 7 (N1); lesson C3 6; panel |
| sub_1k_no_regroup | 7 | 7 | 6 | 8 | panel C1 7 and C2 7 (N3); lesson C3 6 (N2) |
| sub_10k_no_regroup | 7 | 7 | 6 | 8 | panel; lesson |
| sub_100k_no_regroup | 7 | 7 | 6 | 8 | panel; lesson C3 6 and, at L, C1 7 (N6); side anchors at L C3 6 (N5) |
| sub_1m_no_regroup | 7 | 7 | 6 | 8 | panel; lesson C3 6 and, at L, C1 7 (N6) |
| sub_2d_1d (preset) | 4 | 7 | 6 | 7 | Across option page; C2 7 (N1); lesson; panel |

Per version (the same for all seven skills unless the row says otherwise):

| Version | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| Independent, More practice, Test (+ keys) at S | 9 (8 at 5-6 digits, N8) | 7 (2-digit, N1) / 8 | 8 | 9 |
| The same at L, and M (spot check) | 9 | 7 / 8 | 8 | 9 |
| Mixed practice, single skill, S / M / L (+ key) | 9 | 7 / 8 | 8 (class d is pinned) | 8 |
| Lesson packet p1-p3 (+ key), S and L | 8 (7 at L for 5-6 digits, N6) | 8 | **6 (H13, N2)** | 8 |
| card-1280 / 820 / 390, worksheet-1280, quiz-1280 | 9 | 7 / 8 | 9 | 9 |
| Option panel | **7** (N3) | **7** (N3, N4) | 8 | 8 |
| Options at S and L (zeros on, lengths shorter, levels 3 / 1 / 0) | 9 | 7 / 8 | 8 | 9 |
| Option `notation: across` (sub_50, sub_100, sub_2d_1d) | **4** (H2) | 7 | **6** (H13) | 7 |
| Side anchors at L (sub_50 ×6, sub_100k ×2) | 8 | 7 / 8 | **6** (H13) | 8 |

**What would raise each criterion to 10:**
- C1: fix N3, N4, N6, N7 and N8.
- C2: fix N1, and N3's untrue text.
- C3: fix N2 and N5.
- C4: draw the "line up" vocabulary picture as a stack (N6), and fix N4.

What I measured as right:
- **Content (probe of 2,520 items, 120 per skill × default / zeros on / lengths shorter, distinct seeds):**
  - 0 items regroup.
  - 0 are not on the kit `stack` cell.
  - 0 keys are wrong.
  - Minuends stay in band.
  - Zero cases are 9/120 (sub_50) and 8/120 (sub_100) with zeros off, and 120/120 from 3 digits with zeros on.
  - `sub_2d_1d`: b = 1 on 11/120, minuends 25-99, and "Subtract." on every role and host.
- **Answer box widths:** a segment is 5.36 mm at S, 7.37 at M and 9.38 at L (TY-21 is met). The key glyph has 0.84 mm clearance at S.
- **Heads:** 0 overlaps at any size. The smallest gap between heads is 0.74 mm at S, 1.45 at M and 1.34 at L.
- **Screens (every host):** the ones box is focused first, the instruction is "Subtract.", and nothing scrolls horizontally. At 390 the 6-digit stack has 11 px on each side.
- **ws-print-lint:** S and M are clean. At L, the only findings are Mixed-practice L-DENSITY ×12 on the 2-digit skills, the same count as the approved `sub_100_regroup` (class d). `ws-providers-unit` is OK.

## Defects

**N1 · C2 major (−1, to 7) · PATTERN · the 2-digit dealer skews and repeats items (sub_50, sub_100, sub_2d_1d).**
- **Where:**
  - `render-r2-S/subtraction__sub_50_no_regroup/independent-key-p1.png`: minuend 49 four times out of 20, answer 22 four times.
  - `render-r2-S/subtraction__sub_100_no_regroup/independent-key-p1.png`: 79 three times, and seven minuends repeat.
  - `render-r2-S/subtraction__sub_2d_1d/mixed-practice-p1.png`: 15 of 20 minuends end in 8 or 9.
  - `worksheet-1280.png` (sub_50): 4 of 6 minuends end in 9, and 29 appears twice.
- **Observed (probe):**
  - The top ones digit is 9 on 39/120 items (sub_50, sub_100) and 43/120 (sub_2d_1d). A uniform draw over the valid pairs gives about 22 %.
  - sub_50: minuend 49 on 19/120 items (uniform over pairs gives 11 %), and answer 11 on 24/120 (uniform gives 11 %).
- **Cause:** the fix-r1 dealer draws the bottom digit first, uniform 1-8, and then the top digit uniform above it. That pushes the top digit toward 9 and the column difference toward 1. On top of that, the one zero item is placed by `state.itemIndex % 10 === 7`, so it always lands on item h or r. That breaks LESSONS_LEARNED L10: "never from itemIndex % n".
- **Fix (`gen-operations.js` `_subNoRegroupPair`, the 2-digit branch):**
  - Draw the pair uniformly from the valid set: top ones digit 2-9, bottom ones digit 1..top−1, and the same for the tens. Keep the b = 1 halving for 2d − 1d.
  - Cap a page at 2 copies of any minuend and 3 of any answer (page-deal).
  - Choose the position of the 1-in-10 zero item with the seeded rng.
- **Check:** a content-audit predicate over 120 seeded items: the top-digit-9 share is at most 25 %, no minuend is above 12 %, and the zero item's position varies across 5 seeds.
- **Machine check:** none exists. It could have been caught, and the predicate above is the proposal.

**N2 · C3 critical (H13, cap 6) · SPACE · the Warm-up fact cell sits in a row sized for a taller item (every lesson, S and L).**
- **Where:**
  - `render-r2-S/subtraction__sub_50_no_regroup/lesson-p2.png`, cell a "7 − 3 = ___" beside the place-value cell.
  - `render-r2-L/subtraction__sub_1m_no_regroup/lesson-p2.png`, cell b "10 − 8 = ___".
- **Observed (DOM probe, `render-r2-S/probes/warmup-band-probe.txt`):** the empty band under the content is 58-59 % of the cell height on the 2-digit lessons, 43-44 % on sub_1k and sub_10k, and 56-59 % on sub_1m. On the approved `sub_100_regroup` Warm-up the band is 38 %, because its facts are drawn stacked.
- **Not engine class (a):** class (a) covers Practice cells pinned in 2 columns. This band comes from the lesson data the pilot chose: `facts10` drawn across in `prereqs.js`, mixed into a row with stacks and place-value items.
- **Fix:**
  - In `js/modules/lessons/prereqs.js`, draw the facts10 Warm-up items stacked, as `sub_100_regroup` does. Or deal two across facts and keep them in their own row.
  - Or, in the lesson composer (`sheet/roles/lesson.js`, the Warm-up grid), size the Warm-up rows per item kind.
- **Check:** extend `ws-print-lint` L-DENSITY H13 to lesson Warm-up cells. Today it reports 0 findings on these pages, so the lint does not measure them.
- **Machine check:** it should have been caught, by L-DENSITY H13. The gap is the lint's scope.

**N3 · C1 major (−1, to 7) and C2 (−1, to 7) · UNTRUE_TEXT · the option panel's Support-level help is untrue (all seven).**
- **Where:** `render-r2-L/panel/subtraction-*.png`.
- **Observed:** the help says "Always stacked from within 1,000 up: the columns line the places up. 3 traces the answer, 2 adds the place heads, 1 is the bare column."
  - Level 2 is not offered.
  - Level 1 prints the heads, and level 0 is the bare column.
  - On sub_50 and sub_100, "Always stacked from within 1,000 up" sits right above an Across option.
- **Cause:** the AP4 loop in `skill-options.js` (about lines 3398-3407, `_ap4Patch(key, 'level', … helpShort …)`) overwrites `_subNrLevel()`'s own help on these ids.
- **Fix:** in that loop, skip the `level` helpShort patch when the id is a no-regroup kit id (`op === 'sub' && rg === 'no_regroup' && max >= 50`). Or write the help as: "3 traces the answer, 1 prints the place heads, 0 takes them away; the answer boxes stay at every level."
- **Check:** an ws-options-verify predicate: the level help names exactly the offered levels, and the level that turns heads off.
- **Machine check:** it could have been caught by a "text names only offered values" check (OC3 family). None exists.
- **Also stale:** `js/modules/skill-options-derived.js` still lists `level: [3,2,1]` for these skills. Re-run `ws-options-derive`.

**N4 · C1 critical (H2, cap 4), C3 critical (H13, cap 6) · CLIP_OVERLAP · the "Across" option breaks the page (sub_50, sub_100, sub_2d_1d).**
- **Where:**
  - `render-r2-S/opt-across/subtraction__sub_100_no_regroup/independent-key-p1.png`.
  - `render-r2-S/opt-across/subtraction__sub_2d_1d/independent-p1.png`.
- **Observed:**
  - "= ___" wraps, so the answer line sits under the equation instead of after "=".
  - On the key, the answer digits overprint the subtrahend ("62" over "26", "51" over "38").
  - About 70 % of every cell is empty.
  - S prints 12 to 16 items, where the stacked page prints 20.
- **Expected:** card section 7 says across belongs to the `sub-setup` rewrite page, not to these skills. Any option a skill offers must render a classroom-ready page.
- **Fix:** in `skill-options.js`, stop `_ap4First(key, _ap4OpsNotation(...))` for the no-regroup kit ids (sub, no_regroup, max ≥ 50). Or, if across stays, fix the equation cell so its slot stays on the line after "=", and size the cell to one line.
- **Check:** ws-options-verify renders every offered value through `buildSheet` and print-lint must pass. That would also catch the key overprint (L-OVERFLOW / ILLEGIBLE on key digits).
- **Machine check:** it should have been caught. ws-options-verify checks the promise, not the rendered page (the same gap as D6).

**N5 · C3 critical (H13) · SPACE · side anchors at L (sub_50 ×6, sub_100k ×2).**
- **Observed:** `ws-print-lint --anchors side --size L` gives "one empty band … 32 % of the cell width: the content is pinned to one side". The approved `add_100_regroup`, `add_1k_regroup`, `sub_100k_regroup` and `sub_1m_regroup` give 0 at L.
- **D12 status:** fixed on sub_1m (0 at L), but the same class now shows on sub_50 and sub_100k. Not engine class (a): the pin is at S only, and no sibling reproduces it at L.
- **Fix:** in `sheet/anchors.js`, size the side-anchor problem column from the section's widest stack (tracks plus separators, the `wide` flag), and centre the stack in the remaining cell width.
- **Check:** `ws-print-lint --anchors side --size L` gives 0 H13 on all seven.
- **Machine check:** caught by L-DENSITY, but the precritic matrix pin did not list the row.

**N6 · C1 major at L for 5-6 digits (−1, to 7); C2 minor elsewhere · VISUAL_DESIGN · the vocabulary picture for "line up" is an across expression.**
- **Where:** `render-r2-L/subtraction__sub_1m_no_regroup/lesson-p2.png`. There, "486,759 −" / "35,247" wraps with a dangling minus, left-aligned off its dot and crowding the "H T O" picture.
- **Observed:** on every lesson, "line up" is pictured as "47 − 23" or "4,867 − 352", where nothing is lined up. On the 4-6 digit lessons, "place" is pictured as "H T O".
- **Fix:** in `prereqs.js` `NR_VOCAB_2` / `NR_VOCAB_BIG`, draw "line up" as a small two-row stack (a picture kind that draws a stack). Picture "place" with the lesson's own heads (Th H T O …).
- **Check:** a lesson-vocab lint: no picture text wraps, and every picture centres on its dot.

**N7 · C1 minor · STEPS_LAYOUT · a line breaks inside an equation in the anchor's step 3.**
- **Where:** at L, lesson-p1 for sub_1m: "4 −" / "3 = 1.".
- **Fix:** in `columnSubNoRegroup` (`providers/subtraction.js`), join the parts of each "a − b = c" with U+00A0.

**N8 · C1 minor · CLIP_OVERLAP · 5-6 digit heads are tight at S.**
- **Observed:** HTh and TTh are 0.74 mm apart, so they read as one run ("HThTTh"). D7 (overlap) is fixed.
- **Fix:** a 1 mm minimum head gap (`HEAD_TRACK_EM.S` about 1.25 em once N5 frees the side-anchor width). Add the check as a print-lint L-OVERLAP margin.

**Not counted (as briefed):** the `sub_2d_1d` Mixed-practice section heading still reads "Practice" (`render-r2-S/subtraction__sub_2d_1d/mixed-practice-p1.png`).

**Out of scope, noted:**
- The legacy print path (`render-r2-L/screens/*/print-p1.png`) clips the right-hand column at the page edge.
- The fix round changed shared engine files (`stack.js`, `layout.js`, `screen-cell.js`, `compose.js`, `practice.js`). The `layout.js` section track now reads `fp.wide` for every stack in a section, so a mixed section that holds a wide-track item widens its neighbours. The siblings I rendered show no change, but the lead should re-run the sibling matrix.

## D1-D12 verification

| r1 | Claimed fix | My check | Status |
|---|---|---|---|
| D1 zero cases flood 2-digit pages | bottom-first dealer, 1 in 10 | zero cases 9/120 (sub_50), 8/120 (sub_100), 0/120 (sub_2d_1d) | **Fixed**, but the new dealer brings N1 (skew, itemIndex % 10) |
| D2 no heads by default | heads at level 1, fade at level 0 | heads on every default cell on paper and every host; level 0 removes them, boxes stay (`render-r2-L/opt-level0`) | **Fixed**; the panel help contradicts it (N3) |
| D3 boxes 4.06 mm at S | wideTracks 0.95 em | segment 5.36 / 7.37 / 9.38 mm at S / M / L | **Fixed** |
| D4 no lesson data | LESSONS entries for the seven | Warm-up deals no regrouping (rung below plus facts10); Steps box matches the items; anchor is subNoZero (37 − 16, 448,835 − 323,421) with heads | **Fixed**; new N2 and N6 |
| D5 screens from 4 digits | binaryParts reads commas | "Subtract." on every host, ones box focused (probe), 390 px: 11 px padding at 6 digits | **Fixed** |
| D6 band option offered | removed | no "Numbers to" on any panel | **Fixed**; but the Across notation is offered and broken (N4) |
| D7 heads collide at 5-6 digits | wider head tracks | 0 overlaps; minimum gap 0.74 mm at S | **Fixed** (N8 nit) |
| D8 preset narrow set / instruction | minuends from 21, b = 1 halved, presetId match | b = 1 on 9 %, minuends 25-99, "Subtract." on every role and host | **Fixed** (heading excluded, still seen) |
| D9 wrongAnswer faults | fits strip, inside 0 only, skipped-place | 9752 − 6231 gives only skipped-place 3551; 420 − 110 has no dropped-zero; 4508 − 2302 gives dropped-zero 226; providers-unit OK | **Fixed** |
| D10 worked steps thin | 4 steps, step 3 states every column, comma | 2-digit: 4 steps; 6-digit step 3 lists all four sums and rings them; anchor answer "125,414" | **Fixed** (N7 nit) |
| D11 zeros label promises n − n | relabelled | label "405 − 203, 586 − 230, 586 − 236, 486 − 452"; every kind is dealt (zeros on: 120/120 zero cases) | **Fixed** |
| D12 sub_1m side anchors at L | anchors width | sub_1m 0 H13 at L | **Fixed for sub_1m**; it recurs on sub_50 ×6 and sub_100k ×2 (N5) |

## Engine-class rulings

I re-measured with `design/audit/runs/pilot-su-c/rate.cjs`. The cases are in `render-r2-S/probes/cases.json` and the output in `render-r2-S/probes/rate.txt`.

| Class | Engine class? | Same rate as the approved siblings? | My measurement |
|---|---|---|---|
| (a) H13, forced 2 columns | **Confirmed** | **Yes**, against the subtraction siblings | M, more-practice, `--columns 2`: sub_50 16/16 = 1.00, sub_1k 16/16 = 1.00; sub_100_regroup 12/12 = 1.00, sub_1k_regroup 12/12 = 1.00. add_1k_regroup 0/12: the addition stack is not pinned. The status table's independent-role figure (0.50 on both) is the same equivalence. |
| (a) H13, side anchors | **Confirmed at S** | **Yes** at S; **rejected at L** (N5) | S: sub_50 8/16 = 0.50, sub_2d_1d 8/16 = 0.50; add_100_regroup 6/12 = 0.50, add_1k_regroup 6/12 = 0.50. At L: ours sub_50 ×6 and sub_100k ×2, against siblings 0. |
| (b) TY-11 7 pt step numbers (`anchors.js` lineHtml) | **Confirmed** | **Yes**, per step number | M, `--anchors sections`: sub_1k 16 findings in 4 anchor cells (4 steps each), add_1k_regroup 6 in 2 (3 each), add_10k_regroup 8 in 2 (4 each). Every step number is flagged on all three. Ours shows more because it has more anchors and steps, not a higher rate. |
| (c) fact-rows ILLEGIBLE / PG-12 | **Confirmed** | **Not the same per cell; the same per full-length item.** I accept the lead's statement. | S: ours sub_100k 128/128 = 1.00 (272 findings); sub_100k_regroup 92/128 = 0.72 (198); sub_1m_regroup 112/128 = 0.88 (224). Looking at `render-r2-S/siblings/fr-S/subtraction__sub_100k_regroup/fact-rows-p1.png`, every 5-digit-under-5-digit cell on the approved sibling has its "−" run into the neighbouring cell. The cells it is not flagged on are those with a 4-digit subtrahend. Ours always deals full-length subtrahends (the card's band rule), so 100 % is the same defect at the same per-item rate. My ruling: it is engine debt in `fact-rows.js` (the mixed-pages lane), and it costs these skills nothing. Fact rows is also outside the RUBRIC scope line. |
| (d) sections / mixed composer | **Confirmed** | **Yes** | L Mixed practice L-DENSITY: ours sub_50, sub_100 and sub_2d_1d ×12 each; approved sub_100_regroup ×12. The pages look the same (2 × 3 cells in a nominal 4 × 3 grid, `render-r2-L/siblings/subtraction__sub_100_regroup/mixed-practice-p1.png`). |
| fact-probe chunking | **Confirmed** as the same engine path, on code reading: `fact-probe.js`; the status file shows sub_1m_regroup the same | Not re-rendered (layout-timed is outside the RUBRIC scope line) | — |

The findings outside these classes cost points: N1-N8 above.

## Pages graded in full, and pages batch-read

**Graded in full** (every cell at full scale; 57 pages, well over 1 in 5 of the S and L print pages):

- S:
  - `sub_50`: independent, independent key, lesson p1-p3, card-390, worksheet-1280.
  - `sub_100`: independent key.
  - `sub_2d_1d`: independent key, quiz-1280.
  - `sub_1m`: independent key, lesson p2, card-390, card-820, worksheet-1280.
  - `sub_10k`: quiz-1280.
  - Options: across key (sub_100), across pupil (sub_2d_1d).
- L:
  - `sub_50`: lesson key p2.
  - `sub_100`: mixed practice.
  - `sub_2d_1d`: independent.
  - `sub_1m`: independent, lesson p1, lesson p2, legacy print-p1 (out of scope).
  - Options: zeros-on key (sub_1k), lengths-shorter (sub_10k), level 3 (sub_100k), level 0 (sub_1k).
  - Option panels: sub_50, sub_1m (the other five read as text).
  - Siblings: `sub_100_regroup` Mixed practice; `sub_100_regroup` S lesson p2; `sub_100k_regroup` S fact rows.
- M (spot check): `sub_100k` test key.

**Batch-read for C1 and C2** (contact sheets in my scratchpad: every pupil page per skill per size, 7 pages each):
- S: `sub_2d_1d` (pupil).
- L: `sub_50`, `sub_10k`, `sub_1k` (pupil).
- Every key at S and L was checked against the probe: 0 wrong answers in 2,520 items.

**Machine reads, all in `render-r2-S/probes/`:**
- ws-print-lint over 7 skills × 5 roles at S, M and L.
- Side anchors at L for ours and 4 siblings.
- The content probe (2,520 items).
- The DOM probe: box widths, glyph clearance and head gaps at S, M and L, levels 1 and 3.
- The screen probe: focus, instruction and 390 padding on 6 skills × 3 widths.
- The Warm-up band probe: ours and 3 approved siblings.
- rate.cjs.

## Files

- `grades-r2.jsonl`: one object per skill (RUBRIC §6), with per-version scores, caps and defects (class and rule_ids).
- `render-r2-S/`, `render-r2-L/`, `render-r2-M/`: the renders.
  - `render-r2-L/screens/`: the run without --roles.
  - `render-r2-L/opt-*` and `render-r2-S/opt-*`: the option renders.
  - `render-r2-L/panel/`: the option panels.
  - `*/siblings/`: the approved siblings.
  - `render-r2-S/probes/`: the probe scripts and their outputs.
- The S queue for levels 1 and 0 was still rendering when this report was written. Level 0 and level 1 were graded from the L renders and the DOM probe.
