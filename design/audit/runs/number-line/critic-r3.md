# Custom number line at the top of the page (MASTER_PLAN 5.2): critic, Round 3

Critic: independent, medium effort. Tree `14ab5dd` (round-3 fixes for R2-D1..D9). Date 2026-10-09.
This file is my only change. My probes, JSON and screenshots are in the session scratchpad (`nl-r3/`):
`probe-auto` (the Auto line of all 131 skills), `probe-ticks` (3 seeded independent sheets per skill;
every number of the page measured against the ticks actually drawn in the SVG), `probe-render` (14 pages
at S/M/L), `probe-screen` / `probe-screen2` (card and online worksheet at 1366x650, 1280x600 and 390x700,
line on vs off, plus the real auto-scroll after render) and `probe-d7` (the blank strip each lost-capacity
build leaves).

## Verdict: FAIL (close)

| Criterion | Score | Why |
|---|---|---|
| C1 Ease of use | 8 | At 1366x650 and 1280x600 the band is 53 px (70 px for fractions) and the card scrolls its answer box into view: band, problem and answer box are on screen together (add_facts: band 243–296, box bottom 639; skip_count_line: band 41–94, box 490). Check sits under the fold on add_facts and compare, but it does so with the line OFF as well: the app chrome above the card (~420 px) is the cause, not the band (see "Chromebook note"). No horizontal scroll at any width; 390 basic check passes (labels thin to every 2nd / 10th). |
| C2 Educational value | 7 | Every R2 Auto-line defect is fixed (table below). Three skills still get a line that serves none of their items: mixed_addition (0 to 700,000), mixed_subtraction (0 to 1,000,000) and number_patterns_rule (0 to 480/500, items in ones, ÷2, +4: 5 of 34 numbers on a tick) (R3-D1, R3-D2). Smaller: ordering_rationals labels unsimplified twelfths (R3-D3); the skip-count basis under-samples its range, so seq_2 pages run 0..90 or 0..110 by seed (R3-D4). |
| C3 Spacing and layout | 7 | The band is on every pupil and key page of all 262 builds (D6 fixed). R2-D7 is still open: 45 of 262 builds lose capacity. 29 of them lose at most one row with ≤ 20 mm of white left (acceptable for an opted-in hint). 16 drop a third or more of the page and leave a blank strip of 27–48 mm at the foot (R3-D5). That is the "huge empty band" RUBRIC C3 names. |
| C4 Standard fidelity | 8 | R2-D8 and R2-D9 are fixed: add_decimal prints ruler-fine tenth ticks (0.87 mm at S) ending at 20, and `git merge-tree --write-tree HEAD claude/sweet-newton-c8wrv1` (4970e4b) exits 0. Black and white, Andika, live width, the key is a facsimile with the same band. |

## Round-2 defects: re-check on fresh builds

| r2 | Status | Evidence (scratchpad nl-r3) |
|---|---|---|
| R2-D1 skip family counts in the wrong step | **fixed** (except number_patterns_rule → R3-D2) | count_sequence 0..20 by 1, every label (23/23 numbers on ticks). count_by_tables 0..150, skip_count_line 0..180, count_by_step_up 0..140, count_by_step_down 0..200, number_seq_fill 0..100, count_by_fill 0..140: a tens line with ones as small ticks and every ten labelled. **Every** number of 3 seeded pages lands on a drawn tick (ticks.txt). Smallest tick gap 0.87 mm (count_by_step_down at S), the ruler-millimetre floor. |
| R2-D2 seq_2 has no landmarks | **fixed** | seq_2 0..90: ones as small ticks, a longer tick at each 5, labels 0, 10 … 90 (pg-seq_2-S.png). No item's answer is a label (probe-auto `ansLab` empty for seq_2). |
| R2-D3 fraction_operations halves line | **fixed** | The 12 fraction_operations skills plus graph_fractions, improper_mixed, mixed_improper_visual, mixed_nl_drag, fraction_number_line and whole_as_fraction are off the list; offered on 131 of 601. STATUS (4) logs the per-problem line as later. Benchmark skills keep 0, ½, 1. |
| R2-D4 percents read as whole numbers | **fixed** | order_fdp 0..1 in tenths with hundredth small ticks (pg-order_fdp-L.png); 60 of 70 page values on a tick, the rest (⅓, ⅝ …) lie between hundredths, which is right. f_to_d / d_to_f the same line, all on ticks. |
| R2-D5 mixed_integers twelfths, equivalence 0..20 | **fixed** | mixed_integers −90..100 by 10, whole (pg-mixed_integers-M.png). equivalent / equiv_frac_nv 0..1 by halves; the "find the missing numerator" answers are left off the line (lineNums). |
| R2-D6 band missing on split pages | **fixed** | 262 of 262 builds carry the band on every pupil and key page (lane gate sweep, and my renders). |
| R2-D7 rows lost to the band | **open** → R3-D5 | 45 of 262 builds (r2: 55 of 298). Judged per build below. |
| R2-D8 add_decimal no tenth ticks | **fixed** | 0..20, tenths at 0.87 mm with a longer half tick, labels every whole (pg-add_decimal-S.png). |
| R2-D9 merge conflict | **fixed** | merge-tree clean against claude/sweet-newton-c8wrv1 4970e4b (17 commits behind, no conflict). |

