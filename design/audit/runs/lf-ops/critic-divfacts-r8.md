# lf-ops: division:div_facts, independent critic, round 8 (narrow re-check of R7-1 and R7-2)

- **Critic:** independent (built none of it), Opus 5.5 medium. **Date:** 2026-11-09.
- **Tree:** frozen worktree `crit8w` at **b43bf8b9**. All renders made on that commit by this critic, one browser run at a time.
- **Previous round:** r7 (`critic-divfacts-r7.md`, FAIL, lowest 7: R7-1 Test < Independent count, R7-2 fade L page 3 20 mm fact-to-line gap).
  Every other r7 page scored >= 8 and is not regraded.
- **Rulings in force:** owner 2026-11-08 / 11-09: every support's div_facts Test page prints the Independent count at each size; at L a fact
  too wide for its column starts under the number tab, 3 columns kept; signed facts card F1-F4; r7's earlier rulings.
- **Scope:** Test page S/M/L with supports off and each support alone; array `constant [2,3,4]`; fade packet L pages 1-3 (+ keys). Print only.

## Renders (`/tmp/claude-0/-home-user-MathQuest/447a1d04-e24b-5c13-8aba-a33c056c9d3a/scratchpad/r8-renders/`)

| Dir | Command |
|---|---|
| `off/` | `ws-grade-render --skills division:div_facts --roles test --size S,M,L --no-screen` |
| `touch/ skip/ array/ think/ boxsign/` | the same with `--supports X` |
| `array-c234/` | the same, `--supports array --opts '{"constant":[2,3,4]}'` |
| `fade-L/` | `ws-print-lint --source kit --skills division:div_facts --supports all --fade packet --pages 3 --size L --save-html` (lint OK, 0 findings), then `shot.cjs.txt` (localhost CSS origin rewritten to the worktree) -> `page-1..6.png` (3 pupil + 3 key) |
| `meas.py.txt`, `gap.py.txt` | grid / pitch / white-under-grid / side gap; fact-ink-to-answer-line gap per row |

1 px = 0.2646 mm. A full page leaves 6.9 mm from grid to footer ink (the floor).

## VERDICT: PASS

Lowest score **8**. R7-1 and R7-2 are fixed on the ink; no new defect.

### Test counts vs the builder's table (all match; Test = Independent at every size)

| Support | S | M | L | measured grid (cols x rows) S / M / L |
|---|---|---|---|---|
| off | 36 | 24 | 18 | 4x9 / 3x8 / 3x6 |
| array (default, greyed = off) | 36 | 24 | 18 | 4x9 / 3x8 / 3x6 |
| touch | 15 | 15 | 12 | 3x5 / 3x5 / 3x4 |
| skip | 21 | 15 | 12 | 3x7 / 3x5 / 3x4 |
| think | 24 | 15 | 12 | 3x8 / 3x5 / 3x4 |
| boxsign | 20 | 16 | 12 | 4x5 / 2x8 / 3x4 |
| array 2-4 (drawn) | 20 | 12 | 10 | 5x4 / 4x3 / 2x5 |

## Scores (C1 / C2 / C3 / C4) - Test pages

White = grid to footer ink; every page's white minus the 6.9 mm floor is under one row pitch (L19).

| Support | S | M | L |
|---|---|---|---|
| off / array default | 8/8/8/8 (pitch 22.1, white 38.9 at the owner's 36 cap) | 8/8/8/8 (pitch 27.8, white 15.3; was 21 / 34.4 in r7) | 8/8/8/8 (33.6, white 34.9 -> 28.0 net) |
| touch | 8/8/8/8 (46.2, 6.9, side 5.56) | 8/8/8/8 (46.2, 6.9, side 4.76) | 8/8/8/8 (51.9, 29.4) |
| skip | 8/8/8/8 (33.0, 6.9, side 3.70) | 8/8/8/8 (46.2, 6.9) | 8/8/8/8 (56.2, 12.2, side 3.18) |
| think | 8/8/8/8 (28.9, 6.9) | 8/8/8/8 (42.1, 27.3) | 8/8/8/8 (50.5, 34.9) |
| boxsign | 8/8/8/8 (46.2, 6.9) | 8/8/8/8 (2x8, box beside the fact as on Independent, 28.9, 6.9) | 8/8/8/8 (57.5, 6.9) |
| array 2-4 | 8/8/8/8 (57.7, 6.9) | 8/8/8/8 (71.5, 23.3) | 8/8/8/8 (2x5 beside, 46.0, 6.9) |

## Fade packet L

| Page | Items | Pitch | White | Fact-to-line | C1/C2/C3/C4 |
|---|---|---|---|---|---|
| 1 (all supports) | 6 (3x2) | 100.3 mm | 36.3 mm | - | 8/8/8/8 |
| 2 | 9 (3x3) | 75.6 mm | 20.9 mm | 12.4 mm | 8/8/8/8 |
| 3 (bare) | **18** (3x6; r7: 15) | **36.2 mm** (r7: 41.1) | 31.0 mm (24.1 net < pitch) | **12.4-13.0 mm** (r7: 20.1) | 8/8/8/8 |

Packet is now 6 / 9 / 18, page 3 equals the Independent L count (18). Facts start under the tab (ruling), 3 columns kept.

## Keys (spot-checked)
- off Test M key: facsimile of the pupil page, all 24 answers correct.
- fade L page 6 (key of page 3): facsimile, all 18 answers correct (incl. 0 ÷ 7 = 0, 9 ÷ 9 = 1).
- ws-grade-render produced a key for every Test page (`test-?-key-p1.png`).

## Defects
None at a score below 8.

## Observations (no score effect)
- Fade L page 3: answer-line length varies by cell (e.g. #32 shorter than #29); one length per page would read cleaner (r7 noted the same at M).
- Fade L: fact sits 2.91 mm from the left rule under the tab (CL-8 3 mm; r7 nit, unchanged).
- boxsign: "box + fact" centred per cell, so the fact's x drifts a few mm down a column (r4-r7 nit, unchanged).
- Touch tally on fade page 2 prints the same 12-dot strip in every cell (by design, r7 "12-dot tally").
- array 2-4 L: 0 ÷ 3 is an empty frame; F2 one frame height per section, by ruling.

## Rule 00 lists

**Automatic checks that would have caught each r7 finding (now passing):**
1. R7-1 -> EB-TESTEQ (`test-eq-ind-divfacts` backtest at b43bf8b9): Test count >= Independent count for every support and size. Confirmed
   independently here from ws-grade-render's grid line against the builder's table: 21 / 21 rows match.
2. R7-2 -> EB-GAP (`eb-gap-divfacts` backtest): fact-to-slot gap spread across a packet's pages <= 1 mm; measured 12.4-13.0 mm on pages 2-3.
   Add EB-FADE-CAP (last bare packet page count >= Independent count at that size) if not already in EB-GAP: here 18 = 18.

**Speed-ups this round revealed:**
1. ws-grade-render's per-size `cols x rows` line is enough to verify counts; a `--expect-count S,M,L` flag would make the count check a one-liner gate.
2. The fade packet still needs a hand-written Puppeteer screenshot with the localhost origin rewritten; ws-print-lint `--save-png` (or ws-grade-render `--fade packet`) would remove that step from every critic round.
3. Keep `meas.py` / `gap.py` as shared tools under `tests/scripts/` so critics stop re-copying them from the previous round's scratch.
