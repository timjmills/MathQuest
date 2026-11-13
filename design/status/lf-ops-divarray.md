# lf-ops — landscape arrays (div_facts, then mult_facts) and SIZE-INK on the fact supports (2026-11-13)

Branch `claude/sweet-newton-c8wrv1-lf-ops-divarray`, from master 88753326 (merged with origin/master f5c03405).
Builder: Opus medium (first build of a new layout of an approved support).

**Owner ruling (2026-11-13, direct):** "it would be better to have the arrays landscape so they can be bigger". Facts card §5.9
(div_facts) and §5.10 (mult_facts, lead ruling C: the smaller factor sets the rows; the caption names the drawing; SIZE-INK on
the fact supports). Card commits fc10446d, b0895e39, d7b890ad, d7158e8c; the lead signed 2c3e0e1e and c2c02a45.

## The change

| Where | What |
|---|---|
| `sheet/cells/fact.js` | ÷ array: the DIVISOR's rows of the quotient's dots (28 ÷ 4 = 4 rows of 7), in the section frame; 0 ÷ n the empty frame. × array: min(a, b) rows of max(a, b), RP-81 5-group gaps, caption "3 rows of 7, for 7 × 3". Dot radius 0.377 x pitch (no 0.98 mm cap). |
| `print-sheet.js`, `screen-cell.js`, `sheet/registry.js` | the ÷ section frame is `{cols: top quotient (10 / 12), rows: largest divisor}` - landscape; the widest-fact ghost follows it |
| `sheet/support-draw.js` | paper ÷ dot pitch S 2.6 / M 3.2 / L 4.4 mm in 3 / 3 / 2 columns (`hardCap`): the frame is never shrunk by the cell's max-width (at 4 columns M it was drawn at 88 %); screen arrays (÷ and ×) follow the cell's digit at 1.7 x paper's dot-to-digit ratio, capped by the cell; every screen cue at one CSS mm per paper mm (96 / 25.4 px, was 3.4: tiles, frames, skip strips, arrays at 90 % of print); a × skip strip follows the digit at paper's ratio |
| `worksheet.js` | one support place per sheet for × cards as for ÷ (a card the kit put under counts as wrapped) |

Print capacity (Independent, default seed 7): div_facts 2-4 tables (12s band) S 20 -> 21, M 12 -> 15, L 10 -> 10; 2-5 tables
(10s band) S 20 -> 21, M 12 -> 12, L 10 -> 8 (the 5-row frame at 4.4 mm). Test = Independent count on every size (1 page).

## Checks (on precritic's `screen-support-eq` gate, `tests/scripts/ws-screen-support-eq.cjs`)

| Check | Rule | Backtest row (FAIL -> PASS) |
|---|---|---|
| ARRAY-ORIENT | a dot array with >= 2 rows (÷ the divisor, × the smaller factor) is drawn width >= height, every screen host and the paper Independent page at S / M / L | `array-orient-divfacts` 88753326 -> fc04ba58; `array-orient-multfacts` 88753326 -> 393db090 |
| ARRAY-DOT-MIN | the screen dot / fact digit >= paper's (CUE-SIZE convention) | `array-dot-min-divfacts` 88753326 -> fc04ba58 |
| ARRAY-CAPTION | the caption names the rows x cols drawn; a × array is min rows of max and names the fact | `array-caption-multfacts` 88753326 -> 393db090 |

`screen-support-eq-divfacts` (EQ) pass state re-pointed d377e32b -> fc04ba58 (EQ now wants the divisor's rows). All five rows PASS.

## SIZE-INK (lf-checks' `ws-screen-ink-size.cjs`, measured from a scratch copy; the tool lands on master separately)

The sweep's pin was 97 findings on these three skills (add_facts touch / tile / frame, mult_facts touch / skip / array, div_facts
array). On this branch: **4** remain, all `support touch` "ws-td-svg circle" (mult_facts card 390 + worksheet, add_facts worksheet):
screen 1.64 mm vs print 1.76 mm. Not a small dot: the tool pools the touch numeral's white halo and keyline circles with its
ink dots. The real marks on screen at the 40 px touch digit are LARGER than paper's at 24 pt (single dot 1.69 vs 1.35 mm, ring
2.70 vs 1.95 mm; touchDotGeometry). Reported to the lead for lf-checks (mark classing), touch drawing unchanged.

## Gates (branch merged with origin/master f5c03405)

| Gate | Result |
|---|---|
| ws-screen-support-eq --skills mult_facts,div_facts (EQ, CUE, PLACE, ORIENT, DOT-MIN, CAPTION) | OK (0) |
| ws-backtest, the 5 array rows | 5 PASS |
| ws-screen-ink-size (scratch copy) div / mult / add_facts | 4 left of the sweep's 97 (touch, a tool artefact: see above) |
| ws-boot-smoke | OK |
| ws-code-snapshot | OK (732 codes) |
| node --input-type=module --check, every changed module | OK |
| ws-precritic --skill div_facts,mult_facts,add_facts --strict | 37 of 62 gates had run at hand-off; red ones all pre-existing or not on the changed path: ws-empty-band EB-EDGE 1 (div_facts mixed-practice M cell 19, default options: same on master 88753326); ws-print-lint --supports touch / all S mult_facts#review H13 x12 (same on master); ws-dealer-uniform mult / add_facts (generator, untouched); node-lint LESSON-DATA mult_facts has no lesson data (data gap); ws-options-verify div array "render-time support changed the items" (only under precritic load; alone OK on this branch twice); print-lint divForm=mix L reason-it CL-40 x2 (no support drawn; not re-run on master) |

Print aid pages: div_facts Independent / Test x S / M / L x 12s and 10s bands, every array frame drawn at 100 % of its
declared size (none shrunk); mult_facts array pages keep master's count (Independent 10 at S / M / L; Test 12).

## Findings -> checks

| Finding | Check that now catches it |
|---|---|
| ÷ array a tall narrow strip (owner screenshot) | ARRAY-ORIENT (screen + paper S / M / L), SIZE-WIDTH (lf-checks) |
| tiny screen dots (0.17 x the digit vs paper 0.25) | ARRAY-DOT-MIN, SIZE-INK |
| a bigger print dot shrunk by the cell's max-width (M at 4 columns, 88 %) | none yet as a rule: found by measuring rendered / declared width; proposal for lf-checks: PRINT-NO-SHRINK (a kit svg's rendered width = its declared mm) |
| × array portrait and its caption silent about the turn | ARRAY-ORIENT on ×, ARRAY-CAPTION |
| one × card's array beside, the rest under | SCREEN-SUPPORT-PLACE (already there; now run on mult_facts) |
| × skip strip numbers 0.22 x the digit vs paper 0.32 | SCREEN-CUE-SIZE (already there; now run on mult_facts) |

Speed notes: the card's frame semantics (cols x rows) flipped in four files; one grep for `arrayFrame` found them all. The
options-verify "render-time support changed the items" FAIL under load did not reproduce alone (flake).
