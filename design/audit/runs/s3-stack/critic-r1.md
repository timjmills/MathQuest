# Critic r1: lane S3 (stack engine debt + the SU-C pilot)

Critic: independent, mq-opus-medium, round 1, 2026-10-24, 09:42-12:13 UTC. Branch `claude/sweet-newton-c8wrv1-wip-s3-stack`. I did not build any of this. I edited no source file and made no commit; everything I wrote is under `design/audit/runs/s3-stack/`.

**Commits graded.** The full render set (`render-r1-S/M/L`, every role, every screen host, the anchors, the options, the panels, the probes) was made at **7ca4631** (85c8b6e code). The orchestrator merged main into the branch at 11:18 (**3f7c3a7**, then 2be17d6: CL-4b centring of write-above stacks in `sheet-kit.css` / `sheet/index.js`, big regroup facts centred in `roles/fact-rows.js`). I re-rendered and re-checked on **2be17d6** (`render-r1b/`): the regroup siblings on side and sections anchors at S and L (add_100_regroup, sub_100_regroup, sub_1m_regroup, add_10k_regroup; ws-print-lint side/sections S and L: 0 findings), fact rows and Independent for sub_50 / sub_100k / sub_1m / sub_2d_1d / sub_100k_regroup at S and L, and the screen hosts of sub_100k and sub_1m. The no-regroup pilot page I spot-confirmed is byte-identical (`render-r1b/S-pilot/subtraction__sub_50_no_regroup/independent-p1.png` = `render-r1-S/.../independent-p1.png`). Every finding below holds on 2be17d6.

Read before grading: CLAUDE.md, RUBRIC (criteria, caps, scope notes, "How a page counts as graded"), WDS CL-4b / INK-31, the r2 critic report (format model), `design/status/s3-stack.md`, the STATUS owner rulings of 2026-10-23/24 on anchors and twins.

## Verdict: FAIL

Most of the lane's work holds up. The r2 pilot defects N1-N5, N7 and N8 are fixed, and the r2 anchor items (add_10k side L, add_10k sections S spill, add_50 side M, the missing bottom frame, twins on the sections band, E10 grey) are fixed. The Warm-up band is measured at 29 % or less on all seven lessons at S, M and L. Four defects still put a 7 on a graded version:

- **A1.** On the band-above anchor pages (shade_fraction, money_count, place_value_10x), the "Model" tab prints over the first line of the worked example. C1 7.
- **S1.** On the sub_1m practice card at 390 px, the 6-place stack runs into the cell frame. C3 7. This is a regression: r2 measured 11 px on each side.
- **N1b.** The sub_2d_1d dealer gives b = 1 on 17.5 % of items, and up to 6 of 20 on a page. C2 7.
- **N6b.** On the sub_1m lesson at L, the vocabulary picture for "place" wraps ("HTh TTh Th H T" / "O"). C1 7. This is r2's N6 check failing ("no picture text wraps").

## Score table (minimum per criterion, over every graded version)

Graded versions follow the RUBRIC scope note (owner, 2026-09-26). Those are Practice (Independent, More practice), Mixed practice, Test (with keys), the Lesson packet, the three screen hosts, the option panel, every offered option value, and the anchor pages the brief names. Stand-alone Guided, Worked example, Review, Opener, Pre-skill check, Error analysis, True or False?, Reason It, Stretch, Fact rows and Fact probe are outside the bar. What I saw on them is under "Not counted".