## R2-D7: acceptable vs blocking, per build (probe-d7: rows lost, blank strip at the page foot with the line on)

- **Blocking (16):** sub_50 / sub_100 / sub_1k × {no_regroup, regroup, mixed} @L 9 → 6, 48 mm blank;
  round_sort_10 / 100 / 1000 @L 4 → 3, 47 mm; add_wp_10 @L 4 → 2, 44 mm; compare @S 16 → 10, 37 mm;
  sub_decimal @L 12 → 8, 35 mm; order_fdp @L 16 → 12, 27 mm. (equiv_frac_nv @L 4 → 2 leaves 18 mm but
  halves the page: borderline, list it with these.) On sub_100_regroup L (pg-sub_100_regroup-L.png) the six
  cells are themselves ~50 % empty, so three rows fit if each row gives up about 5 mm of its slack.
- **Acceptable (29):** one row or a few cells lost, ≤ 20 mm left: add_sub_100s S, add/sub_5_pictures L,
  missing_add_sub S, sub_10/20_regroup S and mixed_add_sub S (3 mm), nl_mult / nl_div S+L, count_by_tables L,
  order_negatives S, abs_value S, ordering_rationals S, equivalent S, order_fractions S, order_frac_numline L,
  round_fractions L, count_by_fill / count_by_step_up / count_by_step_down S, nearest_1000 L,
  round_sort_* S (2 mm), between_tens S+L.

## Gates (browser runs one at a time through /tmp/mq-browser-run.sh)

| Check | Result |
|---|---|
| `support-numberline` | OK: offered on 131 of 601; codec round trips; 262 builds, band on every page; 45 lose capacity |
| `ws-boot-smoke` | OK |
| `ws-share-options` | OK |
| `ws-code-snapshot.mjs` | OK (608 codes / 35 categories, nothing moved) |
| `ws-screen-answer` | OK (nl_mult, nl_div card / worksheet / quiz ok; live green ok) |
| `ws-print-lint --source kit` | 463 findings in 33 of 191 documents: **at the baseline** |
| syntax (`node --input-type=module --check`) | refline.js, refline-screen.js, roles/practice.js, skill-options.js, sheet/index.js: ok |
| `git merge-tree --write-tree HEAD claude/sweet-newton-c8wrv1` | exit 0 |

## Chromebook note (not a lane defect)

At 1366x650 the student game view spends ~420 px on chrome (app bar, stats banner, Exit row, progress
bar) before the card. With the line off, add_facts' answer box ends at 755 px and Check at 840 px:
both below the fold before the band is added. active-box.js scrolls the box into view (`block:
'nearest'`), so the pupil sees band + problem + box, but Check stays 30–160 px below (add_facts 671–724,
compare 801–854) with or without the line. That belongs to the Chromebook pass of the game view, not to
this lane. The band adds 63 px (80 px with fractions) to the card's height.

## Defects (RUBRIC §6)

