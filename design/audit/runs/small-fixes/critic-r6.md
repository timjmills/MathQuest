# Small fixes lane: independent critic, round 6

Branch `claude/sweet-newton-c8wrv1-wip-small-fixes` at `ca347e23`. That commit merges main `e53677e0` into the lane; the merge kept
both blocks of the one conflict in `css/screen-cell.css`. I graded the diff `origin/claude/sweet-newton-c8wrv1..HEAD`. The round-6 fix
under review is `c957695d`, which does four things:
- `opener.js` holds the L label-wrap reserve (`hand`) only when an Independent band is drawn.
- Practice rows are sized from the practice items, not the Model row.
- `bestGeometry` also tries the deal without its tallest practice rows, and re-fits the chosen rows on exactly the placed items.
- `count-row.js` drops r5's 1.2 mm row padding and starts the row 1.5 mm in from the left instead (N14). The gate
  `small-fixes-model-pages` gets 2 more option sets and a missing-second-Guided-row check.

Between the r5 tree (`ce62a62c`) and `c957695d`, only those 3 files change.

I checked the Chromebook sizes first (1366x650 and 1280x600, with mouse and with touch), then the phone at 390 (basic pass). I ran
one browser at a time; another session was running gates in `/home/user/mq-numberline` at the same time. My scripts and logs are in
the critic scratchpad (`scripts/`, `r6/`). The scratch trees were:
- `main72`, the archive of `72e05d7`, the gate's base;
- `r5tree`, the archive of `ce62a62c`;
- `mut`, HEAD with one line mutated.

The evidence PNGs are in `r6/`.

## Gates and probes

- **`small-fixes-model-pages`** (`MQ_BASE_ROOT` = `main72`): **OK**, 180 sheets (15 option sets × S/M/L × A4/Letter × Opener and
  Scripted model). No page count rises, the scripted model is byte-identical to the base, there are 0 empty cells and no footer
  overrun, and the largest band is 29 %.
- **Is the gate extension real?** I copied the r6 gate into the r5 tree (`r5tree`, `ce62a62c`) and ran it there:
  - The gate **FAILS** on `step 25 + Lines + one page`, Letter, S/M/L: "1 Guided row with 33 mm free in the budget (a row is
    31.6 mm)". That is N13b.
  - It does **not** catch N13a (100,000, L A4) on the unmodified r5 tree. The new check reads the row's natural height from
    `fits.sections[0].rowMm`, which r6 added to the plan's meta. On the r5 tree that field is missing, so the check falls back to the
    last drawn cell's height, which includes the 8 mm grow, and the row "does not fit".
  - I then added the two meta fields to the r5 tree's `opener.js` and changed nothing else (`rowMm: g.gH, growMm: g.grow`, a
    reporting-only line). The gate now fails both cases: `100,000 from 1,000,000 | L | A4 ... 1 Guided row with 42.8 mm free in the
    budget (a row is 38.3 mm)` and the three by-25 Letter sheets (`gate-r5tree-meta.log`).
  - So on the code it now guards, the check is real for both halves of N13. The weak fallback is nit N16.
- **Mutation on HEAD:** I put `hand` back in the second-Guided-row test (the N13a cause) on the r6 tree. It still prints 2 Guided
  rows at 100,000 L A4, because r6 also removed the 2.4 mm row padding. So the padding was the main cost, and the `held` change is
  a correct guard, not the deciding one.
- **The same gate checks with seeds 99 and 2026** (a scratch copy of the gate with only the seed changed, Opener only): **OK**,
  90 + 90 sheets.
- **`small-fixes-countrow-caret`**:
  - Full run: 303 PASS, **1 FAIL** at `[1366x650 worksheet by25lines] slow typing, Space after each number: 75|175|225||275300
    (want 75|175|225|275|300)`. This is an assertion failure, not the "detached Frame" flake.
  - Two full re-runs with `SIZES=1366` passed (128/128 each).
  - A focused loop of the same case (worksheet, by 25 Lines, 750 ms between keys, Space after each number), 12 times at 1366x650,
    gave 12 of 12 right.
  - I could not reproduce it. It is O5 below.
- **Chromebook touch probe** (my own, `scripts/touch.cjs`; `hasTouch` at 1366x650 and 1280x600, card / worksheet / quiz × by 7 and
  by 25 Lines). In every case I tapped each box and typed: 12/12 land every number in its box. No horizontal scroll, the touch line
  "After each number, tap the next box." shows (the Space line is hidden), and the boxes are 58–66 × 44 px.