| Skill | C1 | C2 | C3 | C4 | Where the minimum comes from |
|---|---|---|---|---|---|
| sub_50_no_regroup | 8 | 8 | 8 | 8 | lesson (C4 8, accent and model text as ruled); anchors (C2 8, near-identical models, nit M1) |
| sub_100_no_regroup | 8 | 8 | 8 | 8 | lesson; anchors side L (C1 8) |
| sub_1k_no_regroup | 8 | 8 | 8 | 8 | lesson |
| sub_10k_no_regroup | 8 | 8 | 8 | 8 | lesson |
| sub_100k_no_regroup | 8 | 8 | 8 | 8 | lesson; side anchors L |
| sub_1m_no_regroup | **7** | 8 | **7** | 8 | lesson L vocabulary wrap (N6b); card-390 overflow (S1) |
| sub_2d_1d (preset) | 8 | **7** | 8 | 8 | dealer: b = 1 skew and near-identical rows (N1b), on print and screen |
| Anchors: add_50_no_regroup, add_10k_regroup, add_100_regroup, sub_100_regroup, sub_1m_regroup (side, sections, S/M/L) | 8 | 8 | 8 | 8 | side L pupil cells (C3 8, see O1); add_10k side S/L 3 or 2 pairs a page |
| Anchors band-above: shade_fraction, money_count, place_value_10x (S, L) | **7** | 7* | 8 | 8 | Model tab overprints the first line (A1). *C2 7 is partner content (the model text), not counted against the lane; see "Not counted" |

Per version (the same for all seven skills unless the row says otherwise):

| Version | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| Independent, More practice, Test (+ keys), S | 9 | 8 (2d_1d 7, N1b) | 8 | 9 |
| The same at L, and M (spot check) | 9 | 8 (2d_1d 7) | 8 | 9 |
| Mixed practice, single skill, S / M / L (+ key) | 9 | 8 (2d_1d 7) | 8 (L-DENSITY ×12 at L is class (d), as r2 ruled; same as approved sub_100_regroup) | 8 |
| Lesson packet p1-p3 (+ key), S / M / L | 8 (sub_1m L 7, N6b) | 8 | 8 | 8 |
| card-1280 / 820 / 390, worksheet-1280, quiz-1280 | 9 | 8 (2d_1d 7) | 9 (sub_1m card-390 **7**, S1) | 9 |
| Option panel (7 skills) | 9 | 9 | 8 | 8 |
| Options at S and L: zeros on, lengths shorter, level 3, level 0, `notation: across` (dropped) | 9 | 8 | 8 | 9 |
| Side / sections anchors, pilot and siblings, S / M / L | 8 | 8 | 8 | 8 |
| Band-above anchors (shade_fraction, money_count, place_value_10x) | **7** (A1) | 7* | 8 | 8 |

**What would raise each criterion to 10:**
- C1: fix A1 and N6b, and draw the sub_2d_1d screen chip with the preset's name (nit N9).
- C2: fix N1b, and stop dealing near-identical anchor models (M1).
- C3: fix S1.
- C4: fix CL-4b on the lesson Guided cells (L1, the lint gate).

What I measured as right:
- **Content.** I probed 2,520 generator items (120 per skill × default / zeros on / lengths shorter, distinct seeds; `probes/content-probe.json`):
  - 0 items regroup.
  - 0 are off the kit `stack` cell.
  - 0 keys are wrong.
  - Minuends stay in band.
  - With zeros on, 3 digits and up give 92-98 / 120 zero cases.
- **N1 (pages).** I dealt 8 seeded Independent pages per skill (`probes/page-probe.json`):
  - sub_50 and sub_100: no minuend prints more than twice, no answer more than 3 times, the zero item's position varies with the seed, and a top ones digit of 9 is 16-19 %.
- **Keys read by eye:** every key I read was right (sub_50 S, sub_100k S, sub_1m S and L, sub_10k L, sub_2d_1d S and L, sub_1k zeros S, sub_10k shorter S, sub_1m zeros S, sub_100 test L).
- **Panel** (`panel/*.png`, `panel/panel-text.txt`):
  - No "Across" control on any of the seven.
  - The level help reads "3 traces the answer, 1 prints the place heads, 0 takes them away; the answer boxes stay at every level", which is true of what level 3 / 1 / 0 print (`render-r1-S/opt-level3`, `opt-level0`).
  - `--opts notation:[across]` is dropped by normalizeOptions, and the page stays stacked.
