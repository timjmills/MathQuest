# Skip-count lane (a79237e5c40225940) · independent critic, round 1

Graded at **8c43b006** (lane head). Scope: `patterns:skip_count_grid`, `patterns:skip_count_line`, and
`multiplication:count_by_tables`, which shares `count-row.js`. Print was graded on lesson, model, guided,
independent, more-practice, review and test at S, M and L, each with its key. Stretch and thinking pages are out of
scope (owner, 2026-10-09). Screen was graded on the practice card, online worksheet and quiz at 1366x650 and
1280x600, with touch, plus a basic check at 390.

Baselines rendered for comparison: `claude/sweet-newton-c8wrv1` (fbfcd9ee) in a scratch worktree, screen hosts plus
lesson, guided, model, review and test.

## Verdict: FAIL

The print side of the redo is good. Independent, more-practice, guided and test show the shared short jump arrows
on the grid with no private copy, the arcs over the number line, and two lines of 6 at M and L. The Chromebook wrap
(owner ruling 3) is what fails, and it fails on every Chromebook screen host:

- On the practice card and the quiz it breaks a row that already fit.
- On the number line it moves the numbers off their ticks.
- On the worksheet it leaves a large empty band with a stray arrow in it.
- Resizing the window in either direction leaves the row broken.

## Scores

| Version | C1 | C2 | C3 | C4 | Pass | Main defect |
|---|---|---|---|---|---|---|
| Independent / more-practice S, M, L (all 3 skills) | 9 | 9 | 8 | 9 | yes | none blocking |
| Guided S, M, L | 8 | 8 | 8 | 9 | yes | L takes 2 pages: 4 tries + Model, page 2 full |
| Test S, M, L: grid, line | 8 | 9 | 8 | **7** | no | title "Test A: skiping count …" (D4) |
| Test S, M, L: count_by_tables | 9 | 9 | 8 | 9 | yes | |
| Review S, M, L: grid, line | 8 | 9 | 8 | **7** | no | title "Review: skiping count …" (D4) |
| Model (scripted-model) L, all 3 | 8 | **6** | **5** (H5) | 8 | no | step 4 alone on page 2. Steps 2–3 say "Write 25" but the box is empty (D5) |
| Model S / M | 8 | **6** | 8 | 8 | no | steps 2–3 do not show their own write (D5) |
| Lesson packet S/M/L, all 3 | **4** (H2) | **5** | **5** | **5** | no | anchor chart and guided row overflow their cells. Purple icons. "Drag the numbers" on paper (D6, pre-existing) |
| Practice card 1366 / 1280 | **6** | **4** (line) / 7 | **5** | 7 | no | D1 |
| Online worksheet 1366 / 1280 | **5** | **4** (line) / 7 | **5** (H13) | 7 | no | D2, D3 |
| Quiz 1366 / 1280 | 7 | 7 | **6** | 8 | no | D1. The line quiz at 1280 is clean; the grid and tables quizzes wrap 4 + 2 |
| Phone 390 (basic) | 8 | 8 | 8 | 8 | yes | a page first loaded wide collapses (D3) |

## Gates (run one at a time through /tmp/mq-browser-run.sh)

