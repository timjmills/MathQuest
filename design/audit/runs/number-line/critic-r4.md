# Custom number line at the top of the page (MASTER_PLAN 5.2): critic, Round 4

Critic: independent, medium effort. Tree `1de8eaa` (round-4 fixes for R3-D1..D5; main merged at `b91ad87`).
Date 2026-10-09. This file is my only change. My probes, output and screenshots are in the session scratchpad
(`nl-r4/`). `probe-sweep` measures every offered skill at S, M and L, line on vs off: pupil pages, cells and the
blank strip under the grid. It was also run on a `git archive` export of `b91ad87` (pre-fix) to separate
regressions from old faults. `probe-ticks` checks every page number against the ticks actually drawn, on 3 seeds.
`probe-render` renders 27 pages. `probe-screen` / `probe-screen3` cover the practice card and online worksheet at
1366x650, 1280x600 and 390x700, after active-box has scrolled.

Owner rulings applied: (1) round_sort_10/100/1000 @L, add_wp_10 @L and equiv_frac_nv @L keep their blank strip,
which is accepted. (2) A two-column page may take 7 rows with the band (compare @S → 14). I measured the foot: 0 mm
blank (seed 77, 14 items), and seed 11 keeps all 16. (3) Lead ruling: Stretch, Reason It, True or False? and Error
analysis are not graded this round.

## Verdict: FAIL

| Criterion | Score | Why |
|---|---|---|
| C1 Ease of use | 8 | At 1366x650 and 1280x600, band, problem and active box are on screen together after active-box scrolls, on every probe that has a box with two exceptions. add_facts @1366 is the first render of the session: box 751–818, not scrolled at 1.5 s; at 1280 it scrolls to band 78, box 407–474. add_decimal fails on both sizes. With the line off its box ends at 823, with it on at 847, and active-box scrolls only 243 of 380 px, so it is an active-box fault, not the band. On three 1280x600 probes the band scrolls 9–16 px above the top while the box and problem show. That is acceptable: the band is a reference. No horizontal scroll at any width, no page errors, and the basic 390 check passes. |
| C2 Educational value | 7 | R3-D2 (default doubling rows), R3-D3 and R3-D4 are fixed on paper. R3-D1 is fixed on paper only. On screen, mixed_addition with no ends set still draws a line: the online worksheet prints **0 to 20,000 by 1,000** above 9 + 8, 2 + 24 and 592 + 213, and the card draws a line for 10 of 20 questions (R4-D3). number_patterns_rule with count on / back but default Start places (ones + tens) runs 0..280 with ticks at 2s: 16 of 42 page numbers sit on a tick (R4-D4). |
| C3 Spacing and layout | 5 | R3-D5 is fixed for every build it named. But the squeeze broke a split section: **abs_value @S now prints 2 pupil pages instead of 1**. Page 1 holds 12 cells over a 120 mm blank, and the 5 full-width items move to page 2 (H5, C3 ≤ 5) (R4-D1). Round 3's sweep counted perPage at S and L only and missed band-only blank strips that predate this round: add_sub_10s @M 39 mm, missing_add_sub @L 42 mm / @M 26 mm, opposite_numbers @L 38 mm, add/sub_10/20_no_regroup @L 23 mm, sub_wp_10(_plain) @M 23 mm (R4-D2). |
| C4 Standard fidelity | 8 | Black and white, Andika, live width. The key is a facsimile with the same band. Fraction labels are in lowest terms (−5/6, −2/3, −1/2 …). `git merge-tree --write-tree HEAD claude/sweet-newton-c8wrv1` (ff76e645) exits 0. |

## Round-3 defects: re-check on fresh builds