- **Heads (N8):** HTh / TTh / Th are visibly separate at S on every 6-digit page.
- **Equations (N7):** step 3 on the sub_1m lesson at L breaks between equations, never inside one.
- **The vocabulary "line up" picture (N6)** is a small stack on every lesson.
- **Warm-up (N2):** `lesson-warmup.check.cjs --max 0.3` (the RUBRIC's 30 %, stricter than the check's own 40 % default) gives OK on all 9 skills at S, M and L. The worst band is 29 % (sub_100 facts at S, M and L), and the width band is 19 % at most (`probes/lesson-warmup-030.txt`).
- **anchors.check:** OK (221 known WARN, none on the pilot rows that gate).
- **ws-print-lint side and sections, S / M / L:** 0 findings on all 12 skills, except add_100_regroup side M ×8 H13. That sibling is not one of the pilot skills, and the finding sits in its own pupil cells (31 %). Re-run on 2be17d6: 0.

## Defects

**A1 · C1 major (−1, to 7) · CLIP_OVERLAP · the "Model" tab prints over the first line of a band-above worked example (shade_fraction, money_count, place_value_10x).**
- **Where:**
  - `render-r1-S/band-above/fractions__shade_fraction/independent-p1.png` (crop: `contact/crop-shade.png`): the numerator "1" of the model's ½ is cut by the tab.
  - The same file at L.
  - `render-r1-L/band-above/measurement__money_count/independent-p1.png`: the tab covers the model coin's outline (`contact/crop-tabs.png`).
  - `render-r1-S/band-above/placevalue__place_value_10x/independent-p1.png`: "2 × 10 =" sits right under the tab, touching it.
- **Owner ruling met:** the worked example sits in a band ABOVE the problems on all three, at S and L.
- **Cause:** the band's first content row starts at the band's top pad, not below the tab keep-out (CL-40 / CL-41). The stack bands never show this, because a stack starts with its heads row and a margin.
- **Fix:** in `js/modules/sheet/anchors.js`, start the band's content below `.ws-modeltab`'s bottom plus 1 mm, as L-TOPSTART already does for cells (`lab.getBoundingClientRect().bottom + 1 * PX`).
- **Check:** anchors.check E-rule: no inked descendant of `.mq-anchor-band` intersects the `.ws-modeltab` box.
- **Machine check:** none exists. L-OVERFLOW does not test overlap between siblings.

**S1 · C3 major (−1, to 7) · CLIP_OVERLAP · sub_1m practice card at 390 px: the stack overruns its cell (regression).**
- **Where:**
  - `render-r1-S/subtraction__sub_1m_no_regroup/card-390.png` and `render-r1b/screens/subtraction__sub_1m_no_regroup/card-390.png` (2be17d6). Crop: `contact/crop-390.png`.
  - Comparison: `contact/r1b-scr.png`, sub_1m beside sub_100k.
- **Observed:**
  - The answer rule runs past the cell's left frame.
  - The heads rule and the focused ones box touch the right frame (0 px).
  - The minus sits 12 px from the left frame.
  - r2 measured 11 px on each side at 6 digits. sub_100k at 390 and sub_1m at 820 / 1280 are fine.
- **Cause:** most likely fix r2 N8, which widens the HTh / TTh tracks at S to 1.3 em. The screen cell at 390 appears to inherit the wider tracks without the matching narrower operator track, or without re-fitting to the cell. I did not prove this; I found it from the timing and the geometry.
- **Fix:** in `js/modules/sheet/cells/stack.js` / `js/modules/screen-cell.js`, keep N8's head-track widening to print (or re-fit the stack to the cell's inner width on screen), so that at 390 the stack has ≥ 8 px on each side.
- **Check:** a screen probe for every stack skill at 390: the stack's bounding box is inside the cell's padding box. This is the r2 "390 padding" probe made a gate.
- **Machine check:** should have been caught. The r2 critic's 390 padding probe was never turned into a gate.