| Gate | Result |
|---|---|
| wave1-c2-cbwrap | OK. It does not check layout quality, so it passes the broken wraps (see D1 to D3) |
| wave1-c2-lines | OK |
| wave1-c2-onepage (MQ_BASE_ROOT = base-efeb910) | OK |
| wave1-c2-defaults | exit 0 |
| wave1-c2-phone | OK (469 PASS) |
| ws-options-verify --skill count_by_tables / skip_count_grid / skip_count_line | OK, OK, OK. step=[0]/[1]/[2] each deal only their step |
| ws-print-lint --self-test | OK, 48 assertions. The planted narrow Lines line at M fires SL-1; the same line at S does not. The exception is limited to `.k2-line-slot` under `data-ws-size="S"` and loosens nothing else |
| ws-print-lint --source kit | 463 findings in 33 documents, equal to the baseline. count_by_tables has 0 findings |
| ws-screen-answer (3 skills) | OK |
| ws-screen-slots (3 skills) | OK |
| ws-chromebook-fit (3 skills) | OK. Its own shots show D1 and D2. The full-sample run hit a "detached Frame" reload error under shared load (a flake, not rerun). The full ws-screen-slots run did not start before my 2 h background limit; the focused 3-skill run is OK |
| ws-boot-smoke | OK |
| ws-search-terms | OK, 232/232 |
| ws-code-snapshot | OK, 608 codes |
| ws-content-audit | OK, 0 failing |
| Throwaway merge into claude/sweet-newton-c8wrv1 (fbfcd9ee) | Code merges clean. The only conflicts are 15 gate-run PNGs under `design/audit/runs/wave1-C2/` (binary, both sides regenerated): take either side, or re-run wave1-c2-phone. On the merged tree: syntax OK on every merged JS, ws-search-terms OK, ws-code-snapshot OK, ws-stamp-assets --check stale as expected (the lead stamps) |

## Defects

### Blocking

**D1 · C3 −3, C2 −4 on the line, C1 −2. The practice card and quiz wrap a row that already fits.**
- **Where:** `js/modules/screen-cell.js` `wireSwipeRows` → `wrapRow` (8c43b006).
- **What:** at 1366x650 and 1280x600 the card's count row is 720 px wide, and baseline fbfcd9ee shows it whole as
  6 + 6 (`evidence/main-card-1280-cbt-baseline.png`). The lane splits each line of 6 into 4 + 2. The result is four
  ragged lines, and the ↴ turn arrow floats about 300 px right of the line it leaves
  (`evidence/card-1280-cbt-4plus2.png`, `evidence/quiz-1366-grid-4plus2.png`).
- **skip_count_line is worse:** five numbers stay on line 1, and "[ ] [ ] 45" wrap under the axis, so the numbers no
  longer stand under their ticks. The picture now contradicts the number line (`evidence/card-1366-line-wrapped-off-ticks.png`).
- **Cause:** `wrapRow` decides with `w.scrollWidth + colW > inner + 1`. It then sets
  `maxWidth = inner − colW − 14` on every line container, even when the row is only a few pixels over, or not over
  at all once the swipe frame's own width is dropped.
- **Fix:**
  1. Never wrap an `axis` row. A number line cannot wrap: its ticks are one SVG. Let it scale or keep the swipe.
  2. Measure the row *after* clearing `frame.style.minWidth`, `w.style.width` and `[data-mq-swipes]`, and wrap only
     when a line of 6 is genuinely wider than the cell.
  3. When wrapping, break a line only at a whole-line boundary: 6 → 3 + 3, never 4 + 2. Do this by setting
     `maxWidth` to `k·pitch − gap`, where k = the largest divisor of perRow that fits.
- **Check:** in `wave1-c2-cbwrap`, for card, quiz and worksheet at 1366 and 1280, assert:
  - the card and quiz rows are not wrapped when the baseline shows them whole;
  - every wrapped line holds the same count;
  - every `.k2-countrow-axis` row has each number's centre within 3 px of its tick;
  - the ↴ exit arrow is within 1 pitch of the line it leaves.

**D2 · C3 −3 (H13), C1 −2. The worksheet wrap leaves an empty band and a stray arrow.**
- **Where:** `wrapRow` + `level()`, worksheet cards (about 335 px).
- **What:** at 1366 and 1280 the step tab sits above the row, and `level()` gives each tab entry the height of its
  wrapped line. This leaves an empty band of about 150–200 px between the tab and the numbers, which is 35–45 % of
  the cell. The jump arrow that leads into a wrapped line also has these faults:
  - It is drawn alone, inside that band (`evidence/worksheet-1366-cbt-band.png`, `evidence/worksheet-1366-line.png`).
  - Its head is clipped at the cell's left border: the "▸" stubs at x ≈ 130 px.
