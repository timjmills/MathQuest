# Visual-quality lane: independent critic, round 3 (final, narrow)

Critic: Opus 5.5, medium effort (critic profile). I did not build this work.
Branch `claude/sweet-newton-c8wrv1-visual-quality` at `11a6ced`. Date 2026-10-31. Narrow scope, as briefed: N1-N4 and
three regression spot-checks. Every other page stands on its round-2 grade (`critic-r2.md`).

**Verdict: FAIL on the brief's rule, by one page.** The lowest score is **C3 5**, on the Reason-It page at L for both
story skills (`sub_wp_20`, `add_wp_20_plain`). The N4 fix puts B under A, so at L the page holds **one item** (RUBRIC
H5, a lone item on a page). Its cell also leaves a 33.6 % empty band (H13).
- N1, N2 and N3 are fixed. N4's keys are fixed: every key item on true-false, reason-it and error-analysis is right at
  S and at L.
- Every other page graded here scores 8 or better.
- Scope note for the lead: round 2 graded Reason-It as an advisory role, so it did not count toward the pass bar
  (RUBRIC scope note 2026-09-26). The brief for this round asks that every page graded here score at least 8. Reason-It
  L is graded here, so the verdict is FAIL. If the lead keeps Reason-It advisory, every pass-bar page is at 8 or better
  and the lane would pass. The fix is small (see N12).

## How I graded

- Renders: `ws-grade-render.cjs --gate`, one run at a time. `R/` means
  `/tmp/claude-0/-home-user-MathQuest/cea1479a-7e02-5121-b21e-92a04002c02f/scratchpad/critic3/`.
  - `R/chart-S`, `R/chart-L`: `fact_family_sort` lesson and independent, `--opts '{"familyChart":true}'`. Gate **OK** at
    both sizes (round 2: FAIL with 14 and 18 findings).
  - `R/wp10-L`: `add_wp_10` lesson and independent. `R/wp10-S`: its lesson. OK.
  - `R/n4-S`, `R/n4-L`: `sub_wp_20` and `add_wp_20_plain` on true-false, reason-it and error-analysis. OK.
  - `R/reg-S`: `add_wp_20_plain` independent with the screen hosts. `R/reg-L`: `fact_family_sort` independent with the
    screen hosts. OK. `smallTargets` is empty on every host, `hScroll` is 0, and `consoleErrors` is empty.
- Empty bands: a pixel scan of each cell (`scratchpad/tools/bands.py`).
- Options: `offeredOptionsFor` called on all 8 story skills (`R/n3.mjs`).
- Keys: verified by hand, item by item, on every key page listed below.

## N1-N4

