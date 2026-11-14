# lf-roles critic r9 - two-step skills, shared page roles (independent critic, mq-opus-medium)

Date 2026-11-13. Graded commit: lane **693d19dbd** (as briefed). Test tree: lf-algebra 71d4e8ac7 + the lane, in a private
worktree at the critic's own merge commit 0ad4abcc1 (scratchpad `cr9/tree`; parents 1b0fbb6e6 + 693d19dbd; only conflict
`tests/fixtures/precritic/backtests.json`, no render code). Before tree: scratchpad/alg2base (71d4e8ac7 + bc32eecc9).

**Process note P1 (no verdict impact).** The shared scratch tree `alg2` was being edited while this round ran (uncommitted
`opener.js`, `ws-cell-checks.cjs`, `capacity.json`). The first cell-checks run there reported OVERFLOW 6.3 mm on
`multi_step_word_plain` opener M page 2. That came from the in-progress continuation title ("Guided Practice and Your turn"
moves the body top from 24 to 35 mm). It is **not** at 693d19dbd: the private tree measures the body at 24-274 mm and the band
bottom at 269.2 mm, and the printed PDF has 2 pages and is clean. Everything below was re-run on the private tree. Since then
the lane head has moved to 103901909 (577daee7e: the spill page keeps 7 mm in hand, plus a merge of master). That commit is
not graded here; see D3.

Sizes M and L. Hosts: print only (these are page-role changes).

## Verdict: FAIL

The round has three counted lf-roles defects, all on the Opener:
- **D1:** the Steps band at L is 32-46 % empty (H13).
- **D3:** spill page 2 leaves room for an Independent row empty on 2 skills at M.
- **D2:** the continuation header does not name the part (lead ruling 1).

Fixes 1, 2, 4 and 5 pass. On (a) the exemption is sound for every page it touches today, with a narrowing proposal. (b) and (c)
pass.

## The five fixes