| r3 | Status | Evidence (nl-r4) |
|---|---|---|
| R3-D1 mixed pools 0..700,000 | **fixed on paper, open on screen** (R4-D3) | Print: no line without both ends (render: band false). The panel says "On · not drawn". With 0..1000 set, the line draws, and the warn names 4,658 and 57,376 as outside. Screen: the worksheet draws 0..20,000 / 1,000 (mixed_addition) and 0..100 (mixed_subtraction). The card draws the line of each item's sub-skill (0..10, 0..20, 0..100, 0..1000) on 10 of 20 questions. |
| R3-D2 number_patterns_rule doubling | **fixed**; count on / back partly (R4-D4) | Default Pattern: no line on paper, card or worksheet. Pattern add+sub with Start = ones: 0..80, 42/42 on a tick. With the default Start (ones + tens): 0..280, ticks at 2s (1.24 mm), 16/42 on a tick (17, 21, 25, 29 … fall between). |
| R3-D3 twelfths labels | **fixed** | ordering_rationals band reads −1, −5/6, −2/3, −1/2, −1/3, −1/6, 0, 1/6 … 1 (pg-ordering_rationals-M-on.png). ¼ and ¾ are unlabelled twelfth ticks, and −0.2 / 0.6 fall between ticks (56/64): acceptable. |
| R3-D4 line changes with seed | **fixed on paper** | seq_2 0..110, seq_5 0..120, seq_10 0..130, estimate_sum 0..200, mixed_add_sub 0..200: one range on seeds 11/22/33. The seq_2 and estimate_sum card is one line over 20 questions. Mixed pools on the card change per item (folded into R4-D3). |
| R3-D5 rows lost / blank strip | **fixed for its list; regression R4-D1** | sub_50/100/1k × 3 @L 9→9 (1 mm), sub_decimal @L 12 (1 mm), order_fdp @L 16 (1 mm), compare @S 16 or 14 (0 mm), plus add_sub_100s, sub_10/20_regroup, mixed_add_sub, missing_add_sub @S, round_fractions, between_tens, nearest_1000, order_negatives, ordering_rationals: all lose nothing now. sub_100_regroup @L cells keep comfortable room (pg-sub_100_regroup-L-on.png). |

## Capacity list (support-numberline, final)

14 builds lose capacity, against 45 in round 3: add_wp_10@L 4→2, nl_mult@S 6→5, nl_mult@L 5→4, count_by_tables@L 5→4,
nl_div@S 6→5, nl_div@L 5→4, equiv_frac_nv@L 4→2, order_fractions@S 10→9, order_frac_numline@L 3→2,
count_by_step_up@S 10→9, count_by_step_down@S 10→9, round_sort_10/100/1000@L 4→3. The 5 owner-accepted builds
leave 18–47 mm. The rest lose one row or one cell, with 0–20 mm left: acceptable. The gate sweeps S and L only and
compares perPage. It does not see M, the page count, or the blank strip, which is why it missed R4-D1 and R4-D2.
My S/M/L sweep adds at M: add_three 8→6 (0 mm), add_wp_10_plain 6→4 (7 mm), unknown_start_wp 3→2 (0 mm),
order_frac_numline 3→2 (7 mm), sub_wp_10 / sub_wp_10_plain 6→4 (23 mm).

## Gates (browser runs one at a time through /tmp/mq-browser-run.sh)

| Check | Result |
|---|---|
| `support-numberline` | OK: offered on 131 of 601; codec round trips; 262 builds (S, L), band on every page; 14 lose capacity (list above). Blind to page count, M and blank strips (R4-D1, R4-D2). |
| `ws-boot-smoke` | OK |
| `ws-share-options` | OK |
| `ws-code-snapshot.mjs` | OK (608 codes / 35 categories, nothing moved, 2524 option round trips) |
| `ws-codec-registry.mjs` | OK (601 skills, 9728 codes read by both decoders) |
| `ws-screen-answer` | OK (nl_mult, nl_div card / worksheet / quiz; live green ok) |
| `ws-print-lint --source kit` | 463 findings in 33 of 191 documents: **at the baseline** (exit 1 as at baseline) |
| syntax (`node --input-type=module --check`) | refline-screen.js, sheet/layout.js, sheet/refline.js: ok |
| `git merge-tree --write-tree HEAD claude/sweet-newton-c8wrv1` (ff76e645) | exit 0, no conflict |

## Out of scope, seen in passing

- add_decimal practice card at 1366x650 and 1280x600: the active box ends at 823 px. active-box scrolls to 243 of 380
  px possible, so the box stays under the fold with the line on or off. This belongs to active-box.js / the Chromebook pass.
- order_fdp kit page: the "numbers to order" are still not drawn (noted in round 3, conversions lane).

## Defects (RUBRIC §6)