```json
{
  "feature": "support-numberline",
  "round": 3,
  "pass": false,
  "scores": { "C1": 8, "C2": 7, "C3": 7, "C4": 8 },
  "defects": [
    { "id": "R3-D1", "criterion": "C2", "severity": "major",
      "where": "skill-options.js _NL_SKILLS addition (mixed_addition) and subtraction (mixed_subtraction); sheet/refline.js defaultLine",
      "what": "The mixed pools deal everything from 4 + 2 to 316,559 − 99,688, so the Auto line runs 0 to 700,000 (or 900,000 by seed) and 0 to 1,000,000 by 50,000 (pg-mixed_addition-M.png: a 0–700,000 line above 4 + 2 and 32 + 451). No item on the page can be read on it.",
      "fix": "Take mixed_addition and mixed_subtraction off the page-wide list (their sub-skills keep it), or offer it only when the teacher sets Start / End. mixed_add_sub (0..180) is fine.",
      "check": "numberLineFits('addition','mixed_addition') and ('subtraction','mixed_subtraction') are false, or their Auto line covers ≥ 80 % of the page's numbers at a readable step."
    },
    { "id": "R3-D2", "criterion": "C2", "severity": "major",
      "where": "skill-options.js _NL_SKILLS patterns (number_patterns_rule), numberLineFits",
      "what": "The default Pattern option deals count on, count back AND doubling/halving. The line is 0 to 480/500 in tens with small ticks at the fives (ones would touch), labels every 50: 5 of 34 page numbers land on a tick (5, 9, 13 …; 52, 49, 46), and the ÷2 / ×2 rows (24, 12, 6; up to 768) cannot be shown on any additive line (pg-number_patterns_rule-M.png).",
      "fix": "Offer the line on number_patterns_rule only when its Pattern option holds count on / count back alone (and its Start option keeps the numbers under ~200), so the line can count in ones. Otherwise not offered. This answers the brief's question: yes, keep it for count on / back only.",
      "check": "With the default Pattern set the skill offers no number line; with Pattern = add (or add + sub) every page number lands on a drawn tick."
    },
    { "id": "R3-D3", "criterion": "C2", "severity": "minor",
      "where": "sheet/refline.js labelOf / refLineGeom fraction labels; integers:ordering_rationals",
      "what": "ordering_rationals gets −1..1 in twelfths with every second tick labelled −10/12, −8/12 … 10/12 (pg-ordering_rationals-M.png). The items use −¾, −⅓, ½, 0.25, −0.2, 0.6: ½ appears as 6/12, ⅓ as 4/12 and ¾ is an unlabelled tick, so the pupil must convert before using the line; −0.2 and 0.6 fall between ticks.",
      "fix": "Label fraction ticks in lowest terms (½, ⅓, ¾ …), or label only the benchmarks (−1, −½, 0, ½, 1) and leave twelfths as ticks.",
      "check": "The ordering_rationals band reads −1, −½, 0, ½, 1 (or lowest-terms labels), no label like 6/12."
    },
    { "id": "R3-D4", "criterion": "C2", "severity": "minor",
      "where": "refline-screen.js skillLineBasis (SAMPLE = 40); sheet line widened by the page's items",
      "what": "The 40-item basis does not reach the skill's real range, so the page's own items widen it: seq_2 prints 0..90 on one seed and 0..110 on another; seq_5 0..100 / 0..120; seq_10 0..120 / 0..130; mixed_add_sub and estimate_sum 0..180 / 0..200. One skill should have one line on every page (r1 D6).",
      "fix": "Take the basis end from the skill's declared bounds (option max / 'within N') or a larger sample, so the page items never widen it.",
      "check": "seq_2, seq_5, seq_10, estimate_sum: the same from/to on seeds 11, 22, 33 and on every role."
    },
    { "id": "R3-D5", "criterion": "C3", "severity": "major",
      "where": "layout row floor + refBandMm (R2-D7 / r1 D9)",
      "what": "16 builds lose a third or more of the page to a 12–13 mm band and leave a 27–48 mm blank strip at the foot: sub_50/100/1k ×3 @L 9→6 (48 mm), round_sort_* @L 4→3 (47 mm), add_wp_10 @L 4→2 (44 mm), compare @S 16→10 (37 mm), sub_decimal @L 12→8 (35 mm), order_fdp @L 16→12 (27 mm), equiv_frac_nv @L 4→2. Their cells have slack (sub_100_regroup L cells are about half empty).",
      "fix": "Before dropping a row for the band, let each row give up its share of the band's height from the cell's slack (here about 4–5 mm per row), keeping the cell's content footprint. The 29 one-row / ≤ 20 mm losses can stay.",
      "check": "probe-d7 / the lane sweep: no build that loses capacity leaves more than 20 mm blank under its grid; sub_100_regroup L prints 9 with the line."
    }
  ],
  "to_raise_to_10": {
    "C1": "With the Chromebook pass of the game view, bring Check into view with the answer box at 650 px.",
    "C2": "R3-D1..D4; later, a unit-fraction line when the teacher fixes one denominator.",
    "C3": "R3-D5.",
    "C4": "Keep RP-55 / PT-FRM-11 in step with the R3 changes."
  },
  "summary": "Round 3 fixes every Auto-line fault round 2 named: skip-count lines now count in a step every item lands on, with landmark labels and ruler-fine ones; percents read as hundredths; fraction_operations is off the list; mixed_integers is whole; split pages keep the band; add_decimal has tenth ticks; the branch merges cleanly. All gates pass and print-lint stays at 463/33. It still fails C2 on three skills whose line serves no item (the two mixed add/sub pools and number_patterns_rule with its default doubling rows), and C3 on 16 builds where the band drops a third of the page and leaves a 27–48 mm blank strip although the cells have slack."
}
```

## Owner questions

1. **Accept the lost rows for now?** Suggested: yes for the 29 builds that lose one row or less with ≤ 20 mm left;
   no for the 16 that drop a third of the page (R3-D5): rows give up 4–5 mm of cell slack first.
2. **A unit-fraction line when the teacher fixes a denominator (later)?** Suggested: yes, as the next step for
   fraction_operations (STATUS item 4); the per-problem line covers it until then.
3. **Keep number_patterns_rule only for count on / back?** Suggested: yes. Offer it only when the Pattern
   option is count on and/or count back, with a line in ones (R3-D2).

## Out of scope, seen in passing

order_fdp pages print "Order from greatest to least:" and a "Convert all to decimals" box but no numbers to
order (pg-order_fdp-L.png). The numbers sit in a part of the item the kit page does not draw. Check with the
line off; it belongs to the conversions family lane.