- At 1280x600 the band pushes the last line of row 1 below the fold.
- On skip_count_line the numbers wrap 2–3 per line under an 8-tick axis.
- **Fix:**
  - When wrapped, reset the tab entries' height to auto (or put the tab above in the swipe style).
  - Drop the lead-in jump arrow on a wrapped line's first box, or move it inside the box column so it does not
    cross the cell edge.
  - Apply the D1 axis rule here too.
- **Check:** in cbwrap, assert:
  - the largest vertical gap between the tab's bottom and line 1's top is ≤ 16 px;
  - every `.k2-jump` lies inside the cell's inner box;
  - no `.k2-jump` lies outside its line's box band.

**D3 · C1 −3. A resize leaves the row broken in both directions.**
- **Probe:** `critic-probe.cjs`. It uses `setViewport` with a fixed `hasTouch` and no reload. The builder's gate
  only re-renders, so it misses this.
- **390 → 1366** (for example, a Chromebook window snapped to half the screen, then maximised): 0 of 20 rows wrap.
  Each row stays a 3-column swipe window, the "Swipe" cue is gone, and boxes 4–6 are hidden with nothing to say so.
  4 of the 10 jump arrows per row lie outside the cell (`evidence/worksheet-390-then-1366-hidden-boxes.png`).
  This happens with all 5 cases at both 1366 and 1280.
- **1366 → 390** (rows first rendered wide): the row collapses to a window about 50 px wide that shows one box sliver
  under the tab (`evidence/worksheet-1366-then-390-sliver.png`). The row's inline style after the round trip differs
  from a fresh 390 load in 4 of 5 cases.
- The verbatim-restore fix in 8c43b006 holds only for the path 390-load → 1366 → 390, where nothing was ever wrapped.
- **Fix:** run the whole layout from one state machine on every resize:
  1. clear the wrap state;
  2. clear the swipe state (`w.style.width`, `frame.style.minWidth`, `data-mq-swipes`, `data-mq-end`);
  3. measure;
  4. choose wrap or swipe.

  Today `mode()` returns early after `wrapRow()`, and `wrapRow()` returns false before it has cleared a swipe set up
  at 390. Also run `level()` and `fitCue()` again after an unwrap.
- **Check:** add a resize cycle to cbwrap with the same page and no reload: 390 → 1366 → 390 → 1280 → 683 (half a
  Chromebook) → 1366. At each width, assert either (wrapped and no cue and every input inside) or (swipe and cue
  visible while `moreRight()`). Also assert that the window is at least one whole column wide.

**D4 · C4 −2 on review and test of both skip skills. The page title is misspelt.**
- **What:** the I Can "skip count …" becomes "Test A: **skiping** count on a number line" and "Review: **skiping**
  count by 2s, 5s and 10s" (`evidence/review-L-grid-key-skiping.png`). It shows on every review and test, pupil
  page and key.
- **Where:** `js/modules/sheet/roles/compose.js` `topicOf`. "skip" is in `verbs`, and the doubling rule requires
  `v.length <= 3`, which "skip" (4 letters) fails.
- **Note:** this is pre-existing code, but these are the first skills whose I Can starts with "skip".
- **Fix:** special-case `skip count` → `skip counting` (the noun phrase), and drop `skip` from `verbs`.
- **Check:** a providers-unit or `ws-print-lint` assertion that no title contains `/\b\w+iping\b/`. Expected titles:
  "Test A: skip counting on a number line" and "Review: skip counting by 2s, 5s and 10s".

**D5 · C2 −2 (all sizes), C3 ≤ 5 at L (H5). The scripted model does not show its own steps.**
- **Where:** the `scripted-model` role with count-row (`evidence/model-L-grid-p2-lone-step.png`).
- **What:**
  - Panel 2 says "8 + 2 = 10. Write 10." / "20 + 5 = 25. Write 25.", but its row is identical to panel 1, with the box
    still empty. Panel 3 is the same. Only panel 4 shows grey traced answers, so the worked steps never show the work
    they name.
  - At L the model takes 2 pages: page 2 holds step 4 alone and is about 65 % empty.
