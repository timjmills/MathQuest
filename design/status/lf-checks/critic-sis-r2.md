# Critic r2: tests/scripts/ws-screen-ink-size.cjs (check SCREEN-INK-SIZE, lane lf-checks), graded at 126106c5 (frozen)

Independent critic, Opus medium, 2026-11-13. Every run was on a scratch worktree of 126106c5, which has since been removed.
The probe fixtures were in the critic's scratchpad. Browser runs went through /tmp/mq-browser-run.sh, one at a time. No
tracked file was edited except this report.

**VERDICT: FAIL.** C1 8 · C2 7 · C3 8 · C4 8

## Evidence (runs)
| Run | Result | Time |
|---|---|---|
| `--self-test` | OK 36/36 | - |
| `ws-backtest --row` on all nine screen-ink-size rows (ink, width, inkbox, sameitem, relabel, noref, spacer, halo, divfacts) | 9 PASS. divfacts: FAIL on 73e96fc1, OK on the fixture | 107 s |
| `--passed` against the pin | OK. 99 findings within the pin (38 keys, 99 findings), 0 SIZE-REF | 423 s, 624 renders |
| `--skill division:div_facts --hosts card --widths 1280` with a pin edited to worst 50 % (the tree gives 11 %) | FAIL: "over the pin: ... worst 11 % < 50 % pinned" ✓ | 27 s |
| `ws-precritic --skill division:div_facts --dry-run` | Plans `ws-screen-ink-size --skill division:div_facts` (default pin) ✓ | - |
| `ws-precritic-plan` | screen-ink-size-divfacts OK. The other eight rows are fixtures ("not applicable"). The plan FAILs on 21 rows of other lanes (cc-*, pv-*, *-facts); none belong to this tool | - |
| Probe: dots at 80 %, no halo | FAIL 80 % ✓ | - |
| Probe: a strip whose ink is 50 % / 56 % of the free width, taller than wide | FAIL ✓ (the ink is read, not the svg box) | - |
| Probe: rings (fill none, black stroke) at 70 % | FAIL ✓ | - |
| Probe: grey-filled counters at 70 % | FAIL ✓ (the halo rule keeps real ink) | - |
| Probe: white fill with a black outline at 70 % | FAIL ✓ | - |
| Probe: a number line, a full-width wide array, a tall array filling its free width | OK ✓ | - |
| Probe: a digit only | SIZE-READ in `--html` (correct) | - |
| Probe: screen dots at print size plus 12 small black rings (0.8 mm) that paper does not draw | **FAIL "dot (array): screen 0.80 mm, print 2.00 mm (40 %)"** ✗ | - |
| Probe: the same, with 12 grey keyline rings larger than the dots | **OK, no SIZE-REF** ✗ | - |

## Defects
**D1 (C2, C4): a ring is still compared with dots, and it is named "dot".**
- `matchRef`'s same-item fallbacks are tried in order: (3) the same mark with any count, then (4) the same count with any
  mark. Step 4 pairs a screen `circle.ring` group with the print's solid dots whenever the counts match.
- Effect: a screen-only ring group that is smaller than the dots raises a false alarm ("40 %"). One that is larger passes,
  when it should FAIL as SIZE-REF.
- `nounOf` splits the `circle.ring` key on "." and so names the ring "dot". The message and the pin key therefore cannot tell
  the ring from the dots.
- This undoes the claim that rings are their own mark.
- **Check:** two fixture rows, `ring-extra.fail` (a SIZE-REF) and `ring-extra-large.fail`. Add a self-test that
  `matchRef(…{mark:'circle.ring'}…)` against dots only gives null, and that a ring's noun is "ring".

**D2 (C4, legibility): findings inside the pin print the same as failing ones.**
- With the pin edited, the run printed 6 SIZE lines and then "FAIL (3)". The reader has to cross-match the "over the pin"
  keys to see which lines failed.
- The "within the pin" line also gives the totals of the whole pin (38 / 99) on a one-skill run.
- **Check:** a self-test on the printed lines. Prefix "pinned" or "OVER" on each line, and give totals for the judged keys
  only.

**D3 (C4, legibility): some add_facts marks have no picture name.**
- The tile and frame supports print a bare "dot". sub_facts names the same supports "counter (ten frame)" and "dot (dot tile)".
- **Check:** in `--passed`, every mark name of a support drawing carries a picture. Fall back to the support value.

**D4 (C3): a pass-side fixture on a commit-pair row is unmarked.**
- The ws-backtest change (4 lines) is sound. But the table prints that state as a plain "OK", and nothing flags the row once
  a div_facts fix lands.
- `{root}` is not filled in a fixture state.
- **Check:** ws-backtest prints "OK (fixture)" for that state, and ws-precritic-plan lists fixture-pass commit-pair rows.

**D5 (C3, minor): nothing keeps the sweep in step with the pin.**
- The sweep is correct today (719fd1e0, 38 / 99), but the next re-pin can leave it stale again (r1 D7's check).
- **Check:** compare the sweep header's totals with `pin.totals` in the self-test or ws-precritic-plan.

## Minors
- m1: `--passed` takes 7 min.
- m2: the precritic gate label says "SIZE-INK, SIZE-WIDTH" and leaves out SIZE-REF.

## Scores
- **C1 8:** Every false-negative probe is caught: the owner's case, a drop of the pin's worst % (90 to 50), and the halo
  exclusion keeping grey and outline counters. The larger unmatched ring passing without SIZE-REF is the one gap (D1).
- **C2 7:** There was no false alarm on digits, number lines or wide drawings, and the `--passed` findings are real. D1 is a
  false alarm by construction.
- **C3 8:** Nine rows PASS, the pin ratchets end to end, and the tool is wired into precritic and the deploy gates. D4 and D5.
- **C4 8:** Messages name the numbers, the limit and how the print reference was found. D2 and D3 are legibility defects to
  fix with D1.