- `small-fixes-equiv-frac`, `small-fixes-quiz-wordrow`, `small-fixes-xp-burst`, `small-fixes-no-start-toast`,
  `wave1-a3-wrongdigits` and `ws-boot-smoke`: all **OK** on the merged tree.
- `ws-code-snapshot`: **OK** (608 codes, 35 categories, +36 appended since the pinned baseline, nothing moved or deleted).
- `ws-content-audit --category multiplication`: **OK** (27 skills, 240 items each, 0 failing).
- Non-browser units, all **OK**:

  | Gate | Result |
  |---|---|
  | `ws-anchors-unit` | 322 |
  | `ws-ink-unit` | 185 |
  | `ws-layout-unit` | 535 |
  | `ws-panes-unit` | 202,727 |
  | `ws-providers-unit` | 105,162 |
  | `ws-supports-unit` | 257 |
  | `ws-content-audit --self-test` | 121 |

  `node --input-type=module --check` passes on `count-row.js` and `opener.js`.
- **Print sweep** (`scripts/sweep.cjs`). I rendered the Opener for the 15 gate option sets × S/M/L × A4/Letter, seed 4242, on HEAD
  and on the r5 tree. For every sheet I measured the Guided and Independent counts, pages and key pages, empty cells, ink out of
  cell, the largest band, the blank foot and the room in the body, the minimum digit pt, and the gap from each letter to the step
  tab. I also ran the same sweep without PNGs for seeds 1, 99 and 2026: 270 sheets, 0 errors, 0 page rises, 0 empty cells, 0 ink
  out, no band ≥ 30 %, no letter overlap, no overrun. I looked at the PNGs myself.
- **The answer keys** for the two N13 sheets are facsimiles with the same rows as the pupil page, and every answer is right
  (`r6/key-opener-100000-L-A4.png`, `r6/key-opener-by25-lines-onepage-M-Letter.png`).

## N13 status: FIXED

| Sheet | r5 tree | r6 (HEAD) |
|---|---|---|
| (a) 100,000 from 1,000,000, L, A4 | 1 model, **1 guided**, 0 independent, 42 mm foot | **1 model, 2 guided**, 0 independent, 3.3 mm foot (0.3 mm room in the body) |
| (b) by 25 + Lines + one page, Letter S | 1 guided + 2 independent, 40 mm foot | **2 guided + 2 independent**, 20 mm foot |
| (b) by 25 + Lines + one page, Letter M | 1 guided + 2 independent, 40 mm foot | **2 guided + 2 independent**, 20 mm foot |
| (b) by 25 + Lines + one page, Letter L | 1 guided + 2 independent, 40 mm foot | **2 guided + 2 independent**, 20 mm foot |

See `r6/print-opener-100000-L-a4-N13a-FIXED.png` (r5: `r6/print-opener-100000-L-a4-r5-tree.png`) and
`r6/print-opener-by25-lines-onepage-M-letter-N13b-FIXED.png` (r5: `...-r5-tree.png`).

The r5 "what a fix must do" items:
- **`hand` only when an Independent band is drawn.** Done: `held = iRows ? hand : 0` in the second-Guided-row test and in `spare`.
- **Rows chosen from the rows actually placed.** Done. `bestGeometry` tries every height cut-off of the practice rows, keeps the
  page with the most rows (ties go to more Independent rows), and re-fits the chosen counts on exactly the placed items (`cap`).
- **Gate extension.** Done, and real on the code it guards (see above). It is weaker on a tree without the `rowMm` meta (N16).

Every sheet that still prints one Guided row in one column, I checked against PT-ENG-3 (fixed heights ≤ bodyH − 4) using the
plan's own `rowMm` and `growMm`:

| Sheet | Room in body | Grow handed back | Free in budget | Row | Fits? |
|---|---|---|---|---|---|
| 100,000 L Letter | 26.5 | 8 | 30.5 | 35.9 | no |
| 100,000 + Lines L A4 | 38.6 | 0 | 34.6 | 38.9 | no |
| 100,000 + Lines S Letter | 34.1 | 0 | 30.1 | 30.6 | no (0.5 mm short) |
| 100,000 + Lines M A4 | 27.6 | 0 | 23.6 | 34.7 | no |
| times under each L Letter | 38.3 | 8 | 42.3 | 46.5 | no |
| Lines L A4 | 28.9 | 0 | 24.9 | 38.9 | no |
| default L A4 | 18.9 | 16 | 30.9 | 35.9 | no |
| **times under each M A4** | 29.6 | 16 | **41.6** | **40.8** | **yes, by 0.8 mm** (see O7) |

## N14 status: FIXED

