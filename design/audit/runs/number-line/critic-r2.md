# Custom number line at the top of the page (MASTER_PLAN 5.2): critic, Round 2

Critic: independent, Opus 5.5, medium effort. Tree `63d7652` (the fixes for round 1). Date 2026-10-09.
This file is my only change. My probes, JSON and screenshots are in the session scratchpad (`nl-r2/`).
Round 1 is `design/audit/runs/support-numberline/critic.md`.

## Verdict: FAIL

| Criterion | Score | Why it is not 8 |
|---|---|---|
| C1 Ease of use | 8 | D1, D7 and D13 are fixed. The worksheet shows the line in the real flow (set store and `~0R1` skill code). The panel has one "Number line at the top of the page" disclosure, and the Support pane is now "Number line in each problem (0 to 20)". The summary shows the resolved line ("On · 0 to 20 · steps of 1 (from the skill)"). The print dialog has a "Hints on tests" switch. |
| C2 Educational value | 6 | The whole-number Auto lines are now right (add/sub within N, rounding, integers, seq_2/5/10). The rest of the skip-count family is still wrong (R2-D1), and on a phone seq_2 has 45 unlabelled ticks between 0 and 90 (R2-D2). Every fraction skill in `fraction_operations`, the family added for the CCSS 4.NF.3 unit-fraction jumps, gets a halves line that cannot show those jumps (R2-D3). order_fdp reads percents as whole numbers (R2-D4). mixed_integers counts in twelfths, and the equivalence lines run 0 to 20 (R2-D5). |
| C3 Spacing and layout | 7 | On a one-skill sheet whose wide items go "full width, at the bottom", page 2 and its key print a blank 16 mm strip instead of the line (R2-D6). The band still costs whole rows on 55 of 298 builds (R2-D7, deferred in STATUS): sub_*_L 9 → 6 with about 45 mm empty, add_wp_10 L and equiv_frac_nv L 4 → 2, order_frac_numline S 1 → 2 pages. Label gaps are now regular (D10 fixed). |
| C4 Standard fidelity | 8 | D11 and D12 are fixed: RP-55, PT-FRM-11 and the SUPPORTS `refline` row. R2-D6 breaks PT-FRM-11's "every page". Add_decimal's line has no tenth ticks, though RP-55 / SUPPORTS promise them (R2-D8). The lane is 49 commits behind `claude/sweet-newton-c8wrv1` and does not merge cleanly (R2-D9). |

## Round-1 defects: re-check

| r1 | Status | Evidence |
|---|---|---|
| D1 worksheet never shows the line | **fixed** | Set store → `initWorksheet` at 390 / 1280: `#mqWsRefLine` "number line 0 to 20, steps of 1". Also fixed for compare and seq_2. The lane gate's real-flow check passes, and so does the code path. |
| D2 unread numbers → 0..20, comma lists | **fixed** | round_sort_1000 0..10,000; order_negatives −100..100; order_frac_numline gets a fraction line; no line in the 298-build sweep reports `covers` false. New misreading: R2-D4 (percent). |
| D3 step / ends from the skill | **partly** | seq_2 / seq_5 / seq_10 count in their own step with only the ends labelled. add_wp_20 is 0..20, add_wp_50 0..50, and all three add_1k skills 0..1000. Not fixed for count_sequence, count_by_tables, number_seq_fill, skip_count_line, count_by_step_up / _down and number_patterns_rule (R2-D1). |
| D4 mixed denominators | **fixed as specified** | A benchmark halves line plus a note. On compare / order_fractions / benchmark_fractions it is a good 0, ½, 1 line. But see R2-D3. |
| D5 decimals | **fixed, with a gap** | The decimal rounding skills are off the list. add/sub_decimal get a whole-number line with uniform labels. The tenth ticks are dropped (R2-D8). |
| D6 one scale per skill | **fixed (one slip)** | add_facts, nearest_10, order_fractions, seq_2 and add_fractions_like keep one range on every role, S and L. add_decimal shows 0..19 on some roles and 0..20 on others. |
| D7 two "Number line" controls | **fixed** | The panel offers one control named "number line"; the Support pane is "Number line in each problem (0 to 20)". |
| D8 mixed pages | **fixed** | add_facts + order_fractions → 0..20 by ½ with a sheet note. Teacher ranges 0..10 and −20..20 merge to −20..20. A section without the line gets a blank reserved strip (pages 3–4 of the on/off probe). |
| D9 band costs whole rows | **not fixed (deferred in STATUS)** | Now 55 of 298 builds lose capacity (r1: 49 of 266). |
| D10 irregular last label gap | **fixed** | Card at 390 reads "0 2 4 … 18 20". Paper ends land on the label grid. |
| D11 missing families | **fixed (list)** | The list adds fraction_operations, nl_mult / nl_div, count_by_tables, number_patterns_rule, ordering_rationals, round_nl_*, estimate_* and f_to_d / d_to_f / order_fdp. Elapsed time is logged as a later step. The Auto lines of several of these are wrong: R2-D1, D3, D4. |
| D12 contract docs | **fixed** | WDS RP-55, PAGE_TYPES PT-FRM-11, SUPPORTS `refline`. |
| D13 hints on tests | **fixed** | The dialog's "Hints on tests" switch; with `testHints` set, test, pre-skill-check and fact-probe print the band on the pupil page and the key. |

