# Critic round 2: touch floor engine rule (lf-checks, branch claude/sweet-newton-c8wrv1-lf-tools-tt)

Critic: independent, Opus medium, 2026-11-14. I graded `git diff c24d069f5..a1ec6ffbb` (the r1 fixes) and the whole change
`git diff 7a5bc902c..a1ec6ffbb`.

## Verdict: FAIL (C1 8 / C2 8 / C3 8 / C4 7)

| Criterion | Score | Why |
|---|---|---|
| C1 Ease of use | 8 | **D1 is fixed.** The mult chart card fits at 1366x768 and 1280x800, with the instruction and the x 1-12 row in view. The sign circle, ordering, fact family and long-division boxes are 48 px on tablets. The leftovers below are minor or pre-existing (D7, D2). |
| C2 Educational value | 8 | The content is unchanged. The sign circle is an answer place, which matches "Type the sign". |
| C3 Spacing and layout | 8 | All 4 required screens render clean (see "Renders"). On a tablet the chart grid is even. At 1280 / 1366 the chart keeps the master layout. |
| C4 Standard fidelity | 7 | **D6:** ws-phone-card's answer floor at 1280 / 1366 drops from 48 to 44 for every skill. That contradicts SP-10, and it hides a real 44 x 44 answer box that master's own tool flags. |

## What I verified myself

**D1, the multiplication chart card**
- 1366x768 (`headshots/1366x768-...-mult_chart_easy-1.png`) and 1280x800 (`m1280/1280x800-...-1.png`) both fit. The instruction,
  the x row and all 12 rows sit between the top bar and the Check bar.
- 1024x768: the 48 px squares are there, but the instruction and the x row scroll under the top bar (see D7). This matches the
  builder's `r1-before` / `r1-after` 1024 shots.
- Row `touch-floor-fit-top` gives **PASS**: FAIL c24d069f5 in 225.6 s, OK 4236381bc in 27.7 s. FIT-TOP catches the r1 state.

**D4, the shared classifier**
- `tests/lib/touch-class.cjs` is required by both tools:
  - ws-phone-card uses it in TOUCH, TOUCH-TARGET and FOCUS-RING (`TC.INJECT`);
  - ws-grade-render uses it in `measure()`, through `window.touchKind`, and in `touchFindings`, through `TC.FLOOR`.
- `touchKind` returns `answer` for `data-mq-kind` sign or answer, before the working-box test. So a `.mq-wwork` sign is an
  answer place. Self-test: 15 cases, OK.
- Row `touch-class-sign` gives **PASS** (FAIL 0.8 s, OK 0.7 s).
- **The blue focus ring on the sign circle is right.** It uses the same `--mq-next` 4 px blue ring as the frame's other
  answer boxes. It is additive (a new selector, screen hosts only, with the wrong / empty states excluded). My head run gives
  FOCUS-RING 0 on add_wp_10 and sub_wp_10. The base tree, judged by the same tool, gives FOCUS-RING 16.

**D5, the screen diff**
- I ran a fresh `--geom` on 9 skills x 4 widths x 3 hosts: head, then base 7a5bc902c via MQ_ROOT. I then ran
  `--geom-diff`: 140 screens, 44 changed.
- Compared with the committed `changed-screens.txt` (same skills): **every worksheet and quiz line reproduces exactly.**
- The **card** lines do not reproduce. 4 differ:
  - in the committed list, not in mine: add_sub_fact_family 1024 / 1280 card, mult_div_fact_family 1024 card;
  - mine reads identify 1280 card where the committed list has identify 1366 card;
  - mine adds add_sub_fact_family 1366 card.
  - Every one of these is a `div.visual-aid` moving 7-19 px as the zoom wiring wraps it. See D5b.
- Spot check of 3 screens NOT on the list: sub_wp_10 card and quiz, vocab_grade_pictures card, and the mult_chart_easy
  1280 / 1366 card. All are unchanged in my run, which agrees with the list.

**The other checks**
- Row `touch-floor-wrappers`: **PASS**.
- `ws-lesson-baseline --check` against my own pin of 7a5bc902c: OK, 334 hashes identical. Print is untouched.
- `ws-precritic-plan --checks-from-critics`: 190 pass / 48 exempt / 14 fail, which matches the builder's note. The 14 are
  the same older ledger rows; no row was dropped.

**The builder's note.** Confirmed, with three exceptions:
- the "two listed lines are zoom-wiring timing" undercounts it (D5b);
- the SP-10 reading is wrong (D6);
- the head run's TOUCH-HIT 8 on the mult_div_fact_family 1280 card is the probe opening the zoom overlay mid-run. It is a
  tool artifact, not this change, and the base is clean only by timing.

## Renders (head, my own shots)

- **add_wp_10 card, 1024:** clean. The sign circle, both boxes and the answer box are on one line, each 48 px, and the blue
  ring sits on the answer.
