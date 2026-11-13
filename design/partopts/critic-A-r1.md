# lf-partopts step A, critic round 1 (independent, Opus medium)

Branch `claude/sweet-newton-c8wrv1-lf-partopts` @ 31a44f9. I rendered everything myself: a static server on the repo, Playwright
`chromium.launch()` with deviceScaleFactor 1. My screenshots are in `design/partopts/critic-A-r1/`. The UI scripts drove the real Print
screen (`tvOpenPrintWith([{role:'lesson', lessonId}])`). The packet script called `buildSheet` and `sheetDocument` with `partOpts`,
rendered every pupil page and key page in print media, and measured them with `ws-empty-band`'s `measureCells` / `judge`.

Lessons used:
- Fact: Y1.B2.S9 `addition:add_facts`
- Rounding: Y4.B1.S14 `number_sense:nearest_10`
- Place value: `skill:placevalue:expand`
- Multi-digit: Y2.B2.S18 `sub_100_regroup` and Y4.B2.S5 `sub_10k_no_regroup`

Each was printed at M and L, with every offered part at its min, every part at its min together, We Do off, and everything at its min with We Do off.
Max is the default for every part that offers a range, so the max packets are the default packets.

## Gates (defaults unchanged)

- `ws-lesson-baseline --all-lessons`: I wrote my own baseline from master 12ec080 (`MQ_ROOT=<12ec080 worktree> … --write`), then ran
  `--check` on HEAD 31a44f9. Result: **`ws-lesson-baseline: OK (1556 hashes identical)`**. The command as briefed, with no file after `--check`,
  only prints its usage line.
- `node tests/scripts/ws-partopts-unit.cjs`: **`PO-2a PASS / PO-2b PASS / PO-2c PASS / PO-2d PASS (232 builds, 539 s)` · `ws-partopts-unit: OK`**

## Scores

| Criterion | UI 1280 | UI 390 | Packets (fact / rounding / place value / multi-digit, M and L, non-default) |
|---|---|---|---|
| Clarity (UI) / C1 Ease of use (packets) | 6 | 6 | 8 |
| Correctness (UI) / C2 Educational value (packets) | 6 | 6 | 7 |
| Layout (UI) / C3 Spacing and layout (packets) | 7 | 6 | **5** (H5) |
| Consistency with mock and tokens (UI) / C4 Standard fidelity (packets) | 6 | 6 | 8 |

**VERDICT: FAIL** (11 cells below 8).

What works:
- The ranges are clamped. Force-clicking + at the max and − at the min does nothing, and both buttons are disabled there.
- The reset link appears only when something differs from the default. I checked every tick off and on, every −1 then +1, and the
  practice pages +1 then −1: each time it appears and then goes away. Reset restores the same numbers, and focus moves to the first tick.
- New numbers changes only its own part's page: chart, sheet, practice and mixed.
- On every one of the 40 non-default packets, the key's pages and cell counts equal the pupil's.
- No packet overflows or splits a cell.
- The cell-level EB findings are the same as the default packet's (see F11).

## Findings

**F1 · MAJOR · packets C3 (H5 cap): the counts on offer leave the lesson sheet 23–77 % blank at its foot.**
Where: the lesson-sheet page of every lesson tried. Shots: `critic-A-r1/round-M-allmin-wedo-off-p2.png` (77 % of the body empty),
`sub10k-L-vocab-min0-p2.png` (38 %, from one click), `fact-M-allmin-p2.png` (34 %).

Measured empty share of the lesson-sheet body (the default is 4–7 %):

| Change | Empty share |
|---|---|
| Vocabulary 0 alone | 31 % (fact M), 32 % (fact L), 29 % (round M), 23 % (sub10k M), 38 % (sub10k L), 33 % (pvexp L) |
| We Do off alone | 34 % (fact M), 39 % (round M), 40 % (sub10k L), 41 % (pvexp L) |
| Everything at its min | 34–50 % |
| Everything at its min, We Do off | 58 % (fact M), 60 % (fact L), 77 % (round M), 66 % (round L), 75 % (sub10k M), 72 % (sub10k L), 73 % (pvexp M) |

