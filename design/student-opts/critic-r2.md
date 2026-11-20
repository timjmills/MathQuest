# Student options screen: critic round 2 (lane lf-studentopts)

Branch `claude/sweet-newton-c8wrv1-lf-studentopts` @ ddf31a52c (round-1 base 03a92fa2e). Independent critic, 2026-11-20.
This is a narrow re-grade of round 1's F1 to F7, plus regressions. I judged from my own real taps (Puppeteer through
`tests/lib/ws-harness.cjs`) with the app in pupil role: a mouse at 1280×1000 and 1366×768, and touch at 1024×768 and 820×1180.
Evidence is in `design/student-opts/critic-r2/`.

## Verdict: PASS

| Width | C1 Ease of use | C2 Educational value | C3 Spacing / layout | C4 Standard fidelity |
|---|---|---|---|---|
| 1280 × 1000 (mouse) | 8 | 8 | 8 | 8 |
| 1366 × 768 (mouse) | 8 | 8 | 8 | 8 |
| 1024 × 768 (touch) | 8 | 8 | 8 | 8 |
| 820 × 1180 (touch) | 8 | 8 | 8 | 8 |

Gate: `node tests/scripts/ws-student-opts.cjs --widths 1280,820` on ddf31a52c prints **`ws-student-opts: OK`**.
The words lint read 1,103 pupil options with 0 hits. The unit check found 742 live skills, 675 with pupil options. The
sweep covered 675 skills at each width with 0 findings.

## Round-1 findings, re-checked

| # | Status | What I did and saw |
|---|---|---|
| F1 | **fixed** | At every width I tapped the card, then tapped "Change how it works", on Mixed Addition, Function Tables: Easy and Division Facts. Only `.so-body` scrolls; the sheet itself never scrolls. Mixed Addition's body is 636 px tall at 1366 and holds 3,345 px of content. Both `[data-so-play]` buttons stay inside the viewport and inside the sheet, and `elementFromPoint` lands on them before and after the body is scrolled to the end. At 1366 they sit at y 636–684 and 692–740. A real tap on "Play all selected" starts the game at all four widths. Shots: `long-function_table_easy-{1280,1366,1024}.png`, `long-mixed_addition-820.png`. |
| F2 | **fixed** (one minor residue, N1) | I read the pupil words on 12 skills: + add, − subtract, × facts, fractions identify, place value more/less 10, time quarter, area, decimals add, counting objects, function tables, bar graph and skip count. The labels are short and plain: "Numbers to", "Regrouping: Never / Sometimes / Always", "What is missing: The answer (8 + 7 = __)", "Questions: Find the area / Find a missing side / A story", "Quarter past (:15)", "Tables to 10 × 10". No "items", "dealt", "setting", "page" or "pupil" is left. **Choices still match what is dealt:** on Basic Addition I tapped "Numbers to" and chose 10, and got 8 + 2, 8 + 2, 2 + 3 and 5 + 4 (every sum ≤ 10). On Area I set Questions to "Find a missing side" only, and all 4 items were "A rectangle has an area of … find the side". The summary and the chip read "Numbers to: 10" (`reworded-1366.png`). |
| F3 | **fixed** | `.so-more-vals` and All / None are rgb(74,69,96) on white, **9.1 : 1**, at 14.4 px and 15.2 px. On the real teacher link `?qs=EW~C34-EA|A1`, the "Set by your teacher" note is 14.4 px at 9.1 : 1. The locked "Divide by 3, 4" stays disabled. Play dealt "12 ÷ 4 = ?", and the gate's locked-link check is green (`locked-1280.png`). |
| F4 | **fixed** | The ÷ facts sheet has no "How it is written" option (D3). Its rows are "Divide by" and "Tables to". |
| F5 | **fixed** | With the fold open, the popover never meets its card's rect at 1280, 1366 or 1024 (beside or above it). At 820 it is a bottom sheet, which is the allowed fallback. |
| F6 | **fixed** | After 3 quick pupil card taps, no toast is visible. Teacher mode still shows "✓ Added Addition!". |
| F7 | **fixed** | Card, sheet and chip all read "Mult Facts" (`names-1280.png`). Division Facts reads "Division Facts (÷1 to ÷12)" in all three. |

## Regressions

- Play carries each skill's options. "Play all selected" opens the game in mixed mode. Basic Addition's "Numbers to: 10"
  and Area's "Find a missing side" reach the dealt items. The locked ÷3 / ÷4 reaches the game. The gate's CARRY check is
  green for each game style and the bottom Play at 1280 and 820.
- Teacher mode is unchanged. `addQuickSkill` adds the skill, no sheet opens, and the "Added" toast shows.
- No console errors and no page errors in any of my runs.

## New finding

| # | Sev | Criterion / widths | Finding | Evidence | The automatic check that catches it |
|---|---|---|---|---|---|
| N1 | minor | C1, all widths | **Mixed-pool "Which skills" choices (40 skills) still show the catalogue's own labels.** About 150 of them carry ", visual" or ", no pictures". A few carry codes a pupil cannot read: "Reflections, visual, mc", "Distance Between Points, visual, q1", "Number Line Addition (B&W)", "Dot Array Multiplication (B&W)" and "Mixed ↔ Improper, visual pizza". Separately, the same idea has two labels: "Numbers to" (206 options) and "Numbers up to" (68). It sits in a long tick list that a pupil seldom opens, so it does not pull C1 below 8. | `long-mixed_addition-820.png` | STUDENT-OPTS-WORDS: add `/\bB&W\b\|\bmc\b\|\bq\d\b\|, visual\b/` to the term list for `members` choices; pin it at 0. Add a "one concept, one label" pin: the pupil label set for `range` / `band`-type caps is either all "Numbers to" or all "Numbers up to". |

Small notes, not findings: "Usual" appears as the default choice 80 times. It is understandable, though "Any" (used on area)
would be more consistent. On Area, unticking every Question kind reads "Questions: any" and deals all three. This is
consistent, but a pupil might expect it to block play.

## Speed reflection (owner rule)

- Round 2 cost one critic round, and every round-1 finding came back fixed with its own gate check. The pattern of adding
  the check first and then backtesting it worked.
- N1 slipped through because the words lint has a term list rather than a vocabulary. The `members` choices reuse skill
  labels, and those labels have their own teacher suffixes. Rule: when one data source feeds another screen (skill labels
  into a pupil choice list), the lint covers the suffix vocabulary of the source too.
