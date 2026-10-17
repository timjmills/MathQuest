# Skip-count lane (a79237e5c40225940) · independent critic, round 4

Graded at **359802c5**. That head is the r4 fix (8cacb455), merged with main a208906d (merge c8d0266a, which brings in the
small-fixes lane), plus the lead commit that limits the one-line Model step text to count rows.

Scope:
- the skills `patterns:skip_count_grid`, `patterns:skip_count_line` and `multiplication:count_by_tables`;
- the code they share: `count-row.js`, the screen twin in `screen-cell.js`, `providers/countby.js` and the shared
  `scripted-model` role.

What was checked:
- **Print:** model, guided, independent, more-practice, review and test at S, M and L, each with its key, through
  `ws-grade-render --roles` (A4, Andika, rasterised). count_by_tables was also rendered with 6-digit rows (step 25,000) and
  7-digit rows (by 100,000 from 1,000,000) on all six page types at S, M and L. The model with step 25,000 + one page was
  rendered on A4 and Letter, on this tree and on main.
- **Screen:** card, worksheet and quiz at 1366, 1280, 1100, 1024, 820, 683 and 390, with mouse and touch, plus both resize
  cycles (critic-probe-r3). The 390 clip was measured on 30 seeds × 3 skills, loaded at 390 and resized from 683. The caret
  was tested on every host at 1366, 1280, 683 and 390.
- **Owner rulings applied:** the line keeps its arcs; the grid uses short jump arrows; count-by Lines at M and L are two lines
  of 6 with ~14 mm writing lines; narrow Lines at S only.
- **Accepted by r3:** `jumps: 15` at L splits 2 + 2.
- **Out of scope:** the D6 lesson packet. The Opener belongs to the lessons wave; I only checked that the merge did not make it
  worse than main.

Note: main has moved on since the merge (origin `claude/sweet-newton-c8wrv1` is now 42919723, the Y1 lessons and the detailed
lesson maker). It touches `providers/countby.js`. A test merge with this head (`git merge-tree`) is clean. All comparisons
below use a208906d, the main that was merged.

## Verdict: FAIL

D10, D9 and D11 are fixed as specified, and nothing that r3 passed has regressed. The Opener is pixel-identical to main.

The round fails on one new blocking defect, which the D11 change caused:

- **D12.** count_by_tables' Model with **step 25,000 + "one page"** now prints **3 pages on A4 and 4 on Letter**, at S, M and
  L, with one model state on most pages (H5). On main it prints 2 pages of 2 states.
- `small-fixes-model-pages` reports it: pupil pages 2 → 3 (A4) and 2 → 4 (Letter).

## Lead's questions

**D10. Only count-row skills' Model pages differ from main: confirmed.**
- I ran `critic-model-allskills-r3.cjs` on this tree and on main (a208906d), 1,707 skill × size versions.
- Exactly 12 differ: count_by_tables, skip_count_grid, skip_count_line and number_patterns_rule, each at S, M and L
  (`evidence-r4/model-allskills-diff.txt`).
- **count_by_tables:** "8 + 2 = 10. **Write 10.**" (N2). L goes from 2 pages to 1: the D5 one-line step text, 4 states.
- **skip_count_grid / skip_count_line:** main has no Model for these skills ("no worked steps"). The lane adds it.
- **number_patterns_rule:**
  - "7 + 2 = 9. Write 9." and traced partial states;
  - S goes from 2 pages to 1, with 5 states, the Say band and about 15 % spare (`npr-S`);
  - M and L stay at 2 pages (3 + 2; page 2 about 50 % used, as on main);
  - nothing is merged: its rule step is not a "parallel" step.
  - This skill belongs to another lane. Its critic should be told the model now traces each written answer, but the change is
    in line with the count-row contract.
- No other skill changes. The generic `caps` rebalance ([3,1] → [2,2]) changes no page count among the 1,707 versions.

**D9. At 390, no column straddles the nearest clipping ancestor: fixed.**
- `critic-390-clip-r4.cjs`: 180 / 180 clean. That is 3 skills × 30 seeds via `generateQuestionFor`, loaded fresh at 390 and
  after a resize from 683.