The letters now clear the step tab on every one-page and Lines + one-page sheet, at every size. On the r5 tree, the Lines + one
page and by 25 + Lines + one page sheets measured **−0.31 / −0.36 mm** (the letter box overlapped the tab). On r6:

| Sheets | Gap from letter to tab |
|---|---|
| Lines + one page; by 25 + Lines + one page | **+1.14 mm** |
| one page; by 25 + one page | +1.73 mm |
| 14,000 / 25,000 + one page | +1.12 to +1.73 mm |
| every other Opener | 2.8 to 5.5 mm |

The sweep found no overlap on any of the 360 Opener sheets (4 seeds). See `r6/N14-letter-vs-tab-r5-left-r6-right.png`: r5 on the
left, where the "a." period sits on the tab corner, and r6 on the right, with a clear gap.

## r6 compared with r5, from the sweep

The sweep compared all 90 sheets at seed 4242. Rows never fall, pages never rise, and no sheet has an empty cell or ink out of its
cell.

| Sheet | r5 tree | r6 | Verdict |
|---|---|---|---|
| 100,000 L A4 | 1 guided, 0 independent, 42 mm foot | 2 guided, 3 mm foot | fixed (N13a) |
| by 25 + Lines + one page, Letter S/M/L | 1 guided + 2 independent | 2 guided + 2 independent | fixed (N13b) |
| 14,000 / 25,000 + one page, A4 S/M/L | 1 guided + 2 independent, 21 mm foot | **2 guided** + 2 independent, 10 mm foot | better |
| 14,000 / 25,000, S Letter | 1 guided + 2 independent | 2 guided + 2 independent | better |
| 100,000 S A4 | 1 guided + 2 independent | 2 guided + 2 independent | better |
| 100,000 M A4 | 1 guided + 1 independent, 24 mm foot | 1 guided + 2 independent, 10 mm foot | better |
| times under each, S Letter | 1 guided + 1 independent, 29 mm foot | 1 guided + 2 independent, 10 mm foot | better |
| times under each + Lines, L Letter | 1 guided, 0 independent, 55 mm foot | 2 guided, 8 mm foot | better |
| times under each + Lines, L A4 | 2 guided + 0 independent | 1 guided + 1 independent (Score /1) | same row count; the tie goes to a scored row (PT-OPN-7), acceptable |
| 100,000 + Lines, M Letter | 2 guided + 0 independent | 1 guided + 1 independent | same as above |
| Full 2 + 2 sheets (one page, Lines S/M, Lines + one page, by 25 + one page, times under each + Lines S/M) | foot 30–85 mm | foot **+9.6 mm** (57–95 mm) | the 2.4 mm padding came off 4 rows. PT-OPN-7 is at its maximum and Lines rows take no grow, so the foot is what PT-ENG-3 requires (accepted since r4). The largest band fell 1–4 points |
| default / by 25 / 14,000 / 25,000, M and L A4 | foot 10–17 mm | foot 17–22 mm | same rows, 2.4 mm shorter each; no row fits in the difference (checked above) |

## Score table (C1 ease · C2 teaching · C3 spacing · C4 fidelity)

| # | Fix | Host / version | C1 | C2 | C3 | C4 | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | Count-row caret: move-on keys, row-wide digit count, overflow, green hand-on | Quiz 1366/1280, mouse and touch | 8 | 8 | 8 | 8 | pass |
| 1 | | Practice card 1366/1280, mouse and touch | 8 | 8 | 8 | 8 | pass |
| 1 | | Online worksheet 1366/1280, mouse and touch | 8 | 8 | 8 | 8 | pass (O5: one unreproduced skip) |
| 1 | | Phone 390 (gate, basic) | 8 | 8 | 8 | 8 | ok |
| 2 | Word hint in flow, "Listen" text button | Card 1366/1280 | 8 | 8 | 8 | 8 | pass |
| 3 | Unknown-id "Simplify a/b" num/den boxes | Card / worksheet / quiz | 8 | 8 | 8 | 8 | pass |
| 4 | Quiz word rows: restore, partial by row, live dots | Quiz 1366/1280 | 8 | 8 | 8 | 8 | pass |
| 5 | +XP burst | Card / boss / race | 8 | 8 | 8 | 8 | pass |
| 6 | No start toast | Card / boss / race / worksheet | 9 | 8 | 9 | 8 | pass |
| 7 | Scripted model | 15 gate variants × S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass (byte-identical to the base) |
| 7 | Opener, rows with boxes: default, by 25, times under each | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass |
| 7 | Opener, 1,000 from 14,000 (boxes, Lines, one page) | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass (6-character answers in 15.5–17.9 mm boxes, about 2.9 mm a character: tight, a nit) |
| 7 | Opener, 100,000 from 1,000,000, boxes and Lines | **S/M/L × A4/Letter** | **5** | 8 | **7** | 8 | **FAIL (N15, cap H9)** |
| 7 | Opener, by 25,000 (boxes, Lines, one page) | **S/M/L × A4/Letter** | **7** | 8 | 8 | 8 | **FAIL (N15)** |
| 7 | Opener + one page (boxes) | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass (N14 fixed) |
| 7 | Opener, Lines | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass (2 + 2 at S and M, so the foot is spec-required) |
| 7 | Opener, Lines + one page (default step) | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass (N14 fixed; the 77–95 mm foot is spec-required with 2 + 2 rows, see O8) |
| 7 | Opener, by 25 + Lines + one page | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass (N13b fixed) |
| 7 | Opener, times under each + Lines | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass |

What would raise the passing rows to 10: on Opener sheets that are full at 2 + 2, use the spare foot (for example a third
Independent row, or more writing room in each row) so the page does not end in a blank band. That needs an owner change to
PT-OPN-7 or PT-ENG-3; the lane cannot do it alone.

## New defects

**N15 · High (critical: cap H9) · Fix 7, and every count-row page: on the Opener's practice rows, a 100,000 or 25,000 row gives the
pupil answer boxes too narrow to write the answer, and prints the given numbers at 9–11 pt. This is r3's observation O2, promoted
to a defect.** It is pre-existing: `main72` (`72e05d7`) measures exactly the same. It is the count-row full-line geometry
(`count-row.js`), not the r6 change. But it is on the very sheets this lane's item 7 lays out, and it costs C1 below 8.

Repro: `buildSheet({role:'opener', sections:[{skills:[{categoryId:'multiplication', skillId:'count_by_tables',
opts:{rows:[{step:100000, start:'custom', at:1000000}]}}]}], size:'L', paper:'A4', seed:4242})`. The same applies with `{step:25000}`.

What the page shows (`r6/N15-100000-L-a4-model-vs-guided-boxes.png`, `r6/print-opener-100000-lines-L-a4-N15.png`). Answer box
width is the narrowest practice box, and given pt is the given numbers in the practice rows:

| Row | Size | Answer box (mm) | Given numbers (pt) | Longest answer | Room per character |
|---|---|---|---|---|---|
| 100,000 | S / M / L | 17.8 / 16.8 / **15.8** | **9.0** | 9 characters ("1,300,000") | **1.8–2.0 mm** |
| 100,000 + Lines | S / M / L | 19.1 / 18.1 / 17.1 (line) | 9.0–9.4 | 9 characters | 1.9–2.1 mm |
| 25,000 | S / M / L | 16.6 / 17.4 / 16.5 | 10.2 / 11.1 / **10.5** | 7 characters ("175,000") | 2.4 mm |
| Model cell, same 100,000 numbers, for comparison | M / L | 27.4 / 28.7 | 14–15 | 9 characters | 3.1–3.2 mm |

- The rubric asks for 8–10 mm writing height, which means about 4–5 mm a digit. "1,300,000" by hand needs about 32–39 mm, and the
  box gives 15.8 mm.
- The answer key shows the problem: at the key's own typeset size, "1,300,000" already fills the box from edge to edge
  (`r6/key-opener-100000-L-A4.png`).
- At L, the size meant for pupils who need bigger print, the boxes are narrower than at S, and the givens stay at 9 pt while the
  Model prints the same numbers at 15 pt. That is lessons-learned L1: "Size S ignored", here the other way round.
- The rubric also says the digits are the largest thing on the page and text a pupil reads is at least 11 pt.

Cost:
- 100,000: H9 caps C1 at 5, and C3 is 7 (the digits are not the largest thing on the page; givens shrink from 15 pt in the Model
  to 9 pt in practice).
- 25,000: C1 7 (6-digit answers at about 2.4 mm a character).
- 1,000 from 14,000: 5-digit answers at about 2.9 mm a character. I keep it at 8, as a nit.

*What a fix must do:*
- **Answer slots.** In `count-row.js` `geom()`, size every answer slot from the widest answer at the size's writing height, not
  from what fits 12 per line. Use at least `chars × 0.55 × writeMm + 4` mm, which the Model cell already approximately does
  (27–29 mm). Wrap the row to as many lines as that needs (for example 6 per line at 100,000, two or three lines). Do not shrink
  the slots.
- **Given numbers.** Print them at the size's working digit size (≥ 11 pt at S, rising with M and L, the same as the Model row).
  Do not drop to `FLOOR_PT`.
