# Lane D restart: independent critic, round 2 (fact family)

Critic: independent (built none of it), Opus 5.5 medium. Branch `claude/sweet-newton-c8wrv1-laneD-restart` @ 616908b1 (merged
with main 784eeff8). Date 2026-10-31. Skills: `addition:add_facts`, `subtraction:sub_facts`, `multiplication:mult_facts`,
`division:div_facts` (divForm standard / vertical / fraction / long / mix) and the new preset `division:div_facts_long`.
Card `design/cards/facts/facts.md` is SIGNED (2026-10-31). Owner rulings applied: (a) the shared page-type defects R1-3, R1-5,
R1-7, R1-8, R1-9, R1-11, R1-13, R1-14 belong to a page-types lane and do not gate this family (their status is listed below);
(b) 10 columns kept, the bracket's arc must never touch or crowd a digit, judged at 100 % and at 600 dpi; (c) a fact-rows page
may mix + − × ÷ (any ÷ form) in one grid, graded here; (d) div_zero_in_quotient not in scope. Error analysis not scored (RUBRIC
scope note).

## Verdict

| Skill | Verdict | Lowest scores (in-scope roles and hosts) |
|---|---|---|
| addition:add_facts | **FAIL** | Review M 6 (C3, H13: R1-10 still present, not on the owner's ruled-out list); Fact probe C3 7 (R2-3); mixed + − × ÷ fact rows C3 7 (R2-2) |
| subtraction:sub_facts | **FAIL** | Fact probe C3 7 (R2-3); mixed + − × ÷ fact rows C3 7 (R2-2) |
| multiplication:mult_facts | **FAIL** | Fact probe C3 7 (R2-3); mixed + − × ÷ fact rows C3 7 (R2-2) |
| division:div_facts | **FAIL** | Long / Mix fact rows at 10 columns C1 7, C4 7 (R2-1: the arc crowds the divisor); supports think / boxsign C1 7, C3 6 (R2-4); Fact probe L (long / fraction / mix) C3 7 (R2-3); mixed fact rows C3 7 (R2-2) |
| division:div_facts_long | **FAIL** | Fact rows at 10 columns (S Auto, any size at 10) C1 7, C4 7 (R2-1); Fact probe L C3 7 (R2-3) |

**What passes, measured.** Every round-1 defect of the family's own drawing is fixed as claimed, on the side it was measured:
- R1-1 (dividend side) **fixed**: arc ink to the dividend's first digit ink is 0.62 mm at 10 columns, 0.69 at 8, 0.92 at 6,
  1.08 at 5 (S / M / L, seeds 11 / 4242 / 90001, every form that draws the bracket, the preset and both mixed pages; same on the
  key). ws-print-lint ARC-INK is clean. The 600 dpi crop shows white between the arc and the dividend everywhere.
- R1-2 **fixed**: Mix fact rows keep the lattice (one cell width, 18.3 mm, at 10 columns; 70 = 24/23/23).
- R1-6 **fixed**: add_facts lesson page 2 has its 4 boxed warm-up items and a clean "Guided Practice: Add." strip (S, M, L).
- R1-4 **fixed as stated** (no split cell, no row off the page; `ws-print-lint --supports all --size S` 0 findings), but the think
  box itself still overflows: R2-4.
- R1-15 **fixed**: `--opts divForm=fraction --size L` on Opener / Review / Reason It / Independent / Test leaves only the shared
  R1-11 and R1-9 findings.
- R1-16 **fixed**: the Mix online worksheet draws one digit size, the paper cells of a row are equal, the across slot is inline.
- + − × fact rows did **not** regress: 70 / 70 / 56 facts in 10 / 10 / 8 columns at S Auto and at 10, 16 pt, 1.68 mm clear
  each side (+ −), 3.32 mm (×); L Auto 25 at 28 / 28 / 24 pt.
- ÷ Standard / Vertical / Fraction fact rows: 10 columns at S Auto and at 10 everywhere, 16 pt, ink ≥ 1.13 mm clear each side.
- Practice card 390 / 820 / 1280, online worksheet and quiz: every ÷ form and the preset draw the paper cell with the slot where
  the pupil writes on paper (9s, as in round 1).
- The preset `div_facts_long` exists, opens div_facts with divForm long on every role, and its keys are correct (100 / 100 on the
  S fact-rows key checked by hand).

**What fails.** One defect in the ruling's own drawing (R2-1, the divisor side of the 10-column bracket), one in the new mixed
+ − × ÷ page (R2-2), one in the probe that round 1 missed (R2-3), the think support's box (R2-4), and R1-10, which is still red and
was not in the owner's ruled-out list (R2-5).

## Scores

C1 ease of use / C2 educational value / C3 spacing and layout / C4 standard fidelity. S and L graded in full, M spot-checked
(every role rendered at S, M and L, pupil and key; div_facts each divForm at S and L). "=" = same as the column to its left.
Ruled-out shared roles (owner ruling (a)) are listed with their status, not scored for the verdict.

| Page type / host | add_facts | sub_facts | mult_facts | div_facts | div_facts_long |
|---|---|---|---|---|---|
| Fact rows Auto / 5 / 6 / 8 / 10, one skill | 9/9/9/9 | = | = (10 clamps to 8, PT-FRW-5) | Standard / Vertical 9/9/9/9; Fraction 8/8/8/8; **Long 7/8/8/7 at 10 cols** (8/8/8/8 at 5-8); **Mix 7/8/8/7 at 10 cols** | **7/8/8/7 at 10 cols** (S Auto); 8/8/8/8 at 5 / 6 / 8 |
| Fact rows, mixed + − × ÷ (one grid) | **8/9/7/8** (R2-2, mixes with ×) | = | = | = (any ÷ form; long / mix also R2-1 at 10) | = with R2-1 |
| Fact rows, mixed + − only, + ÷ fraction | 9/9/9/9 | = | n/a | Fraction 8/8/8/8 | 7/8/8/7 (R2-1) |
| Independent | 9/9/8/9 | = | = | 9/9/8/9 every form | 9/9/8/9 |
| More practice | 9/9/8/9 | = | = | = | = |
| Test | 9/9/8/9 | = | = | = | = |
| Fact probe | 8/9/**7**/8 (cell 20 spans the across block, R2-3) | = | = | Standard (20 across) 9/9/8/9; **Long / Fraction / Mix L 8/8/7/8** (cells 19-20 re-laid 1.5 wide) | 8/9/8/8 at S; **8/8/7/8 at L** |
| Review | 9/8/**6** at M (H13 x6, R2-5 = R1-10); S, L 9/8/8/9 | 9/8/8/9 | 9/8/8/9 | 8/8/8/8 (L: R1-11, ruled out) | 8/8/8/8 |
| Opener | 8/8/8/9 (R1-14 ruled out) | 8/8/8/9 | 8/8/8/9 | 8/8/8/9 | 8/8/8/9 |
| Guided | 8/8/8/9 | = | = | = | 8/8/8/9 (S H13 x16: R1-13, ruled out) |
| Lesson packet | 8/8/8/8 (R1-6 fixed) | 8/8/8/8 (R1-5 ruled out) | 8/8/8/8 | 8/8/8/8 | 8/8/8/8 (p3 SPREAD 43 %, main-red under the lane's lint) |
| True or False? | 8/8/8/9 | = | = | = | = |
| Stretch | 8/8/8/9 | = | = | = | = |
| Word problems | 8/8/8/9 | = | = | = | = |
| Mixed practice (R1-7 ruled out) | 9/9/8/9 | = | = | 9/8/8/8 | 9/8/8/8 (L H13 x4: the R1-7 sizing) |
| Reason It (R1-9 ruled out) | 8/8/8/8 | = | = | = | = |
| Supports (think / boxsign, cover whole) | - | - | - | **7/8/6/7** (R2-4) | n/a (supports draw nothing on the bracket: main-red, see observations) |
| Answer keys | correct everywhere checked | = | = | = | = |
| Practice card 390 / 820 / 1280 | 9/9/9/9 | = | = | 9/9/9/9 every form | 9/9/9/9 |
| Online worksheet 1280 | 9/9/8/9 | = | = | 9/9/8/9; Mix 9/9/8/9 (R1-16 fixed) | 9/9/8/9 |
| Quiz 1280 | 9/9/9/9 | = | = | = | = |

## Defects

### R2-1 (div_facts long / mix, div_facts_long, every mixed page with the bracket) At 10 columns the arc crowds the DIVISOR
- **Where:** fact rows at 10 columns: S Auto, and 10 picked at S / M / L; every seed (11, 4242, 90001); pupil page and key. 8, 6
  and 5 columns are clear (0.74 / 1.0 / 1.19 mm).
- **What:** the fix opened the dividend side (0.62 mm) and left the divisor side at **0.27 mm** of white between the divisor's last
  digit ink and the arc ink (measured in the browser, canvas ink at 20x, every bracket on every page: `r2/fact-rows-sweep.txt`,
  column `divisorToArc`). That is under the lane's own 0.3 mm floor for the other side. At 100 % (96 px per inch, one pixel =
  0.26 mm) there is no white pixel column: the foot of the "1" in "11 ) 121" joins the arc, and "10 ) 50", "3 ) 6" read as one
  run of ink. At 600 dpi the gap exists but is the narrowest white on the page (about 0.3-0.4 mm against the 0.2 mm digit
  tracking). The owner's ruling is "never touch or crowd a digit", judged at 100 %: this crowds. It also leaves the bracket
  asymmetric (0.27 left, 0.62 right), which reads as the arc belonging to the divisor.
- **Evidence:** `r2/R2-1a-div_facts_long-S-c10-100pct-x4.png` (the 100 % raster, pixels enlarged 4x: cells 1-4 of seed 11),
  `r2/R2-1b-div_facts_long-S-c10-600dpi.png`.
- **Rule:** owner ruling 2026-10-31 (card §5, Q3); VA-60a / PT-FRW-9; H2 / C1 (information must not be overlapped); C4 (the ruling).
- **Fix:** give the divisor side the same floor as the dividend side, aimed at 0.6 mm (so one white pixel survives at 100 %):
  take the room from the gutter's arc position (the arc starts at 47 % of the gutter; centre it on the white between the two
  inks) or from the 1.02 mm right margin (the bracket is centred on its ink but its left clear is 1.3 mm at 600 dpi). If 12 ) 144
  cannot give 0.5 mm on both sides at 16 pt in 18.3 mm, drop the 3-digit dividend's tracks to 0.54 em only for that fact, not the
  divisor's gap.
- **Would have caught it:** ws-print-lint **L-OVERLAP ARC-INK** exists but measures only the dividend side. **Extend ARC-INK to
  the divisor side** (last divisor glyph's ink right edge from `measureText().actualBoundingBoxRight`, same 20x canvas, floor
  0.3 mm, aim 0.5 mm), and add a **100 % raster check** (rasterise each bracket at 96 dpi; the arc and each neighbouring digit
  must be separate connected components). Backtest: fails on 616908b1, passes on a build whose divisor gap is ≥ 0.5 mm.

### R2-2 (all four, new mixed page) A mixed + − × ÷ fact-rows page prints 56 facts in a 10-column grid it says holds 70
- **Where:** fact rows with + − × ÷ (and + × ÷, + ×) in one section, Size S, Auto or 10. In 24 seeds per mix: 3 / 24 (+ − × ÷
  Mix), 5-6 / 24 (+ × ÷ long), 7 / 24 (+ ×). Example: + − × ÷(Long), seed 4242, S, 10 columns. Never at M or L; never without ×.
- **What:** the page deals 56 facts (the 8-column count from the PT-FRW-5 probe), then lays them in 10 columns because the final
  deal has no product over 99. Result: 5 full rows + 6 facts, a 74 mm unruled trailing area, a 25 mm empty band above the footer,
  "Score /56", while the dialog's fits line says "10 columns x 7 rows, 70 per page". 14 facts of a fluency page are lost and the
  teacher is told otherwise. (When a product over 99 is dealt the 8-column page is correct.)
- **Evidence:** `r2/R2-2-mixed-facts-S-auto-seed4242-56-of-70.png`; sweep rows `mix4-Long-S-c10-s4242`, `mix4-Mix-S-cauto-s4242`,
  `mix4-Vert-S-c10-s4242` (n 56, cell widths 18.3 / 73.8).
- **Rule:** PT-FRW-2 / PT 4.1 capacity (S 10 x 7); LESSONS_LEARNED L1 (Size S used to the full); C3 (wasted page); the fits line
  must describe the page (PT-DLG).
- **Fix:** after the re-deal, recompute the count from the columns actually drawn: if no fact needs the clamp, deal the 10-column
  count (keep each operation's share of 70); or deal once with the clamp decided from the BAND (a × band of 144 always clamps,
  PT-FRW-5 reads the band, not the dealt facts), which also makes the page seed-stable.
- **Would have caught it:** **new ws-layout-unit / ws-print-lint `L-DENSITY COUNT-FITS`** on fact rows: items printed =
  `fits.perPage` (= cols x rows) and Score /N = that count, swept over seeds 1-24 for every mix that includes ×. The lane's
  layout-unit block for mixes ran one seed (11), where the deal never clamps.

### R2-3 (all four, the probe) The fact probe re-lays its short last row wider
- **Where:** fact-probe. + − ×: the 5 across facts are 2 + 2 + 1 and cell 20 spans the whole across block (S, M, L, all three
  skills). div_facts long / fraction / mix and div_facts_long at L: 20 facts in 3 columns, cells 19 and 20 are 1.5 columns wide.
- **What:** one section with two cell widths. PT 4.2's own drawing leaves the 20th across fact in its column and the rest as
  "(unruled remainder)". The builder's status claims the Mix probe was fixed (column count that divides 20), but the L Mix probe in
  this render (grade-render seed) is still 3 columns with a widened last row.
- **Evidence:** `r2/R2-3a-add_facts-probe-S-cell20-full-width.png`, `r2/R2-3b-probe-L-cells19-20.png` (div_facts_long L).
- **Rule:** RUBRIC C3 ("cells are equal in size across a section, arranged in a regular grid"); PAGE_TYPES 4.2 drawing; PT-ENG-7.
- **Fix:** the probe's grids keep the lattice like fact rows (`relay: false`): 20 at L in 4 or 5 columns, or 3 columns with the
  unruled remainder; the across block's 20th fact stays in column 1 with the remainder unruled.
- **Would have caught it:** ws-print-lint **L-DENSITY GRID-EVEN** exists but is limited to fact-rows grids (`.ws-grid.facts`).
  **Run GRID-EVEN on every kit grid section** (fact-probe first; any declared full-width span exempt) and add fact-probe x divForm x
  S / L to precritic's plan for div_facts and div_facts_long.

### R2-4 (div_facts) The think box overflows its frame; the sign box moves beside or under the fact
- **Where:** Independent (and every role that carries supports), `support=think` (with or without boxsign), S, cover whole.
- **What:** "Think: 12 × [ ] = 108" runs past the rounded box's right edge in 6 of 12 cells ("= 108", "= 110", "= 80", "= 10",
  "= 72", "= 96" sit on or over the border), and the answer box touches the "×". The boxsign pane sits under the fact in 9 cells and
  beside it in 3 (cells 3, 6, 8), so one page has two layouts. R1-4's page break is fixed; the box itself is not (the status file
  notes it as "seen, not gated").
- **Evidence:** `r2/R2-4-div_facts-support-think-boxsign-S-independent.png`.
- **Rule:** H2-near (ink over a frame, C1); CL-1 (ink inside its own box); C3 (one layout per section).
- **Fix:** size the think box from its content (min-width: max-content, as the sign box already does) and keep the sign box in one
  position for the whole section.
- **Would have caught it:** **new ws-print-lint `L-OVERLAP TEXT-FRAME`**: a text run inside an element with a border must end
  inside that border (glyph ink vs the box's inner edge). `--supports all --size S` reports 0 findings today because no lint
  compares a label to its own box.

### R2-5 (= R1-10, add_facts, still present) Review M: Mixed Review rows H13 x6
- **Where:** add_facts review, Size M, cells 10-12 (the across Mixed Review rows: "one empty band 56.1 mm wide in a 184.9 mm cell
  (30 %)"); S and L clean. ws-print-lint red.
- **Status:** not in the owner's list of shared defects ruled out (R1-3, R1-5, R1-7, R1-8, R1-9, R1-11, R1-13, R1-14), not pinned,
  and not in the Round 2 precritic table (that run used `--role fact-rows`, so Review M never ran). It is a review-engine defect like
  R1-11; if the lead and owner move it to the page-types lane, add_facts no longer fails on it, but it fails on R2-2 and R2-3 anyway.
- **Evidence:** `r2/R2-5-add_facts-review-M.png`. **Rule:** H13 (C3 ≤ 6).
- **Would have caught it:** **existing** ws-print-lint L-DENSITY. Process: precritic must run every role the card offers at S / M / L
  (`--role all`), not `--role fact-rows`; the status table said every red was main-red or pinned, which was true only for the roles run.

## Round-1 fact-family defects: verified

| Defect | Status |
|---|---|
| R1-1 arc on the dividend | **Fixed** (0.62-1.08 mm at 10-5 columns, ARC-INK clean). The divisor side is the new R2-1. |
| R1-2 Mix grid uneven | **Fixed** on fact rows. The same class remains on the probe: R2-3. |
| R1-4 ÷ supports break the page | **Fixed** (no split, no overflow off the page; lint 0). The think box overflow remains: R2-4. |
| R1-6 add_facts lesson warm-up | **Fixed** (4 boxed items, strip clear, S / M / L). |
| R1-15 fraction numerator keep-out | **Fixed** on Opener / Review / Reason It / Independent / Test at L. |
| R1-16 Mix online worksheet | **Fixed** (one digit size, equal paper cells per row, across slot inline). |
| R1-10 add Review M H13 | **Still present** (R2-5). |
| R1-12 across CL40 | Not re-checked this round (the across option was not changed). |

## Shared page-type defects (owner ruling (a): not gating; status only)

| Defect | Status on 616908b1 |
|---|---|
| R1-3 Scripted model (no answers in the key, no "Answer Key" header, identical panels) | **Still present** (sub_facts S key: 4 panels of the same 7 − 5, no header; add_facts still 2 pages) |
| R1-5 Lesson Steps vs the items | **Still present** (sub_facts lesson S: "19 − 10: take away 10" beside 10 − 8, 11 − 5, 6 − 2; WRAP-OP x4 S, x2 L; div_facts_long lesson steps "100 ÷ 10" beside 11 ) 121) |
| R1-7 Mixed practice S < M | **Still present** (add_facts 20 at S, 30 at M; div_facts_long L 10 facts in 2 columns, H13 x4) |
| R1-8 Pre-skill check | **Still present** (4 items of the skill itself, about 80 % of the page blank) |
| R1-9 Reason It CL40-INK | **Still present** (x6 at S / M, x4 at L, all fact skills) |
| R1-11 Review count-by strips | **Still present** (div_facts Review L CL40-INK x6; four count-by-12 strips at S / L) |
| R1-13 Guided H13 | **Still present** (div_facts_long guided S H13 x16) |
| R1-14 Opener "Use the dots" | **Still present** (add_facts opener: "Use the dots", no dots) |

## Observations (no score effect)
- div_facts_long offers Support (touch / skip / array / think / boxsign) but the bracket cell draws none (status: main-red, the
  long-division cell is not in support-draw.js `canDraw`). A control that does nothing on the preset should be hidden or drawn.
- Card Q5 (facts take the "short" class, L 3 x 5 = 15) is not built: Independent / More practice / Test at L still print 12 facts
  in 3 x 4 with large writing room. The owner placed it in the layout lane's files; lint does not flag it, so it is not scored.
- The compact 10-column bracket's arc is nearly straight; at 100 % it reads as a vertical bar rather than ")". It is the drawing
  the owner accepted (Q3); R2-1 is about the white beside it, not its shape.
- The mixed-practice and fact-probe brackets use the wide-tracked bracket ("4 ) 3 6"), the fact rows the compact one: two
  drawings of one notation within the skill. Acceptable (different page densities) but worth one sentence in VA-60a.
- `ko` in the sweep is a crude keep-out heuristic and over-counts; CL40 was judged from ws-print-lint, not from it.

## Automatic checks that would have caught each finding

| Defect | Existing gate (why it missed) | New or extended check |
|---|---|---|
| R2-1 arc crowds the divisor | ARC-INK (dividend side only) | ARC-INK on the divisor side (floor 0.3, aim 0.5 mm) + a 96 dpi raster connected-components check |
| R2-2 mixed page 56 of 70 | ws-layout-unit mixed block (one seed, never clamps) | `L-DENSITY COUNT-FITS`: printed items = fits.perPage = Score /N, seeds 1-24 for every mix with × |
| R2-3 probe last row widened | GRID-EVEN (fact-rows grids only) | GRID-EVEN on every kit grid section; fact-probe x divForm x S / L in precritic |
| R2-4 think box overflow | print-lint --supports (no label-to-box lint) | `L-OVERLAP TEXT-FRAME` (text ink inside its bordered box) |
| R2-5 add Review M H13 | L-DENSITY (red, but precritic ran `--role fact-rows` only) | precritic `--role all` x S / M / L for a family round; the status table lists every red document |

## Speed notes (for design/status/speed-audit.md)
- 3 of 5 findings sit next to a check the lane wrote this round but scoped too narrowly (ARC-INK one side, GRID-EVEN one role, the
  mixed-page unit test one seed). Rule: a new check is written for the defect CLASS (every side, every grid role, a seed sweep), not
  the one instance the critic named.
- R2-5 reached the critic because precritic was run for one role. A family round runs `--role all`.
- The sweep that found R2-1 and R2-2 is `r2/sweep2.cjs.txt` (fact rows x forms x S / M / L x columns x seeds, plus 6 mixes): about
  20 minutes; builders of a dense drawing should run it before the critic.

## How it was graded
- `ws-grade-render --roles` (16 roles) x S / M / L x 5 skills, pupil and key, with practice card 390 / 820 / 1280, online worksheet
  and quiz; div_facts again with divForm standard / vertical / fraction / mix at S and L (long = the preset).
- Fact-rows sweep (`r2/sweep2.cjs.txt`, output `r2/fact-rows-sweep.txt`): 9 single-skill variants x S / M / L x Auto / 5 / 6 / 8 / 10
  x 1-3 seeds, and 6 mixed pages (+ − × ÷Mix, + − × ÷Long, + − ÷Fraction, × ÷Standard, + − × ÷Vertical, + div_facts_long) x S / M /
  L x columns x 2 seeds: 495 pages, counting items, columns, digit size, cell widths, and both arc gaps on pupil and key. Seed sweep
  1-24 of 5 mixes for R2-2. 600 dpi and 96 dpi rasters of the 10-column bracket from Chrome's PDF.
- `ws-print-lint --source kit` for 5 skills x 14 roles x S / M / L (39 / 35 / 28 findings, all classified above);
  `--supports all --size S` (0); `--opts divForm=fraction --size L` on 5 roles (only R1-9 / R1-11).