**N1b · C2 major (−1, to 7) · PATTERN · the sub_2d_1d dealer: too many "− 1" items, and near-identical runs.**
- **Where:**
  - `probes/page-probe.json`, 8 seeded Independent pages: b = 1 on 28 / 160 items (17.5 %), with 6 of 20 on two pages (seeds 11 and 88) and 2-3 on the rest.
  - The generator probe: b = 1 on 27 / 120 (22.5 %). The code comment and the r1 D8 fix say "about 1 item in 9", and r2 measured 9 %.
  - `render-r1-S/subtraction__sub_2d_1d/independent-key-p1.png` and the L key: the first row is 76 − 5, 75 − 3, 73 − 2, 66 − 2, 79 − 6, with answers 71, 72, 71, 64, 73, and 92 three times.
- **Cause:** in `_nr2Pair` (gen-operations.js), the b = 1 re-deal ("half the time") now sits on top of a uniform pair draw. The uniform draw already gives b = 1 its share of the 2d − 1d pairs, so the re-deal doubles it.
- **Fix:**
  - In `js/modules/gen-operations.js` `_nr2Pair` (lenB 1), drop the extra b = 1 re-deal, or set it so that b = 1 lands near 11 %.
  - Add the page cap: at most 2 "− 1" items in any 20.
  - Add a minuend-tens spread: no more than 3 consecutive items with the same tens digit.
- **Check:** extend the r2 N1 predicate to sub_2d_1d: b = 1 ≤ 12 % over 120 seeded items, ≤ 2 per 20 on a page.
- **Machine check:** none exists. The r2 N1 predicate was not built, and this is the gap.

**N6b · C1 major at L for 6 digits (−1, to 7) · VISUAL_DESIGN · the vocabulary picture for "place" wraps.**
- **Where:** `render-r1-L/subtraction__sub_1m_no_regroup/lesson-p2.png` (`contact/L1m-a.png`): "HTh TTh Th H T" / "O", left-aligned off its dot. sub_100k at L ("TTh Th H T O") and every S / M lesson fit on one line.
- **Fix:** in `js/modules/lessons/prereqs.js` `NR_VOCAB_BIG` and the lesson vocabulary picture renderer, add `white-space: nowrap` to the `text` picture kind, sized to fit (a smaller head size is fine; the heads are a label). Or picture "place" as the head row over a short rule, as the stack draws it.
- **Check:** the lesson-vocab lint proposed in r2 N6: no picture text wraps, and every picture centres on its dot. It still does not exist.

**L1 · gate (L-TOPSTART CL-4b), not counted · lesson Guided cells are centred, 4-5 mm below the top pad.**
- **Where:** ws-print-lint `--roles lesson`, S / M / L, all seven skills (2-6 findings each; `probes/lint-*-roles.txt`). The same on the stand-alone Guided page (×10-16, outside the bar).
- **Cause:** `js/modules/sheet/roles/lesson.js` (lines 1730-1744) marks every Guided item `mq-lvcenter`. That was an H13 measure written before CL-4b (owner, 2026-10-23) made top-of-box the default.
- **Why not counted:**
  - The approved siblings fail the same way at the same rate per cell: sub_100_regroup ×4 and add_100_regroup ×4 (`render-r1b/lint-sib-lesson-S.txt`, on 2be17d6).
  - The lead's 09:39 note names L-TOPSTART from main's CL-4b as lead-owned.
