# lf-ops: division:div_facts support aids, independent critic, round 5 (narrow)

- **Critic:** independent (built none of it), Opus 5.5 medium. **Date:** 2026-11-07.
- **Tree:** frozen worktree `crit7` at **c41a48c**. Every render below was made on that commit by this critic, one browser run at a time.
- **Previous round:** `design/audit/runs/laned-restart/critic-r4.md` (FAIL, R4-1..R4-5).
- **Binding design:** signed facts card `design/cards/facts/facts.md` §5, owner rulings F1-F4 (2026-11-07). Earlier rulings kept: a plain count-by
  strip is not answer-given-away; touch digits at 24 pt or more at S / M (so touch S = M = L digits is by ruling); the bracket at 10 columns;
  Mixed Review count-chain rows (R1-11 class) do not gate.
- **Read:** RUBRIC.md (H13, §6.1), critic-r4.md, facts card §5 / §9, WDS RP-81 and the array-tile rule (WDS l. 855, l. 1139).

## Renders (`design/audit/runs/lf-ops/renders/divfacts-r5/`)

| Dir | Command |
|---|---|
| `touch/`, `skip/`, `array/`, `think/`, `boxsign/` | `ws-grade-render --skills division:div_facts --roles independent,test,review --supports X --size S,M,L --no-screen` (45 pupil pages + keys) |
| `array-c234/` | the same with `--supports array --opts '{"constant":[2,3,4]}'` (dividends <= 48, so the array is drawn) |
| `fade/` | `ws-print-lint --source kit --skills division:div_facts --supports all --fade packet --pages 3 --size M --save-html`; `packet-local.html` (stylesheet links pointed at the worktree) screenshotted to `page-1..6.png` (3 pupil + 3 key) |
| `regress/` | add_facts, mult_facts, div_facts_long, Independent + Test M, supports off |
| `lint/think-test-M.txt` | `ws-print-lint --supports think --roles test --size M`: 0 findings on a page measured at 40 % empty |
| `tools/` | `band2.py.txt` (per-cell empty band under the last ink, tab excluded, cells from full-span grid lines), `cell-band.py.txt` (r4's), `shot.cjs.txt` |

Measures below are `band2.py` on the 96-dpi PNGs (1 px = 0.265 mm) unless said otherwise.

## VERDICT: FAIL

Lowest score: **6** (C3), on: skip Test M; think Test S and M; the array support at the default band (it falls back to the plain across fact)
on Independent S/M/L, Test S/M/L and Review S/M; fade packet M (page 3).

What r4 failed and is now fixed: R4-1 (touch Independent S/M now 3 x 5 at 14 %, boxsign Independent S 5 x 5 at 15 %, boxsign L 3 x 4 at 13 %);
R4-2 (a true array, quotient rows of the divisor, on every fact when dividends <= 50; greyed past 50 with the reason, and the fits line names
the facts; Review counts 8-16, PT-REV-1 met); R4-3 (strip to 12 x the divisor in two lines of 6, every dividend reached, no term marked:
F3 met); R4-4 (boxsign Test L 3 x 4 = 12, no lone row); R4-5 order (packet dealt all -> fewer -> none: F4 order met).

## Scores (C1 / C2 / C3 / C4)

| Support | Size | Independent | Test | Review |
|---|---|---|---|---|
| touch | S | 8/8/8/8 (band 14 %) | 8/8/8/8 (14 %) | 8/8/8/8 |
| touch | M | 8/8/8/8 (14 %) | 8/8/8/8 (14 %) | 8/8/8/8 |
| touch | L | 8/8/8/8 (11 %) | 8/8/8/8 (28 %) | 8/8/8/8 |
| skip | S | 8/8/8/8 | 8/8/8/8 (27.8 %) | 8/8/8/8 |
| skip | M | 8/8/8/8 (21 %) | 8/8/**6**/8 (34 %, R5-1) | 8/8/8/8 |
| skip | L | 8/8/8/8 (23 %) | 8/8/8/8 (23 %) | 8/8/8/8 |
| array, default band (greyed: falls back to plain) | S | 8/8/**6**/8 (54 %, R5-2) | 8/8/**6**/8 (56 %, R5-1) | 8/8/**6**/8 (35 %, R5-2) |
| array, default band | M | 8/8/**6**/8 (53 %) | 8/8/**6**/8 (54 %) | 8/8/**6**/8 (40.5 %) |
| array, default band | L | 8/8/**6**/8 (36 %) | 8/8/**6**/8 (50 %) | 8/8/8/8 (17 %) |
| array, tables 2-4 (drawn) | S | 8/**7**/**7**/8 (R5-3, R5-4) | 8/**7**/**7**/8 (R5-3, R5-4) | 8/**7**/8/8 (R5-3) |
| array, tables 2-4 | M | 8/**7**/8/8 | 8/**7**/8/8 | 8/**7**/8/8 |
| array, tables 2-4 | L | 8/**7**/8/8 | 8/**7**/8/8 | 8/**7**/8/8 |
| think | S | 8/8/8/8 (19 %) | 8/8/**6**/8 (36 %, R5-1) | 8/8/8/8 (21 %) |
| think | M | 8/8/8/8 (20 %) | 8/8/**6**/**7** (40 %, R5-1, R5-5) | 8/8/8/8 |
| think | L | 8/8/8/8 (11 %) | 8/8/8/8 (29 %) | 8/8/8/8 |
| boxsign | S | 8/8/8/8 (15 %) | 8/8/8/8 (15 %) | 8/8/8/8 |
| boxsign | M | 8/8/8/8 (27 %) | 8/8/8/8 (23 %) | 8/8/8/8 |
| boxsign | L | 8/8/8/8 (13 %) | 8/8/8/8 (13 %) | 8/8/8/8 |

| Other | C1 / C2 / C3 / C4 |
|---|---|
| Fade packet M, 3 pages, 27 problems (6 / 9 / 12), `--supports all` | **7**/8/**6**/8 (R5-6) |
| Regression M, supports off: add_facts, mult_facts Independent + Test | 9/9/8/9: pixel-identical to r4 `regress-M` (0 px differ) |
| Regression M: div_facts_long Independent + Test | 8/8/8/8: pixel-identical to r4 |
| Keys (skip Test M, array 2-4 Test S, fade p5, touch Independent S): facsimile, every answer correct, key ink | pass |

Review-page bands above are the fact cells; the Mixed Review count rows (32-47 %) are the R1-11 class and do not gate.

## Defects

### R5-1 Test rows are still filled to the page, not sized to the footprint (F1 not met for skip, think and the plain fact)
- **Where / measured:** skip Test M 3 x 5 in 45.6 mm rows against a 34.6 mm need (`fits.sections[0].hMin`): **34 %** empty under the
  strip in every cell (`skip/.../test-M-p1.png`); think Test S 4 x 5, 45.6 mm rows / 33.1 mm need: **36 %**; think Test M 4 x 4, 56.75 /
  38.3 mm: **40 %**; the plain across fact (array default) Test S 38.8 / 20.1 mm: **56 %**, M 48.5 / 25.3: **54 %**, L 55.1 / 30.6:
  **50 %**. The same content on Independent sits at 19-21 % (think S/M 28.5 / 32.6 mm rows). Touch passes only because its need (42.9 mm)
  happens to match the 45.6 mm row.
- **Rule:** facts card F1 (H13 wins over the PT-TST fixed large cells; Test rows sized to the footprint like Independent); RUBRIC H13 -> C3 <= 6.
- **Root cause:** `js/modules/sheet/roles/test.js` `fillToCeiling()`: `cellH = max(L.cellH, L.hMin * FILL_CAP, 0.85 * G / rows)` - the
  0.85-of-the-grid term stretches every row once the count hits the 12.1 ceiling (20 / 16 / 12).
- **Fix:** for a one-line (`oneLine`) section cap the row at the footprint plus room, `cellH <= hMin / 0.7` (band < 30 %), and drop the
  0.85 * G term there; let the grid end short (PG-14 strip rule) or deal more items, as Independent does.
- **Check that would have caught it:** an ink H13 on every Test page per support alone (`band2.py`: last ink row to the cell's bottom rule,
  tab excluded, >= 30 % fails). `ws-print-lint --supports think --roles test --size M` reports 0 findings on this 40 % page
  (`lint/think-test-M.txt`), so its H13 measure is not the rubric's.
- class SPACE, rule_ids H13 F1. Severity critical (cap).

### R5-2 The plain across fact is stretched on Independent and Review (what the greyed array falls back to)
- **Where / measured:** `array/.../independent-S-p1.png` 3 x 10 in 22.8 mm rows / 13.4 mm need: **54 %**; M 3 x 8, 28.5 / 16.4: **53 %**;
  L 2 x 8, 25.6 / 19.4: **36 %**; Review S fact cells **35 %**, M **40.5 %**. The page is the supports-off div_facts page: r4's
  `regress-M/division__div_facts/independent-p1.png` measures the same 53 % (r4 graded only add/sub/mult and div_facts_long off).
- **Rule:** RUBRIC H13 -> C3 <= 6; card §3 (rows from the cell's need).
- **Fix:** cap the Independent / Review fill for a one-line fact section the same way as R5-1 (band < 30 %), printing more facts up to the
  page ceiling or leaving the page short.
- **Check:** the same ink H13, run on the supports-off page of every fact skill (not only on supported pages).
- class SPACE, rule_ids H13. Severity critical (cap). Pre-existing; first measured here.

### R5-3 The array has no subitising gap
- **Where / measured:** `array-c234/.../independent-S-p1.png` item 2 (48 / 4): 12 rows at an even 10 px (2.6 mm) pitch, row tops
  248, 258 ... 356, no gap after the 5th row; every drawn array on every size and role is the same.
- **Rule:** WDS RP-81 and the array-tile rule (l. 855, l. 1139): a 1.5 mm subitising gap after the 5th row and column in arrays over 5.
  Counting 8-12 evenly packed rows (0.7 mm between dots) is the job the support exists for. C2 7.
- **Fix:** add the 1.5 mm gap after row 5 (and row 10) in `factCue` kind `array`; size the frame for it.
- **Check:** a support lint reading the array SVG's circle y-values: any array of more than 5 rows has a gap >= pitch + 1.5 mm after row 5.
- class SUPPORT, rule_ids RP-81. Severity major.

### R5-4 Array at S prints what M and L print
- **Where / measured:** tables 2-4, Test S = Test M = Test L = 12 (4 x 3, 76 mm rows); Independent S 15 in 76 mm rows against a 56.9 mm
  need ("Tall problems: 5 rows per page"); the bottom band is 29.8 % with the 12-row frame empty above it on small quotients (4 / 4: one row
  in the frame, about 68 % of the cell blank).
- **Rule:** RUBRIC C3 (full, S denser than M; LESSONS_LEARNED "Size S ignored"). C3 7.
- **Fix:** size the array rows from the measured cell (56.9 mm at S) so S takes a 4th row, or draw the frame to the section's largest
  quotient rather than to 12 rows.
- **Check:** S-vs-M count check per support (S perPage > M perPage, or a stated clamp).
- class SPACE / LAYOUT. Severity minor.

### R5-5 The think box shrinks to fit, so one Test page has two type sizes
- **Where / measured:** `think/.../test-M-p1.png`: item 7 (132 / 12) box 148 px wide, its neighbours 130 px (the natural width is 40.5 mm
  = 153 px), so the boxes print at about 97 % and 85 %. That is two text sizes in one row, with the small one about 3.06 mm, at the TY-11
  3 mm floor. The cause is `fact.js` `wrap()`, `max-width:100%` on the cue SVG.
- **Rule:** contract "content never shrinks to fit"; C4 (one type size a section). C4 7.
- **Fix:** no max-width scaling on support SVGs; pick the column count the think box fits (or size its type from `ctx.metrics`).
- **Check:** a lint flagging any support SVG whose rendered width / viewBox-mm width < 0.98.
- class TYPE. Severity minor.

### R5-6 Fade packet: page 3 half empty, facts not left-anchored, answer place moves
- **Where / measured:** `fade/page-1..3.png`. Page 3 (no supports, 12 facts at 22 pt) holds 3 x 4 in 29 mm rows: **54 %** empty in every
  cell, and the grid ends at y 567 of a body running 122-1035 (49 % used). The facts are centred, not left-anchored: page 1 item 1 starts at
  x 118, item 5 (110 / 10) at x 93 (6.6 mm). Page 3's "0 / 7" is at x 330 and "44 / 11" at x 313. The answer place moves: page 1 "= ___"
  beside the fact, page 2 a line under it, page 3 beside again. Order is now right: supports per problem 3,3,3,3,3,3 then 2 x 9 then 0 x 12.
- **Rule:** F4 (rows per page sized to the supports that page carries; the fact left-anchored at one x); H13 -> C3 <= 6; SCC-T10 / P-1
  (one change per stage: page 2 drops the think box AND moves the answer) -> C1 7.
- **Fix:** size stage-3 rows to the bare fact (as R5-2) and fill the page (deal more items into the last stage). Left-anchor the fact at one x
  for the packet. Keep one answer form across the stages.
- **Check:** L-FADE-ORDER passes; add per-page ink H13 and a fact-x-spread check (max - min of the fact's left ink across a section or
  packet <= 1 mm) to the fade lint.
- class SPACE / LAYOUT, rule_ids H13 F4 SCC-T10. Severity critical (cap).

### R5-7 (minor, teacher dialog, no page score) Touch fits line names the wrong digit size
- `touch/.../meta.json`: Independent S says "Digits 16 pt", M "Digits 22 pt", while the touch facts print at the L size (27 px glyphs on
  S, M and L alike). `print-sheet.js` `touchFitLine()` keys on `ws-tn`, which the ÷ tally row does not carry. Rule SF-34 / PT-FRW-1 (the
  dialog reports the real digit size). Check: a fits-line test that reads the drawn digit size from the page.

## Observations (no score effect)
- Skip-strip and think-box terms print at about 9 pt at every size; L is no larger than S.
- When every fact is out of reach, the array fits line lists all 30 facts. "No fact of this set is 50 or less" would read better.
- Touch Test L prints 12 at 28 % while Independent L prints 15 of the same cell at 11 %. This passes H13, but it is the R5-1 cause.
- boxsign Independent M: each row centres "box + fact", so the slot's right end drifts about 5 mm in a column (r4 nit, unchanged).
- Array frames are one height a section (12 rows) and as wide as the divisor. An empty frame on 0 / 3 reads as "no rows", which is correct.

## Visual-quality bar (RUBRIC 6.1)
1. Representation: ÷ as count-by is drawn by the tally row, the strip (to the band's top), the think box, and now a true array.
2. Live parts: every support draws on every item it is offered for. The array is offered only to 2-4 / 2-5 sets.
3. One answer place: yes in every section. No across the fade packet (R5-6).
4. Type and stroke: Andika and black and white throughout. Think type varies inside one Test M page (R5-5).
5. Paper = screen: not covered. This is a print-only narrow round.
6. Title: "I Can divide by 2-4" / "Test A: dividing by 2-4" follow the options. The sentences are fine.
7. Own renders: every page above was rendered on c41a48c for this round.

## Process rule 00

**Automatic checks that would have caught each finding**
1. R5-1, R5-2, R5-6: an ink-based H13 (`tools/band2.py.txt`, about 40 lines) on every role and every support alone, plus the supports-off
   page. `ws-print-lint`'s H13 passed pages at 34-56 %.
2. R5-3: an RP-81 array-gap check on the cue SVG's circle rows.
3. R5-4: a per-support S > M count check.
4. R5-5: a shrink-to-fit check on support SVGs (rendered width / declared width).
5. R5-6: a fact-left-x spread check per section and packet, and an answer-form-constant check across fade stages.
6. R5-7: a fits line compared with the measured digit size.

**Speed-ups this round revealed**
1. The lane's "every R4 check green" covered the R4 defects one by one. The F1 ruling applies to every Test, but it was checked only where
   the old R4-1 numbers lived (touch). When a ruling is general, run its check across the full grid, not only on the cells of the finding.
2. `ws-grade-render --size S,M,L` with one support per run took about 40 s a support. The whole 15-run grid plus the packet took under 10
   minutes of browser time. Precritic can afford it, so make the per-support grid a precritic row.
3. `--save-html` writes absolute `http://127.0.0.1:<port>/css` links, so the packet does not render after the run. Write relative links, or
   save PNGs directly (`--png`), so critics do not have to rewrite the HTML.
