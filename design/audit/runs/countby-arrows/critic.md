# Critic: count-by short arrows, smallest to biggest, select all/none, docked options panel, option help, Lines mode

Lane `a91a01fc3e4acb8e8`, head `9ca508b`, graded 2026-10-09 by an independent critic (read and test only, no code changed).
Skill: `multiplication:count_by_tables` (count rows). Rubric: `design/audit/RUBRIC.md`, pass = 8 or more on C1 to C4 everywhere.

## Verdict: FAIL

**Boxes passes.** The short arrows, sorting, select all/none, docked panel and option help all meet the owner's
requests. Three things fail:

- **Lines mode** fails on the Chromebook screen hosts.
- **Lines mode** fails in print at sizes M and L, and on the one-page sheet.
- **The `wave1-c2-onepage` gate fails.** It was not re-pinned after the owner-approved change to the arrows.

## Gates (run one at a time through `/tmp/mq-browser-run.sh`)

| Gate | Result |
|---|---|
| syntax check (the 6 modified JS files) | OK |
| `ws-boot-smoke` | OK |
| `ws-code-snapshot.mjs` | OK (608 codes, 35 categories) |
| `wave1-c2-phone` | OK (469 PASS) |
| `wave1-c2-lines` | OK |
| `wave1-c2-defaults` | digest **identical** to `claude/sweet-newton-c8wrv1` (4970e4b), so defaults are unchanged |
| `ws-options-verify --skill count_by_tables` | OK (27/27 values) |
| `ws-print-lint --source kit` | 463 findings in 33 documents, **at the baseline** (not raised) |
| `wave1-c2-onepage` (MQ_BASE_ROOT = archive of 4911898) | **FAIL (12)**: all 12 default digests (A4 and Letter) DIFFER from the base. The chosen-rows checks all pass |
| merge into `claude/sweet-newton-c8wrv1` (4970e4b) | code merges cleanly; only the gate-run screenshots under `design/audit/runs/wave1-C2/*.png` conflict (binary, regenerate) |

## What is right

- **Arrows (print).** I measured every jump arrow, by its painted bounding box, against every box, tile, line and printed
  glyph in its line. The sweep covered 13 page roles, S/M/L, Boxes, Lines, wide numbers, times labels and hexagons, pupil
  page and key: **0 collisions**, minimum clearance 1.0 mm. Every arrow is short, bold, filled and centred on the box
  height. No hop arcs remain in any count row. Turn arrows match. The four roles that refuse this skill (word problems,
  fact rows, fact probe, stretch) do so with their own message, unchanged.
- **Height saved.** Without the arcs a row is about 32 px shorter on every screen host. An M Independent page of 6 rows
  now fits on 1 page (2 pages on main).
- **`skip_count_line` keeps its arcs.** It draws its own legacy SVG (`gen-algebraic.js`), which this lane does not touch.
  `number_patterns_rule` ('train' look) and `hop-line` are unaffected too.
- **Smallest to biggest.** I tapped chips 7, 3, 11, typed 25, then tapped 5: the rows went in as 3, 5, 7, 11, 25. After
  "Move row 1 down", tapping 2 added it at the end, so the hand-made order is kept (`panel-1366x768-rows.png`). Select
  none cleared the tables 1 to 12. I verified **Select all** by reading the code (`mqRows 'all'`); I clicked it, but did
  not confirm the result through the print host's option store.
- **Docked panel.** At 1366x768 and 1280x720, with mouse and with touch, the popover docks over the settings column
  (`is-docked`). Its overlap with the preview card and with the paper is **0 px**, and the preview redraws live: choosing
  Lines redrew 120 lines.
- **Option help.** All 11 option rows carry a "?". Hovering shows the tip; a tap or click opens it under the control.
  Each row part (step, start, direction, move, typed step) has its own title.
- **Typing.** On the card and the worksheet (1366x650 and 1280x600, mouse and touch):
  - The pulse sits on the next empty box.
  - A right answer hands the caret on to the next box.
  - A wrong answer keeps the caret where it is.
- **Box-full caret move (lane `a5e11bcf`, not yet on main).** I merged it into a scratch copy of this lane: the two merge
  cleanly, and count rows behave identically. That lane leaves count rows alone by design, so its rule never fires here.

## Defects

