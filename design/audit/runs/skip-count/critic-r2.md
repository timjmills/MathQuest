# Skip-count lane (a79237e5c40225940) · independent critic, round 2

Graded at **2015274a** (lane head, merged with the latest base). Scope: `patterns:skip_count_grid`, `patterns:skip_count_line`
and `multiplication:count_by_tables` (shared `count-row.js` and the count-row kit cell).

- **Print:** model (scripted-model), guided, independent, more-practice, review and test at S, M and L, each with its key.
  Rendered through `ws-grade-render --roles` (A4 PDF, rasterised) and looked at.
- **Out of scope:** the lesson packet (D6, lessons wave; noted below and not scored), stretch and thinking pages.
- **Screen:** practice card, online worksheet and quiz at 1366x650, 1280x600, 683x650 (half a Chromebook) and 390x844, with
  mouse and touch. Extra checks at 820, 1024 and 1100.
- **Resize cycles without reload, both directions:**
  - fresh 390 → 1366 → 390 → 1280 → 683 → 1366;
  - fresh 1366 → 390 → 1366 → 1280 → 683 → 390.
  - Both cycles ran on all three hosts × 5 cases × mouse/touch (`evidence-r2/critic-probe-r2.cjs`, 451 checks).
- **Regression baseline:** the r1 lane head 8c43b006, served with `MQ_ROOT`.

## Verdict: FAIL

The round fixed what r1 failed on the Chromebook sizes:

- At 1366 and 1280 no row wraps 4 + 2 or leaves a band. No number leaves its tick. Every host shows every row whole.
- Both resize cycles end clean on the worksheet and the quiz, and on the card for the grid and the tables.
- The review/test titles read "skip counting".
- The scripted model traces steps 2..k and fits one page with default options.

It fails for two reasons:

1. **D7, a regression.** The practice card's number line (`skip_count_line`) breaks between 683 and 1279 px:
   - from 820 to 1279 px it shows "Swipe → for more boxes" under a line that fits whole;
   - at 683 the last number is cut in half at the cell edge ("6(");
   - at 820 it shrinks the digits from 28 px (r1) to 24.8 px.

   r1 drew all three widths whole, with the tab above.
2. **D8.** The one-page model fix holds only for the default options. With "Multiplication under each number"
   (`times: each`) at M and L, "15 numbers" (`jumps: 15`) at M and L, or a 7-digit row at L, count_by_tables' model goes back to
   step 4 alone on page 2, which is about 70 % empty (H5).

## Owner question: a number line that does not fit keeps the swipe on a Chromebook

Acceptable for C1 and C3.

- At 1366x650 and 1280x600 no number line overflows on any host:
  - 0 of 69 rows across 3 seeds × 3 hosts (`evidence-r2/line-band1000-chromebook.txt`);
  - this includes the worksheet with "Numbers to 1,000" (3-digit lines up to 460).
- So on a full-screen Chromebook the swipe is a fallback that the dealt content never reaches.
- Wrapping a number line would break its ticks, which is the r1 D1 defect.

The ruling becomes a problem only when the swipe is drawn badly, and D7 is a case of that.

## Scores

| Version | C1 | C2 | C3 | C4 | Pass | Main defect |
|---|---|---|---|---|---|---|
| Independent / more-practice S, M, L (all 3) | 9 | 9 | 8 | 9 | yes | none blocking |
| Guided S, M, L (all 3) | 8 | 8 | 8 | 9 | yes | L takes 2 full pages for grid and tables (as r1) |
| Review / test S, M, L (all 3) | 9 | 9 | 8 | 9 | yes | D4 fixed: "Review: skip counting by 2s, 5s and 10s", "Test A: skip counting on a number line" |
| Model S, M, L, default options (all 3) | 9 | 8 | 8 | 9 | yes | step 3 does not say "Write N." (N2) |
| Model M / L, count_by_tables `times: each` or `jumps: 15`; L with 7-digit rows | 8 | 8 | **5** (H5) | 9 | no | D8: step 4 alone on page 2 |
| Practice card 1366 / 1280 (all 3) | 9 | 9 | 8 | 9 | yes | |
| Practice card 683 / 820–1279, skip_count_line | **5** | 7 | **5** | 8 | no | D7: false swipe cue, cut number, shrunk digits |
| Practice card 683, grid and tables | 8 | 9 | 8 | 9 | yes | shrinks to the 44 px floor (22 px digits) and fits |
| Practice card 390, skip_count_line | 8 | 8 | **7** | 8 | no | D9: the rest window cuts the 4th number ("5L") on some seeds; pre-existing (same at r1) |
| Online worksheet 1366 / 1280 / 683 / 390 (all 3) | 9 | 9 | 8 | 9 | yes | whole rows, no band; numbers on their ticks |
| Quiz 1366 / 1280 / 683 / 390 (all 3) | 9 | 9 | 8 | 9 | yes | |
| Resize cycles, worksheet + quiz (all 3), card (grid, tables) | 9 | – | 8 | – | yes | every step clean and equal to a fresh load |
| Resize cycles, card skip_count_line | 5 | – | 5 | – | no | inherits D7 at 683 (both directions) |
| Lesson packet | – | – | – | – | not scored | D6, out of scope (lessons wave) |

