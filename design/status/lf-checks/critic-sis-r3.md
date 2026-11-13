# Critic r3: tests/scripts/ws-screen-ink-size.cjs (check SCREEN-INK-SIZE, lane lf-checks), graded at 138f43d9 (frozen)

Independent critic, Opus medium, 2026-11-13. Every run was on a scratch worktree of 138f43d9 (/tmp/claude-0/wt-sis3), which has
since been removed. The probe fixtures and edited pins were in the critic's scratchpad. Browser runs went through
/tmp/mq-browser-run.sh, one at a time. No tracked file was edited except this report.

**VERDICT: PASS.** C1 9 · C2 9 · C3 9 · C4 8

## Evidence (runs)
| Run | Result | Time |
|---|---|---|
| `--self-test` | OK 55/55 (with the new D1, D2, D3 and D5 cases) | - |
| `ws-backtest --row` on all eleven screen-ink-size rows (ink, width, inkbox, sameitem, relabel, noref, spacer, divfacts, halo, ring, ring-large) | 11 PASS. divfacts prints "OK (fixture)" and "pass side is a fixture: re-point when a fix lands" ✓ | 109 s |
| `ws-backtest --list` | Both ring rows are listed; divfacts is flagged "re-point when a fix lands" ✓ | - |
| `--passed` against the pin | OK. 99 lines start with "pinned", 0 with "OVER", 0 SIZE-REF. "judged here: 42 of its keys, 99 pinned findings" ✓ | ~7 min, 624 renders |
| `--passed` mark names | box (skip-count strip) 14, counter (ten frame) 8, dot (array) 28, dot (dot tile) 14, ring (ten frame) 13. No bare noun ✓ (D3) | - |
| `--skill addition:add_facts --hosts card --widths 1280` with an edited pin: tile key worst 95 % (the tree gives 90 %, i.e. a drop below the pin), frame ring key n 2 (the tree gives 3) | FAIL (6). "over the pin: … dot (dot tile) …: worst 90 % < 95 % pinned" and "… ring (ten frame) …: 3 finding(s) > 2 pinned". The lines of the broken keys start "OVER", the counter key's lines start "pinned"; the totals cover the 3 keys judged ✓ (D2) | 28 s |
| The same run with the pin's worst set to 50 % (a looser pin) | OK, all lines "pinned" (correct: 90 % is better than the 50 % accepted) | 29 s |
| `ws-precritic --skill addition:add_facts --dry-run` | Plans `ws-screen-ink-size --skill addition:add_facts`; the label now names SIZE-INK, SIZE-REF, SIZE-WIDTH ✓ (m2) | - |
| Probe: screen rings at 70 % of the same item's print rings | FAIL "ring: screen 2.45 mm, print 3.50 mm (70 %; needs >= 95 % = 3.32 mm) [print: same item]" ✓ | - |
| Probe: small black screen rings (0.8 mm), paper draws dots only | SIZE-REF "ring: 12 marks of 0.80 mm have no print counterpart" ✓ (r2's false "40 %" is gone) | - |
| Probe: large black screen rings (3.5 mm), paper draws dots only | SIZE-REF ✓ (r2 passed this silently) | - |
| Probe: screen 12 rings, print 10 rings of the same size, same item | OK ✓ | - |

## Defects
**D1 (C4, minor): the SIZE-REF wording is wrong for a screen-only ring.**
- The message says "(no same item, no print drawing of the same marks and count)". In the ring probes the same item IS on
  paper; paper just draws no ring. The reader is pointed at the wrong cause.
- **Check:** the SIZE-REF message names the reason that applied ("paper draws no ring for this item" when the item matched
  but no print group of that mark kind exists). A self-test case on that string.

## Minors
- m1: `--passed` still takes about 7 min.
- m2: in `--html` / `--no-baseline` runs every line starts "OVER" although no pin is read. It is documented in the header,
  but "OVER (no pin)" or "new" would read better.
- m3: `ws-backtest --list` cuts the fixture paths ("ring-extr", "ring-matc"), so the two ring rows cannot be told apart from
  the list. Show the basename, not a cut path.
- m4: a pin outside the repo prints as a long `../-home-user-…/pin.json` path.

## Scores
- **C1 9:** Every false-negative probe is caught: rings at 70 %, a screen ring paper does not draw (small and large), a drop
  below the pinned worst %, and a count above the pin, under the new keys.
- **C2 9:** The r2 false alarm (a ring compared with dots) is gone. `--passed` gives no SIZE-REF and only real findings.
  There is no alarm on a count difference of the same mark kind.
- **C3 9:** Eleven rows PASS, a fixture pass side is marked and flagged, the sweep is tied to the pin by a self-test, and
  the tool is wired into precritic (label fixed) and the deploy gates.
- **C4 8:** Lines say "OVER" / "pinned", the totals are for the keys judged, and every mark carries its picture. D1 and m2–m4
  are small wording and legibility issues.
