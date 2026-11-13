# Critic cbt r1: multiplication:count_by_tables (lane lf-ops)

Critic: independent, Opus medium. Frozen tree `/home/user/mq-critic-cbt` @ a33ff1a5b (detached, untouched).
Renders: `ws-grade-render --roles ... --size S|M|L` (96 dpi), lesson options via `--opts`, plus
`ws-print-lint --source kit --rules ROW-STRETCH,H13-ABS` S/M/L and `ws-screen-slots --screen-digit --train-fit`.
Band numbers below are measured on the PNGs (pixel probe: ink-free run / cell height) and match grade-render's `band.hPct`.

## Verdict: FAIL

Lowest score: **5** on three versions: online worksheet 1280 C3, Mixed practice M C3 (H5) and lesson jumps=15 L C3 (H5).

## Scores (C1 ease · C2 teaching · C3 spacing · C4 fidelity)

### Print (pupil page + key)
| Version | S | M | L |
|---|---|---|---|
| Independent | 7 · 8 · 8 · 8 FAIL (D1) | 8 · 8 · 8 · 8 | 9 · 8 · 8 · 8 |
| More practice | 7 · 8 · 8 · 8 FAIL (D1) | 8 · 8 · 8 · 8 | 9 · 8 · 8 · 8 |
| Test | 7 · 8 · 8 · 8 FAIL (D1) | 8 · 8 · 8 · 8 | 9 · 8 · 8 · 8 |
| Guided | 7 · 8 · 7 · 8 FAIL (D1, D4) | 8 · 8 · 7 · 8 FAIL (D4) | 8 · 8 · 6 · 8 FAIL (D4, H13) |
| Mixed practice | 7 · 8 · 8 · 8 FAIL (D1) | 8 · 8 · **5** · 8 FAIL (D5, H5) | 8 · 8 · 8 · 8 |
| Review | 7 · 8 · 8 · 8 FAIL (D1) | 8 · 8 · 8 · 8 | 8 · 8 · 8 · 8 |
| Reason It | 7 · 8 · 7 · 7 FAIL (D1, D6, D7) | 8 · 8 · 7 · 7 FAIL (D6, D7) | 8 · 8 · 7 · 7 FAIL (D6, D7) |
| Lesson, default (chart, sheet, Practice) | 8 · 8 · 6 · 8 FAIL (D3) | 8 · 8 · 6 · 8 FAIL (D3) | 8 · 8 · 6 · 8 FAIL (D3) |
| Lesson, times=each | 8 · 8 · 6 · 8 FAIL (D3, D8) | 8 · 8 · 6 · 8 FAIL (D3, D8) | 8 · 8 · 7 · 8 FAIL (D8) |
| Lesson, times=given | 8 · 8 · 6 · 8 FAIL (D3) | 8 · 8 · 6 · 8 FAIL (D3) | 8 · 8 · 8 · 8 |
| Lesson, jumps=15 | 8 · 8 · 6 · 8 FAIL (D3, D8) | 8 · 8 · 6 · 8 FAIL (D3, D8) | 8 · 7 · **5** · 8 FAIL (D8, D9) |

Note: the lesson pages at S print at M sizes (the meta for S = M exactly); that is a floor and is not scored down.
Answer keys: every key checked is a facsimile, in reddish-orange `#C2410C` (INK-31) and correct. Checked by eye: independent S/L, lesson L sheet (vocab lines, warm-up 50/52 and 10/15, guided 10s/11s) and Reason It S (A, A, B). Key = pupil on every page. No H1.

### Screen
| Host | Scores | |
|---|---|---|
| Practice card 1280 | 9 · 8 · 8 · 8 | PASS (4 / 4 / 4 a line, 56 px digits) |
| Practice card 820 | 8 · 8 · 8 · 8 | PASS (5 / 5 / 2: the last line is short but readable) |
| Practice card 390 | 8 · 8 · 7 · 8 | FAIL (D10) |
| Online worksheet 1280 | 6 · 8 · **5** · 6 | FAIL (D2) |
| Quiz 1280 | 9 · 8 · 8 · 8 | PASS |