- **vocab_grade_pictures worksheet, 820:** clean. The letter boxes are even, and nothing overflows.
- **add_sub_fact_family quiz, 1024:** clean. The 2-digit strip shows its divider (SL-13), and the rows are aligned.
- **long_div_2digit card, 1280 (x900 and x800):** fits, and the tracks are even. TOUCH-HIT is unchanged from master (D2).
- Nothing is broken.

## Defects

**D6 (C4, blocks): the computer-width touch floor is a weakening that SP-10 forbids.**
- **What the change does.** `floorAt` gives 44 for every box above 1100 px. Master's ws-phone-card held answer places to 48 at
  every width of 600 px or more (`7a5bc902c:tests/scripts/ws-phone-card.cjs:225, 276`).
- **What the rules say:**
  - WORKSHEET_DESIGN_STANDARD SP-10 (line 1227): "Minimum touch target 44 x 44 px for every input ...; **digit inputs are at
    least 48 px tall**. The only exception is a 10-column chart on a phone." There is no width scope. The builder cites only
    the first clause ("SP-10's 44 px general floor").
  - The owner rule (CLAUDE.md fastest plan item 7) and RUBRIC H6 keep 48 for tablets; neither lowers SP-10 on a computer.
- **Evidence.** I ran master's tool on the head tree (MQ_ROOT) at 1366x768 and 1280x800. mult_chart_easy fails on the card,
  the worksheet and the quiz: `TOUCH-TARGET 8 x input.mq-cellslot 44 x 44 px (an answer place: want >= 48 x 48)`, plus the
  matching TOUCH findings. These chart boxes are the same on master, so the defect is pre-existing. **The new tool hides it,
  and it hides any future 44-47 px answer box at 1280 / 1366 in every skill.**
- **Fix direction.** Keep 48 for answer places at every screen width of 600 px or more (at least for height, as SP-10 says).
  Record the multiplication chart at more than 1100 px as a NAMED exception: a selector in touch-class with a reason, ruled by
  the lead or owner, like the compact-layout ruling. Or make the chart's answer squares 48 px tall at a computer width while
  the printed rows stay compact (r1's second option), if that still passes FIT-TOP.
- **Automatic check.** Add a touch-class self-test case: `floorAt('answer', 1280) === 48`, unless the element matches the
  ruled exception list. Add a backtest row on mult_chart_easy at 1366 that FAILs on a planted 46 px answer box in a
  non-exception skill (for example add_wp_10's answer box) at 1280.

**D5b (tool, minor): the card-host GEOM diff is not deterministic for cards with a `.visual-aid`.**
- The zoom wiring resizes the visual-aid on a timer (7-19 px). Left out of the hash are only the class `zoom-trigger` and
  the button. So a rerun moves about 4 card lines in and out of the list (evidence above), not the "2 of 2" in the note.
- **Automatic check.** `--geom` waits until the zoom wiring has settled (every `.visual-aid` carries `zoom-trigger`, or there
  are no mutations for 500 ms) before it measures. The self-test hashes the same card twice, with the wiring timer racing,
  and expects equal hashes.

**D7 (C1, minor, not new): on a tablet (1024x768) the chart's instruction and x row scroll out of view** while the pupil
types in the focused box. The 48 px squares that the owner rule needs make 13 rows taller than the screen. FIT-TOP is
scoped to computers, so nothing catches this.
- **Direction (facts lane).** A sticky x header row, or start focus at the top row.
- **Automatic check.** FIT-TOP extended to tablets for the column-header row only (the factor row stays in view while any
  answer box is focused).

**D2 (routing honest).** long_div_2digit TOUCH-HIT is pre-existing.
- The builder found the root cause: the bracket twin's digit spans overlap the input bottoms. The fix direction is named and
  routed to lf-hosts. Master's tool on the head tree gives the same counts as on base.
- This routing is honest. The skill stays on the re-check list until lf-hosts closes it.

**D3 (routing honest).** The 13 px printed products in the chart are a master-wide chart font question, not this rule's.
The 48 px squares are tablet-only now, which removes the contrast r1 saw at 1280. It is routed to the facts lane. Honest.

## Checks that would have caught this round's findings

- **D6:** a floor-parity self-test against SP-10's text (answer height 48 at every screen width), plus the backtest row above.
- **D5b:** a GEOM determinism self-test (hash the same live card twice, 1 s apart).
- **D7:** a header-in-view check on tablets.

## Speed note

- **Lost round cause.** The builder resolved a design-rule conflict (SP-10 48 versus fitting 1366x768) inside a test tool, by
  lowering the floor, instead of raising it as a ruling.
- **Rule.** A tool floor may be lowered only with a named exception plus a ruling line. The touch-class self-test should pin
  the floors.