- **Re-fit.** The Opener re-fits rows from the new heights (r6's `bestGeometry` already does), and `small-fixes-model-pages` must
  still show no page count rise and no missing row.
- **Gate check.** Add a check to `small-fixes-model-pages`, or to a count-row unit: for every count-row practice cell, the
  narrowest slot ≥ longest answer × 0.55 × writeMm, and the givens ≥ 11 pt, at S, M and L. It must fail on today's 100,000 and
  25,000 sheets.

**N16 · Low (nit, does not fail) · gate: the missing-row check of `small-fixes-model-pages` falls back to the last drawn cell's
height when the plan gives no `rowMm`.** That height includes up to 8 mm of grow, so a dropped row can read as "not fitting": the
gate missed N13a on the r5 tree as it stood. The fix: when `rowMm` is absent, subtract the grow (or fail with "no rowMm in the
plan's fits"), so the check cannot pass silently on a plan that stops reporting it.

## Out of lane / observations

- **O1, O3 and O4:** unchanged from r4 and r5. I did not re-run `hint-popup-e2e` this round; it is not on the brief's list.
- **O2:** promoted to N15 (above).
- **O5 · count-row caret, worksheet, one unreproduced skip.** In the first full `small-fixes-countrow-caret` run, at 1366 worksheet
  by 25 Lines with slow typing, box 4 stayed empty, and "275" then "300" landed together in box 5. It looks like a double move after
  "225" turned green: the green hand-on plus the Space. The next 26 tries of that path passed: 2 full gate runs at 1366, and 12
  focused loops with my own trace (`scripts/slowrepro.cjs`). That run was under heavy CPU load from the other session.
  - I do not score it. Chromebooks are slow, though, so the lane should look at the timing between `selectIfLoose`'s `justRight`
    hand-on (`active-box.js` ~line 158, its 1500 ms window) and `wireCellSlots`' `handed` check (`screen-cell.js` ~line 1873, its
    2500 ms window).
  - A useful check: run the slow-typing case with CPU throttling (`page.emulateCPUThrottling(6)`) 20 times. It must give 20 of 20.
- **O6 · online worksheet with touch, 1280x600** (`r6/screen-touch-1280-worksheet-by25lines-O6.png`). When card 1 is solved, its
  "Here is how" panel grows the grid row, and card 2's count row sits vertically centred, with about 140 px of blank above it. This
  is the worksheet grid's row stretch, not this lane's diff. It is a cosmetic C3 nit.
- **O7 · times under each, M A4:** 1 Guided + 1 Independent with 29.6 mm room. By PT-ENG-3 a second row fits by 0.8 mm (41.6 mm
  free against a 40.8 mm row). The gate's extra 1 mm host tolerance hides it, and the plan's own arithmetic says no. I accept it as
  within measurement noise; it is not a defect (`r6/print-opener-times-each-M-a4-borderline.png`).
- **O8 · full 2 + 2 Opener sheets now end in a foot 9.6 mm deeper than in r5** (for example Lines + one page A4 95 mm, Lines S A4
  87 mm; `r6/print-opener-lines-S-a4-2plus2-foot.png`). This is spec-required: PT-OPN-7 allows at most 2 Independent rows, and Lines
  rows take no grow. A fuller page needs an owner ruling (a third row, or a writing-room grow for Lines rows). It is not a lane
  defect.
- **Key ink.** The answer keys print answers in a key ink colour (`--ws-key-ink`, `css/sheet-kit.css:333`). That is main's
  answer-key options work, merged in `ca347e23`, not this lane.

## Verdict

**FAIL.**

**What passes:**
- **N13 is fixed:** 100,000 at L A4 prints 2 Guided rows again, and by 25 + Lines + one page on Letter prints 2 + 2 at S, M and L.
  The r5 "what a fix must do" items are all met.
- **N14 is fixed:** letters clear the tab by 1.1 mm or more on every Opener sheet.
- **The gate extension is real:** it fails both N13 cases on the r5 code once that code reports its row height, and passes now
  across 3 seeds.
- **The rest of the sweep:** compared with r5, rows never fall, pages never rise, and there are no empty cells, ink outside a cell
  or bands ≥ 30 %.
- **Fixes 1–6** pass on every host on the merged tree, Chromebook touch included.
- **The scripted model** is byte-identical to the base.

**What fails is N15 (r3's O2, promoted).** On the Opener's practice rows, a count by 100,000 gives the pupil a 16–19 mm box for a
9-character answer and prints the givens at 9 pt (C1 5 under H9, C3 7). A count by 25,000 gives about 2.4 mm a character (C1 7).

The cause is pre-existing count-row geometry, not `c957695d`. It is the one thing left between item 7 and an 8 on every row.