- The number line's window is now 244 px and shows 3 whole columns. The `.visual-aid` clip is at 356 px; the 4th column would
  end at 366 (`clip390/card-390-seed8.png`).
- Boxes are 61 px or more; there is no page scroll.

**D11. 6- and 7-digit rows: fixed on every print page type, S/M/L.**
- `critic-wide-boxes-r4.cjs` measured 36 sheets in Chromium: 2 row widths × 3 sizes × 6 roles, pupil page and key.
- Every answer box is at least 5 mm a digit plus 1.2 mm a comma ("1,200,000" gets about 37 mm).
- No key answer or model trace spills out of its box. The answers are Andika.
- The given numbers are 17.9 pt at L, 14.1 pt at M and 10.2 pt at S. The size is now held at the page's digit size; r3 had
  ~12 pt on an L page.
- Seen: `w7-L/*/independent-key-p1.png` (3 items, 4 lines of 3, a full page), `w7-L/*/scripted-model-p{1,2}.png` and
  `w7-S/*/scripted-model-key-p1.png`.

**The 2-page Model at M/L and the 2-page Independent at L under H5/C3: accepted at C3 8. The empty strip on page 1 is acceptable.**
- **Model, 7-digit row, M and L:** 4 states, 2 + 2.
  - At L the bottom strip is 19 % of page 1 and 21 % of page 2 (measured from the raster). Each page is more than 75 % used,
    and no state is alone.
  - A third state needs the strip plus about 60 mm. Merging steps 2 and 3 would give 3 states, which splits 2 + 1 (a lone
    state, H5). Shrinking the drawing is not allowed.
  - This is the same ruling as r3's `jumps: 15` at L. To reach 9: put the Say band and a one-line "Your turn" item in page 1's
    strip.
- **Independent at L:**
  - At the role's own capacity it is **one** page of 3 items, full (`w7-L`).
  - The builder's 2-page sheet comes from asking for 4 items. That rebalances 2 + 2, with about 30 % strips and no lone item:
    better than 3 + 1.