```json
{
  "feature": "support-numberline",
  "round": 4,
  "pass": false,
  "scores": { "C1": 8, "C2": 7, "C3": 5, "C4": 8 },
  "caps": ["H5 (abs_value @S)"],
  "defects": [
    { "id": "R4-D1", "criterion": "C3", "severity": "major", "where": "sheet/layout.js resolveSectionLayout (the R3-D5 squeeze) with a split section ('N problems are too wide for k columns: full width, at the bottom')",
      "what": "abs_value @S with the line on prints 2 pupil + 2 key pages instead of 1 + 1. Page 1 holds the 3 x 4 grid over a 120 mm blank; the 5 full-width items go to page 2 (111 mm blank). Line off: 1 page, 17 items, 7 mm. Round 3 (b91ad87): 1 page, 15 items, 19 mm. The squeeze treats the main grid alone and does not leave the bottom section its room.",
      "fix": "Apply the band squeeze to the page as a whole (main grid + full-width section), or skip it when a section is split. Never let the band add a page that the line-off build does not have.",
      "check": "For every offered skill at S/M/L, the pupil pageCount with the line on is no larger than with it off; abs_value @S prints 1 page. Add this to the support-numberline sweep." },
    { "id": "R4-D2", "criterion": "C3", "severity": "major", "where": "layout with a band when no row is lost (Dense 'cells sized to the problems' grids and tall 2-row pages); support-numberline sweep",
      "what": "The band costs 12–13 mm but leaves a much larger strip at the foot, with every item kept: add_sub_10s @M 0 → 39 mm (24 cells), missing_add_sub @L 0 → 42 mm (20) and @M 0 → 26 mm, add_10/add_20/sub_10/sub_20_no_regroup @L 0 → 23 mm (12), opposite_numbers @L 10 → 38 mm (also 9 → 7), sub_wp_10 / sub_wp_10_plain @M 0 → 23 mm (6 → 4). The same in b91ad87, so this predates round 4. The grid is laid out to the shorter height and then not stretched back to fill it.",
      "fix": "After the band is placed, let the rows fill the grid height that is left (as the line-off page does), so the strip at the foot is no larger than with the line off. Extend the lane sweep to M and measure the blank.",
      "check": "probe-sweep / lane sweep at S/M/L: blank-on minus blank-off ≤ 5 mm for every build that keeps its count, and ≤ 20 mm for every build that loses one row (owner-accepted builds excepted)." },
    { "id": "R4-D3", "criterion": "C2", "severity": "major", "where": "screen hosts: online worksheet band (mqWsRefLine) and practice card (mqRefLine) for addition:mixed_addition / subtraction:mixed_subtraction; refline-screen.js numberLineBlocked is applied only through lineOpts of the pool id",
      "what": "R3-D1 holds on paper and in the panel ('On · not drawn'), but on screen the line is still drawn without Start / End. The worksheet resolves one line from the sub-skills' items: mixed_addition 0 to 20,000 by 1,000 above 9 + 8, 2 + 24, 592 + 213. The card takes each item's sub-skill: 0..10, 0..20, 0..28, 0..100, 0..1000 on 10 of 20 questions, none on the rest. Paper and screen disagree, and the worksheet line serves no item.",
      "fix": "Run the numberLineBlocked test on the pool id (the skill the teacher set the option on) in the worksheet and card paths too, so no line is drawn on any host until both ends are set; with ends set, draw that one line on every question.",
      "check": "mixed_addition / mixed_subtraction with {nlOn:true} only: no #mqRefLine over 20 card questions and no #mqWsRefLine on the worksheet; with {nlFrom:0, nlTo:1000}: the same 0..1000 line on all 20 questions and the worksheet." },
    { "id": "R4-D4", "criterion": "C2", "severity": "minor", "where": "refline-screen.js numberLineBlocked (number_patterns_rule places check)",
      "what": "Pattern = count on / back with the default Start (ones + tens) is allowed, and the line runs 0..280 with ticks thinned to 2s (ones would be 0.62 mm). 16 of 42 page numbers land on a tick (17, 21, 25 …). R3-D2's check ('every page number lands on a drawn tick') holds only with Start = ones (0..80, 42/42).",
      "fix": "Allow the line only with Start = ones, or when the resolved line can still tick in ones (≥ 0.87 mm); otherwise say so in the panel, as for doubling.",
      "check": "number_patterns_rule {pattern:[add,sub]} at the default Start: no line, or every page number on a tick; with places [1]: 42/42 as now." }
  ],
  "to_raise_to_10": {
    "C1": "Fix active-box's scroll for add_decimal-style tall boxes (outside this lane); keep the band in view where the box allows.",
    "C2": "R4-D3, R4-D4.",
    "C3": "R4-D1, R4-D2; the gate sweep at S/M/L with page count and blank.",
    "C4": "Keep RP-55 / PT-FRM-11 in step with the R4 changes."
  },
  "summary": "Round 4 fixes the paper side of all five R3 defects. The mixed pools draw no line without ends, number_patterns_rule draws none for doubling rows, fraction labels are in lowest terms, seq lines no longer move with the seed, and the 16 blocking blank strips are gone because rows give up slack (sub_100_regroup @L prints 9 again). It still fails. The squeeze splits abs_value @S onto 2 pages with a 120 mm blank (H5). Older band-only blank strips of 23–42 mm at M and L were never swept. On screen the mixed pools still draw a line without ends: the online worksheet shows 0 to 20,000 above single-digit sums."
}
```

## Owner questions

1. **Practice card for a mixed pool with ends set: one line for every question, or the item's own sub-skill line?**
   Suggested: the teacher's ends, one line for every question (what paper does). Without ends: no line.
2. **number_patterns_rule: allow the line with a tens start?** Suggested: only with Start = ones (0..~100, every number on a tick).