| # | Sev | Criterion | Where | What |
|---|---|---|---|---|
| D1 | major | C1, C3 | Online worksheet, Lines, 1366x650 and 1280x600 (mouse and touch); card, Lines, 390 | **The jump arrows collide with the answer field.** The on-screen input is widened to its touch width past the drawn line. The active-box yellow and the right/wrong tints then cover the arrowheads on both sides: 8 to 10 overlaps per row (`zoom-ws-lines.png`, `screen-metrics.json` minClear −1). This breaks the owner's "arrows never collide with boxes". Boxes have 0 collisions on every host. |
| D2 | major | C1 | Quiz and worksheet, Lines, at 1366 and 1280 | **Lines makes the Chromebook pupil swipe.** The screen twin keeps the paper's single line of 12, so the quiz card shows "Swipe → for more boxes" at 1366 px. With Boxes the same item wraps to 6 + 6 with no swipe (`screen-1366x650-quiz-lines-typed.png` against `screen-1366x650-quiz-boxes.png`). On the practice card the step tab moves above the line, so the Lines answer row sits at y 600–652 in a 650 px window, with its rule cut at the fold (Boxes: 539–583). On screen, Lines should wrap like Boxes; the 12-on-a-line rule is a paper rule. |
| D3 | major | C3, C4 | Print, Lines, M and L (all roles), and the one-page Lines sheet | **Lines keeps 12 on a line by shrinking the digits, and Size L stops being large.** Any row holding a 3-digit number (by 9, 11, 12) drops to about 10 pt at M and L (L working size 17.9 pt), and its **step tab shrinks with it**. One page then mixes 18 pt and 10 pt rows (`independent-L-lines-pupil-p1.png`). On the one-page Lines sheet, rows 9–12 drop from about 16 to 11.3 pt while a third of the page stays empty (`independent-S-onepage-lines-pupil-p1.png`). This is LESSONS_LEARNED "Size ignored". TY-10a's shrink was meant for numbers wider than 3 characters. |
| D4 | major | gate | `tests/scripts/wave1-c2-onepage.cjs` | **The one-page gate fails** (12 of 12 digests differ from 4911898). The owner approved the change (arrows replace arcs; narrow boxes, keep the count), but the gate was neither re-pinned nor rewritten. The one-page digits on 3-digit rows also moved from **16 pt to 14.7 pt** (main 16, lane 14.7). Either re-pin the digest to an approved commit and assert the new invariants, or get the owner's word on 14.7 pt. Never drop the check. |
| D5 | minor | C3 | One-page sheet (Boxes) | The columns no longer line up row to row: a printed number takes only its glyph width. Runs of printed 3-digit numbers sit at the 1.0 mm minimum ("→ 100 → 110 →", "144 → 132 → 120 → 108"), so the page reads ragged next to the even grid of base 4911898 (`independent-S-onepage-pupil-p1.png`). Clearance is within the rule; the issue is the look. |
| D6 | minor | C3 | Teacher options panel, "Sample question" | The sample row runs off the right edge of its frame: the last box or line is clipped, in both Boxes and Lines (`panel-1366x768-open.png`, `panel-1366x768-lines.png`). |
| D7 | minor | docs | `WORKSHEET_DESIGN_STANDARD.md` SL-3a; `design/STATUS.md` | SL-3a says the one-page 12-number row keeps **0.4 mm** of arrow clearance; the code uses **1.0 mm** (`COMPACT_CLEAR_MM`). STATUS has no "Phone pass (deferred)" entry for the 390 px tints over arrows on the card in Lines mode. |

### Found in passing, already on main (not this lane's defects)

- **Lesson anchor chart.** Count rows overflow their quadrants and overlap each other on main too
  (`main-lesson-M-boxes-pupil-p1.png`, `lesson-M-boxes-pupil-p1.png`). Every page type must be 8 or more, so this needs
  its own fix.
- **Check button at 1366x650.** On the practice card the Check button is below the fold (bottom at y 750 on main, 718 on
  this lane), because the app chrome above the card is about 420 px tall.
- **Quiz count rows never move the caret on.** The quiz has no live feedback, and the box-full rule skips count rows, so
  a pupil who types on gets "811" in one box. Same on main.
- **Scripted model.** Step 2 says "Write 8" but the row does not show 8 until step 4. Same with Boxes.
- **Size S.** Count rows at S print at about 10.2 pt on Independent pages, same on main.

## Scores

| Version | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|
| Print, Boxes: independent, more practice, test, guided, error analysis, review, true/false, reason it, mixed practice, opener, model (S/M/L) + keys | 9 | 9 | 8 | 8 | yes |
| Print, one-page sheet, Boxes (default and chosen rows) + key | 8 | 9 | 8 | 8 | yes (gate D4 still open) |
| Print, Lines, S (all roles) + keys | 8 | 9 | 8 | 8 | yes |
| Print, Lines, M and L (rows with 3-digit numbers) + keys | 8 | 8 | 6 | 7 | **no** (D3) |
| Print, one-page sheet, Lines + key | 8 | 8 | 6 | 7 | **no** (D3) |
| Screen, Boxes, card / worksheet / quiz, 1366x650 and 1280x600, mouse and touch | 8 | 9 | 8 | 8 | yes |
| Screen, Lines, online worksheet, Chromebook | 6 | 8 | 6 | 7 | **no** (D1) |
| Screen, Lines, quiz and card, Chromebook | 7 | 8 | 7 | 8 | **no** (D2) |
| Screen, 390 basic check (no page overflow, boxes tappable, typing works) | 8 | 9 | 8 | 8 | yes (the 390 tint overlap is phone polish, but must be recorded: D7) |
| Teacher options panel and help, 1366x768 and 1280x720 | 9 | n/a | 8 | n/a | yes (D6 is minor) |

## Owner questions

1. **Lines at M and L, rows with 3-digit numbers.**
   - (a) **Suggested:** keep the size's digit and step-tab size, and take two lines of 6 for those rows.
   - (b) Keep 12 on one line and accept about 10 pt digits.
2. **One-page sheet, 3-digit rows.** Is 14.7 pt digits acceptable (narrower boxes, the same 12 numbers), or must they
   stay at 16 pt?
   - (a) **Suggested:** accept 14.7 pt, and re-pin the gate to it.
   - (b) Return to 16 pt by giving the arrows less clearance.
3. **Lines on screen.**
   - (a) **Suggested:** wrap 6 + 6 like Boxes; the 12-on-a-line rule is for paper only.
   - (b) Keep 12 on one line and the swipe.

## Evidence

- `evidence/` holds screenshots of the print pages (lane, plus one from main), the screen hosts and the teacher panel.
- `evidence/print-metrics.txt` is the per-role, per-size measurement sweep.
- `evidence/screen-metrics.json` holds the per-host geometry and typing results.
- The critic scripts are `critic-print.cjs`, `critic-screen.cjs` and `critic-panel.cjs`. Run them with `TREE=<checkout>`
  and `OUT=<dir>`.