Passing points, checked. The Say band ("I count by 10: 10, 20, 30.") is on the chart. The chart closes with the check step as its tail line ("Check every jump. Do the same at every gap."). The chart is one new thing a panel: read the jump, then the first gap traced, then the next. Times labels are correct where drawn ("4 × 10" sits under the 4th number, `given` labels only the given numbers, grey on the lesson Guided). Tests carry no labels. Nothing is given away: the fill=two pattern shows the step, the boxes stay empty and nothing appears in the captions. Every instruction uses a print verb on paper and a screen verb on screen.

## Defects

**D1 · S practice digits print at 10.2 pt, under the 11 pt reading floor (C1 −1, major, all S practice roles)**
- Where: independent, more-practice, test, guided, mixed-practice, review and reason-it at S. grade-render measures `digitPt` median 10.2 pt and max 10.7. The instruction line (≈ 11-12 pt) is larger than the numbers the pupil reads.
- Rule: TY-11 says everything a pupil must read is ≥ 11 pt. TY-10a says a row whose boxes already hold its digits keeps the working size (16 pt at S). The 16 × 0.64 factor shrinks the digits even though they fit.
- Cause: the `digitPt(ctx) * 0.64` factor in `js/modules/sheet/cells/count-row.js:365, :446` (arcsGeom / linesGeom). The comment at :444 already notes "S gave 16 x 0.64 = 10.2 pt", but its fix (`wideFloor`) only covers 6+-digit rows.
- Fix: floor `basePt` at `GIVEN_MIN_PT` (11 pt) for every paper row, not only wide ones. Better: drop the 0.64 when the row's boxes fit at the working size, as TY-10a says.
- Check: ws-print-lint gets a `TY-11-DIGITS` rule that fails when a count-row cell's median given digit is < 11 pt (it reads the same `digitPt` that grade-render's meta already measures).

**D2 · Online worksheet: the count row stacks ONE number a line (C1 6, C3 5, C4 6, critical)**
- Where: `worksheet-1280.png`, all six cards. Each row of 12 is a 12-line column about 930 px tall. The arrows still point right (→) at a number that sits BELOW them. The 6-item sheet is 2,679 px tall.
- Rule: the lead ruling on the arcs train says 3-4 numbers a line, with the arrow carrying on. VQ-8 says paper = screen (paper prints two lines of six). Rubric C3 says even, readable cards.
- Cause: the worksheet card keeps the host digit size (`:has(.k2-countrow-wrap)`) inside a ~250 px column, so the wrap falls to 1 a line.
- Fix: in the worksheet grid, give a count-row card the full row (span every column, or a one-column layout for count-row items). Alternatively, set the wrap width so `perRow` ≥ 3 at the 40 px floor.
- Check: ws-screen-slots TRAIN-FIT gets a numbers-per-line count. Every visual line of `.k2-countrow` must hold ≥ 3 numbers/boxes (except a remainder line) on card 390/820/1280, worksheet and quiz. TRAIN-FIT passed this page with 0 misses: it measures digit size and overflow only.

**D3 · Lesson Warm-up cells: 34-35 % empty band, about 2.3 × their content (C3 ≤ 6, critical H13)**
- Where: lesson sheet (p2), Warm-up cells 1 and 2. Bottom band: S 34 %, M 34 %, L 34 % (pixel probe), grade-render `band.hPct` 35.2 / 35.2 / 34.6. The same happens with times=each S/M, times=given S/M and jumps=15 S/M (33.2 %). The shape train (one line of 5 circles/hexes, ~15 mm) sits in a 30-32 mm cell.
- Rule: H13 and ruling (b). Rows of count rows are at most 1.25 × content (1.42 on a pageCap page).
- Fix: size the Warm-up row to its content × 1.25 in the lesson sheet composer (the Warm-up row of `roles/lesson` / we-do sheet, the same cap as fix 7 in we-do.js). Give the freed height to the Guided rows or leave it at the foot.
- Check: `ws-print-lint --rules ROW-STRETCH` judges the lesson Warm-up row too. It passed here because the Warm-up cell is a `counting:number_seq_fill` shape train, which is outside `--rule-skills`. Extend ROW-STRETCH to every cell on a lesson page, or add an H13-ABS ≥ 30 % rule on the lesson role.