Repro: Print screen, Lesson Y4.B1.S14, then Vocabulary − to 0, Remember untick, We Do untick, rows − to 0, chart − to 1. Page 2 is two
warm-up cells under an "I Can round" title.

DESIGN §3 promises "no offered value can … leave a near-empty band". The builder's notes leave this "for step C", but it ships in step A.

Fix: when a band is removed or shortened, give the freed height back to the page:
1. Raise the lesson practice rows' max, or re-plan the rows to fill.
2. Where nothing can fill it, do not offer the value. Or make it one explicit choice with a note: "This lesson sheet now ends half way."

Check: in `ws-partopts-unit`, add **EB-PAGE on the LAST page of each sheet, judged absolutely**. A lesson-sheet body that is 30 % or more
empty fails. Today PO-2d judges relative to the standard packet, and EB-PAGE only fires when the next page has the same sheet. Also run the
combinations (every part at its min; We Do off with rows 0; Vocabulary 0 with Remember off), not one part at a time.

**F2 · MAJOR · UI correctness and value: the problem counts the owner asked for are fixed almost everywhere.**
Survey of the 25 library lessons at M and L (50 cases):

| Part | Fixed in |
|---|---|
| We Do | 50 of 50 |
| Mixed | 50 of 50 |
| Practice | 43 of 50. A range shows only for place-value expand / combine / unit_form (7–8) and add_facts at L (12–15). |
| Lesson practice rows | 0 or fixed in most cases |

At M, the multi-digit lesson Y2.B2.S18 offers one stepper: Vocabulary (`sub-1280-section.png`). The owner asked for "how many of the
problems". DESIGN §3 sets the We Do min at 1, with a warning, and the Practice min at the fewest whole rows. The code takes the floor at
`max(2, fit.min)`, and `fit.min` equals the fit, so the range collapses (`part-opts.js` `partLimits` case `wedo`).

Repro: open any library lesson and look at We Do: "3 problems (fixed: fewer would leave the cells half empty)".

Fix:
1. Make the We Do planner able to lay out fewer cells: widen them beside the Steps, or move to fewer columns.
2. Make Practice able to re-flow (fewer columns, taller cells under the cap) so it has a real lower range.
3. Otherwise take it back to the lead or owner as a scope change. Do not ship a Parts table whose problem counts are almost all fixed.

Check: add a coverage line to `ws-partopts-unit` that counts the lesson × size cases with a We Do or Practice range of 2 or more values,
and fails below a floor the lead sets.

**F3 · MEDIUM · UI correctness (owner answer 2, "per lesson only"): part settings carry over to a different lesson.**
Repro: open Y1.B2.S9, set Vocabulary to 0 and untick Remember. Remove the skill (×), then Add a skill, "round to the nearest 10".
The new lesson opens with Vocabulary 0 and Remember off, and the Reset link already shows. Shots: `fact-1280-after-switch.png`, and
`ui2` log "after switch vocab=false/0". `partStd` (the standard pages and Mixed) is also kept from the first lesson.

Fix: clear `partOpts`, `partRefresh` and `partStd` whenever the section's lesson (lessonId, or the practice skill) changes.

Check: a step in `ws-partopts-shots` that switches the skill and asserts `partOpts` is `{}` and no reset link shows.

**F4 · MEDIUM · UI clarity and ease: the Vocabulary and rows steppers go dead at 0.**
Repro: Vocabulary − three times. At 0 the part unticks itself, and **+ is disabled** (`teacher-print.js` stepper:
`!on || at >= …`), although the range still reads "0 to 3 words". The only way back is the tick or Reset. Shot: `sub-1280-changed.png`.

Fix: keep + enabled at 0, and let stepping up re-tick the part. Or offer 1..max on the stepper and leave "off" to the tick.

Check: `ws-partopts-shots` asserts that at a stepper's min, + is enabled whenever max > min.

