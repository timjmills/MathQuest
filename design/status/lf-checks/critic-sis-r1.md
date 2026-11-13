# Critic r1: tests/scripts/ws-screen-ink-size.cjs (check SCREEN-INK-SIZE, lane lf-checks), graded at 844c4873 (frozen)

Independent critic, Opus medium, 2026-11-13. All runs were on the frozen tree, except one scratch worktree of master 73e96fc1
(run with MQ_ROOT, since removed). The probe fixtures are in the critic's scratchpad. No tracked file was edited except this report.

**VERDICT: FAIL.** C1 6 · C2 7 · C3 7 · C4 7

## Evidence (runs)
| Run | Result | Time |
|---|---|---|
| `--self-test` | OK 16/16 | - |
| `ws-backtest --row screen-ink-size-ink` / `screen-ink-size-width` | PASS / PASS | 6 / 6 s |
| `--skill division:div_facts` with MQ_ROOT=master 73e96fc1 | FAIL 28. Every host and width, 390 included: dots 1.77 vs 1.96 mm (90 %), strip 10.8 x 32.3 mm (10-47 % of the free width) ✓ | 55 s, 72 renders |
| `--passed` against the pin | OK. 69 findings within the pin, 0 "no print counterpart" notes | 367 s, 552 renders |
| `ws-precritic --skill division:div_facts --dry-run` | Plans `ws-screen-ink-size --skill division:div_facts` (default pin) ✓ | - |
| `ws-precritic-plan` | OK (112 on path). The two sis rows are fixture rows ("not applicable") | - |
| Probe: dots at 80 % | FAIL ✓ | - |
| Probe: strip at 55 % of the free width, taller than wide | FAIL ✓ (it reads 56 %) | - |
| Probe: a wide number line, a tall drawing at full width, a fact digit | No SIZE finding ✓. In --html mode the digit gives SIZE-READ, which is correct | - |
| Probe: one big picture shrunk from 30 mm to 8 mm | Not judged (outside the rule: repeated marks only) | - |
| Probe: a strip drawn in a `width:100%` svg (default preserveAspectRatio) | **OK** ✗ | - |
| Probe: a screen array whose aria-label differs from print ("dots for 12") at 50 % | **OK**, with a note only ✗ | - |
| Probe: print page holds a 2x3 (4 mm dots) and a 10x10 (1 mm dots); screen 2x3 at 2.6 mm | **OK** ✗ (it is 65 % of its own print) | - |
| Same print page; screen 10x10 drawn exactly at print size | **FAIL "40 %"** ✗ (a false alarm) | - |
| Probe: strip beside an empty `flex:1` spacer | The free width is read as 20 mm of 181.5 mm | - |

## Defects
**D1 (C1): SIZE-WIDTH measures the svg's box, not its ink.**
- A tall viewBox in a `width:100%` svg draws a centred strip of dots. The box is full width, so the drawing passes.
- **Check:** a `--html` fixture row (`stripbox`): a 6-rows-of-2 viewBox in a full-width svg must FAIL. Then take the width and
  height from the union of the mark rects.

**D2 (C1/C2): the print reference is not the same item.**
- Kind = aria-label with the digits stripped ("array"). Its size is the MEDIAN over every item on the print page, and the page
  is dealt from different seeds than the card's (7, 8, 9).
- As soon as mark size depends on the item, this misses real shrinkage and raises false alarms (see the two probes above).
  The skills judged today keep a fixed dot size, so no real case was found.
- **Check:** a fixture pair (`sameitem_fn` must FAIL, `sameitem_fp` must be OK). Then match the screen item to the print cell
  that holds the same item (generateQuestionFor seed/itemIndex), or to the same drawing dimensions.

**D3 (C1): a kind with no print counterpart is silently skipped.**
- A renamed label (or an aria-label added on screen only) bypasses SIZE-INK, and the run still says OK.
- **Check:** a fixture row where an uncompared screen mark group must FAIL (SIZE-REF), unless it is listed as screen-only.

**D4 (C1): "beside" counts empty and invisible-ink blocks.**
- An empty `flex:1` spacer cut the free width from 181.5 mm to 20 mm. A 15 mm strip there would pass at 75 %.
- **Check:** a spacer fixture with a 15 x 45 mm strip must FAIL. Count only siblings that hold ink.

**D5 (C3): the pin key hides growth.**
- The key is `skill {option} host width | rule`. It holds neither the mark kind nor the size.
- Hidden: a new mark kind failing on the same cards, a fall from 90 % to 50 %, and one failing item swapped for another.
- **Check:** key on `... | rule | kind`, pin the worst % per key, and fail when the worst % gets worse. Test it with a self-test
  case.

**D6 (C3): no commit-state backtest row for the owner's case.**
- Both rows are fixtures. The real div_facts state (73e96fc1 FAIL, its fix PASS) is held by no row.
- **Check:** a commit row: `--skill division:div_facts --no-baseline` FAILs on 73e96fc1.

**D7 (C3): the sweep report is stale.**
- `screen-ink-size-sweep.md` says 26 skills, 97 findings and "not yet wired into ws-precritic".
- Today it is 25 skills, a 69-count pin, and the tool is wired.
- **Check:** the sweep header states the commit and the pin totals, and ws-precritic-plan compares them.

**D8 (C4, legibility): the kind names in messages are unreadable.**
- Messages print "and circle", "rows of" and "count by rect". This is the aria-label with its numbers stripped, and it no
  longer says what the picture is.
- **Check:** a self-test that every kind name holds a noun from a known list (array, dot, ten frame, tile, counter ...), or
  falls back to the template id.

## Minors
- m1: only the `support` option values are rendered. Other options (representation, size) are not.
- m2: the rule is only relative to print. On 73e96fc1, paper drew the same 12 x 36 strip, so a screen copy of a bad paper
  drawing passes SIZE-INK. The rule could add an absolute dot floor.
- m3: `--passed` takes 6 min (about 15 s per skill per host). It is acceptable for deploy, but it is the slowest browser gate in
  this lane.

## Scores
- **C1 6:** The owner's case, the 80 % dots, the 55 % strip and the 390 card are all caught. D1, D3 and D4 are realistic
  bypasses, and D2 breaks the "same item" brief.
- **C2 7:** There was no false alarm on the number line, the full-width tall drawing or the digit. The --passed findings look
  real. D2 can raise a false alarm by construction.
- **C3 7:** Wired into precritic and the deploy gates, the pin is read, the plan is OK and both rows PASS. D5, D6 and D7.
- **C4 7:** Messages name the limit and the numbers. Runtime is about 55 s per skill. D8.