| r2 | Status | Evidence |
|---|---|---|
| **N1** lesson overflow with `familyChart` | **Fixed** | Gate OK at S and L. `R/chart-S/addition__fact_family_sort/lesson-p1.png` is the bare three-step model ("Find the big number." / "Add the small numbers." / "The same? Circle yes. Not? Circle no."), with Say and Rule readable inside the frame. `lesson-p2` (L) has guided practice and Steps inside the page. `lesson-p3` (L) has 6 triangles in a 2 × 3 grid. The lesson is still sound: it teaches the decision, and the chart (working space on the practice pages) is not drawn on it, which is right for a first lesson. On the independent page with the chart, S has 4 items and L has 3. The chart is keyed only for true families: S items 2 and 3 (4+13=17, 3+17=20) are filled, while items 1 (10+7≠13) and 4 (12+2≠15) are left blank and circled No. L items 1 to 3 are the same |
| **N2** `add_wp_10` lesson L band 30.4 % | **Fixed** | The largest band on lesson p3 is 20.6 % at L (`R/wp10-L/.../lesson-p3.png`; the 7 apples draw on one line) and 19.7 % at S. On the p2 practice cells, the warm-up stacks keep their writing room (21.5 % at L, 28.1 % at S). Round 2 accepted the p2 vocabulary panel and the Guided/Steps split, and they are unchanged |
| **N3** `wpCues` / `wpBank` offered | **Fixed** | `offeredOptionsFor` on all 8 skills (`add/sub_wp_10`, `_20`, each with `_plain`) lists neither option. Both remain in `SKILL_OPTIONS` as `hidden: true`, so old share codes still decode. `add_wp_100` / `sub_wp_100` still offer them (out of this ruling's scope) |
| **N4** sentence frame ignores `shown` | **Keys fixed; the layout opens N12** | All 56 key items are right (list below). True-or-False shows the wrong claims (16 − 9 = 25, 7 + 1 = 6, 3 + 2 = 1, 15 − 6 = 21), and each False tick sits on a value that differs from the answer. Reason-It A ≠ B, and the frame stays inside its panel. At S, Reason-It holds 2 items and the page is full, so neither H5 nor H13 applies: the response column has gaps, but the story column fills each band. **At L it holds 1 item: N12** |

Keys verified (56 items):
- `sub_wp_20`: true-false S (6) and L (4), reason-it S (2) and L (1), error-analysis S (6) and L (4).
- `add_wp_20_plain`: the same set (6, 4, 2, 1, 6, 4).
- Regression pages: `add_wp_20_plain` independent S (11), `fact_family_sort` independent L (6), `add_wp_10`
  independent L (4).
- The chart keys: S 4 and L 3.

## Scores (C1 use · C2 teaching · C3 spacing · C4 standard)

| Page | S | L | Notes |
|---|---|---|---|
| `fact_family_sort` lesson, `familyChart` on (3 pp + key) | 8·8·8·8 | 8·8·8·8 | N1 fixed. The r2 nit N9 stands: frames 1 and 2 draw the same unmarked triangle |
| `fact_family_sort` independent, `familyChart` on | 8·8·8·8 | 8·8·8·8 | 4 / 3 items; the chart is keyed only for true families |
| `add_wp_10` lesson | 8·8·8·8 | 8·8·8·8 | N2 fixed: bands at most 20.6 % in the practice cells |
| `add_wp_10` independent (regression) | — | 8·8·8·8 | 4 items; groups split with a gap (4 _ 2, 4 _ 6); band at most 25.5 % |
| `sub_wp_20` true-false | 8·8·8·8 | 8·8·8·8 | Keys right; band 16 %; L uses about 82 % of the body |
| `add_wp_20_plain` true-false | 8·8·8·8 | 8·8·8·8 | as above |
| `sub_wp_20` error-analysis | 8·8·8·8 | 8·8·8·8 | Keys right; bands 22 % |
| `add_wp_20_plain` error-analysis | 8·8·8·8 | 8·8·8·8 | as above |
| `sub_wp_20` reason-it | 8·8·8·8 | 8·**7**·**5**·8 | **N12** at L: one item, an H5 lone item, and a 33.6 % band below B (H13) |
| `add_wp_20_plain` reason-it | 8·8·8·8 | 8·**7**·**5**·8 | **N12** |
| `add_wp_20_plain` independent S + card-390 (regression) | 8·8·8·8 | | 11 items, band 17.3 %; the card is unchanged from r2 |
| `fact_family_sort` independent L + card-390 (regression) | | 8·8·8·8 | 6 items, band 17.9 %; the card's Yes / No targets are at least 44 px |
| Options panel, 8 story skills | 8·8·8·8 | | N3 fixed |

## New findings

**N12 · blocking under this brief (advisory in r2 scope) · Reason-It at L, sentence-layout stories: a lone item on the
page (H5, H13)**
- Where: `R/n4-L/subtraction__sub_wp_20/reason-it-p1.png` and `-key-p1.png`, and the same pages for
  `addition__add_wp_20_plain`. The score reads "/1".
- Cause: commit `11a6ced` draws a sentence story as the wide form (B under A), and A and B each print the whole story.
  - One item is about 470 px tall at L.
  - Two items do not fit the 867 px body, so the page holds one item.
  - The one item's cell is stretched to about 700 px and leaves 235 px empty below B (33.6 %).
- Also a teaching cost (C2): A and B repeat the same three-line story word for word. That doubles the reading for an
  ELL pupil, and the only difference between the panels is the answer box.
- Fix:
  - Print the story once, across the top of the item, and draw two sentence frames under it, labelled A and B. That
    removes about 75 px a panel at L, so 2 items fit, and it halves the reading.
  - Or, failing that, size the cell to its content and let the role take 2 items at L (`counts()` / `layout()` in
    `roles/reason-it.js`).

**N13 · nit · error-analysis `sub_wp_20` S:** items 1 and 2 are both "takes 1 out" (16 − 1 and 7 − 1). Two
take-away-1 stories in one page of six is thin variety. Not capped.

## Automatic checks (that would have caught this round's findings)

| Finding | Check |
|---|---|
| N12 lone item | `ws-grade-render --gate` should FAIL a role page with `perPage === 1` when the role's capacity is at least 2 at another size, or when the item's cell band is at least 30 %. Run the reason-it role at S, M and L in `ws-precritic --skill` for every template whose layout changes the A/B form (backtest: `sub_wp_20` reason-it L, seed 222410) |
| N12 repeated story | A Reason-It lint: when panel A's prompt text equals panel B's, draw the prompt once (or flag a repeated prompt) |
| N4 (holds) | A key consistency check on true-false: a False tick needs the drawn value to differ from the key value, and a True tick needs them to match. 56 hand-checked items this round could have been one assert |
| N3 (holds) | `ws-options-verify` assert: the 8 sentence-layout skills never offer `wpCues` / `wpBank` |

## Speed-ups

- The fix commit was checked at S only for Reason-It. A layout change to a role must be rendered at S and L before the
  critic; the gate (`--gate`) does not see an under-filled page. Add the lone-item check above, so the builder sees it.
- `bands.py` should live in the repo (`tests/scripts/`), print the maximum per page, and run inside `--gate`. This
  round spent several calls re-measuring bands by hand.
- `ws-grade-render --help` starts a full render. Make `--help` print the header and exit.