## r1 defects: verification

| r1 | Status | Evidence |
|---|---|---|
| D1 card/quiz wrap a row that fits | **Fixed at 1366/1280** | Probe: 0 wrapped, 0 swiping, 0 cues on card and quiz at 1366/1280 for all 5 cases; `probe/card-1280-count_by_tables.png`, `probe/quiz-1280-skip_count_grid.png`, `probe/card-1366-skip_count_line.png` (numbers under ticks). The card's number line regresses below 1280 instead (D7) |
| D2 worksheet band and stray arrow | **Fixed** | `probe/worksheet-1366-*.png`, `probe/worksheet-1280-count_by_tables.png`: the tab is beside the row, there is no band, and every jump is inside the cell. The cbwrap band/jump checks pass |
| D3 resize leaves the row broken | **Fixed** for worksheet and quiz (all 5 cases) and for the card's grid and tables, in both directions, mouse and touch. The card's number line is clean at 1366/1280/390 in the cycle but carries D7 at 683 | `probe/probe-r2.out` |
| D4 "skiping" titles | **Fixed** | `review-L-grid-key-title.png`. Titles were read on all 6 roles × 3 skills (`gate-logs/modelprobe.log`). The providers-unit check is in place |
| D5 model does not show its steps / L on 2 pages | **Fixed for defaults; partly open (D8)** | `model-L-line.png`, `model-S-cbt.png`. Every "Write N." step traces N in its own panel, over 12 seeds × 9 option sets × S/M/L (0 failures). One page holds for 21 of 27 option/size sets |
| D6 lesson packet | Out of scope (lessons wave) | not re-graded |
| N1 search | **Fixed** | `count by 5 number line` → skip_count_line; `skip count by 5` → skip_count_line, skip_count_grid first |
| N2 stale comment | **Fixed** | `gen-mult-patterns.js` |
| N3 hundred-chart tag | **Fixed** | `hundred chart` no longer returns skip_count_grid |

## New defects

### Blocking

**D7 · C1 −4, C3 −3 on the practice card, skip_count_line, 683–1279 px (regression from r1 8c43b006).**
- **Where:** `js/modules/screen-cell.js` `wireSwipeRows`: `layout()` (l. 1815–1869), `alignAxis()` (l. 1722–1771) and
  `upd()` (l. 1882). Card host only; the worksheet and quiz number lines are clean at the same widths.
- **What the card shows:**

  | Width | r2 | r1 |
  |---|---|---|
  | 683x650 | Tab beside the line, boxes at the 44 px floor, digits 22.2 px. The line runs past the cell: the last number "80"/"62" is cut at the cell's right edge ("6(") and the `.visual-aid` box scrolls. "Swipe → for more boxes" shows. The row has no `data-mq-swipes` and no snapped window (`card-683-line-r1-vs-r2.png`, `card-683-line-cut-number.png`) | Tab above, all 8 numbers whole at 22 px, no cue |
  | 820, 1024, 1100 | The whole line fits, but the cue shows: `data-mq-end` is absent while `moreRight()` is false (`tablet-cue-scan.txt`: falseCue 1 on the card line at all three widths, 0 on every other host and skill; `card-line-fresh-1024.png`, `card-line-fresh-1100.png`) | |
  | 820 | Digits 24.8 px with boxes 45 px (`card-820-line-r1-vs-r2.png`) | Tab above, 28.1 px digits, 54 px boxes |

  A pupil is told to swipe a row that does not move. At 683 a number they must read is cut.
- **Cause (from the DOM):** `layout()` measures `fits()` on the drawing as rendered, then `alignAxis()` maps the ticks onto the
  laid-out numbers and widens the axis and arc SVGs (`wNew = max(v[2], f(v[2]))`, `sv.style.width = wNew*k px`). This makes
  the row wider than the room it was measured for, and nothing measures again. `upd()` (the only setter of `data-mq-end`) is
  not re-run after the late `alignAxis()` from the ResizeObserver, so the cue state is stale. The r1 order also put the step tab
  above before shrinking (C2 r6). r2 tries "beside + shrink" first and never reaches the tab-above whole line on an axis row.