## Gates and probes (browser runs one at a time through /tmp/mq-browser-run.sh)

| Check | Result |
|---|---|
| `support-numberline` | OK (offered on 149 of 601 skills; codec round trips) |
| `ws-boot-smoke` | OK |
| `ws-code-snapshot.mjs` | OK (608 codes / 35 categories, nothing moved) |
| `ws-share-options` | OK |
| `ws-print-lint --source kit` (full, report-only) | 463 findings in 33 of 191 documents: **at the baseline, not above it** |
| My sweep: 149 skills × S / L, independent, line on vs off | 298 builds, 0 errors, 0 overflows, the key's band is the pupil's band, every number is covered. **3 builds have a page with no line (R2-D6). 55 builds lose capacity (R2-D7).** |
| My roles probe: 6 skills × 16 roles × S / L | One range per skill on every role, except add_decimal (0..19 / 0..20). Test, pre-skill-check and fact-probe carry the band only with `testHints`. |
| My screen probe: card and worksheet, real flow, 390 / 1280 | Both hosts show the line; no horizontal scroll (scrollWidth = viewport). The card band is 53 px, or 70 px with fractions. |
| `git merge-tree HEAD claude/sweet-newton-c8wrv1` | **CONFLICT** in js/modules/question-render.js (import lines; R2-D9) |

## Defects (RUBRIC §6)

