# Critic r2: lf-tools (A no phone width + B copy-light / batch), f3ae7acca..c1a188d58, graded at c1a188d58

Independent critic, Opus medium, 2026-11-13. Branch claude/sweet-newton-c8wrv1-lf-tools. Browser runs through
/tmp/mq-browser-run.sh, at most two at a time. No tracked file edited except this report.

**VERDICT: FAIL (both changes).** A: C1 8 · C2 7 · C3 8 · C4 8. B: C1 6 · C2 7 · C3 8 · C4 8.

Criteria (as r1): C1 verdicts correct · C2 no false alarms / holes · C3 tests, self-tests, plan green · C4 notes, briefs, runtime clear.

## Evidence
| Run | Result |
|---|---|
| self-tests: ws-copy-light (48), ws-no-phone-width (26), ws-grade-render --touch-self-test (9) / --sample-self-test (5), ws-screen-slots, ws-precritic | all OK |
| ws-no-phone-width | OK (75 files, 73 derived from 3 plan sources, 8 allow-listed) |
| ws-precritic-plan; --checks-from-critics | OK (158 on path); 75 pass / 30 exempt / 15 fail (was 70 / 25 / 15: 10 rows added, none dropped), no lf-tools row failing |
| ws-boot-smoke | OK |
| ws-grade-render --gate, placevalue:unit_form independent M | FAIL 24 TARGET findings: `input.mq-cellslot` 50 x 46 on worksheet-820 / worksheet-1024; meta has card / worksheet / quiz at 1280, 820, 1024 (+ card-1366x768). precritic's render-gate passes `--gate` without `--no-screen`, so this runs on every `--skill` run |
| ws-grade-render --sample (3 pages cut from a real add_missing_digit sample: independent S seed 89509 range 100, card@1024, worksheet@1366) | OK; one dir per page, meta sampleSeed / sampleWidth / opts as sampled, only the sampled host and width rendered |
| ws-backtest --row: copy-light-eligibility, copy-light-drawing-batch, copy-light-sample-widths, copy-light-brief-names, no-phone-width-derived, no-phone-width-default, vocab-o1-next-box-blue | 7 PASS |
| ws-backtest --row vocab-r11-nb9-blur | FAIL (fail state FAIL, pass state FAIL), as the status says |
| ws-copy-light on 3 templates' near-anchor skills (stack, pv, word-work) | stack hole, below (D1) |

## r1 defects re-verified
- **B1 (pv kind): fixed for pv.** placevalue:compare and order_least_to_greatest NOT ELIGIBLE ("pv passed only as pv/kind=expand, ..."). But the drawing key is incomplete: see D1.
- **B2: fixed for a single skill and a batch** (add_missing_digit alone: 1280, 1366, 820, 1024). Residue D3.
- **B3: fixed.** The sample renders exactly as written (above).
- **B4: fixed.** Both briefs carry RUBRIC's four names; `--brief-lint` row PASS.
- **B5: fixed.** copy-light-eligibility fails on f3ae7acca's semantic error (compare ELIGIBLE), PASS.
- **B6: fixed** (self-test: a drawing at items 5 / 13 is found; the "sign its card" reason prints, e.g. digit_value_unit_form).
- **A1: fixed and on precritic's path** (worksheet and quiz judged at 820 / 1024; unit_form's real red is caught and routed to lf-hosts). Stale label only: precritic's render-gate row still reads "card-820 / 1024 targets" (D5).
- **A2: derived list fixed** (73 scripts; student-explorer moved to 1366 / 1024 / 820). One allow reason is untrue: D2.
- **A3: fixed.** One table, `HOST_DIGIT_FLOOR` / `digitFloor(host, width)` in tests/lib/ws-screen-widths.cjs; ws-screen-slots reads only it, and its self-test checks that every host has a floor at every default width. No other screen gate keeps its own digit floor (grep).
- **A4: fixed.** The status gives each moved row's outcome. vocab-r11-nb9-blur is reported as UNPROVEN, still red at both commits (re-run here: FAIL / FAIL). It is routed to lf-vocab, which wrote the row (lf-vocab.md:466). The route is written only in lf-checks.md, not in lf-vocab's own status (minor).