**D4 · Guided rows stretched past ruling (b) (C3 7 at S/M, 6 at L)**
- Where: guided S cells are ~118 px for ~75 px of ink (1.6 ×), bands 26-28 %. M: 132 px cells, bands 21-26 % (1.5 ×). L p2: 168 px cells for ~105 px of ink (1.6 ×), bottom bands **31-32 %** (≥ 30 %, so H13 applies). The 4 rows on L p2 still leave 52 px at the foot.
- Rule: ruling (b) and H13.
- Fix: the we-do.js noStretch cap (r4b fix 7) does not reach the Guided ROLE page (`roles/guided.js` rows). Apply the same `NO_STRETCH_ROOM` cap there. At L, a 2-page Guided with 4 rows on p2 could also take 5 rows on p1.
- Check: `ws-print-lint --rules ROW-STRETCH` on `--roles guided` at S/M/L. It reported 0 here, so its 1.25 × measure uses the cell's content box (with padding), not the ink. Measure the ink height of the row content, or backtest it on this page.

**D5 · Mixed practice M: a lone item on page 2 (C3 5, critical H5)**
- Where: `M/.../mixed-practice-p1.png` holds 6 rows with a ~150 px empty foot, where one more row (~121 px) fits. `mixed-practice-p2.png` holds item 7 alone, with 84 % of the page empty.
- Lint agrees: `L-DENSITY LONE` and `PG-23` on mixed-practice M (lint-M.log).
- Fix: in `roles/mixed-practice.js`, fit 7 on p1 (the noStretch row cap leaves the room) or rebalance to 4 + 3.
- Check: already caught by ws-print-lint L-DENSITY LONE / PG-23 at M. It must be on the lane's precritic `--strict` path for mixed-practice at every size.

**D6 · Reason It: the A/B count rows are cramped (C3 7, major, S/M/L)**
- Where: `reason-it-p1.png`. The boxes of the A/B rows hug two-digit numbers ("14", "20", "22", "44" touch the box sides). The boxes are 8-10 mm wide at M/L and the arrows between "20 → 22" are squeezed. The panels use ~70 % of the cell width.
- Fix: give the A/B row the box width of the independent row (16-18 mm). Draw it at the size's slot, not the compact pitch. There is room: the right column holds only "A B".
- Check: a slot-fit rule in ws-print-lint. Any count-row box whose text ink comes within 1 mm of its border fails (SL-1 writing room).

**D7 · Reason It: the A panel paints in the label keep-out (C4 7, major)**
- Where: ws-print-lint `L-OVERLAP CL40-INK`, M ×6 and L ×4, cells 1-3 (`div.mq-abbox` at 3 mm across, 5 mm down).
- Fix: start the A/B panels below `--ws-koin` in `roles/reason-it.js` for count-row cells. r4b's fix covered the train form only.
- Check: already caught by ws-print-lint CL40-INK. The default lint run must include `reason-it` for this skill.

**D8 · Lesson chart row shrinks with times=each and jumps=15 (C3 7, major)**
- Where: lesson p1 (all sizes). The anchor row drops from ~18 pt (default chart) to ~13 pt. Its tab "10" shrinks to ~9 mm. The row spans only ~60 % of the panel, leaving 18-21 % empty on each side, so it was not shrunk to fit.
- Rule: TY-10a ("nothing is shrunk that fits") and L11, the full-width chart row.
- Fix: in `chartWide` panels, lay the row at the panel's full live width and keep the working digit size. The 15-jump row's 3 lines of 5 and the label line both fit the 261 px panel at the default size.
- Check: ws-print-lint gets a CHART-DIGIT rule: a lesson chart's count-row digits equal the default chart's size, and the row width is ≥ 85 % of the panel.

**D9 · Lesson jumps=15 at L: sheet page 1 half empty, the Practice page lost (C3 5 H5, C2 7, critical)**
- Where: `opt-jumps=15-L/.../lesson-p2.png`. Vocabulary + Warm-up, then ~50 % of the page is blank. `lesson-p3.png` holds Guided (10s, 11s), then an "Independent Practice" section with ONE item (count by 2) and a 20 % empty foot. The lesson has no Practice page (3 pages in all: chart + 2 sheet pages). At S/M the same option gives a 4-row Practice page.
- Fix: in the lesson compiler, when the Guided block does not fit under the Warm-up, put the Guided rows on page 1 at their 1.25 × height (D3 frees ~30 mm) or split Guided across pages. Never fold Practice into a single trailing item: keep the Practice page (`practiceShapes` [[4,1],[3,1]] at jumps=15 L).
- Check: `ws-detailed-lesson --check` asserts a lesson packet always has its Practice page with ≥ 3 items, and ws-print-lint PAGEFILL runs on the lesson role at L with every `jumps` value. Neither ran on jumps=15 L.