- **Model, 7-digit row, S:** 1 page. Steps 2 and 3 are merged into one parallel step ("1,100,000 + 100,000 = 1,200,000.
  Write 1,200,000. 1,400,000 + …"). The merged text wraps onto 2 lines close to the drawing: a nit, C3 8.

**The Opener: no worse than main.**
- `small-fixes-model-pages` passes every Opener sheet: no page added, no empty cell, no band of 30 % or more, slots hold their
  answers.
- `ws-grade-render --roles opener` gives pupil pages and keys that are **pixel-identical** to main for default S/L, step 25,000
  M and the 7-digit row M (`opener-head-*` vs `opener-main-*`).
- The merge-r4 screenshots agree.

**The merged caret ("moves on when the pupil says so") with the lane's swipe/wrap: works on all hosts.**
- `small-fixes-countrow-caret`: OK.
- I ran the same gate on the lane's three skills (`critic-caret-r4.cjs`, widths 1366/1280/683/390). It adds a 390 pass in
  which a pupil with a keyboard types each number and Space.
  - At 390 on card, worksheet and quiz: 108 / 108. Every number lands in its box, and every box that takes focus lies whole
    inside its swipe window.
  - Card and quiz at 1366/1280/683: all pass.
  - The run hit the 30-minute tool limit after the grid and line skills and part of count_by_tables. count_by_tables at 1366/1280/683
    is covered by the gate itself.
- The only failures were on the worksheet host, at 1366/1280/683. They are artefacts of the gate, which reloads the worksheet
  (a new random question) for each pass but keeps the first pass's expected answers.
  - A same-question check (`critic-ws-moveon-r4.cjs`, grid and line × comma/Enter/Tab × 1366/683 × 2 worksheets) passes 24 / 24.
  - The "row says how to move on" line (Space / tap) shows on every host.

## Scores

| Version | C1 | C2 | C3 | C4 | Pass | Main defect |
|---|---|---|---|---|---|---|
| Independent / more-practice S, M, L (all 3, defaults and Lines) | 9 | 9 | 8 | 9 | yes | unchanged from r3 (render logs identical) |
| Guided S, M, L (all 3) | 8 | 8 | 8 | 9 | yes | L takes 2 full pages for grid and tables (as in r1–r3) |
| Review / test S, M, L (all 3) | 9 | 9 | 8 | 9 | yes | |
| Model S, M, L, default options (all 3) | 9 | 9 | 8 | 9 | yes | 4 states on 1 page with traced answers |
| count_by_tables, 6-/7-digit rows, independent / more-practice / review / test, S/M/L | 8 | 9 | 8 | 9 | yes | D11 fixed: ≥ 5 mm a digit, answers inside their boxes; S gives numbers at 10.2 pt (N10) |
| count_by_tables, 6-/7-digit rows, guided S/M/L | 8 | 8 | 8 | 9 | yes | 2 pages, as for default L |
| count_by_tables, 6-/7-digit rows, model M/L (2 + 2) | 9 | 9 | 8 | 9 | yes | accepted (see above) |
| count_by_tables, 6-/7-digit rows, model S (merged step) | 8 | 8 | 8 | 9 | yes | 2-line merged step text crowds the drawing (nit) |
| **count_by_tables model, step 25,000 + one page, S/M/L, A4 and Letter** | 8 | 8 | **5** (H5) | 9 | **no** | **D12: 3 / 4 pages, a lone state on page 1 (A4) or on every page (Letter); main 2 pages** |
| Model `jumps: 15` at L | 9 | 9 | 8 | 9 | yes | 2 + 2 (r3 ruling) |
| number_patterns_rule model (other lane; changed by this lane) | 9 | 9 | 8 | 9 | yes | S now fits 1 page; M/L 3 + 2 as on main |
| Opener (lessons wave; merge check only) | – | – | – | – | not scored | pixel-identical to main |
| Practice card 1366 / 1280 / 1100 / 1024 / 820 (all 3) | 9 | 9 | 8 | 9 | yes | |
| Practice card 683 (all 3) | 8 | 9 | 8 | 9 | yes | |
| Practice card 390, grid and tables | 8 | 8 | 8 | 9 | yes | see N11 (owner question) |
| Practice card 390, skip_count_line | 8 | 8 | 8 | 8 | yes | D9 fixed: 3 whole columns, 0/180 cut; N11 |
| Online worksheet, all widths (all 3) | 9 | 9 | 8 | 9 | yes | |
| Quiz, all widths (all 3) | 9 | 9 | 8 | 9 | yes | |
| Resize cycles, all hosts, 5 cases, mouse and touch | 9 | – | 8 | – | yes | critic-probe-r3 540 / 540 |
| Caret / move-on with swipe and wrap, all hosts | 9 | – | – | – | yes | 108/108 at 390 with keyboard + Space |
| Lesson packet | – | – | – | – | not scored | D6, out of scope |

## r3 defects: verification

| r3 | Status | Evidence |
|---|---|---|
| D10 the merge bleeds into 35 other skills | **Fixed** | `model-allskills-diff.txt`: 12/1,707 differ, all count-row skills. `parallel()` plus `marks` guard the merge |
| D9 the 390 window is clipped by `.visual-aid` | **Fixed** | `clip390/clip390-r4.txt` 180/180; `clip390/card-390-seed{8,15,18}.png` |
| D11 6+ digit rows | **Fixed** (lead ruling, reversible) | `wide-boxes-r4.txt` 36/36; `w7-*`, `w6-L`. But see **D12** |
| N7 jumps 15 at L | Accepted (unchanged) | |
| N8 cbwrap deals the card by `__wsReseed` | Not re-checked in the gate. My D9 probe deals by seed | |

## Defects

### Blocking

**D12 · The Model splits into lone states with a wide row and "one page" (H5, C3 5). This is a regression from main, caused by D11.**
- **Where:** `js/modules/sheet/roles/scripted-model.js` `plan()` together with the D11 wide-row geometry in
  `js/modules/sheet/cells/count-row.js`. "One page" makes the row `compact`. The compact branch now steps aside for a wide row
  (`isTwin(ctx) || !wideNeedMm(p)`), so the row takes the wide geometry: 4 lines of 3 with 37 mm boxes, a taller state.
  - The 4 steps are all ≤ 48 characters, but the one-line text path needs `floor(room1 / H1) >= 4`, which fails.
  - The merge path needs `floor(room1 / H) >= 3`, which also fails.
  - So `perFirst = 1`. On Letter `perCont = 1` too, giving 4 pages × 1 state. On A4 `perCont = 2`, giving caps [1, 2, 1].
    The rebalance only fires when the page before the last holds more than 2, so it does not fire.
- **What:** `rows: [{step: 25000}], onePage: true`, at S, M and L.
  - A4: 3 pages, 1 + 2 + 1 states.
  - Letter: 4 pages, 1 state each.
  - Each lone page is under about 50 % used (`s25000-onepage-M-A4/*/scripted-model-p1.png`, `model-wide/head-s25000-onepage-M-Letter.png`).
  - Main prints 2 pages × 2 states (`main-s25000-onepage-M-Letter`).
  - `small-fixes-model-pages` flags all 6 versions ("pupil pages 2 → 3 / 2 → 4").
  - Also, the in-row arrows of this compact row are drawn very small next to the line-start arrows.
- **Fix (any one, with the check below):**
  1. Never leave a state alone. In `plan()`, when `perFirst === 1` or the caps contain a 1 next to a page that could take 2,
     re-plan with the one-line step text (it fits: the steps are ≤ 48 characters). Then pair the states 2 + 2, or force
     `perFirst = perCont = 2` when `2 × H1 + strip + say ≤ budget`.
  2. Or let a wide row ignore `onePage`'s `compact` sizing in the Model. "One page" is a pupil-sheet option; the Model has one
     row. The model then draws the same wide row as the independent page, which fits 2 + 2 at M/L as the 7-digit model does.
- **Check:** `small-fixes-model-pages` with `MQ_BASE_ROOT=<a208906d archive>` must show no pupil-page increase except the
  intended D11 ones: the 7-digit / 25,000 rows going 1 → 2 pages with 2 + 2 states. Add a no-lone-state assertion to
  `wave1-c2-model` for `{rows: [{step: 25000}], onePage: true}` and the 7-digit row × S/M/L × A4/Letter.

### Non-blocking

- **N9 · `small-fixes-model-pages` byte-diff part.** It fails 90 / 180 sheets, every one a scripted-model sheet ("differs from
  base"); every Opener passes. The differences are the lane's intended ones: traced partial states, "Write 10.", the one-line
  step text, merged parallel steps, and wide rows (1 → 2 pages for 6-/7-digit rows on some sizes and papers, 2 + 2). The only
  unintended one is D12. When D12 is fixed, update this gate's model baseline to the lane's output (or exempt count rows), so
  it guards pages again.
- **N10 · S pages give 6-/7-digit numbers at 10.2 pt.** That is under the rubric's 11 pt reading floor (C1 nit). It is the S
  digit size × 0.64, the same as on S pages at r3, so it is not new.
- **N11 · Phone first view (owner question, not scored down; SP-11a / TY-10b are owner rulings).**
  - On the 390 card, skip_count_line shows **no answer box** in the first view on 17 / 30 questions: the window holds 3 columns
    and the lead-in gives 3 numbers. Yet the cue says "Swipe → for more boxes".
  - The grid and count_by_tables show their two lines as one window, so the eye reads "2 → 4 → 6 / [ ] → 16 → [ ]" (columns
    1–3, then 7–9; `clip390/nobox-*.png`, `merge-r4/card-390-count_by_tables.png`). The grid shows no box on 4 / 30.
  - The same is true at r3's head (198efa97); main has no such row for the line and grid skills.
  - Options to put to the owner:
    1. Open the window scrolled so the first box is the last whole column;
    2. tighten the 390 pitch by about 3 px, so 4 columns fit inside the 356 px clip;
    3. say "Swipe → for the boxes" when none is in view.
- **N12 · Main has moved (42919723).** It changes `providers/countby.js`. The lane merges cleanly (`git merge-tree`), but the
  lane must merge again and re-run `critic-model-allskills-r3` before it lands.
- **N13 · `ws-options-verify`.** count_by_tables 27 pass / 36 fail, and skip_count_line 9 / 36. All the failures are the
  `nl*` options. The FAIL lines are **identical on main** (same 36 option names, same counts; `opt-*-main.log`). That is
  pre-existing, not this lane. skip_count_grid: OK.

## Gates (run one at a time; one browser process of mine at a time)

| Gate | Result |
|---|---|
| Syntax on the 9 changed JS files | OK |
| ws-boot-smoke | OK |
| wave1-c2-cbwrap | OK |
| wave1-c2-lines | OK |
| wave1-c2-phone | OK (`design/audit/runs/wave1-C2/` PNGs restored with `git checkout`) |
| wave1-c2-model | OK. It does not cover step 25,000 + one page (D12) |
| wave1-c2-onepage (MQ_BASE_ROOT = efeb910 archive) | OK |
| small-fixes-countrow-caret | OK |
| small-fixes-model-pages (MQ_BASE_ROOT = a208906d) | FAIL 90 / 180. Every Opener passes. The scripted-model byte diffs are the lane's intended changes, except the 6 page increases of D12 |
| ws-options-verify count_by_tables / skip_count_grid / skip_count_line | 27/63, OK 7/7, 9/45. The `nl*` failures match main exactly (N13) |
| ws-print-lint --self-test | OK, 50 assertions, 38 planted defects |
| ws-print-lint --source kit | 461 findings in 33 documents (= main). count_by_tables 0 |
| ws-screen-answer (3 skills) | OK |
| ws-screen-slots (3 skills) | OK |
| ws-chromebook-fit × 3 | OK × 3 |
| ws-providers-unit (.mjs) | OK, 105,381 checks |
| ws-search-terms | OK |
| ws-code-snapshot | OK, 608 codes, 35 categories |
| ws-content-audit --skill count_by_tables | OK, 0 failing, 1 note |
| critic-probe-r3 (7 widths × 3 hosts × 5 cases × mouse/touch + 2 cycles) | 540 / 540 |
| critic-model-allskills-r3 vs main | 12 / 1,707 differ, all count-row (D10 fixed) |
| critic-390-clip-r4 | 180 / 180 |
| critic-wide-boxes-r4 | 36 / 36 |
| critic-caret-r4 at 390 (3 skills × 3 hosts, tap and keyboard + Space) | 108 / 108 |
| critic-ws-moveon-r4 | 24 / 24 |

## What would raise each criterion to 10

- **Print:**
  - Fix D12 (no lone state, whatever the options).
  - Fill page 1's strip on 2 + 2 models with the Say band and a "Your turn" line (C3 9).
  - Give S pages' wide numbers at least 11 pt (N10).
- **Screen:** have the owner settle N11. Each 390 first view should show the pattern and at least one box, and two wrapped lines
  should never read as one sequence with a gap. Then settle the carried 683 question (44 px boxes, 23 px digits).

## Files

- **Report:** `design/audit/runs/skip-count/critic-r4.md`.
- **Probes** (all under `evidence-r4/`):
  - `critic-390-clip-r4.cjs`: D9;
  - `critic-wide-boxes-r4.cjs`: D11;
  - `critic-model-wide-r4.cjs`: D12 page counts; its shots are layout only, without Andika;
  - `critic-caret-r4.cjs`: the caret gate on the lane skills, plus the 390 keyboard + Space pass;
  - `critic-ws-moveon-r4.cjs`: the worksheet move-on check on one question.
- **Evidence** (all under `evidence-r4/`):
  - Print: `print-{S,M,L}/` (all roles and keys), `w7-{S,M,L}/`, `w6-L/`, `npr-{S,M,L}/`;
  - D12: `s25000-onepage-M-{A4,Letter}/`, `main-s25000-onepage-M-Letter/`, `model-wide/`;
  - Opener: `opener-{head,main}-{s25000,w7}-M/`;
  - Screen: `clip390/`, `probe/` (touch card shots and logs);
  - Text: `model-allskills-diff.txt`, `wide-boxes-r4.txt`, `gate-logs/*.log`.