## Defects
- **D1 (B C1, major; the same class as r1 B1, so round-cap rule 4 applies): the drawing key misses the stack template's discriminators.**
  `DRAWING_KEYS` is a fixed name list (kind / task / layout / mode / type / form). `stack` draws by `op` ('-', '+', '*'), by
  `unknown` (the VA-7 missing-digit box), by `regroup` ('add' carry row vs subtraction headroom) and by the number of operand rows
  (CM-5 / CM-6). The only passed stack skills are the subtraction no-regroup family (op '-', 2 rows). The results:
  `ws-copy-light --skill` reads **ELIGIBLE** for multiplication:mult_2by1_column (stack op '*', the ×-carry the subtraction card
  marks "SPEC, NOT BUILT", T-5.6), addition:add_column_multi (4 addends, `regroup:'add'`), and addition:add_missing_digit /
  subtraction:sub_missing_digit (`unknown` box). **`--batch add_column_multi,add_missing_digit,sub_missing_digit` reads BATCH OK
  on template stack.** Each is anchored by subtraction:sub_50_no_regroup. Other templates hold unkeyed discriminators too:
  word-work `barKind` (groups / compare / whole), fact `notation` / `across`, pv `support` (line / none), equation `notation`,
  coins / hop-line `response`. **Check:** each cell template declares its drawing fields (a registry export, e.g.
  `DRAWING_FIELDS.stack = ['op', 'unknown', 'regroup', 'rows']`), and a lint fails when a `p.<field> ===` branch in
  js/modules/sheet/cells/<t>.js is neither a declared drawing field nor declared non-drawing. Add a self-test case (stack op '*' vs
  op '-': NOT ELIGIBLE) and a backtest row: the batch above is BATCH OK at c1a188d58 and must FAIL after the fix.
- **D2 (A C2): an allow-list reason is untrue.** ALLOW says the teacher files render "no pupil screen host at 390", and
  ws-share-options.cjs is on that list. Its pupil 3 (lines 433-442) opens the pupil Direct Play landing at 390 x 844 and plays
  twelve practice-card questions (`answerTwelve`). With SHOTS set, pupil 1 also shoots the pupil Quick Start grid at 390. The
  allow covers the whole file, so a new pupil 390 step in any allowed file passes unseen. **Check:** allow by line or step
  (a marker comment such as `// np-allow: teacher <reason>` on each 390 line) rather than by file. Then move ws-share-options'
  pupil steps to 820 or 1024, or give them their own honest reason.
- **D3 (B C2): a multi-skill copy-light sample deals the widths across skills.** `ws-copy-light --skill a,b,c --sample-out`
  (precritic `--skill a --skill b --skill c --copy-light` makes the same call) gives each skill 3 screen pages. For example
  mult_2by1_column has 1280 / 1366 / 820, add_column_multi 1024 / 1280 / 1366, and add_missing_digit 820 / 1024 / 1280. Each
  skill's narrow critic is a separate brief (critic-copy-light.md is per skill), so each one misses a width. **Check:** in
  `copy-light` mode, the sample self-test asserts that every skill has every SCREEN_WIDTHS width. Only a batch deals the widths.
- **D4 (B C3, minor): no self-test or backtest exercises a non-pv drawing.** The 8 drawing cases are pv, word-work and clock
  key strings, and D1 shows how that misled. **Check:** as in D1.
- **D5 (A C4, minor): the precritic render-gate label reads "card-820 / 1024 targets >= 48 px".** It now judges the worksheet
  and quiz too. **Check:** none needed; fix the label.

## Scores
- **A C1 8:** touch, digit floors and the derived scan give correct verdicts. **C2 7:** D2, a pupil practice flow at 390 hidden
  under a false allow reason. **C3 8:** self-tests and rows green, plan OK, none dropped. **C4 8:** clear notes, honest A4 table,
  one stale label (D5).
- **B C1 6:** D1, never-passed stack drawings read ELIGIBLE and BATCH OK (the r1 B1 class, second round). **C2 7:** D3.
  **C3 8:** the tests are green and the rows are not vacuous; D4 is minor. **C4 8:** the sample renders exactly; the briefs are right.

Round-cap note (FASTEST_PLAN item 4): D1 is the second round of the "drawing identity" defect class. Before r3, find the
root cause (a hand-kept discriminator list) and make the machine check above. Then one more round.