- **Fix:**
  1. In `layout()`, call `alignAxis()` before every `fits()` measurement (or measure the mapped width), so the choice is made on
     the drawing as it will stand.
  2. For an axis row, try "tab above, full size, whole" (`frame` with `data-mq-tabtop`, as r1 drew it) before shrinking, and
     shrink only if the tab-above line still does not fit.
  3. End `mode()` with `upd()`, and call `upd()` in the ResizeObserver callback after `alignAxis()`.
  4. If the line still overflows, give it the real swipe window (the `data-mq-swipes` branch, whole columns), never an overflow
     of `.visual-aid`.
- **Check:** add the card host at 683x650, 820x1180, 1024x768 and 1100x650 to `wave1-c2-cbwrap`'s LAYOUT pass. Assert:
  - no visible `.k2-swipe-cue` unless a `.k2-given`/input lies past the window's right edge;
  - no `.k2-given`/input straddles the cell's or window's right edge;
  - the digit size at 820 is ≥ the size at 683.

  `evidence-r2/critic-probe-r2.cjs` and the scans in `tablet-cue-scan.txt` / `phone-halfcb-cut-scan.txt` are ready-made.

**D8 · C3 ≤ 5 (H5) on the model page of count_by_tables with common options at M and L.**
- **Where:** `js/modules/sheet/roles/scripted-model.js` `plan()` (l. 69–83), the one-line text rule.
- **What:** over 12 seeds each, the model takes 2 pages, with step 4 alone on page 2 (about 70 % empty), in these cases
  (`model-L-cbt-times-each.png`; `gate-logs/modelprobe.log`):
  - `times: each` at M and L;
  - `jumps: 15` at M and L;
  - a row by 100,000 from 1,000,000 at L.

  The defaults, `fill`/`spaces: line`, a by-7-from-3 row and the 1,000s row stay on 1 page. This is the r1 D5 layout again. The
  one-line text rule does not save the page because the drawing itself is taller: three lines of 5, or a fact row under each
  number.
- **Fix:** when `Math.floor(room1 / H) < steps.length` after the one-line rule, choose one of:
  - put two states side by side (2 columns) when the half-width column holds the row at the 44-px-equivalent print floor;
  - drop the `times` facts from states 1–3 and keep them on state 4 (they are a hint, not the step being modelled);
  - merge steps 2 and 3 into one state ("6 + 2 = 8. 8 + 2 = 10. Write them.") so three states fit.

  Never leave a lone state on a page.
- **Check:** extend `wave1-c2-model.cjs` to `{times:'each'}`, `{jumps:15}` and `{rows:[{step:100000,start:'custom',at:1000000}]}`
  at S/M/L, asserting `pageCount === 1` (or, if two pages are unavoidable, that page 2 holds ≥ 2 states).

### Non-blocking (scored above, fix in the same round)

**D9 · C3 −1 on the card at 390, skip_count_line (pre-existing; same at r1).**
- **What:** at rest the swipe window is the full 346 px, and the 4th number is cut at its right edge ("5L" for 54). Seen on
  seeds 9 and 33; seed 21 gets a 334.6 px window and is clean (`card-390-skip_count_line-s9.png`,
  `phone-halfcb-cut-scan.txt`).
- **Cause:** the axis line starts with a lead-in before the first number, so the first item is about 40 px into the window.
  `n = floor((avail + gap + .5) / pitch)` ignores that offset, and `win = min(avail, n·pitch − gap + 3)` falls back to the
  full width.
- **Fix:** compute `lead = its[0].left − w.left` and use `n = floor((avail − lead + gap + .5) / pitch)`,
  `win = lead + n·pitch − gap + 3`.
- **Check:** in cbwrap at 390, no `.k2-given`/input straddles the window's right edge on 5 seeds of card, worksheet and quiz.

### Nits (not scored)

- **N1 · 683 inputs.** On the worksheet and card number lines at 683, inputs are 42x44 px inside a 46x44 tile (21 of 60
  worksheet boxes). The tile clears 44 px, so H6 does not apply, but the shrink's "≥ 44 px box" floor is applied to the tile,
  not the input. Measure the input in `layout()`'s `small`.
- **N2 · model wording.** Step 2 reads "6 + 2 = 8. Write 8." and step 3 reads "8 + 2 = 10." without "Write 10.", although
  panel 3 now traces 10 (`sheet/providers/countby.js` `rowSteps`, l. 54). Add `Write ${fmt(values[i])}.` for parallel steps.
