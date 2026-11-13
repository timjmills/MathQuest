# Critic r2: tests/scripts/ws-empty-band.cjs (lane lf-checks), graded at 4834361d (frozen)

Independent critic, Opus medium, 2026-11-08. Every run used the frozen tree or a scratch copy, run with MQ_ROOT. The copy is
/tmp/claude-0/critic-eb2/wt, identical except for the one-line regex change named in D7. No tracked file was edited.

**VERDICT: FAIL.** C1 6 · C2 4 · C3 7 · C4 6

## Evidence (runs)
| Run | Result | Time |
|---|---|---|
| `ws-backtest --row eb-fixture-band` | fail.html FAIL, pass.html OK, row PASS | 9 s |
| `ws-precritic --skill addition:add_wp_10 --dry-run` | plans `[browser] ws-empty-band ... --skill addition:add_wp_10` | - |
| `ws-precritic-plan` | OK, 47 rows on the path. eb-fixture-band is "not applicable (no skill)", like the other fixture rows | - |
| bebf5b36 vocab guided S,L (the backtest row), on 4834361d | FAIL 4 (35.1 / 32.4 / 33.5 / 32.6 %) | 10 s |
| b23e418d div_facts `--sizes S --hosts none` | FAIL 112 (BAND 90, SIDE 22). More-practice S equation cells at 35.2 % | 72 s |
| b28a0867 pv value `{band:9999}` L / unit_form `{rename:more}` S | FAIL 12 / FAIL 16 | 7 / 11 s |
| today's head, placevalue:value (no card: default roles) | FAIL 40, all EB-BAND: pv cells on error-analysis S/L 38–40 %, review S/M 35 %. No ROLE, READ or SIDE finding | 84 s |
| today's head, multiplication:mult_properties (no card) | FAIL 143: BAND 131, SIDE 2 (card 820/1280), FOOT 10. Of these, arrays-turn shows 49–61 % "above the ink", which is **false** (D7) | 83 s |
| The same four backtests with the D7 regex fixed (scratch copy) | All still FAIL with identical counts: 4, 112, 12, 16 | - |
| addition:add_wp_10 raw, D7 fixed | FAIL 40 (BAND 26, SIDE 4, FOOT 10). **The pin holds 238** for this skill. Critic r1 measured 40 at b180064f | 141 s |
| addition:fact_family_sort raw, D7 fixed | FAIL 36 (pin 46), including 6 EB-ROLE, 3 of them false (D8) | 114 s |

## What r1 asked for, and whether it is fixed
- **D1 (card not measured): fixed, but only in part.** The card is now measured through `.mq-scell`: mult_properties card 820 and
  1280 report findings, and a host with no cell gives EB-READ.
  - A host that does not render (`!ok` / `ERR`) is still only a *note*, never a failure (line ~232). R1 asked for that too.
- **D2 (top, between and SVG bands; 6 items): fixed in code.** The worksheet host deals 6 items (`worksheet.js:1817` honours
  `state.problemCount`).
  - The "shape by shape" SVG measure is broken for black ink. See D7.
- **D3 (offered but not composed): fixed.** EB-ROLE fires when a card offers a role the app does not compose. It inherits the
  card reader's scoping bug (D8).
- **D4 (pin): done as the minimum r1 named.** All 20 passed skills are pinned (424 keys), and that follows the lead's ruling.
  - The pin is inflated by false alarms (D7). Its headroom now hides real regressions.
- **D5 (calibration): fixed.** The header is honest, the comparisons are unrounded, and `hw` is gone.
- **D6 (no runnable backtest): fixed.** `eb-fixture-band` runs and passes in 9 s. The fixture covers only the band *under* the
  ink (see m7).

## Defects
**D7 (C1/C2, root cause): any black SVG shape is treated as transparent, so the drawings in a B&W cell are not ink.**
- `paints()` uses `/^rgba?\([^)]*,\s*0\)$|transparent/`. That pattern matches `rgb(0, 0, 0)`, and any colour whose last channel
  is 0. Black fill and black stroke are therefore "not painting". SVG ink counts only if it is `<text>` or grey.
  - Proof: `paints('rgb(0, 0, 0)') === false`.
  - DOM probe of mult_properties: the array dots are `circle fill=rgb(0, 0, 0) stroke=none`.
- **False alarms.** Two examples were measured on screenshots (`wp10-L.png`, `mp-S.png`):
  - mult_properties independent S, arrays-turn cell 1: "37.0 mm above the ink, 60.8 %". Both dot arrays are missed. With the
    regex fixed it measures 5.4 %.
  - add_wp_10 independent L, word-work cells: 31.4–34.3 %, because the picture row is ignored. The true values are 15.5–17.6 %.
- **The pin carries the error.** add_wp_10 is pinned at 238 findings, but the true number is 40. fact_family_sort is pinned at
  46 against 36. Every pinned count above the true count is headroom: a real band that appears later in a pinned render passes
  unseen.
- **Escapes.**
  - A cell whose only ink is a black drawing has `box == null`, so `return` drops it unjudged.
  - Bands inside or under a drawing (number lines, bar models, ten frames, pictures) are measured against the wrong ink.
- This was introduced by the r1 fix. Critic r1 measured add_wp_10 raw at 40, the same as today's fixed count.
- The four lane backtests are unaffected: same counts with the fix, because their cells are HTML and text.
- **Fix:**
  - Treat a colour as transparent only when its alpha is 0 (`/^rgba\([^)]*,\s*0\)$/`), and keep the white exclusion.
  - Count a cell with no measured ink as EB-READ, not skip it.
  - Re-pin from a corrected run, with a STATUS note giving each skill's before and after counts.
  - Better: take ink from pixels, using `tests/lib/ws-ink.cjs` (`inkScan`), which already exists for this purpose. That removes
    this whole class (C4).