**D10 · Practice card 390: two numbers a line (C3 7, major)**
- Where: `card-390.png`. The 12-number row wraps into 6 lines of 2. The ruling asks for 3-4 a line. 3 fit: tab 50 + 2 boxes of 76 + a number of ~50 + 3 arrows of ~20 is about 312 px, under the ~340 px inner width. The Check button sits below a 6-line zig-zag and needs a scroll at 390 × 844.
- Fix: in the twin wrap (`count-row.js` twin `perRow`), compute numbers a line from the card's inner width at the 40 px floor. Allow 3.
- Check: the same numbers-per-line count as D2, in TRAIN-FIT at 390.

### Minor (−1 where noted; none decides the verdict alone)
- **m1** (C2, nit, not scored): the title is built from the `rows` option ("I Can count by 2s to 12s"), not from the rows dealt. At a one-page count (grade-render's capacity) Independent / More practice / Test deal only 2s-7s at L (2s-9s at S), and More practice deals the same tables as Independent. The print screen's `auto` count deals all 11 rows on 2 pages, so the default is right. Fix: title from the dealt rows, or rotate the start table per More-practice letter. Check: a content-audit assertion that the steps in the title equal the set of dealt steps.
- **m2** (C1, nit): the Warm-up (number_seq_fill) mixes circles and hexagons as writing places, so the slot shape does not tell given from blank within a section.
- **m3** (C1, nit): "the number in the box" names the pentagon step tab, while every empty writing place is also a "box". It reads clearly on the page because of the tab shape.
- **m4** (C2, nit): the Review page's mixed shelf ("Multiply": 8 × 100, 80 × 7) asks for facts the count-by is preparing.

## Automatic checks that would have caught each defect
| Defect | Check |
|---|---|
| D1 | new ws-print-lint TY-11-DIGITS (count-row given digits ≥ 11 pt; grade-render already measures `digitPt`) |
| D2, D10 | ws-screen-slots TRAIN-FIT + numbers-per-line ≥ 3 on every host (passed today with 0 misses) |
| D3 | ROW-STRETCH / H13-ABS on every cell of a lesson page (not only the lane's own skills) |
| D4 | ROW-STRETCH on `--roles guided` measuring ink height, backtested on guided L p2 |
| D5 | ws-print-lint L-DENSITY LONE / PG-23 (already fires at M; must be on precritic for mixed-practice at all sizes) |
| D6 | new slot-fit rule (text ink ≥ 1 mm inside its box) |
| D7 | ws-print-lint CL40-INK (already fires; include reason-it in the skill's default lint roles) |
| D8 | new CHART-DIGIT rule (chart row at the default chart size, ≥ 85 % of the panel width) |
| D9 | ws-detailed-lesson --check: a Practice page with ≥ 3 items on every option × size; PAGEFILL on lesson role with `jumps=15` |

## Graded PNGs
Base: `/tmp/claude-0/-home-user-MathQuest/447a1d04-e24b-5c13-8aba-a33c056c9d3a/scratchpad/critic-cbt-r1/`
- `S/multiplication__count_by_tables/`: independent-p1, independent-key-p1, more-practice-p1, test-p1, guided-p1, mixed-practice-p1, review-p1, reason-it-p1, reason-it-key-p1, lesson-p1..p3, card-1280, card-820, card-390, worksheet-1280, quiz-1280 (keys of the other roles read via meta/key check)
- `M/multiplication__count_by_tables/`: mixed-practice-p1, mixed-practice-p2, reason-it-p1 (other roles measured from meta.json bands/digits)
- `L/multiplication__count_by_tables/`: independent-p1, more-practice-p1, test-p1, guided-p1, guided-p2, review-p1, reason-it-p1, lesson-p1..p3, lesson-key-p2
- `opt-times=each-S/.../lesson-p1..p3`, `opt-times=given-L/.../lesson-p3`, `opt-jumps=15-S/.../lesson-p1..p3`, `opt-jumps=15-L/.../lesson-p1..p3` (the other option × size pages measured from their meta.json)
- Logs: `lint-S.log`, `lint-M.log`, `lint-L.log`, `screen-slots.log`, `render-*.log`