- **Fix (lesson.js, this lane's file):** apply `mq-lvcenter` only to write-above items (`data-ws-writeabove`), and let the others take the CL-4b top default.

**M1 · C2 minor (nit) · near-identical anchor models (sub_50).**
- **Observed:** on sections S, the two model bands are 23 − 11 and 23 − 12 (`contact/ASec-b.png`). Side S twins 1-2 are 23 − 11 and 23 − 12, and 2 of 8 twins are 40 − x0.
- **Fix:** in the anchor example dealer, require different minuends, and use the zero twin only beside a zero problem.

**N9 · C1 nit · the sub_2d_1d screen chip shows the host label "Subtract within 100"** (`render-r1-S/subtraction__sub_2d_1d/card-390.png`). The paper title is right.

**O1 · observation, not counted · side anchors at L leave the pupil cell mostly empty.**
- **Observed:** the bottom band under a top-aligned problem is 58 % (sub_50, sub_1m) and 72 % (add_50) of the pair row, which the twin sizes. sub_1m side L prints 2 problems a page; add_10k side L prints 2.
- **Why not counted:** WDS CL-4b says the band under a top cell is writing room and does not count towards H13, and ws-print-lint follows it.
- **For the owner:** a teacher may still read this as wasted paper. One option: put two pupil problems beside one twin when the twin is more than twice the problem's height.

## r2 defect verification

| r2 item | Status | Evidence |
|---|---|---|
| N1 dealer skew / repeats | **Fixed** for sub_50 / sub_100 | page probe: minuend ≤ 2, answer ≤ 3 per 20, zero position varies, top-9 16-19 %; but sub_2d_1d b = 1 skew (N1b) |
| N2 Warm-up empty band (H13) | **Fixed** | lesson-warmup check at 0.3: worst 29 % S/M/L; at S/M the 2-digit facts sit in their own row |
| N3 untrue level help | **Fixed** | panel help names 3 / 1 / 0 truly; `skill-options-derived.js` still lists `level: [3,2,1]` for these ids (not shown, own level wins; re-run ws-options-derive) |
| N4 Across option | **Fixed** (removed) | no Across control on any panel; `notation:across` is dropped, page stays stacked |
| N5 side anchors at L H13 | **Fixed** (width band) | lint side L 0 findings; vertical band is exempt by CL-4b (O1) |
| N6 "line up" vocab picture | **Fixed**; new N6b | "line up" is a stack on every lesson; "place" wraps on sub_1m L |
| N7 line break inside an equation | **Fixed** | sub_1m lesson p1 at S and L |
| N8 5-6-digit head gap | **Fixed** on paper; S1 at 390 is likely its side effect | heads separate at S |
| add_10k side L (one pair a page / 46 % twin) | **Fixed** | 2 pairs, twin band ≈ 27 % |
| add_10k sections S (lone block spill) | **Fixed** | one page, band + 8 problems |
| add_50 side M (second page) | **Fixed** | 8 pairs on one page |
| missing bottom frame (add_50 side S, add_10k sections L) | **Fixed** | frame present on both |
| twins match the pupil's problem on every page type incl. sections band | **Met** | heads, regroup boxes and answer boxes match on side and band, pilot and siblings |
| E10 grey newest marks on twins | **Met** | the newest step's digits are grey on every twin and band state |
| band-above for shade_fraction / money_count / place_value_10x | **Met**, but A1 | band above at S and L |

## Not counted (outside the RUBRIC scope, partner-owned, or a lead ruling)

- **Fact rows at S (10 × 9), sub_50 / sub_100 / sub_2d_1d:**
  - ws-grade-render reports OVERFLOW.
  - The last row's cells end about 2 mm under the rule, so there is no room to write answers 81-90, and on the key they print below the grid (`contact/crop-fr.png`, `crop-frk.png`).
  - This is the lead's known capacity item (cells 1 mm short with the 4.5 mm tab clearance), and it still holds on 2be17d6.
  - Fact rows is outside the bar, but in a counted page this would be H9 (C1 ≤ 5).
- **Reason It at M / L, 5-6 digits:** L-OVERFLOW 2.3-10.4 mm (PG-12).
- **Stand-alone Worked example (scripted-model):** steps 1-3 show empty answer boxes. The state never shows the digit the step writes (`contact/s50S-a.png`).
- **Error analysis:** all three wrong answers on a page come from the same misconception ("added instead"), and the cells are 41 % empty below. Error analysis is out of the bar (owner, 2026-09-26).
- **Guided (stand-alone):** the page ends at about 60 % height.
- **Partner content on the band-above pages:**
  - shade_fraction: "Shade 1 parts.", a slashed "1/2" in the step text, and the model ½ beside problems in sixths or fifths.
  - money_count: the model is a single 1-cent coin ("Count on: 1"), beside problems of 3-6 coins.
  - Fractions and measurement providers own these.
- **sub_1m_regroup side:** no examples ("no step-by-step steps yet"). That is sibling data.
- **algebra:tape_diagram Answer-line overflow on mixed rows:** not seen on my renders (I rendered no partner set).

## Pages graded in full, and pages batch-read

**Graded in full** (every cell at full scale; 68 pages, more than 1 in 5 of the in-scope print pages):

- **S:**
  - sub_50: independent, independent key, lesson p1, lesson p2, lesson p3, lesson key p2, mixed practice, test, card-1280, card-390, worksheet-1280, quiz-1280.
  - sub_100k: independent, independent key, card-390.
  - sub_1m: independent, independent key, lesson p1, lesson p2, lesson p3, mixed practice, card-390, card-820, quiz-1280, worksheet-1280.
  - sub_2d_1d: independent key, mixed practice, lesson p1, lesson p2, lesson p3, test key, card-390.
  - sub_100 / sub_10k: lesson p2.
  - Options: across (sub_100), level 3 (sub_50), level 0 (sub_1k), zeros key (sub_1k, sub_1m), shorter key (sub_10k).
  - Anchors side: add_50, add_10k, sub_50, sub_1m, sub_100_regroup, sub_1m_regroup.
  - Anchors sections: add_50, add_10k, sub_50, sub_1m.
  - Band-above: all three.
- **L:**
  - sub_50: independent, mixed practice, lesson p1, lesson p2, lesson p3, test key.
  - sub_100: lesson p2, test key.
  - sub_1k: lesson p1, lesson p2, mixed key.
  - sub_10k: independent key, mixed, test, lesson p2, lesson p3.
  - sub_100k: lesson p2, independent.
  - sub_1m: lesson p1, lesson p2, lesson p3, independent key.
  - sub_2d_1d: lesson p2, independent key.
  - Anchors side: add_50, add_10k, sub_50, sub_100k, sub_1m, sub_2d_1d, sub_100_regroup, sub_1k.
  - Anchors sections: add_10k.
  - Band-above: all three.
- **M (spot check):** sub_50 independent key and lesson p2; add_50 side; add_10k sections at L.
- **Panels:** sub_2d_1d and sub_1m as images; all seven as text.
- **On 2be17d6:** sub_100_regroup and add_10k side S, sub_1m and sub_100k card-390.

**Batch-read for C1 and C2** (contact sheets in `contact/`): every other S page of sub_50 (opener, scripted model, guided, error analysis, review, test, mixed, true/false, reason it, stretch, pre-skill check, word problems, fact rows, fact probe). The remaining keys were checked against the generator probe.

**Machine reads:**
- ws-print-lint `--source kit`: 7 pilot skills × 11 roles at S / M / L; side and sections anchors at S / M / L on 12 skills; and on 2be17d6 the regroup siblings plus the sibling lessons.
- `js/modules/sheet/anchors.check.cjs`.
- `lesson-warmup.check.cjs` at 0.3 and at its default.
- The content probe (2,520 items) and the page probe (32 pages).
- Pixel band scans (`probes/rows.py`, `band.py`).

## Files

- `critic-r1.md` (this file) and `grades.jsonl` (one record per skill, plus the anchor sets).
- `render-r1-S/`, `render-r1-M/`, `render-r1-L/`: the renders at 7ca4631. `render-r1b/`: the renders on 2be17d6. `panel/`: the option panels.
- `probes/`: the probe scripts and their outputs. `contact/`: contact sheets and crops.
