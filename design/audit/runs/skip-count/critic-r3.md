# Skip-count lane (a79237e5c40225940) · independent critic, round 3

Graded at **198efa97** (the lane's r3 fix head). Scope: `patterns:skip_count_grid`, `patterns:skip_count_line` and
`multiplication:count_by_tables` (shared `count-row.js`, the count-row kit cell, `screen-cell.js` `wireSwipeRows`, and the
shared `scripted-model` role the lane changed).

- **Print:** model (scripted-model), guided, independent, more-practice, review and test at S, M and L, each with its key, via
  `ws-grade-render --roles` (A4 PDF, rasterised, Andika). count_by_tables' model was also rendered with `jumps: 15`,
  `times: each`, `spaces: line` and a 7-digit row at M and L, and independent/guided with 5-, 6- and 7-digit rows. Looked at.
- **Out of scope:** the lesson packet (D6, lessons wave), stretch and thinking pages.
- **Screen:** practice card, online worksheet and quiz at 1366x650, 1280x600, 1100x650, 1024x768, 820x1180, 683x650 and
  390x844, mouse and touch, plus both resize cycles without reload:
  - fresh 390 → 1366 → 390 → 1280 → 683 → 1366;
  - fresh 1366 → 390 → 1366 → 1280 → 683 → 390.
- **Owner rulings applied:** skip_count_line keeps its arcs; the grid uses short jump arrows; count-by Lines at M and L are two
  lines of 6 with ~14 mm writing lines; narrow Lines at S only.

## Verdict: FAIL

D7, D8 and the nits are fixed, and nothing that r2 passed has regressed for the three skills. The round fails for three reasons:

1. **D10 (new, blocking).** The D8 merge in the shared `scripted-model.js` is not limited to count rows. It changes the model
   page of **35 other skills in other lanes** (59 skill/size versions; 2 of them, number_patterns_rule S/L, only by the N2 wording). It joins steps 2 and 3 into one state even when they
   are two different actions ("Tens: … Regroup 1 hundred. Hundreds: … Write 1."), which breaks PEDAGOGY P-1. None of those
   lanes or their critics have seen the change.
2. **D9 is only partly fixed.** At 390 the card's number-line window still runs 12 px past the `.visual-aid` box that clips
   it. On 8 of 30 questions the 4th column is clipped, and on 3 of those it is the answer box that loses its right side
   (C3 7).
3. **D11 (new finding; the code is unchanged since r1).** count_by_tables rows of 6 or 7 digits (custom steps such as
   25,000 or 100,000, which the panel offers "up to 100,000") give 16 mm boxes for 7–9 character answers on every print page,
   at every size (H9). The model's traced answers spill out of their boxes. r1 and r2 graded only the default options, so
   neither round looked at this.

### Lead's question: count_by_tables `jumps: 15` at L, model split 2 + 2

**Accepted: C3 8, H5 does not apply.**

- Each page holds 2 full states, with the largest blank band at 28 % (page 1) and 30 % (page 2), measured from the raster
  (`model-opts/jumps15-L-both.png`). Neither page is under 50 % used, and no state is alone.
- A third state needs about 280 px more. That would leave no room for the Say band above the footer, so the planner's
  `perFirst = 2` is right.
- Merging steps 2 and 3 would give 3 states, which splits 2 + 1 (a lone state, H5). That is worse.
- Shrinking the drawing is not allowed: content never shrinks to fit.
- So 2 + 2 is the best layout the rules allow. The bottom-third strips are what cost it the 9.
- To reach 9, put the Say band and a one-line "Your turn: count by 2 from 30" item on page 2. Do not stretch the states.

## Scores

| Version | C1 | C2 | C3 | C4 | Pass | Main defect |
|---|---|---|---|---|---|---|
| Independent / more-practice S, M, L (all 3, default options and Lines) | 9 | 9 | 8 | 9 | yes | none blocking |
| Guided S, M, L (all 3) | 8 | 8 | 8 | 9 | yes | L takes 2 full pages for grid and tables (as r1/r2) |
| Review / test S, M, L (all 3) | 9 | 9 | 8 | 9 | yes | titles correct ("Review: skip counting by 2s, 5s and 10s", "Test A: counting by 1 to 12") |
| Model S, M, L, default options (all 3) | 9 | 9 | 8 | 9 | yes | N2 fixed: "8 + 2 = 10. Write 10." |
| Model M / L count_by_tables `times: each`, 7-digit row (M) | 9 | 8 | 8 | 9 | yes | D8 fixed: 1 page with steps 2+3 merged ("6 + 2 = 8. Write 8. 8 + 2 = 10. Write 10.") |
| Model L count_by_tables `jumps: 15` | 9 | 9 | 8 | 9 | yes | 2 + 2, no lone state (see the ruling above) |
| count_by_tables, any print page, rows of ≥ 6 digits (custom step 25,000 / 100,000) | **5** (H9) | 7 | 7 | 7 | no | D11: 16 mm box for "1,200,000"; ~12 pt digits on an L page; model traces overflow the boxes |
| Practice card 1366 / 1280 / 1100 / 1024 / 820 (all 3) | 9 | 9 | 8 | 9 | yes | D7 fixed: line whole, tab above, 27.2 px digits, no cue |
| Practice card 683 (all 3) | 8 | 9 | 8 | 9 | yes | line whole at 22.9–23.8 px digits, 44 px boxes, no cue, no cut |
| Practice card 390, grid and tables | 8 | 9 | 8 | 9 | yes | |
| Practice card 390, skip_count_line | 8 | 8 | **7** | 8 | no | D9 residue: 4th column clipped 12 px by `.visual-aid` on 8/30 questions |
| Online worksheet, all widths (all 3) | 9 | 9 | 8 | 9 | yes | 0 cut over 8 seeds at 390 |
| Quiz, all widths (all 3) | 9 | 9 | 8 | 9 | yes | |
| Resize cycles, all hosts, all 5 cases, mouse and touch | 9 | – | 8 | – | yes | every step equals a fresh render of the SAME question (540/540) |
| Lesson packet | – | – | – | – | not scored | D6, out of scope (lessons wave) |

## r2 defects: verification

| r2 | Status | Evidence |
|---|---|---|
| D7 card number line 683–1279 | **Fixed** | `probe/touch-card-{683,820,1024,1100}-skip_count_line.png`: the tab is above, the line is whole, there is no cue and no cut. Digits are 27.2 px from 820 to 1366 and 22.9 px at 683 (r1 had 28.1 and 22). The cbwrap D7 checks pass at 683/820/1024/1100 for all 5 cases |
| D8 model 2 pages with options | **Fixed for this lane** | `times: each`, the 7-digit row and `jumps: 15` at M fit 1 page; `jumps: 15` at L splits 2 + 2 (accepted). `critic-model-probe-r2` re-run: traces 100 % correct; its only failures are the 12 `jumps: 15` L seeds (2 pages, 2 + 2 by design). **But the change leaks to every other skill (D10)** |
| D9 390 window cut | **Partly fixed** | The lead-in is counted and seeds 9/21/33/45/57 are clean. The window's right edge is still taken from `.mq-scell` (368 px), while the `.visual-aid` that clips the row ends at 356 px (`clip390/card-390-seed8.png`, `gate-logs/clip390.log`) |
| N1 44 px floor on the input | Fixed | `small` reads the input's width |
| N2 "Write 10." | Fixed | `sheet/providers/countby.js` |
| N3 probe limit | **Settled** | The r2 probe's 6 "card skip_count_line 390 differs from fresh 390" failures (still 6 on this tree) compare **different questions**: `generateQuestion()` keeps a recent-question history, so `__wsReseed` does not reproduce the card's question. With the card dealt by `generateQuestionFor({seed})` (`critic-probe-r3.cjs`), every cycle step equals the fresh render of the same question: 540/540, 0 question mismatches. The r2 probe's fresh 390 image (`probe-r2-rerun/card-390-skip_count_line.png`, by 10s from 10, window 334 px) is the D9 residue below, not a cycle defect |
| N4 "counting by 25" | Fixed | `search-queries.txt`: count_by_tables first for "counting by 25" and "count by 25s" |
| N5 listeners | Fixed | `onResize` / `onResizeUpd` remove themselves once the row is disconnected; ResizeObservers disconnect |
| onepage digest | Fixed | `wave1-c2-onepage` OK against the efeb910 base with `data-ws-key-ans` stripped |

## Defects

### Blocking

**D10 · The D8 merge changes the model page of 35 other skills (scope bleed; PEDAGOGY P-1).**
- **Where:** `js/modules/sheet/roles/scripted-model.js` `plan()`, the block that joins `steps[1]` and `steps[2]` whenever
  `floor(room1 / H) === steps.length − 1`. The comment says "the two parallel middle steps", but nothing checks that the steps
  are parallel or that the item is a count row.
- **What:** every skill × S/M/L, seed 7, compared with the parent 73cc8b8b (`model-allskills-diff.txt`, from
  `critic-model-allskills-r3.cjs`). The lane's own skills changed only by N2. Every other changed skill shows the same
  thing: the model goes from 2 pages to 1, and one state now carries two different actions. Examples:
  - `addition:add_1k_regroup` M/L: "Tens: 8 + 4 + 1 regrouped = 13. Write 3. Regroup 1 hundred. Hundreds: 3 + 3 + 1
    regrouped = 7. Write 7."
  - `addition:add_50_mixed`: "10 or more? Write the ones. Regroup the ten … Add the tens, and any regrouped number."
  - `composing:number_bonds`, `division:long_div_2digit` (a whole long-division cycle in one state), `division:share_into_groups`,
    `multiplication:area_model_mult` S, `subtraction:sub_50_*`, `sub_100_*`, `number_sense:rounding_visual`,
    `round_nl_*` S, `place_on_number_line`, `addition:nl_add`, `subtraction:nl_sub`, `measurement:money` /
    `money_change` L, `composing:teen_compose`, `hundreds_chart_fill`, `number_chart_fill`, `multiplication:arrays_groups`,
    `nl_mult`, `division:nl_div`, `patterns:number_patterns_rule` M.
  - Before, those pages broke H5 (a lone state on page 2). Now they put two new things in one step, which those lanes'
    critics have not graded.
- **Fix:** guard the merge with the count row only. For example, apply it only when `marks` is non-null (that is,
  `q.cell.template === 'count-row'` and the provider's steps match), or when the provider marks steps 2 and 3 as parallel
  (`workedSteps` flag). Keep the generic `caps` rebalance ([3,1] → [2,2]); it only moves whole states.
- **Check:** re-run `critic-model-allskills-r3.cjs` on the fixed tree and against the parent. Only count-row skills may
  change.

**D9 (residue) · C3 −1 on the card at 390, skip_count_line.**
- **Where:** `js/modules/screen-cell.js` `layout()`, swipe branch: `rightEdge` comes from `.mq-scell`'s inner edge (368 px).
  The row's nearest clipping ancestor is `#questionCard .visual-aid` (`overflow: auto`, right edge 356 px).
- **What:** 8 of 30 card questions (generateQuestionFor seeds 1–30, at 390 both when loaded there and after a resize from
  683) get a 334 px window, which holds 4 columns up to 366 px. The `.visual-aid` cuts the 4th column at 356 px:
  - on seeds 8, 15 and 18 the 4th column is the answer box, which loses its right border and about 10 px
    (`clip390/card-390-seed8.png`);
  - on the other 5 seeds it is a number tile, whose 2-digit glyphs end at about 352 px, right against the clip.

  The worksheet (8 seeds) and the quiz are clean.
- **Why the gates missed it:** cbwrap's new `EDGE` check (and my `critic-390-window-r3.cjs`) measure against
  `min(window.right, cell inner right)`. Neither looks at the clipping ancestor.
- **Fix:**
  1. Take the room from the nearest clipping box. Walk up from `w` to `.mq-scell`'s host and use
     `min(right − paddingRight − borderRight)` over every ancestor whose `overflow-x` is not `visible`, then
     `avail = min(inner, thatEdge − w.left)`.
  2. Make the same change in cbwrap's `EDGE`.
  3. Add 30 card seeds dealt by `generateQuestionFor` at 390 to cbwrap.

**D11 · H9 on count_by_tables rows of 6–7 digits (new finding; pre-existing at r1 head; C1 5).**
- **Where:** the count-row kit cell's box width and number size for wide rows (`js/modules/sheet/cells/count-row.js`;
  the screen twin shares it).
- **What:** the box stays about 16–17 mm wide whatever the row's digits, and the number type drops to fit the row:
  - 5-digit rows (by 1,000 from 14,000): about 15 pt numbers; the pupil writes "16,000" in 17 mm. Tight but usable
    (`model-opts/rows1000-indep-L`).
  - 6-digit rows (by 25,000): 12–13 pt numbers; "125,000" in 16 mm (`model-opts/rows25000-indep-L`).
  - 7-digit rows (by 100,000 from 1,000,000): about 12 pt numbers on an **L** page. "1,200,000" goes in a 16 mm box, which
    is under 2 mm per character for a hand-writing pupil. The model's grey traced answers overflow their boxes
    (`model-opts/rowsstep1000-{M,L}`, `model-opts/rows7-indep-L`). At L the merged step-2 text wraps onto two lines that
    crowd the drawing.
- **Fix:**
  - Size the answer box from the widest answer the row can hold, at ≥ 5 mm per digit plus the commas, at the page's own digit
    size (the size never drops below the page's digit pt).
  - Let a row of ≥ 6 digits take three lines of 4 (L11: wide rows get the full width) instead of two lines of 6.
  - If the 12-number promise cannot hold at that width, cap the custom step in the panel at what fits and say so beside
    the row, as the panel already does for raised starts.
- **Check:** in `wave1-c2-onepage` / `ws-options-verify`, assert for `rows: [{step: 100000, start: 'custom', at: 1000000}]`
  and `{step: 25000}` at S/M/L that box width ≥ (digits + commas) × 4.5 mm and number pt ≥ the page's digit pt.

### Non-blocking

- **N7 · model `jumps: 15` at L.** 2 + 2 with 28–30 % bottom strips. Accepted at C3 8; see the ruling above for the 9.
- **N8 · cbwrap's 390 check uses `__wsReseed` on the card.** That does not fix the card's question (N3). Deal the card with
  `generateQuestionFor({seed})`, as `critic-probe-r3.cjs` does, so the 5 seeds are 5 known questions.
- **N6 · lesson packet (D6).** Out of scope (lessons wave).

## Gates (run one at a time; one browser process of mine at a time)

| Gate | Result |
|---|---|
| ws-boot-smoke | OK |
| wave1-c2-cbwrap | OK, 299 checks, including the new 683/820/1024/1100 card and 390 seed checks. It misses the D9 residue (wrong clip edge, see D9) |
| wave1-c2-lines | OK |
| wave1-c2-phone | OK. The tracked PNGs under `design/audit/runs/wave1-C2/` were restored with `git checkout` |
| wave1-c2-model | OK, including `times: each`, `jumps: 15`, the 7-digit row × seeds 7/11/23 × S/M/L |
| wave1-c2-onepage (MQ_BASE_ROOT = efeb910 archive) | **OK** (r2: 12 byte-diffs from `data-ws-key-ans`, now stripped) |
| ws-options-verify count_by_tables / skip_count_grid / skip_count_line | OK 27/27, 7/7, 9/9 |
| ws-print-lint --self-test | OK, 50 assertions, 38 planted defects |
| ws-print-lint --source kit | 461 findings in 33 documents (baseline 463/33; exit 1 by baseline). count_by_tables 0 findings |
| ws-screen-answer (3 skills) | OK |
| ws-screen-slots (3 skills) | OK, 0 doubled, 0 paper verbs |
| ws-chromebook-fit × 3 | OK × 3 |
| ws-providers-unit | OK (105,381 checks, incl. 4 count-by) |
| ws-search-terms | OK, 239/239 |
| ws-code-snapshot | OK, 608 codes, 35 categories |
| ws-content-audit --skill count_by_tables | OK, 0 failing, 1 note |
| Syntax (`node --input-type=module --check`) on the 4 changed JS files | OK |
| critic-probe-r2 re-run (final code) | 444 / 450 pass. The 6 failures are the card skip_count_line 390 cycle compares: different questions (N3), settled by critic-probe-r3 |
| critic-probe-r3 (7 widths × 3 hosts × 5 cases × mouse/touch + 2 cycles, card dealt by seed) | **540 / 540 pass**, 0 question mismatches |
| critic-model-probe-r2 re-run | Traces and titles all pass. 13 failures, all `jumps: 15` at L (2 pages, 2 + 2, accepted) |
| critic-390-window-r3 (card 30 seeds, worksheet 8 seeds, load and resize) | 0 cut by its own (cell-edge) measure. `critic-390-clip-r3` shows the clip at the `.visual-aid` (D9 residue) |
| critic-model-allskills-r3 (every skill × S/M/L vs parent) | 68 versions changed; 59 outside the lane (D10) |

## What would raise each criterion to 10

- **Print:** guard the merge (D10) and size wide-row boxes from their answers (D11). The model then reads as 4 parallel steps
  on one page with any common option. C3 rises to 9 when the L pages' bottom strip (15–20 %) is used: a 5th row at L, or
  the Say band plus a "Your turn" line on the 2 + 2 model.
- **Screen:** take the phone window's room from the clipping `.visual-aid` (D9). The card's number line is then whole
  everywhere. Then settle the owner's carried C4 question on 44 px boxes and 23 px digits at 683.

## Files

- Probes:
  - `evidence-r3/critic-probe-r3.cjs`: screen hosts, 7 widths, both cycles, with the card dealt by seed.
  - `evidence-r3/critic-390-window-r3.cjs` and `evidence-r3/critic-390-clip-r3.cjs`: the phone window and its clipping
    ancestor.
  - `evidence-r3/critic-model-allskills-r3.cjs`: every skill's model, to diff against a parent checkout via `MQ_ROOT`.
- Evidence:
  - `probe/` (touch card shots at every width, cycle ends, `probe-r3.log`, `probe-r3-fresh-table.tsv`);
  - `probe-r2-rerun/`;
  - `clip390/`, `window390/window-390.txt`;
  - `print-{S,M,L}/` (all roles; keys for model and test at S/M, all keys at L);
  - `model-opts/` (jumps 15, times each, 5/6/7-digit rows, Lines);
  - `model-allskills-diff.txt`, `search-queries.txt`, `phone/`, `gate-logs/*.log`.