```json
{
  "feature": "support-numberline",
  "round": 2,
  "pass": false,
  "scores": { "C1": 8, "C2": 6, "C3": 7, "C4": 8 },
  "defects": [
    { "id": "R2-D1", "criterion": "C2", "severity": "critical",
      "where": "skill-options.js numberLineSkillHints (skip = /^(seq_\\d+|count_by_|skip_count|count_sequence|number_seq_fill|number_patterns_rule)/); refline-screen.js skillLineBasis (hints.step = nlSequenceStep(qs)); sheet/refline.js sequenceStep",
      "what": "Only seq_N names its step. Every other skill in the family gets the most common gap among its sample's numbers, and that gap is not what the items count in. count_sequence ('What number comes after 8?', a count-by-ones skill) gets 0..20 BY 2 with only 0 and 20 labelled, so 9 has no tick. count_by_tables (count by 2, 3, 7, 8 or 12 per item) gets 0..160 by 10 with only the ends labelled. skip_count_line (by 4s, 5s, 10s or 25s) gets 0..180 by 10. count_by_step_up / _down (by 2s, 4s, 5s) get 0..140 and 0..200 by 10. number_seq_fill (tracks in ones, fives or tens) gets 0..100 by 5. number_patterns_rule gets 0..500 by 50. With ends-only labels and the wrong step, none of these lines can be counted along.",
      "fix": "count_sequence is not a skip-count skill: take it out of `skip` and let it use the plain whole-number line (0..20 by 1, labels on). When the items of a skill count in different steps (count_by_tables, skip_count_line, count_by_step_*, number_seq_fill, number_patterns_rule), default to a line in ones (or the smallest step of the page) labelled every 10, not ends-only. Or, if the page's step is fixed by an option, use that option's value. A line in tens cannot show a count by 3s or 4s.",
      "check": "Sweep: count_sequence 0..20 by 1 with labels. On count_by_tables, skip_count_line and count_by_step_up, every number on the page lands on a tick of the line, and the line carries at least one label every 10."
    },
    { "id": "R2-D2", "criterion": "C2", "severity": "major",
      "where": "sheet/refline.js resolveLine (labels 'ends' for every skip skill)",
      "what": "seq_2 is 0..90 in 2s with only 0 and 90 labelled. On the 390 px card (nl-r2/card-seq_2-390.png) and on paper, that is 45 identical ticks. To find 41, 43 the pupil must count about 20 unlabelled hops from 0. Round 1 asked for 'ends (or every 10th)'. Ends-only gives the pupil no landmark.",
      "fix": "On a skip-count line, label the multiples of 10 (or of 5 times the step), which the items never ask for as answers, and leave the counted values unlabelled. Keep 'ends' only when the line has 12 or fewer ticks.",
      "check": "seq_2 Auto labels 0, 10, 20 … 90; seq_5 labels 0, 50, 100 (or every 25); no item's answer is a label."
    },
    { "id": "R2-D3", "criterion": "C2", "severity": "major",
      "where": "skill-options.js _NL_SKILLS.fraction_operations; sheet/refline.js defaultLine fraction branch",
      "what": "The 12 fraction_operations skills were added for the 4.NF.3 model: jumps of a unit fraction. Their items mix sevenths, tenths, thirds and eighths, so every one falls back to a halves line with the note 'one line cannot show them all' (nl-r2/pg-add_fractions_like-S.png: 0, ½, 1, 3/2, 2 above 6/12 + 8/12, 4/8 + 7/8). The line cannot show the jumps the skill was added for. add_frac_like_nv runs 0..12 in halves and add_mixed_like_nv 0..19 in halves. The same fallback gives graph_fractions, round_fractions, mult_frac_whole* and decompose_* long halves lines that serve none of their items.",
      "fix": "Either (a) take fraction_operations (and other per-item-denominator skills) off the page-wide list, and log in STATUS that the jump line belongs in each problem (the pane), or (b) when the teacher fixes the denominator (an option), use it, and offer the line only then. A halves fallback is right only for compare / order / benchmark skills, where ½ is the benchmark.",
      "check": "No skill offers the Auto line when its default is the halves fallback, except the benchmark family (compare, order_fractions, order_frac_numline, benchmark_fractions, compare_frac_lcd, fraction_nl_drag)."
    },
    { "id": "R2-D4", "criterion": "C2", "severity": "major",
      "where": "sheet/refline.js numbersInText / listNumbers (no % handling); conversions:order_fdp",
      "what": "order_fdp answers such as '15%,0.65,80%' are read as 15, 0.65 and 80. The line runs 0..90 in halves (nl-r2/pg-order_fdp-S.png: 0 5 10 … 90), but every value on the page lies between 0 and 1. f_to_d / d_to_f get 0..1 in halves, so no item's tenths or hundredths can be read on them.",
      "fix": "Read 'N%' as N/100. For the conversion skills, default to a 0..1 line in tenths with hundredth small ticks, labels 0, 0.1 … 1 (or 0, ½, 1), or take them off the list.",
      "check": "order_fdp Auto = 0..1, and every value of the page (as a decimal) is on it."
    },
    { "id": "R2-D5", "criterion": "C2", "severity": "minor",
      "where": "sheet/refline.js defaultLine (fraction branch spans every whole number read); integers:mixed_integers",
      "what": "mixed_integers reads one rational item (−1/3), so the whole −89..98 line counts in twelfths: a 2,000-tick comb thinned to dense hairlines (nl-r2/pg-mixed_integers-S.png). equivalent and equiv_frac_nv run 0..20 / 0..18 in halves, because the missing-number answers (4, 8, 12) are read as positions, but their fractions are all at most 1.",
      "fix": "Use a fraction step only when most of the page's values are fractions in the line's span. Leave whole-number answers to 'find the missing numerator / denominator' out of the line's numbers.",
      "check": "mixed_integers Auto = −100..100 by 10 (whole). equivalent Auto ≤ 0..2."
    },
    { "id": "R2-D6", "criterion": "C3", "severity": "major",
      "where": "sheet/roles/practice.js composeSheet (refSections test: pg.parts.some(pt => input.refSections.includes(pt.section)))",
      "what": "On a ONE-skill sheet, the page that holds the items moved 'full width, at the bottom' has parts whose section index is not in refSections. That page and its key page print the blank `ws-refline-gap` instead of the line. Observed at S: order_frac_numline (pages 2 and 4 of 4), mixed_improper_visual and number_patterns_rule. Page 1 has the line, page 2 a blank 16 mm strip. This breaks PT-FRM-11 ('on EVERY page … continuation pages included'), and the pupil loses the line halfway through.",
      "fix": "Map relocated wide parts back to their source section (or test the part's skill key against nline.keys), so only pages whose items truly come from a section without the line print the gap.",
      "check": "The sweep (149 × S/L) shows the band on every pupil and key page of every one-skill sheet; the on/off mixed probe still shows the gap on the nearest_100 pages only."
    },
    { "id": "R2-D7", "criterion": "C3", "severity": "minor",
      "where": "layout headerHeightMm + refBandMm; design/STATUS.md (D9 logged as a later step)",
      "what": "The band still costs a whole row where cells have no slack: 55 of 298 builds. Examples: sub_50/100/1k_* L 9 → 6 (about 45 mm empty under the grid, nl-r2/pg-sub_100_regroup-L.png); add_wp_10 L, equiv_frac_nv L and order_frac_numline L 4 → 2; fraction compare S 16 → 10; order_frac_numline S, mixed_improper_visual S and number_patterns_rule S 1 → 2 pages. STATUS calls this a per-skill cell-height review. That is a fair deferral, but the empty strip is a layout fault on the page as printed.",
      "fix": "Leave it deferred if the lead agrees. Otherwise let rows shrink into the cells' slack before dropping one (r1 D9 fix).",
      "check": "As r1 D9."
    },
    { "id": "R2-D8", "criterion": "C4", "severity": "minor",
      "where": "sheet/refline.js refLineGeom minor-tick guard ((pitch*tickEvery)/minor < 1.2 → no small ticks); WDS RP-55 / SUPPORTS refline",
      "what": "add_decimal's Auto line is 0..19 in wholes with tenth small ticks asked for, but at 186 mm a whole step is 9.2 mm, so tenths (0.92 mm) are dropped as 'touching' at S and L (nl-r2/pg-add_decimal-S.png). What prints is a plain whole-number line ending on 19. The sums reach 19.98, and some roles end at 20. The docs promise tenth ticks.",
      "fix": "Fall back to 2 or 5 small ticks (halves or fifths) when tenths do not fit, or shorten the span to the page's whole part. End at 20.",
      "check": "add_decimal Auto shows small ticks and ends at 20 on every role."
    },
    { "id": "R2-D9", "criterion": "C4", "severity": "minor",
      "where": "branch: 63d7652 vs claude/sweet-newton-c8wrv1 c91cc8b",
      "what": "The lane is 49 commits behind the main branch (number-family any-order, touch-dot floor, shared-link pop-up …), and `git merge-tree` reports a content conflict in js/modules/question-render.js. Line 3: the lane's `import { syncPracticeRefLine }` against main's `import { isOrderFreeFamily, familyBoxVerdict }`.",
      "fix": "Merge claude/sweet-newton-c8wrv1 into the lane, keep both imports, and rerun the lane gate plus ws-screen-answer.",
      "check": "git merge-tree --write-tree HEAD claude/sweet-newton-c8wrv1 exits 0."
    }
  ],
  "to_raise_to_10": {
    "C1": "On a phone, collapse the band to the end labels plus every 10th, and add a one-tap hide on the card.",
    "C2": "R2-D1 to R2-D5: every Auto line counts in what the items count in, has landmarks, and is offered only where one page-wide line can serve the page.",
    "C3": "R2-D6 and R2-D7: the band on every page, and no row lost to it where the cells have slack.",
    "C4": "R2-D8 and R2-D9."
  },
  "summary": "Round 1's critical faults are fixed. The online worksheet shows the line in the real flow. One resolver serves print, card and worksheet with one scale per skill. Whole-number Auto lines follow the skill's declared range. Mixed pages merge with a note. The panel names are clear. Tests have a hints switch. The docs carry RP-55 and PT-FRM-11. Share codes, the boot smoke, the code snapshot and print-lint (463 / 33, at baseline) all pass. It still fails C2: most of the skip-count family counts in the wrong step with ends-only labels, seq_2's line has no landmarks, the newly added fraction-operations skills get a halves line that cannot show their jumps, and percents are read as whole numbers. C3 fails because a one-skill sheet's second page prints a blank strip where the line should be. The lane must also merge main again (one import conflict)."
}
```