**D8 (C2): EB-ROLE false alarms, because the card reader drops "on" lists after a "(PROPOSED)" tag.**
- `ws-card-plan.mjs`'s line regex expects ` on ` right after `**offered**`.
- `family-check.md:187` reads ``**offered** (PROPOSED) on `add_wp_10`, …``. The "on" list is dropped, so the line applies to
  every skill.
- The "out of scope on `fact_family_sort`" line (188) is ignored, because only "hidden" is subtracted.
- Result: fact_family_sort word-problems S/M/L raise EB-ROLE, against a card that rules the role out of scope. Those 3 keys are
  pinned.
- (Stretch S/M/L on the same skill is a real contradiction: offered "any skill", and the app refuses it.)
- **Fix:**
  - Allow an optional parenthesised tag before `on`.
  - Subtract "out of scope" as well as "hidden".
  - Add a self-test line with "(PROPOSED) on".
  - Coordinate with lf-ops, which owns the file.

**D9 (C1, r1 D1 left open): a host that does not render passes.**
- `if (!ok || /^ERR/.test(ok)) { notes.push(...) ; continue; }`. A worksheet or quiz host that throws gives a green run.
- Make it EB-READ, as is already done for a host that renders no cell.

## Minors
- **m7:** The fixture set has one page: a band under the ink. There is no top band, no between-blocks band, no SVG with black
  shapes, and no SVG-only cell. A black-dot SVG fixture would have caught D7 at once (rule 00, item 1).
- **m8:** EB-SIDE fires on mult_properties card 820/1280 (33 % / 30 %). These are legacy left-aligned items. The finding is
  plausible, but 30 % sits exactly on the limit at 1280. I did not check it by eye.
- **m3 (r1), m1, m2:** unchanged and accepted as recorded.
  - Card §7a Screen hosts are ignored.
  - EB-FOOT is grid-only.
  - The pin is a count per render. With D7 this is now a real weakness, not a theoretical one.
- **m9:** placevalue:value and mult_properties have no card on this tree, so they run the 9 default roles. That is fine, but the
  run's note should say "no card: EB-ROLE not judged", so a lane does not read a pass on roles as card-checked.

## Scores
- **C1 catches its class: 6.**
  - All four backtests fail for the cited defect.
  - D1, D2 and D3 are fixed in code, and the card host is now measured.
  - But no black SVG ink is seen. Bands under or beside drawings are wrong, and a drawing-only cell is skipped unjudged (D7).
  - A host that does not render still passes (D9).
- **C2 no false alarms / honest pin: 4.**
  - Pinning every passed skill is right under the lead's ruling, and the HTML/text findings I checked are real:
    - the add_wp_10 picture-row band is real at about 16 %, but is reported at 31–34 %;
    - the pv error-analysis 40 % bands are real;
    - the vocab bands are real.
  - But every black-drawing skill gets false bands. The mult_properties arrays read 61 % against a true 5 %.
  - The pin bakes in about 200 fake findings for add_wp_10 alone, which hides future regressions (D7).
  - EB-ROLE raises card-contradicting false alarms (D8).
- **C3 wired: 7.**
  - `precritic --skill` plans it.
  - The fixture row runs and passes in 9 s, and `ws-precritic-plan` is OK.
  - The fixture set is too thin to guard the measure (m7). The real-head rows are still pending.
- **C4 runtime and maintainability: 6.**
  - Runtime is good: 80–140 s per skill, and 7–11 s per backtest row.
  - But the ink classifier is a dense hand-written regex with no unit test, and its first change broke silently.
  - It is a fourth ink measure, beside print-lint H13, H13-ABS and `tests/lib/ws-ink.cjs` (the pixel `inkScan`, which reports
    top / bottom / left / right bands already).

## Rule 00: automatic checks that would have caught each finding
1. D7: `ws-empty-band --self-test` asserts the colour classifier: `rgb(0, 0, 0)`, `rgb(17,17,17)` and `#999` paint, while
   `rgba(0,0,0,0)`, `transparent` and white do not. Add a fixture of a black-circle SVG array above an answer box, which must
   PASS, and a black SVG with an empty lower half, which must FAIL.
2. D7: run a pixel cross-check (`ws-ink.cjs` `inkScan`) on one render per template. When the DOM band and the pixel band differ
   by more than 5 points, fail.
3. D7 and pin: before writing a pin, sample 3 pinned keys per skill and print the cell's screenshot crop beside the number for
   a human check. Fail a re-pin whose count is over 3× the previous critic's raw count.
4. D8: `ws-card-plan.mjs` self-test gets a line ``**offered** (PROPOSED) on `x` `` and a line `**out of scope** on`. For each
   card, assert that every role line with an "on" list parses with `on` not null.
5. D9: host coverage. Every host in the plan either renders and reads ≥ 1 cell, or the run FAILs with EB-READ.

## Rule 00: speed-ups
1. Reuse `tests/lib/ws-ink.cjs` (pixel ink) instead of a DOM classifier. One measure means one calibration, and no colour
   parsing.
2. `--json` should dump every cell's bands (above, between, below, side), not only the findings. This critic copied
   `measureCells` into a probe to see the unflagged cells, as the r1 critic did.
3. Run the fixture backtest inside the tool (`--self-test`, no browser for the classifier), so a regression in the measure
   fails in under a second, before any lane run.
4. The branch freeze worked this round: no rerun was needed.
