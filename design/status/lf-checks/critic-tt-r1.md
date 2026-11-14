# Critic round 1: touch floor engine rule (lf-checks, branch claude/sweet-newton-c8wrv1-lf-tools-tt)

Critic: independent, Opus medium, 2026-11-14. Graded: `git diff 7a5bc902c..7fde8fe6f` (css/screen-cell.css touch-floor block,
ws-phone-card `--geom`, backtest row `touch-floor-wrappers`, ledger row, reflow re-pin).

## Verdict: FAIL (C1 7 / C2 8 / C3 7 / C4 8)

| Criterion | Score | Why |
|---|---|---|
| C1 Ease of use | 7 | D1: the multiplication-chart card no longer fits a Chromebook screen; the instruction and the factor header row scroll away. D2 (old): long-division tap misses |
| C2 Educational value | 8 | Content unchanged. The sign circle is now a full answer place, which matches "Type the sign" |
| C3 Spacing and layout | 7 | D1 (the 1280 / 1366 fit). The mult-chart grid is now even (better than the ragged base), but small digits sit in 48 px squares (D3) |
| C4 Standard fidelity | 8 | Black and white, Andika, one boxed cell everywhere. Sibling boxes match (fact family, ordering, vocab, word-work row). Print untouched |

## What I verified

- **Builder's note:** confirmed. The backtest row `touch-floor-wrappers` gives PASS (FAIL 7a5bc902c, OK 52a9f5369, 47.5 s).
  `ws-precritic-plan --checks-from-critics` gives 188 pass / 47 exempt / 14 fail, against 187 / 47 / 14 on the base, so no
  row was dropped.
- **Print is untouched:** I pinned `ws-lesson-baseline` on the base 7a5bc902c and checked head against it: OK, 334 hashes
  identical.
- **I rendered the changed screens myself** (`ws-phone-card --geom --shots`, 1024x768 and 1280x800, card / worksheet / quiz):
  add_wp_10, vocab_grade_pictures, mult_chart_easy, long_div_2digit, add_sub_fact_family and order_negatives.
  - TOUCH-TARGET is 0 on every one of them.
  - Look: add_wp_10, vocab_grade_pictures, fact family and order_negatives are clean. Digits stay centred, rows stay
    aligned, nothing overflows, and the boxes in a row are the same size as each other.
  - Long division at the 62 px floor fits the card, the worksheet and the quiz at 1024 and 1280.
- **TOUCH-HIT on the 6 skills:** 5 are clean. long_div_2digit gives 22 findings, but the base also gives 22 (D2).
- **Spot check, 7 screens NOT on the changed list** (`--geom`, head against base via MQ_ROOT, 1024): the add_wp_10,
  vocab_grade_pictures and unit_form cards, and the add_wp_10, vocab_grade_pictures, order_negatives and unit_form quizzes.
  All 7 have identical hashes.
  - The order_negatives card's raw hash differs, but only by `button.zoom-icon-btn`, a transient chrome element that the
    builder's diff filtered out (D5).
  - The worksheets that changed (add_wp_10, vocab, order_negatives, unit_form) are all on the list.

## Defects

**D1 (C1, C3; regression; blocks).** The multiplication-chart card at 1366x768 and 1280x800 no longer fits the screen.

- Base: "Fill in the missing products." and the × 1–12 header row are visible with the first box focused.
- Head: the k2-multgrid floor makes all 13 rows 48 px tall, so the page scrolls. The instruction and the factor header row
  end up under the top bar, and the pupil cannot see the column factors they multiply by.
- At 1024x768, rows 11 and 12 sit under the sticky Hint / Check bar (row 12 already did on the base).
- Evidence: my shots `1366x768-multiplication-mult_chart_easy-1.png` (head `headshots2/`, base `baseshots/`) and
  `1280x800-…-1.png`. The rule is not width-scoped, and `changed-screens.txt` lists the 1280 / 1366 card as changed
  without judging its fit.
- Fix direction (builder's choice): scope the k2-multgrid floor to tablet widths / `(pointer: coarse)`, as plan item 7
  asks for tablets. Or keep the 48 px answer squares and let only the printed rows stay compact, so the chart fits
  638 px at 1366x768.
- Automatic check: a FIT rule in ws-phone-card. After load at 1280x800 and 1366x768, the question text and the first row
  of the cell (`[data-ws-cell]` first child row) lie inside the viewport below the top bar. It is backtested on
  mult_chart_easy: FAIL at 52a9f5369, OK at the fix.

**D2 (C1; pre-existing, not caused by this change; log it).** long_div_2digit fails TOUCH-HIT on every host:
`input.mq-cellslot 49 x 73` and `input.mq-work.mq-opswork 55 x 61`.

- A real tap 1 px inside the bottom edge focuses `body`: 22 findings at 1024 on both head and base.
- The builder's note reports TOUCH-TARGET / TOUCH-UNIQUE going to 0 but does not mention TOUCH-HIT on the changed screens.
- Automatic check: precritic's touch sweep already includes TOUCH-HIT. The lane report should cite it per changed skill.
  A re-check-list skill stays open until it is clean.

**D3 (C3; minor, pre-existing font).** On the mult-chart worksheet at 1280, the printed products are about 13 px in
49 px squares. The grid is now even, but the digits look very small against the squares (the "big digits" contract).
Not caused by this diff, but the diff makes it more visible.
- Automatic check: ws-grade-render's font floor run on the k2-multgrid `td` text.

**D4 (tool consistency; open question answered).** The add_wp_10 sign circle `input.mq-wwork.mq-gl-sign`
(`data-mq-kind="sign"`) should be held to the 48 px answer floor, so ws-grade-render is right.

- The instruction says "Type the sign". Typing the sign is a required production step even though it is
  `data-ws-graded="0"`.
- ws-phone-card's working-box list `.mq-wwork` (lines 273 and 468) holds it to 44, so the tool would pass a regression to
  44–47 px.
- The two tools should share one classifier, for example `tests/lib/touch-class.cjs`, imported by both:
  - **working box (44):** carry / regroup / `.mq-opswork` / `[data-mq-work]` / `.mq-wwork`, EXCEPT inputs with
    `data-mq-kind` (sign, answer), which are answer places;
  - **answer place (48):** everything else.
- Self-test fixture: a 46 px `mq-wwork mq-gl-sign` fails in both tools.

**D5 (tool; minor).** The `--geom` hash includes transient chrome (`button.zoom-icon-btn`, 0-size nodes). The filter the
builder used for the 118 / 528 proof is not in the committed tool, so a rerun of the committed `--geom` shows false
CHANGED screens.
- Fix: apply the filter inside GEOM, and add a self-test that the same tree hashes identically twice.

## Answers to the brief

- **Is a changed screen at 1280 / 1366 acceptable?** Yes for word-work, vocab, fact family, ordering, long division and
  boxed slots. No for the mult-chart card (D1).
- **Spot check of unchanged screens:** they are identical (7 of 7, once the zoom chrome is ignored).
- **Should the tools agree on the sign circle?** Yes. It is a 48 px answer place, so ws-phone-card should change (D4).

## Speed notes

D1 would have been caught before the critic if the hash-proof listing of 1280 / 1366 changes had been paired with a fit
check. A "changed" screen at a computer width needs a fit verdict, not just a list.