- **N3 · probe limit.** On the card host, `__wsReseed` does not reproduce the same question across renders. The probe's
  "differs from fresh 390" lines for the card line compare a by-2 line with a by-10 line (346 vs 334.6 px window), so they are
  not counted as defects.
- **N4 · search.** `counting by 25` returns 0 results; count_by_tables deals by 25. Add `count by 25`, `counting by 25s` to
  its SKILL_TERMS.
- **N5 · listeners.** Each `wireSwipeRows` call adds two `resize` listeners on `window` and never removes them. Rows from
  earlier cards (disconnected) still run `mode()` on every resize. Guard with `if (!w.isConnected) return removeEventListener`,
  as `digitKey` does.
- **N6 · lesson packet (D6).** Out of scope this round (lessons wave); r1's findings stand for that wave.

## Gates (run one at a time, directly; no /tmp/mq-browser-run.sh)

| Gate | Result |
|---|---|
| ws-boot-smoke | OK |
| wave1-c2-cbwrap | OK. It covers card/quiz/worksheet at 1366/1280 and the worksheet resize cycle from 390 only; it misses D7 (no 683/820–1100 card) and D9 |
| wave1-c2-lines | OK |
| wave1-c2-phone | OK |
| wave1-c2-model | OK. Default options only; misses D8 |
| wave1-c2-onepage (MQ_BASE_ROOT = efeb910 archive) | **FAIL, 12 byte-diffs, NOT the lane.** All invariants and chosen-row cases ok. The digest equals the base at r1 head 8c43b006 and changes at the base merge 60a5e836, before any r2 lane commit. The only difference is the key's new `data-ws-key-ans` attribute on answer slots (pixels unchanged). Lead note: re-pin with the owner, or strip that attribute in `digest()` |
| ws-options-verify count_by_tables / skip_count_grid / skip_count_line | OK 27/27, 7/7, 9/9 |
| ws-print-lint --self-test | OK, 50 assertions, 38 planted defects |
| ws-print-lint --source kit | 461 findings in 33 documents (baseline 463/33). count_by_tables 0 findings |
| ws-screen-answer (3 skills) | OK |
| ws-screen-slots (3 skills) | OK, 0 doubled, 0 paper verbs |
| ws-chromebook-fit (3 skills) | OK |
| ws-providers-unit | OK (105,381 checks, incl. 4 count-by) |
| ws-search-terms | OK, 238/238 |
| ws-code-snapshot | OK, 608 codes |
| ws-content-audit --skill count_by_tables | OK, 0 failing, 1 note. Lead note: the audit does not cover the patterns skip skills; its count-row reader yields NaN for them |
| Syntax (`node --input-type=module --check`) on the 6 changed JS files | OK |
| critic-probe-r2 (3 hosts × 5 cases × mouse/touch × 4 widths + 2 cycles) | 438 / 451 pass. All 12 failures are the card number line: 683 cut + false cue (D7), and the card's 390 compare (N3) |
| critic-model-probe-r2 (9 option sets × S/M/L × 12 seeds + titles) | Traces 100 % correct, titles clean. 6 option/size sets take 2 pages (D8) |

## What would raise each criterion to 10

- **Print:** fix D8 and N2. The model then reads as 4 parallel steps on one page with any option. Independent, review and test
  are at 9 on C1/C2/C4; C3 rises from 8 to 9 when the L pages' bottom strip (about 15–20 %) is used by a 5th row at L or a
  taller row pitch.
- **Screen:** fix D7 and D9. The card's number line is then whole with the tab above from 683 up, cued only when it truly
  scrolls, and snapped to whole columns on a phone. Then settle the owner's carried C4 question on 44 px boxes and 22 px digits
  at 683, and 16–19 px digits on 5-digit rows at Chromebook width (`probe-r2-fresh-table.tsv`).

## Files

- Probes:
  - `evidence-r2/critic-probe-r2.cjs`: screen hosts, widths, resize cycles. Run from the tree root:
    `node design/audit/runs/skip-count/evidence-r2/critic-probe-r2.cjs <outdir>`.
  - `evidence-r2/critic-model-probe-r2.cjs`: model traces, page counts and titles.
- Evidence:
  - `evidence-r2/*.png`, `evidence-r2/probe/*.png`;
  - `probe-r2.out`, `probe-r2-fresh-table.tsv`;
  - `tablet-cue-scan.txt`, `phone-halfcb-cut-scan.txt`, `line-band1000-chromebook.txt`;
  - `gate-logs/*.log`.