| # | Fix | Verdict | Evidence |
|---|---|---|---|
| 1 | Lone one-row page held to its ink | **PASS** | 25 `mq-onerow` / `mq-inkrows` pages of the 7 skills (independent, more-practice, test, review, reason-it × M/L) probed in print media. Each is top-aligned, with the band under the work ≤ 29 %. Visual independent / test / review M strip 66 mm under a 116 mm story, L 41 under 132. |
| 2 | Guided 2 a page where they fit | **PASS** | I checked the builder's measurements (cell probe, print). Hinted try 133 mm M / 152 L. Plain try 84 M / 95 L (two need 190 + gap > 184 L body). Visual plain try 116 M / 132 L (two > body). Every lone story cell has ≤ 29 % under its ink (add_then_mult Model M 56.7 / 196.1 = 28.9 %). Letter M 2+2, L 1+2+2. Nit N1. |
| 3 | Opener spill to 2 pages | **FAIL** | Things that work: no overflow (cell-checks 0 on all 14 opener pages), the Model takes the full width, no blank cell, the PDF is 2 pages. Defects: D1 (L Steps band), D3 (M page 2 under-filled on add_then_div and mult_div_first), D2 (continuation header). |
| 4 | Reason It two-step: story once, A over B full width | **PASS** (column-story skills) | plain, Visual, mult_div_first, add_then_mult, add_then_div M/L: the story prints once with the response beside it, and A over B is full width. letter / estimate keep the frames layout with the story in each panel (the builder's stated scope; RI-DISTINCT, lf-algebra). See D4. |
| 5 | Review band held to its ink | **PASS** | Visual Review M/L: the one-story band is 26 % under the ink, top-aligned. div_facts_long review M and sub_2d_1d review L: see (b). |

## Findings

| Id | Page | Sev | Crit | Owner | Finding | Automatic check that catches it |
|---|---|---|---|---|---|---|
| **D1** | Opener **L** p1: plain, Visual, add_then_mult, add_then_div (46 %), letter (35 %), mult_div_first (32 %); estimate 19 % passes | major (H13, C3 ≤ 6) | C3 | **lf-roles** (opener.js r9 SPILL) | The two-column Steps band (`mq-stepszone height:${stepsH}mm`) is drawn at an ESTIMATED height: 50.1 mm with ink to 27.2 mm. `stepLines()` counts characters at 0.5 em in 93 − 16 mm, so at L text it predicts two lines per step ("Read it. What happens first?" = 28 chars > 24 per line) where one prints. At M the band is 30.1 mm, ink 24.1 (20 %). PNG `r9/critic/D1-*.png`. | **EB-BAND on strip bands**: ws-empty-band measures every `.ws-band` (Steps / Say / What's New), not just grid cells: ink-to-bottom ≥ 30 % of the band = FAIL. It passed today because EB-BAND reads cells only. Unit form: ws-roles-unit OPENER-SPILL asserts that `stepsH` ≤ the rendered `.mq-steps-rows` height + 4 mm at S/M/L. |
| **D3** | Opener **M** p2: two_step_add_then_div, two_step_mult_div_first | major (C3 7: an under-filled page where more fits) | C3 | **lf-roles** (opener.js `geometry` SPILL) | Page 2 holds only the Guided row, with about 40 % of the body white. The Independent row is sized as `lv1 = max(atLevel[1]) of ALL practice items + 1`, which includes the 3 spares the plan never draws (98.1 mm). The stories actually dealt measure 91.2 mm. Guided 133 + Independent 91.2 = 224 mm fits as plain M fits (135 + 93.2, which holds 1 Independent). Plan meta: add_then_div M `g 1, i 0`; plain M `g 1, i 1`. 577daee7e (7 mm in hand) makes this more conservative still, so the next round must re-check plain M too. PNG `r9/critic/D3-*.png`. | **SPILL-FILL** (ws-roles-unit, or EB-PAGE on opener p2): on a spill page 2, if the free height under the last row ≥ the SHORTEST undrawn practice item's level-1 measure + strip + 7 mm, FAIL. Size `iH` from the items that will be dealt (after the bestGeometry sort), not from the spares. |
| **D2** | Opener p2, every spill page (12 of 14 opener pages) | major (lead ruling 1, PT-OPN-10) | C4 7 | **lf-roles** | At 693d19dbd the continuation header is "Name ____" only. It does not name the part on the page ("Guided Practice" / "Your turn"); the band labels do. The builder's in-progress version adds a title and **overflowed plain opener M p2 by 6.3 mm** (P1). 577daee7e's 7 mm reserve addresses that; re-check. | **CONT-PART** (ws-roles-unit + ws-print-lint): a page with `.ws-cont` header whose role is opener carries a header title that names each band label on the page; plus the existing cell-checks OVERFLOW on the same page (it caught the in-progress overflow). |
| D4 | Reason It: letter L (unit word "crayons" across the A/B panel's right border); estimate M/L ("No", the "50" estimate box and the "Yes" circle cross the panel border) | major (C1 7: legible but struck by a rule) | C1 / C3 | **shared, pre-existing** (byte-identical on alg2base): the RI panel width (reason-it.js, lf-roles) is narrower than the frames / estimate template's natural width (lf-algebra) | Not counted this round: it is pre-existing, and the same pages already fail RI-DISTINCT (lf-algebra). It must be fixed before these RI pages can pass. cell-checks OVERFLOW misses it because it tests ink against `.ws-cell`, not the inner A/B panel. PNGs `r9/critic/D4-*.png`. | **OVERFLOW-PANEL**: ws-cell-checks OVERFLOW also tests every descendant's ink rect against its nearest bordered ancestor inside the cell (`.mq-ri-panel` / any element with a border), not only the cell. |
| N1 | Guided M, two_step_letter_equation | nit | C3 8 | lf-roles (guided.js count) | M deals 3 tries (Score /3) and L deals 5. M page 2 leaves about 85 mm under 2 plain tries where a third (62 mm) fits. | ws-capacity-pin SIZE-ORDER already demands S ≥ M ≥ L on capacities. Extend it to Guided's dealt count (M ≥ L). |
| N2 | Opener L, two_step_mult_div_first | nit | C1 8 | lf-algebra (step string) / lf-roles (column width) | Step 2 "Step 1: groups or share. × or ÷." wraps and leaves "÷." alone on a line. | ws-words-checks ORPHAN: no line of a wrapped instruction or step is a lone sign or a single short token. |

Known out-of-lane failures (lf-algebra; not counted): EB-SIDE 120 (107 mm step columns in a 185 mm cell), add_then_div
guided L p2 ÷-bar OVERFLOW, RI-DISTINCT on letter and estimate (A and B draw the same work; C2 ≤ 3 on those RI pages). All
were reproduced on the private tree, and all match the builder's note.

## Machine gates on the private tree (7 skills × 7 roles × M/L = 98 renders)

- `ws-cell-checks`: 28 findings: LONE-PAGE 16, OVERFLOW 4, RI-DISTINCT 8.
  - LONE-PAGE 16: every one is a Reason It two-step pair or multi_step_word test, ruled capacity 1 by the lead.
  - OVERFLOW 4: add_then_div guided L (lf-algebra).
  - RI-DISTINCT 8: lf-algebra.
  - No lf-roles finding.
- `ws-empty-band`: every rule PASS except EB-SIDE 120 (lf-algebra). EB-BAND PASS, which misses D1 (see the check above).

## (a) PAGEFILL / EB-PAGE exemption for `mq-onerow`

**Verdict: sound for every page it touches today, but keyed on a class instead of on the fact. Narrow it.**

- Where the class is set: `mq-onerow` is set only when `capRowsToInk` actually holds a row, on a lone part, with one row
  (practice.js 1229-1236, test.js 307, review.js 342, reason-it.js 163). `mq-inkrows` pages are still judged.
- Probe on the 7 skills and the lane: for every exempted page I compared the strip under the grid with the tallest cell's ink.
  - 7 two-step skills: 25 pages, every strip shorter than one more row (66 vs 116 mm is the closest).
  - 29 passed skills × independent / more-practice / test / review / reason-it × M/L: only 3 pages carry the class (div_facts_long
    review M/L, sub_2d_1d review L), all with no room for another row.
  - Nothing is hidden today.
- Risk: an under-counted capacity (a measuring bug that plans 1 row where 2 fit) yields a one-row held page that PAGEFILL /
  EB-PAGE then skips. LONE-PAGE only catches it when the row holds a single item; ws-capacity-pin only where a pin exists.
- Proposal: accept the strip only when `strip < tallest measured ink in the row + row gap`. The probe above
  (`cr9/onerow.cjs`) is that test. Otherwise FAIL as before.

## (b) The 2 passed-skill pages that changed (graded, master vs lane)

| Page | C1 | C2 | C3 | C4 | Note |
|---|---|---|---|---|---|
| division:div_facts_long review M (pupil + key) | 9 | 9 | 8 | 9 | Master's Mixed Review band left 34 % under the stories (EB-BAND fail). On the lane it is held to 25 % and the page ends 52 mm above the footer, honest white. The key is correct (11, 5, 9, 10, 4, 2; 40 ÷ 8 = 5, 8 ÷ 2 = 4) and a facsimile. Better than master. |
| subtraction:sub_2d_1d review L (pupil + key) | 9 | 9 | 8 | 9 | The stories band is 5 mm shorter (25 % under ink). The stack band's 30 % under the answer boxes is pre-existing and identical on master. Key correct (31, 87, 35, 58, 48). No regression. |

Both pass at 8 or more. PNG `r9/critic/passed-master-vs-lane.png` (master | lane, per page).

## (c) Byte identity of other passed skills against origin/master

10 passed skills: add_facts, add_wp_20, number_word_form, div_facts, mult_facts, expand, sub_100_no_regroup, sub_wp_10,
vocab_pick3_words, sub_1k_no_regroup. Roles: 11 (true-false, reason-it, error-analysis, pre-skill-check, review, scripted-model,
guided, test, independent, more-practice, opener). Sizes M/L, pupil + key.

| Lane 693d19dbd compared with | Pages (220 M/L) |
|---|---|
| origin/master a8258e3f3 | **220 / 220 identical** |
| merge base a6883082c | 220 / 220 identical |

The lane had not merged master's newest commits at 693d19dbd, and the pages are identical to master all the same.

## Scores (4 criteria: C1 ease / C2 teaching / C3 layout / C4 fidelity; pupil page + key graded together)

3 skills in full (every role × M/L, pupil + key); spot check of 4 (guided, opener, reason-it, test, review × M/L, pupil).

| Skill | guided M / L | opener M / L | reason-it M / L | indep. M / L | more-pr. M / L | test M / L | review M / L |
|---|---|---|---|---|---|---|---|
| multi_step_word_plain | 8888 / 8888 | 8887 / 88**6**7 | 8888 / 8888 | 8888 / 8888 | 8888 / 8888 | 8888 / 8888 | 8888 / 8888 |
| multi_step_word (Visual) | 8888 / 8888 | 8887 / 88**6**7 | 8888 / 8888 | 8888 / 8888 | 8888 / 8888 | 8888 / 8888 (ruled 1) | 8888 / 8888 |
| two_step_letter_equation | 8888 / 8888 (N1) | 8888 / 88**6**8 | 7·3·8·8 / 7·3·8·8 (lf-algebra RI-DISTINCT, D4) | 8888 / 8888 | 8888 / 8888 | 8888 / 8888 | 8888 / 8888 |
| two_step_mult_div_first | 8888 / 8888 | 88**7**7 / 88**6**7 | 8888 / 8888 | - | - | 8888 / 8888 | 8888 / 8888 |
| two_step_add_then_mult | 8888 / 8888 | 8887 / 88**6**7 | 8888 / 8888 | - | - | 8888 / 8888 | 8888 / 8888 |
| two_step_add_then_div | 8888 / lf-algebra OVERFLOW | 88**7**7 / 88**6**7 | 8888 / 8888 | - | - | 8888 / 8888 | 8888 / 8888 |
| two_step_estimate_check | 8888 / 8888 | 8887 / 8887 | 7·3·8·8 / 7·3·8·8 (lf-algebra) | - | - | 8888 / 8888 | 8888 / 8888 |

Opener C4 7 is D2 (header). Opener L C3 6 is D1. Opener M C3 7 is D3. The letter opener M does not spill and passes.

## Lead's open rulings: the critic's view

- **PT-OPN-10, the two-page Opener (approved).** Sound: page 1 now reads as a complete Model lesson. To pass, it needs D1 (Steps
  band to its ink), D3 (fill page 2 from the stories actually dealt) and D2 (header names the parts, without the 6.3 mm
  overflow the first attempt made).
- **LONE-PAGE on the Reason It two-step pairs and on multi_step_word test (ruled capacity 1).** Agree. The pairs are 108-158 mm
  of ink and the Visual test story 116-132 mm, so a second never fits. Cell-checks now prints them as `ruled`.
- **Visual Opener L page 2 (about 40 % white).** It looks intentional: the story sits at the top under the continuation header
  and the cell is held (≤ 28 %). Taken alone, page 2 scores C3 8. The Visual Opener L version still fails on D1 (page 1) and D2.

## Speed reflection (what would have caught each finding before the critic)

- **D1 and D3.** Both are estimates standing in for measures: `stepLines` character counting, and `lv1` over undrawn spares.
  - Rule: a role never draws a band at an estimated height. It draws the band at its content height or at the measured height.
  - Rule: a fit decision uses only the items the plan deals.
  - The EB-BAND-on-strips and SPILL-FILL checks above turn both rules into gates.
- **D2.** The lead's ruling arrived mid-round. The OVERFLOW the first attempt caused was caught at once by the existing
  cell-checks, which shows the gate works.
- **P1.** Critics must grade a private worktree at a named commit, never a shared scratch tree that a builder may be editing.
  The lead's brief should name a commit, not a directory.

## Re-critic r9b (narrow; lane 52abf7e79)

Test tree: a private worktree of lf-algebra 201692a31 merged with lane 52abf7e79 (critic merge b0b5216cc; the only conflict
was `tests/fixtures/precritic/backtests.json`). The lane contains origin/master 88cc98b00. I did not use `alg2`.

Graded: the 13 spilled Opener pages (7 two-step skills × M/L; letter_equation M does not spill), each pupil page with its key.

### Verdict: FAIL on 2 pages (page-1 white under the Say band); D1, D2 and D3 PASS

| Item | Verdict | Evidence |
|---|---|---|
| D1 Steps band sized to its printed text | **PASS** | Steps band against ink, page 1: M 25.0 / 24.1 mm (4 %), estimate M 29.9 / 29.0 mm (3 %); L 27.0 / 27.2 mm, and 33.8 / 33.9 mm on mult_div_first and estimate. No empty band. |
| D2 continuation header names the part | **PASS** | Page 2 title is "Guided Practice" (plain, Visual, mult_div_first, add_then_mult, add_then_div, estimate L), or "Guided Practice and Your turn" where an Independent row follows (estimate M, letter L). Pupil and key match. `ws-cell-checks --roles opener` on M/L: 14 pages, no finding. The overflow from the first attempt is gone. |
| D3 page 2 fitted from the dealt stories | **PASS; r9's D3 withdrawn** | The builder's measure is confirmed (table below). My r9 D3 compared plan heights without the band strip, the tab and the in-hand margin. Rendered with them, no Independent row fits on those pages. |
| Page 1 white under the Say band, spilled M Openers (lead bar ≤ 30 %, C3 ≥ 8) | **5 of 6 pass; estimate M over** | Body 239 mm. Plain 60.3 mm (25.2 %), Visual 60.3 (25.2 %), add_then_div 62.3 (26.1 %), add_then_mult 67.2 (28.1 %), mult_div_first 68.6 (28.7 %). **estimate_check M: 74.4 mm (31.1 %).** |
| Page 1 white, spilled L Openers (same bar) | **5 of 6 pass; letter L over** | Plain / Visual 35.5 mm (14.9 %), mult_div_first and add_then_div 37.8 (15.8 %), add_then_mult 43.3 (18.1 %), estimate 50.9 (21.3 %). **two_step_letter_equation L: 93.7 mm (39.2 %)**, the bottom 40 % of the Model page blank. I under-reported this in r9: D1 was the reason I gave there. |
| Tightened PAGEFILL / EB-PAGE one-row exemption | **PASS** | Both tools now accept the strip only while it is shorter than the held row: `oneRowStripOk` in ws-print-lint, and in ws-empty-band 903-906 `b0.bottom - gr.bottom < gr.height`. `--onerow-probe` gives 60 mm under a 160 mm row = OK and 170 mm = FAIL. Nit: it compares with the held row (ink / 0.72); ink + pads would be stricter by about 25 %. The planner places rows at held height, so this is consistent. |
| Spot hash: 5 passed skills × opener / review × M/L, pupil + key, against origin/master 88cc98b00 | **PASS** | Skills: div_facts_long, sub_2d_1d, add_wp_10, combine, mult_facts. 20 pages, 18 identical. Only **div_facts_long review M** and **sub_2d_1d review L** differ, as expected. |

### D3 measurement check (M, page 2)

Free = body bottom (274.0 mm) minus the bottom of the Guided band. Needed = the shortest undrawn dealt story's level-1 height
+ 1 mm + 3 mm tab + 7.5 mm band strip.

| Skill M | Guided band bottom | Free | Shortest undrawn level-1 | Needed | Independent row? |
|---|---|---|---|---|---|
| multi_step_word_plain | 179.2 | 94.8 | 93.2 | 104.7 | no (correct) |
| multi_step_word (Visual) | 179.2 | 94.8 | 124.9 | 136.4 | no (correct) |
| two_step_mult_div_first | 177.2 | 96.8 | 91.2 | 102.7 | no (correct) |
| two_step_add_then_mult | 172.9 | 101.1 | 93.2 | 104.7 | no (correct) |
| two_step_add_then_div | 177.2 | 96.8 | 91.2 | 102.7 | no (correct) |
| two_step_estimate_check | 160.2 | 113.8 | - | - | yes, 1 row (band 159.7-244.0) |
| two_step_letter_equation (L) | 141.7 | 132.3 | - | - | yes, 1 row (band 141.2-214.1) |

The builder's "95-101 mm free against 102-105 needed" holds. Spill page 2 at M is 40-42 % white under one Guided story. It is
top-aligned and the cell is held, so it reads as an intentional spill page (your ruling 4): C3 8.

### New findings

| Id | Page | Sev | Crit | Owner | Finding | Automatic check |
|---|---|---|---|---|---|---|
| **W1** | two_step_letter_equation Opener **L** p1 (pupil + key) | major | C3 7 | lf-roles (opener spill) | 93.7 mm (39.2 %) white under the Say band. The next part, the Guided band, needs 105 mm, so nothing fits. The remainder is honest, but a teacher sees a page 40 % empty. | **SPILL-P1** (ws-empty-band EB-PAGE, opener): on a spill page 1, white under the last band > 30 % of the body = FAIL unless a lead-ruled remainder applies. |
| **W2** | two_step_estimate_check Opener **M** p1 (pupil + key) | minor, over the bar | C3 7 (by the 30 % bar) | lf-roles | 74.4 mm (31.1 %) white under the Say band. The Guided band needs 123.7 mm. | Same SPILL-P1. |
| N2 (open) | mult_div_first Opener L Steps | nit | C1 8 | lf-algebra string | "÷." still wraps alone onto its own line. | ORPHAN (as r9). |

**Remedy or ruling.** W1 and W2 are leftover space: the next band, measured, does not fit. Two ways out:
1. A lead ruling: "a spill page 1 may leave more than 30 % white when the next part's MEASURED height exceeds that white". SPILL-P1
   would then check that clause. That would turn both pages to C3 8 and the round to PASS.
2. A layout change that brings the white under 30 %.

My view: option 1 matches ruling 4, which already accepts the 40-42 % white on spill page 2.

### Scores (C1 / C2 / C3 / C4; pupil + key)

| Skill | Opener M | Opener L |
|---|---|---|
| multi_step_word_plain | 8 8 8 8 | 8 8 8 8 |
| multi_step_word (Visual) | 8 8 8 8 | 8 8 8 8 |
| two_step_mult_div_first | 8 8 8 8 | 8 8 8 8 (N2 nit) |
| two_step_add_then_mult | 8 8 8 8 | 8 8 8 8 |
| two_step_add_then_div | 8 8 8 8 | 8 8 8 8 |
| two_step_estimate_check | 8 8 **7** 8 (W2) | 8 8 8 8 |
| two_step_letter_equation | not spilled (r9: 8 8 8 8) | 8 8 **7** 8 (W1) |

All keys checked; every answer is correct (estimate M: 39 / 8 / 10 Yes; 71 / 99 / 100 Yes; 87 / 30 / 30 Yes. letter L: n = 11, 31, 17).
