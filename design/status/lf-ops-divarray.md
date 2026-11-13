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

## Pre-critic regression fix: mult_facts Review stacks (2026-11-13, builder Opus medium)

**Regression, from master 114ee8e0b:** `ws-print-lint --source kit --supports array --size S --roles independent,more-practice,test,review
--skills division:div_facts,multiplication:mult_facts` gave 6 findings on master and 13 on 55e7d0f2f, all on mult_facts#review. 12 of
them were H13 side bands on the Mixed Review stacks (19.7 mm empty in a 61.5 mm cell, 32 %) and 1 was H13-ROW on "4 × 0".

**Cause (from `git diff origin/master...HEAD -- js/`, no review code in the diff):** the Review composer was not reserving room for
the stacks. Two steps led to it. (1) Drawn landscape, the × arrays measure shorter at 4 columns, so `review.js` sectionFit moved the
main band from 2 x 4 to 4 x 2. (2) That freed height. The Review's search then narrowed the Mixed Review from its own 4 columns to 3,
which let a second row of stacks fit under the 45 % share (8 + 6 = 14). The stacks' ink did not change, but each cell grew from
46 to 61.5 mm. Master had the same narrowing on the touch / all pages (lf-roles' finding).

**Fix (`js/modules/sheet/roles/review.js`):**
- Static-width earlier problems (stacks) keep their own column count. A narrower count is offered only while the widest problem
  still fills 70 % of the cell.
- At S, a 5th column is taken only when it prints MORE problems. Example: touch has 10 facts + 5 stacks, where 4 columns allowed
  only one row of 4 under the ceiling. An equal count keeps the step's own columns. Making 5 columns the default for every page
  was tried and backed out (fcbf82424 -> f32c9aeb2): it freed height that stretched the default mult_facts Review's fact rows
  (EB-BAND x 13, 34 %).
- A band of supported facts with the array support is held to FACT_ROOM x its rows' height, as div_facts is. Otherwise the
  page's spare height stretched a 9 x 7 array's row around a 2 x 5 (EB-BAND 32 %).
- No content shrinks.

| Command (S unless said) | master 114ee8e0b | 55e7d0f2f | f45a05123 |
|---|---|---|---|
| print-lint --supports array (the brief's command) | 6 | 13 | **1** (H13-ROW "4 × 0", below) |
| print-lint --supports touch | Review stacks flagged (lf-roles) | n/a | **0** |
| print-lint --supports all | Review stacks flagged (lf-roles) | n/a | **0** |
| print-lint --supports array, review at M / L | | | 0 / 0 |
| ws-empty-band review S array, EB-SIDE (raw) | 21 | 6 | 0 |

Review counts by layout, f45a05123:

| Support | S | M | L |
|---|---|---|---|
| array | 2 x 4 + 5 = 13 | 2 x 3 + 3 = 9 | 2 x 3 + 3 = 9 |
| touch | 5 x 2 + 5 = 15 | 3 x 3 + 3 = 12 | 3 x 3 + 3 = 12 |

Before the fix, touch S on master printed 16, using 3-column stacks at 32 % side band. Now the page keeps the room the ceiling
leaves under its grid.

**Left, and not caused by this branch:** H13-ROW on "4 × 0", array Review S, p1 cell 8. A × fact with a zero factor draws no array
(0 rows), so its row is sized for the arrays beside it. Master flags the same cell as a side band (2 findings); this branch flags 1.
The fix needs a card ruling on what a × 0 fact draws (an empty landscape frame, as 0 ÷ n does, or nothing). That ruling is for
the lead.

**Gates (f45a05123):**
- ws-screen-support-eq div/mult: OK
- ws-empty-band mult_facts: OK
- ws-empty-band div_facts: EB-EDGE 1 (mixed-practice M cell 19, pre-existing, as above)
- ws-boot-smoke: OK
- `node --input-type=module --check` review.js: OK
- print-lint review S, 11 add / sub / fact skills: 0 findings, unchanged from master
- Backtest row `review-stack-side-multfacts-array`: ws-empty-band EB-SIDE against the pin, FAIL 55e7d0f2f (6 > pin 4) ->
  PASS 4e2e4c988. Verified PASS.

**Findings -> checks:**
- The class "a section's columns narrowed so the same ink sits in a wider cell" is now caught by EB-SIDE through that backtest row.
- Speed note: comparing the Review's `Fits:` lines (ws-grade-render meta, or `--save-html` grids) on master and the branch found the
  column change in one step.

Renders: `/tmp/claude-0/-home-user-MathQuest/447a1d04-e24b-5c13-8aba-a33c056c9d3a/scratchpad/divarray-renders/mult_facts-review-{array,touch}-{S,M,L}-{p1,key-p1}.png`.

## Lead rulings 2026-11-13: the × 0 frame, and Review S touch 15 (builder Opus medium)

**1. A × 0 fact with the array support draws a short empty landscape frame** (`sheet/cells/fact.js`), as 0 ÷ n does.
- This applies to 4 × 0 and 0 × n.
- The frame is one row tall and as wide as the larger factor's dots (at least a five-group). It holds no dots.
- Caption: "0 rows of 4, for 4 × 0".
- It draws on paper and on every screen host (card, worksheet, quiz).

**The check came first:** ws-screen-support-eq **ARRAY-FRAME**.
- On an array-support band every fact draws its array or frame.
- A × 0 fact draws the empty frame, at most half as tall as it is wide.
- The card and quiz now render the item the scan dealt. Before, they re-generated it, and the dealer avoids repeats, so the 0 item was never drawn.

On 669c41cea it FAILs 11 times (8 × 0 on paper S / M / L; 10 × 0 on the card at 1280 / 820 / 390 and on the quiz). On 792e5ca30 it is OK.

| Backtest row | FAIL state | PASS state | Command |
|---|---|---|---|
| `array-frame-multfacts` | 669c41cea | 792e5ca30 | ws-screen-support-eq --only FRAME,EQ |
| `review-zero-row-multfacts-array` | 05875e169 (H13-ROW "4 × 0", 32 %) | 792e5ca30 | print-lint array Review S --lints L-DENSITY |

Both rows PASS, run directly.

**2. Re-pin, ruled** (`design/audit/baselines/capacity.json` "ruled"):

| Page | Before | After | Reason |
|---|---|---|---|
| mult_facts Review S `{"support":["touch"]}` | 16 | 15 | Lead ruling 2026-11-13: master's 16 relied on defective 32 % side bands (3-column Mixed Review stacks) |
| mult_facts Review S `{"support":["array"]}` | 12 | 13 | A gain, pinned so it never falls |

- The default-option pages are unchanged: mult_facts Review S is 16.
- ws-capacity-pin had no supports dimension. It now measures a ruled page whose key names options as JSON after the size.
- Those option pages are left out of SIZE-ORDER.
- This note is the re-pin's status note (the pin file says: rewrite only on master or with a ruling).

**Merge:** origin/master is merged in (b1bf118e6).
- `review.js`: master's tightRows and this lane's supported-fact FACT_ROOM are both kept.
- `backtests.json`: the union of both sides by row id. This lane's re-pointed rows win.

**Gates, after the merge:**
- print-lint --supports array S, the 4 roles × div / mult: **0**
- ws-capacity-pin --check: OK (648 pinned pages, 0 drops; the ruled touch page is 15, the array page 13)
- ws-screen-support-eq div + mult: OK
- ws-boot-smoke: OK
- `node --input-type=module --check`, every changed module: OK

Renders: `/tmp/claude-0/-home-user-MathQuest/447a1d04-e24b-5c13-8aba-a33c056c9d3a/scratchpad/divarray-renders/` (`mult_facts-review-array-S-p1.png`
and `-key-p1.png` show 0 × 1 with its frame; `mult_facts-card-1280-zero.png` is 6 × 0, `mult_facts-card-390-zero.png` is 10 × 0, and
`mult_facts-worksheet-1280-zero.png` is 11 × 0 among 12 cards).

## Critic divarray r1 (e3aa95d32, independent Opus medium) - FAIL, lowest C3 6 (mult_facts array Test S/M/L, worksheet 1280)
Report design/audit/runs/lf-ops/critic-divarray-r1.md (renders in the session scratchpad critic-divarray-r1/). div_facts array: PASS on every host and page type; add_facts screen size: clean. Every lint / gate was green - none caught these.
| Finding | Check that would have caught it |
|---|---|
| D1 (major) mult x 0 empty frame reads as an answer slot (the only framed support in a band; next to / under the input on screen) | SUPPORT-NOT-SLOT: a support draws no empty closed box the size/shape of the answer slot, nor is the only framed support in its band |
| D2 (major) mult_facts Review S touch at the ruled 15: 71 mm blank strip under the grid (30 %), stacks ~37 % empty; 15 not a Review total | PAGEFILL on review and test roles |
| D3 (major) mult_facts array page identical at S / M / L (Ind 10, Test 12) | ws-capacity-pin size-order check must include the ruled option pages |
| D4 (H13, C3 6) x arrays unframed: a small array in a cell sized for 10-12 rows (Test S cell 4 38 %, worksheet 1280 cards 36-44 %) | empty-band below the support on Test cells and on the screen worksheet |
| nit: "1 rows of 1" caption (fact.js:242) | ARRAY-CAPTION grammar (row/rows) |
Open question to the lead: does Test count = Independent count (2026-11-09, div_facts) extend to mult_facts?

## r2 checks (CHECKS FIRST; builder Opus medium) - the 6 checks the critic's findings become

Each check is written and backtested BEFORE the defect fix (the lead is still ruling on the fix design). Every check FAILs on
e3aa95d32 (the critic's tree) and is on precritic's path. Branch head after these commits: see git log. Backtest pass commit
is left `TBD-divarray-r2` (filled when the fix lands), so these rows read PENDING in a full ws-backtest run meanwhile.

| # | Check (rule, file) | On e3aa95d32 | On master | Backtest row |
|---|---|---|---|---|
| 1 | SUPPORT-NOT-SLOT - no support draws an empty closed box ~ the answer slot (±40 %), and a frame on only some cells of an array band (the × 0 frame) is the lone slot-like box. `ws-screen-support-eq` (paper Independent + every screen host) + `ws-print-lint` L-SUPPORT NOT-SLOT (all paper roles) | FAIL: screen-support-eq 3 (paper S/M/L band-mix: 1 framed + 9 unframed array supports). print-lint NOT-SLOT fires on the review/test/independent supports pages | OK (no × 0 empty frame on master: ARRAY-FRAME is this lane's) | `support-not-slot-multfacts-array` |
| 2 | PAGEFILL / PG-23 orphan run on Review + Test roles for fact skills with supports (`--fill-roles`). `ws-print-lint` L-DENSITY | FAIL: PAGEFILL fires on mult_facts Review S touch (empty strip 73 mm, 31 % of the problem area) | no PAGEFILL finding - master's Review S touch is 16 (no bottom strip); this lane's re-pin to 15 created the strip the critic saw | `pagefill-review-multfacts-touch` |
| 3 | SIZE-ORDER-OPT - the ruled OPTION pages are judged by SIZE-ORDER; an option page whose cells measure smaller at S must fit more at S (strict S > L). `ws-capacity-pin` | FAIL 3: mult_facts {support:array} independent/test/more-practice S==L (10/10/10, 12/12/12). div_facts array (36/24/18) PASSES | FAIL (pre-existing: mult array 10/10/10). div array passes | `size-order-opt-multfacts-array` |
| 4 | EB-SUPBAND - the empty band directly UNDER the support drawing (not only under the item), in Test cells + screen worksheet/card/quiz. `ws-empty-band` | FAIL 114 across default roles (Test S cell 4 ~38 %); 12 at --roles test alone; worksheet host also fires. div_facts array PASSES | FAIL 2 at S (pre-existing unframed × array) | `supband-below-support-multfacts-array` |
| 5 | ARRAY-CAPTION grammar - a one-row array caption is "1 row of n", never "1 rows". `ws-screen-support-eq` | FAIL 3: card 1280/820/390 "1 rows of 1, for 1 × 1" | CAPTION fails on master too, but for the pre-lane PORTRAIT convention ("12 rows of 2"), not the grammar | `array-caption-grammar-multfacts` |
| 6 | TEST-EQ-IND (Q1) - a fact skill's Test count follows its Independent count on each support. DISABLED behind `--test-eq-ind`, pending the lead's ruling. `ws-capacity-pin` | FAIL (flag on): mult array Test 12 != Ind 10 (S/M/L); touch Test 20/16 != Ind 25/20 (S/M) | FAIL (flag on): touch 20 != 25 (pre-existing). div array Test == Ind (no finding) | `test-eq-ind-multfacts` (pending the ruling) |

Notes:
- Checks 3 and 6 share `ws-capacity-pin`; the pin now carries `sizeOrderOpts` and `testEqOpts`. SIZE-ORDER-OPT is live by
  default (it is the D3 fix check); TEST-EQ-IND stays OFF unless `--test-eq-ind` (Q1 is still the lead's to rule).
- Check 2: PAGEFILL on review/test is wired into precritic by adding `--fill-roles` to the fact-support print-lint gates.
- Check 1 (print-lint) and check 4 (EB-SUPBAND) run on the existing fact-support / empty-band precritic gates (no new gate).
- Could not be checked automatically: the practice CARD host renders no `[data-ws-cell]` for mult_facts, so EB-SUPBAND and
  the screen slot-rule read nothing there (a screen-parity gap, not this check's). The worksheet and quiz hosts are covered.

## r2 fix (builder Opus medium, rebuild after critic r1 FAIL; lead rulings 2026-11-13)

Card: the rulings are recorded on the facts card (f31aceddf, re-generated unsigned); the lead signed it at 12317e6be.

| Ruling | Fix (commit ecc8342e8) |
|---|---|
| 1. Test = Independent for mult_facts, every support | `print-sheet.js` buildSheetInner builds a one-skill mult_facts Test (Auto count and columns) on its Independent page's grid (`_indFit`: columns, count, cell height); `test.js` takes it. ws-capacity-pin TEST-EQ-IND is ON by default (`--no-test-eq-ind` turns it off); `testEqOpts` holds mult_facts array / touch / skip / boxsign / none and div_facts array. |
| 2. One frame per band for × arrays | `skill-options.js` multFactsArrayFrame (rows = the band's largest smaller factor, columns = its largest larger factor, read as the generator deals); `print-sheet.js` supportPlanFor and `screen-cell.js` screenSupportsFor hand it in (paper = screen); `fact.js` draws every × array top-left in that frame, a × 0 fact the empty frame; `support-draw.js` pitch S 2.6 / M 3.2 / L 3.3 mm (never under the print dot; the 12 x 12 frame stays BESIDE the fact at every size - at L a 4.4 mm pitch put it under the fact and printed 4 a page). |
| 3. Review S touch back to 16 | `review.js` geometry: a band of supported × facts at S tries the other column counts and takes one only when it prints MORE (touch: 5 x 2 + 5 = 15 -> 4 x 3 + 4 = 16). capacity.json ruled 16 (the 16 -> 15 re-pin withdrawn); the array Review S stays ruled 13 (master 12). |
| 4. "1 row of n" | `fact.js` row / rows in every array caption (÷ too). |

Before -> after (default seeds):

| Page | e3aa95d32 (critic r1) | ecc8342e8 |
|---|---|---|
| mult_facts {array} Independent S / M / L | 10 / 10 / 10 | 10 / 8 / 8 |
| mult_facts {array} Test S / M / L | 12 / 12 / 12 | 10 / 8 / 8 (= Independent) |
| mult_facts {array} More practice S / M / L | 10 / 10 / 10 | 10 / 8 / 8 |
| mult_facts {array} Review S / M / L | 13 / 9 / 9 | 13 / 9 / 9 |
| mult_facts {array, constant 2} Independent / Test S / M / L | - | 12 / 12 / 10 each |
| mult_facts {touch} Test S / M / L vs Independent | 20 / 16 / 12 vs 25 / 20 / 12 | 25 / 20 / 12 = Independent |
| mult_facts {boxsign} Test S / M / L vs Independent | 12 / 12 / 12 vs 15 / 15 / 12 | 15 / 15 / 12 |
| mult_facts default Test S / M / L | 20 / 16 / 12 | 25 / 20 / 12 (= Independent; capacity-pin "rise") |
| mult_facts {touch} Review S | 15 (73 mm strip, 31 %) | 16, no strip |

Hash check (print-lint --save-html, port-normalised, 108 documents: div_facts and add_facts with supports all / array / touch / none,
independent / more-practice / test / review, S / M / L): every div_facts and add_facts page byte-identical. Changed: mult_facts Test
(none S/M/L, touch S/M/L) and mult_facts Review S touch, as intended.

### The r2 checks red -> green (ws-backtest, each row run directly)

| Row | FAIL state | PASS state |
|---|---|---|
| support-not-slot-multfacts-array | e3aa95d32: 3 (1 framed + 9 unframed, paper S/M/L) | ecc8342e8: 0 |
| pagefill-review-multfacts-touch | e3aa95d32 | ecc8342e8 |
| size-order-opt-multfacts-array | e3aa95d32: S == L | ecc8342e8 |
| supband-below-support-multfacts-array (now on the Test role) | e3aa95d32 | ecc8342e8 |
| array-caption-grammar-multfacts | e3aa95d32 | ecc8342e8 |
| test-eq-ind-multfacts (no flag) | e3aa95d32 | ecc8342e8 |
| capacity-ruled-review-touch-multfacts (new) | e3aa95d32: 15 under ruled 16 | ecc8342e8: 16 |
| array-caption-multfacts (re-pointed: CAPTION now holds N1) | 88753326 | ecc8342e8 |

Tool changes this round, each one reason:
- ws-screen-support-eq: `--only NOTSLOT` skipped the paper pages, so the NOTSLOT backtest read only the screen hosts and passed on the critic's tree; fixed. ARRAY-FRAME: a × 0 fact draws its band's empty frame (square on the 12 x 12 band), so the rule is "empty, never portrait"; captions read `rows? of`.
- ws-empty-band EB-SUPBAND: a support BESIDE taller ink (the fact beside the band frame) has no band under it (the strip holds the fact's lower rows; the band under the cell's last ink is EB-BAND's). The backtest runs the Test role, where D4 was graded: the Scripted Model's own tall step cells (34 % under the frame at S) are the page-types lane's (facts card ruling 2026-10-31) - left, reported.
- ws-precritic `--role R --skill X` now also runs ws-empty-band and ws-capacity-pin on X's R pages, so the Review stack-side, the Test support band and the ruled Review capacity are on precritic's path.

### Owner check rule (2026-11-13): every finding a check, a backtest, on precritic's path, a ledger row

- The div_facts r6 / r7 page checks (EB-PAGE test / fade, EB-PAD, EB-COLS, EB-TESTEQ, EB-GAP, EB-FACTX) were dropped from master when the
  deploy cherry-pick kept master's tests/: the fix shipped (4c5de5a27), the checks did not. Restored as `tests/scripts/ws-fact-pages.cjs`
  (the lane's tool as b43bf8b99 had it, under its own name, since master's ws-empty-band is a different rewrite) with the 8 backtest rows,
  pass re-pointed to 4c5de5a27 (an ancestor of origin/master); precritic plans it on div_facts (gate `fact-pages`).
- R5-3 (no 5-group gap): ws-screen-support-eq ARRAY-GAP (new), row array-gap-divfacts (FAIL 9a8acc59c -> PASS 4c5de5a27).
- R5-5 / R5-7: exempt with reason in the ledger (measurable, not built; fixed in round 5, unchanged since).
- design/lessons-first/CHECKS_FROM_CRITICS.md: the lf-ops rows name real ids; an lf-ops-divarray section. lf-checks' sweep
  (`ws-precritic-plan.mjs --checks-from-critics`, their 503ad16c, run from a scratch copy): no lf-ops / lf-ops-divarray row fails.

### Findings -> checks (r2)

| Finding | Check that now catches it |
|---|---|
| D1 × 0 frame reads as an answer slot | SUPPORT-NOT-SLOT (paper + screen), ARRAY-FRAME |
| D2 Review S touch 15, 30 % strip | PAGEFILL on review / test (--fill-roles), ruled capacity 16 |
| D3 same page at S / M / L | SIZE-ORDER-OPT |
| D4 small × arrays in tall cells | EB-SUPBAND (Test role) |
| N1 "1 rows" | ARRAY-CAPTION grammar |
| Q1 Test != Independent | TEST-EQ-IND (default on) |
| r2 tool gap: `--only NOTSLOT` read no paper | the NOTSLOT backtest now fails on e3aa95d32 (it passed there before the fix) |

Speed notes: (1) a check's backtest must be re-run after every tool edit on the lane, not only after the code fix - the NOTSLOT and
CAPTION rows had silently drifted. (2) `git pull --rebase` on a branch holding a merge commit replays master's commits and swaps the
working tree under running browser gates: fetch, and merge only when the remote branch is ahead.
