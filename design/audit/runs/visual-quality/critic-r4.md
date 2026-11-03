# Visual-quality lane: critic round 4 (final, narrow)

Independent critic, Opus medium. Branch `claude/sweet-newton-c8wrv1-visual-quality` at `ee575ad`, 2026-10-31.
Scope: the r3 failure **N12** (Reason-It at L for the sentence-layout stories), plus one regression spot check. Every other
page keeps its r2 or r3 grade.

**Verdict: PASS.** Every page graded in this round scores at least 8 on all four criteria. The lowest score is 8:
C3 on Reason-It at S for both skills, where a 9 % band sits below the grid.

## Renders

- `node tests/scripts/ws-grade-render.cjs --skills subtraction:sub_wp_20,addition:add_wp_20_plain --roles reason-it --size S|M|L --gate`.
  It was run once per size, and each run printed `ws-grade-render: OK`.
- Regression: `--skills addition:add_wp_20_plain --roles independent --size L --gate`. It printed `OK`.
- The output is in `/tmp/claude-0/-home-user-MathQuest/cea1479a-7e02-5121-b21e-92a04002c02f/scratchpad/critic4/{S,M,L,reg}`.

## N12: fixed

The story now prints **once** at the top of each cell, with the A and B sentence panels under it. At L the page holds **2
items** (r3: 1) on 1 page.

| Size | Items per page | Band below grid | Inside cells |
|---|---|---|---|
| S | 2 | 8.6 % | Largest gap about 16 % of the cell, under right column. Under the H13 limit of 30 % |
| M | 2 | 3.7 % | Under 30 % |
| L | 2 | 1.8 % | Under 30 % |

No ink crosses a panel, cell or page border at any size. The question still makes sense: the story is read once, A and B
are two complete number sentences for that story, and the pupil circles one and writes the answer.

## Keys (12 items, all right)

At every size, A and B differ, the right one is circled, the blank names it, and the answer blank holds the value.

- **`sub_wp_20`** (S, M and L give the same seed and items):
  - 6 − 5: A = 1 is circled; B = 11 is the wrong answer.
  - 8 − 5: B = 3 is circled; A = 13 is the wrong answer.
  - Both wrong answers come from adding instead of subtracting, so they match the real error.
- **`add_wp_20_plain`**:
  - 10 + 2: A = 12 is circled; B = 8 is the wrong answer.
  - 4 + 3: B = 7 is circled; A = 1 is the wrong answer.
  - Both wrong answers come from subtracting instead of adding.

The right answer falls under A in item 1 and under B in item 2, so the position does not give it away.

## Scores (C1 use · C2 teaching · C3 spacing · C4 standard)

| Page | S | M | L |
|---|---|---|---|
| `sub_wp_20` Reason-It, pupil + key | 8·8·8·8 | 8·8·9·8 | 8·8·9·8 |
| `add_wp_20_plain` Reason-It, pupil + key | 8·8·8·8 | 8·8·9·8 | 8·8·9·8 |
| `add_wp_20_plain` independent L, pupil + key (regression) | | | 9·8·9·8 |
| `add_wp_20_plain` card-390 (regression) | | | 8·8·8·8 |

- **Reason-It at S, C3 8:** the grid ends with an 8.6 % band below it. The page is still more than 90 % used, and the
  ceiling of 4 is not reachable with 2 tall cells per page, so H5 does not apply.
- **Independent page at L:**
  - 8 items in a 2×4 grid. The story prints in every cell and the band below the grid is about 2 %.
  - All 8 key answers are right: 15, 9, 16, 18, 11, 13, 18 and 5.
  - The `noStory` flag does not leak into the default page.
- **card-390:** the story prints above the equation slots, and nothing crosses the card edge.

## New findings

None that cap a score.

**Nit:** at S and M the right column leaves a tall gap between "__ is correct." and "The answer is __.". It is under the
H13 limit, so it is not capped.

## Automatic checks

- Add a precritic assertion that the story text appears exactly once in each sentence-layout `reason-it` cell. This is the
  machine check for N12, and it must be on the `ws-backtest` path.
- In `--gate`, fail a Reason-It page with `perPage` 1 at any size when its `ceiling` is 2 or more.

## Speed-ups

- `ws-grade-render.cjs --help` has no help branch, so it starts a full default render. Add a `--help` that exits
  straight away; this round lost about 2 minutes to it.
- `--size` already takes a list, so `--size S,M,L` replaces three separate runs.
- `meta.json` already records `perPage`, `ceiling` and `cellH`. Printing the band-below-grid percentage there would save
  the critic from measuring it by hand.
