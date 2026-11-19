# lf-engine chart-name critic r1

The critic was independent and ran at medium. lf-engine saved this report because the critic's Write call was refused.

## Verdict

| Lessons | Verdict |
|---|---|
| The 30 library lessons | **PASS**: every page scores at least 8 on every criterion |
| Detailed-lesson charts | **NOT YET GRADED**: the fix was not committed when the critic finished; the head was b25d1118c, which holds the check only |

## Pages graded

- **Supplied PNGs:** add_facts, sub_100_regroup, nearest_10 and div_facts, pupil and key, at M and L.
  - In each before/after pair only the Name / Date row (y 74–91 px) changed. The body, title, rule and footer are pixel-identical to master.
- **The critic's own renders**, one at a time through /tmp/mq-browser-run.sh, at M and L, pupil and key: placevalue:expand, composing:number_word_form, vocabulary:vocab_grade_pictures, subtraction:sub_wp_20 and addition:fact_family_sort.
  - At L, the Name / Date fields are pixel-identical to p2, with the same 2.25 pt rule. Score is absent.
  - Pupil and key differ only in "Name" vs "Answer Key".
  - Each lesson prints 1 pupil page and 1 key page, with no overflow.

## Scores

C1 = ease of use, C2 = educational value, C3 = spacing and layout, C4 = standard fidelity. Pupil and key score the same.

| Page (9 lessons) | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| Every page at L | 9 | 9 | 9 | 9 |
| Every page at M | 9 | 9 | 9 | 8 (O1) |
| div_facts | 9 | 9 | 9 for this change (F1 is pre-existing) | 8 at M, 9 at L |

## Findings

**F1 (pre-existing, not counted): the div_facts chart's lower half is empty.**
- The content ends at about 53 % of the page, at M and L. The pixel diff proves this change neither caused it nor made it worse.
- Check: a CHART-FILL rule in `ws-lesson-samples --check`. The last body ink must reach at least 80 % of the body height, or the chart's zoom must be at its cap. It belongs on precritic's lesson-samples-chart path.

**F2 (process): ws-precritic-plan lists chart-name-line as "not applicable (no skill in the command)".**
- Siblings lesson-pm-cont and lesson-tab-clear are listed the same way.
- The gate is in fact wired (`ws-precritic.cjs`:1233, lesson-samples-chart), but the plan does not prove it.
- Check: resolve rows that name no skill by tool plus `needFlags` against the `--role lesson` gates, and print on-path or FAIL instead of N/A. Owner: lf-checks.

**O1 (needs a lead ruling): at M, the chart's Name / Date line is in L type.**
- The chart always prints at L (a wall chart), and its title was already L before this change.
- If "same type" means the packet's size, CHART-HEAD must compare against page() at the requested size.

**Process note:** ws-backtest takes its own browser slot. Wrapping it in mq-browser-run.sh holds 2 slots.

## Claims verified by running them

| Claim | Result |
|---|---|
| `ws-backtest --row chart-name-line` | FAIL on 22752843c, OK on cb5e5bd94; `ws-backtest: OK` |
| `ws-precritic-plan` | OK (249 rows on path, 227 not applicable), with F2 |
| `ws-lesson-samples --check --seeds 1 --all-lessons --rules CHART-HEAD --sizes M,L` | CHART-HEAD PASS and PC-BUILD PASS over 30 lessons |
| Re-pin cb5e5bd94 vs 22752843c | 512 changed, 0 added, 0 removed. The changed keys are only pupil-p1, key-p1, pupilHtml and keyHtml, over 32 lessons × M, L × 2 seeds |

## To finish the detailed-lesson grading

1. Grade at least 2 detailed packs' P2 charts, pupil and key, at M and L. The master side is in before/: g1-oa1-bar-model-wp-20 and g3-oa5-mult-properties.
2. Run `ws-lesson-samples --check --rules CHART-HEAD --detailed all`.
3. Diff the detailed baseline and confirm that only P2 / P2b chart pages changed.