**F5 · MEDIUM · UI 390 layout: the Practice card's "page" label runs under the New numbers button.**
The label's right edge is 280 px and the button's left edge is 275 px. Shots: `sub-390-practice-overlap-zoom.png`, `sub-390-changed.png`.
At 390, the Parts column is 274 px wide, inside four nested bordered boxes (What to print > Section > Parts > card), so the cards wrap
heavily.

Fix: put the practice pages stepper on its own grid line of the card (with a "pages" label), not in the name cell. Consider dropping one
level of nesting (no card border, or no Parts box) at phone width.

Check: an overlap test in `ws-partopts-shots`: inside each `.tv-part`, no two visible text or control boxes intersect, at 390 and 1280.

**F6 · MINOR · clarity: fixed counts are written twice, and their wording reads as a minimum.**
Examples: "15 · 15 a page (the fewest rows that fill the page)", "2 · 2 worked examples (fixed by the chart)", "6 · 6 problems
(the Mixed page fills its page)". "The fewest rows that fill the page" reads as a minimum, not as "fixed". "6 a page" is not a phrase.

Fix: show one value with the reason, e.g. "15 problems a page · set by the page size".

Check: a string lint that fails when a range note starts with the value shown beside it.

**F7 · MINOR · clarity: "Lesson practice rows: 0 · No row fits under the bands" still shows a ticked Print box and a New numbers button.**
Unticking it changes nothing on paper but shows Reset. New numbers there re-deals the whole sheet. "Under the bands" is engine jargon.

Fix: when a part's limits are fixed at 0, show it as "Not on this lesson sheet (no room)" with no tick and no button, or leave it out.

Check: a part whose limits are fixed at 0 renders no tick.

**F8 · MINOR · consistency: the "Standard" / "None to choose" chips look like controls but do nothing.**
They are full-width 44 px pills with borders, so they read as empty fields or buttons, and a teacher will click them. The mock's chips are
compact and carry a ▾.

Fix: until step B, show them as plain caption text ("Supports: standard"), or as the compact chip from the mock, marked as not
interactive.

**F9 · MINOR · UI 1280 layout and consistency: the mock's table never appears.**
The section column is about 410 px at 1280, so the `@container (min-width: 720px)` table never applies. The teacher gets a stack of 7 cards
about 1,250 px tall (`round3-1280-default.png`), much taller than the mock. The Remember card spends a line on a lone "—".

Fix: in the narrow column, give each part one compact row (tick · name · stepper · ⟳, with the range under it), with no supports chip
until step B and no "—" line. Or show Parts full width under the section.

Check: `ws-partopts-shots` asserts the Parts height is at most about 700 px at 1280 for a 7-part lesson.

**F10 · MINOR · clarity: New numbers on We Do and on Lesson practice rows do the same thing.**
Both re-deal the whole lesson sheet, warm-up included (`refreshPartOf` → 'sheet'). Only the aria-label says so.

Fix: give the lesson sheet one New numbers button, or a visible caption: "New numbers for the whole lesson sheet".

**F11 · PRE-EXISTING (not scored against this lane), for the lead:**
- (a) The Print screen scrolls 10 px sideways at 390 (`#settingsPanel` is off canvas; scrollX = 10). It is the same on master 12ec080.
- (b) The default packets already carry EB findings:
  - Y4.B1.S14 Practice cells: 37 % band, 15 cells, at M and L.
  - Y1.B2.S9 L Mixed: 49 %.
  - Y4.B2.S5 M Practice: 33 %.
  - Y4.B1.S14 We Do: EB-SIDE 31–33 %.

  These are unchanged by part options.

**F12 · PROCESS:** the builder's PO-2 passed while F1 holds, for two reasons:
- It judges each variant against the standard packet, not absolutely.
- It varies one part at a time.

Its EB-PAGE also skips the last page of a sheet. LESSONS_LEARNED L21 and L22 apply: sweep the measured page across the input space,
combinations included.