- **Scope:** count_by_tables has the same layout on main (pre-existing). The skip skills are new on this role.
- **Fix:**
  - Panel k traces the answers written in steps 2..k.
  - At L, size the steps to fit one page: drop the repeated tab, or use 2x2 panels as at S and M.
- **Check:** in the model plan, assert that panel k's traced count is ≥ k−1 and that the model's pageCount is 1 at
  S, M and L.

**D6 · lesson packet, all three skills, all sizes (pre-existing, outside the lane's files; caps C1 ≤ 4 under H2).**
- **Anchor chart:** the count rows run out of the 2x2 cells and over each other. The step tab and boxes overlap
  neighbours ("10" over "30"), and the ws-grade-render check reports "content overflows the sheet".
- **Guided row:** the row starts left of the cell border, with the tab and first number cut.
- **Steps:** the step box says "Count by 11" beside a row of 10s.
- **Warm-up b:** "Drag the numbers in counting order (counting up by 8s)". That is a screen verb on paper (H7), and
  8s are not Grade 2 content.
- **Colour:** purple step icons (H4).
- **Baseline:** main is worse here, with a blank page 1 for the skip skills.
- **Scope:** RUBRIC §scope grades the lesson only "where it has one", and the build says "No lesson data for this
  skill yet", so this needs a lead or owner decision. I list it as blocking because the brief names the lesson page
  type and a teacher can print it.
- **Fix:** in `sheet/roles/lesson.js` and `anchors.js`, measure count-row cells against the anchor cell's width
  (or give wide rows the full width, as the L11 rule says), derive the steps from the item shown, and filter the
  warm-up pool to print-verb, same-grade items.

### Nits (not scored)

- **N1 · search.** `count by 5 number line` returns **0 results**, while `count by 5s number line` finds
  skip_count_line. `skip count by 5` ranks seq_5 first, and skip_count_line is not in the top 5. Fix: add
  `count by 2`, `count by 5`, `count by 10` and `skip count by N` to the SKILL_TERMS of both skip skills, plus a
  query in `ws-search-terms` QUERIES. Everything else asked for ranks the skills first: skip count, count by 5s,
  hundreds chart / number grid, hops/jumps on a number line, counting in 5s.
- **N2 · stale comment.** The comment in `gen-mult-patterns.js` above `SKIP_STEPS` still says "one hop arc with an
  arrowhead per jump" for both skills. The grid now uses the short jump arrows.
- **N3 · search tag.** skip_count_grid is tagged "hundreds chart" and "hundred square", but it now draws a count
  row, not a chart. A teacher who searches "hundred chart" gets a different picture. Either keep the tag and
  rename it, or drop the tag.
- **N4 · keyboard.** Typing goes into the box, and Tab moves the caret to the next box. A wrong digit shows
  `mq-wrong-digit` / `mq-wd-mirrored` once the pupil leaves the box (probe on the worksheet, all 3 skills). A touch
  tap on a box in a wrapped second line focuses it (boxes 51–70 × 49 px). This works and is not scored. Recorded so
  the fix round does not regress it.

## What would raise each criterion to 10

- **Print:** fix D4 and D5. The independent, more-practice, guided and test pages are already at 9.
- **Screen:**
  - D1 to D3: a row that fits is never wrapped, a number line never wraps, and a wrapped row splits evenly with no
    empty band.
  - A resize in either direction ends in the same state as a fresh load.
  - Then add the owner's carried C4 question on 44 px boxes and 22 px digits.

## Files

- Probe: `design/audit/runs/skip-count/critic-probe.cjs`. Run it from the lane tree as
  `/tmp/mq-browser-run.sh node <probe> <outdir>`; it requires the harness by absolute path.
- Evidence: `design/audit/runs/skip-count/evidence/*.png`.
