ws-precritic: 25 gate(s) (14 browser), logs /tmp/claude-0/-home-user-MathQuest/777ba8d1-efd2-5fc4-929a-183f87207bfc/scratchpad/pc2/logs
  N/A             ws-providers-unit --skill (0 s)
  PASS            ws-node-lint (2 s)
  PASS            ws-code-snapshot (4 s)
  FAIL            ws-card-rulings --check offered (panel offers nothing the card bans) (1 s)
  PASS            ws-card-rulings --check rulings (spec card numeric rulings, 300 items) (11 s)
  FAIL            ws-content-audit --skill (14 s)
  PASS            ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) (1 s)
  INCOMPLETE (unsigned card) ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) (4 s)
  PASS            ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) (30 s)
  PASS            ws-presets-unit (196 s, waited 179 s for a slot)
  PASS            ws-options-verify --skill (328 s)
  PASS            ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) (180 s, waited 119 s for a slot)
  PASS            ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) (125 s, waited 62 s for a slot)
  PASS            ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) (120 s, waited 65 s for a slot)
  FAIL            ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) (167 s, waited 60 s for a slot)
  FAIL            ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) (212 s, waited 100 s for a slot)
  PASS            ws-screen-slots --skills (128 s, waited 102 s for a slot)
  PASS            ws-screen-answer --skills (155 s, waited 40 s for a slot)
  PASS            ws-boot-smoke (188 s, waited 181 s for a slot)
  PASS            ws-chromebook-fit --skills (419 s, waited 69 s for a slot)
  PASS            ws-phone-card (practice card at 390 px: clip, first-box focus) (343 s, waited 102 s for a slot)
  PASS            ws-options-verify --render (each offered appearance value at S / L vs the default page) (712 s, waited 134 s for a slot)
  FAIL            ws-coverage-matrix --skills (2502 s)
  FAIL            ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) (1014 s)
  FAIL            ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) (1883 s)

### ws-precritic — --skill subtraction:sub_50_no_regroup,subtraction:sub_100_no_regroup,subtraction:sub_1k_no_regroup,subtraction:sub_10k_no_regroup,subtraction:sub_100k_no_regroup,subtraction:sub_1m_no_regroup,subtraction:sub_2d_1d

commit `02ce513153` + uncommitted changes (1515 file(s)) (claude/sweet-newton-c8wrv1-wip-s3-stack) · started 2026-10-24T13:09:47Z · finished 2026-10-24T14:39:47Z · wall 5400 s · logs `/tmp/claude-0/-home-user-MathQuest/777ba8d1-efd2-5fc4-929a-183f87207bfc/scratchpad/pc2/logs`

| Gate | Scope | Result | Findings vs baseline | Seconds |
|---|---|---|---|---|
| ws-node-lint | 7 skills | PASS | 0 found, 0 pinned, 0 new | 2 |
| ws-providers-unit --skill | 7 skills | N/A | no provider test for subtraction:sub_50_no_regroup, subtraction:sub_100_no_regroup, subtraction:sub_1k_no_regroup, subtraction:sub_10k_no_regroup, subtraction:sub_100k_no_regroup, subtraction:sub_1m_no_regroup, subtraction:sub_2d_1d | 0 |
| ws-content-audit --skill | 7 skills | FAIL | ws-content-audit: FAIL - 1 of 7 subtraction/sub_50_no_regroup,sub_100_no_regroup,sub_1k_no_regroup,sub_10k_no_regroup,sub_100k_no_regroup,sub_1m_no_regroup,sub_ | 14 |
| ws-options-verify --skill | 7 skills | PASS | 203 value(s) checked; 0 failing, 0 pinned, 0 new | 328 |
| ws-presets-unit | 2 preset / host skill(s) | PASS | - | 196 (179 waiting) |
| ws-coverage-matrix --skills | 7 skills × kinds × S/M/L | FAIL | 100 of 235 row(s) run × S/M/L: OK 91, RED 9, ERROR 0; PENDING 107, N/A 28; the sibling comparison found counts above the approved siblings: NOT engine red (rule 0b) | 2502 |
| ws-print-lint --source kit --size L (independent defaults; duplicates the matrix's single/defaults row) | 7 skills | PASS | 0 found (7 doc(s)) | 180 (119 waiting) |
| ws-print-lint --source kit --size S (independent defaults; duplicates the matrix's single/defaults row) | 7 skills | PASS | 0 found (7 doc(s), unpinned) | 125 (62 waiting) |
| ws-print-lint --source kit --size M (independent defaults; duplicates the matrix's single/defaults row) | 7 skills | PASS | 0 found (7 doc(s), unpinned) | 120 (65 waiting) |
| ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...) | 7 skills | FAIL | 30 found in 7 of 7 doc(s); 7 (document, lint, rule) count(s) above the pin; lesson page not pinned at L: subtraction:sub_50_no_regroup, subtraction:sub_100_no_regroup, subtraction:sub_1k_no_regroup, subtraction:sub_10k_no_regroup, subtraction:sub_100k_no_regroup, subtraction:sub_1m_no_regroup, … 1 more (must be clean) | 167 (60 waiting) |
| ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...) | 7 skills | FAIL | 34 found in 7 of 7 doc(s); 7 (document, lint, rule) count(s) above the pin; lesson page not pinned at S: subtraction:sub_50_no_regroup, subtraction:sub_100_no_regroup, subtraction:sub_1k_no_regroup, subtraction:sub_10k_no_regroup, subtraction:sub_100k_no_regroup, subtraction:sub_1m_no_regroup, … 1 more (must be clean) | 212 (100 waiting) |
| ws-screen-slots --skills | 7 skills | PASS | 0 found, 0 pinned, 0 new (28 host renders, --baseline design/audit/baselines/screen-slots.json) | 128 (102 waiting) |
| ws-screen-answer --skills | 7 skills | PASS | - | 155 (40 waiting) |
| ws-chromebook-fit --skills | 7 skills | PASS | - | 419 (69 waiting) |
| ws-code-snapshot | all share codes | PASS | - | 4 |
| ws-boot-smoke | app boot | PASS | - | 188 (181 waiting) |
| ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings) | 7 skills: matrix rows with findings | FAIL | worse than siblings: 31 count(s) above the approved siblings in 21 row(s), 0 with no sibling measured, 0 ERROR row(s); 124 at or below (engine) in 51 printed row(s) with findings (OK 33, RED 9, PENDING(no-baseline) 9; siblings per skill: sub_50_no_regroup: 1, sub_100_no_regroup: 1, sub_1k_no_regroup: 1, sub_10k_no_regroup: 1, sub_100k_no_regroup: 1, sub_1m_no_regroup: 1, sub_2d_1d: 1) | 1014 |
| ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap) | 7 skills × matrix rows × S/M/L + extras at S | FAIL | exit SIGTERM (timed out?/killed) | 1883 |
| ws-phone-card (practice card at 390 px: clip, first-box focus) | 7 skills × 390x844, 390x664 | PASS | - | 343 (102 waiting) |
| ws-card-rulings --check rulings (spec card numeric rulings, 300 items) | 7 skills | PASS | - | 11 |
| ws-card-rulings --check offered (panel offers nothing the card bans) | 7 skills | FAIL | ws-card-rulings: FAIL - 28 broken: N-D-nlOn sub_100_no_regroup; N-D-nlOn sub_1k_no_regroup; N-D-nlOn sub_2d_1d; N-D-nlOn sub_50_no_regroup; N-D-nlFrom sub_100_n | 1 |
| ws-dealer-uniform (120 seeded items: digits and values even, page caps, no pinned case position) | 7 skills | PASS | - | 30 |
| ws-node-lint --rules LESSON-DATA,OPTION-HELP,WRONG-FITS (lesson data, option help names only offered values, wrongAnswer fits its slot) | 7 skills | PASS | 0 found, 0 pinned, 0 new | 1 |
| ws-spec-card --check-signed --skill (card signed; every host, role and option value decided) | 7 skills | INCOMPLETE (unsigned card) | needs owner signature: design/cards/stack/stack.md (also 1 other problem(s)), design/cards/subtraction/subtraction.md (also 1 other problem(s)) | 4 |
| ws-options-verify --render (each offered appearance value at S / L vs the default page) | 7 skills × S/L | PASS | 56 value page(s) (7 skill(s) x S/L) against 14 default page(s) through ws-print-lint --source kit in 578 s; 0 n/a | 712 (134 waiting) |

Failing rows (first lines; the full output is in the log):
- **ws-content-audit --skill** (exit 1, `/tmp/claude-0/-home-user-MathQuest/777ba8d1-efd2-5fc4-929a-183f87207bfc/scratchpad/pc2/logs/content-audit.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-content-audit.cjs --skill sub_50_no_regroup,sub_100_no_regroup,sub_1k_no_regroup,sub_10k_no_regroup,sub_100k_no_regroup,sub_1m_no_regroup,sub_2d_1d --category subtraction`
  - `FAIL subtraction/sub_50_no_regroup  "Subtract within 50 (No Regrouping)"`
  - `- [card-ruling] R-ZERO-NOT-SEEDED (card §9.4 (zeros off: never seeded; critic r1 D1 bound 10%)): zeroCase on 13 of 120 items (10.8%; at most 10%); e.g. 40 - 30 = 10 [2 boxes], 40 - 30 = 10 [2 boxes], 50 - 20 = 30 [2 boxe`
  - `ws-content-audit: FAIL - 1 of 7 subtraction/sub_50_no_regroup,sub_100_no_regroup,sub_1k_no_regroup,sub_10k_no_regroup,sub_100k_no_regroup,sub_1m_no_regroup,sub_2d_1d skills, 240 items each, Max Number 100 (1 contradict t`
- **ws-coverage-matrix --skills** (exit 1, `/tmp/claude-0/-home-user-MathQuest/777ba8d1-efd2-5fc4-929a-183f87207bfc/scratchpad/pc2/logs/coverage-matrix.log`); rerun alone: `node tests/scripts/ws-coverage-matrix.cjs --skills subtraction:sub_50_no_regroup,subtraction:sub_100_no_regroup,subtraction:sub_1k_no_regroup,subtraction:sub_10k_no_regroup,subtraction:sub_100k_no_regroup,subtraction:sub_1m_no_regroup,subtraction:sub_2d_1d --baseline design/audit/matrix/baseline.json --slots 2 --out /tmp/claude-0/-home-user-MathQuest/777ba8d1-efd2-5fc4-929a-183f87207bfc/scratchpad/pc2/logs/coverage-matrix.json`
  - `RED subtraction:sub_100_no_regroup|sections/ex-each`
  - `+ S L-WRAP WRAP-OP: 0 -> 2`
  - `+ L L-INK ILLEGIBLE: 0 -> 8`
  - `RED subtraction:sub_100k_no_regroup|sections/defaults`
  - `+ S L-DENSITY H13: 0 -> 2`
  - `RED subtraction:sub_100k_no_regroup|sections/ex-each`
  - `+ M L-DENSITY H13: 2 -> 4`
  - `+ M L-OVERFLOW PG-12: new finding "p5 sticks out of its cell by # mm (cell # x # mm) (PG-#, CL-#)" (0 -> 4; the rule's count did not rise: it replaced a fixed one)`
  - `RED subtraction:sub_10k_no_regroup|mixed/defaults`
  - `+ S L-DENSITY H13: 0 -> 2`
- **ws-print-lint --source kit --roles lesson --size L (the lane skills' own lesson pages: H13, WRAP-OP, ...)** (exit 1, `/tmp/claude-0/-home-user-MathQuest/777ba8d1-efd2-5fc4-929a-183f87207bfc/scratchpad/pc2/logs/print-lint-lesson-L.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --skills subtraction:sub_50_no_regroup,subtraction:sub_100_no_regroup,subtraction:sub_1k_no_regroup,subtraction:sub_10k_no_regroup,subtraction:sub_100k_no_regroup,subtraction:sub_1m_no_regroup,subtraction:sub_2d_1d --baseline design/audit/baselines/print-lint.json`
  - `pin (STATUS note required): node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --skills <skills> --report-only --json <out>, then merge its documents into the pin`
  - `- subtraction:sub_50_no_regroup#lesson L-TOPSTART CL-4b: 0 -> 6`
  - `- subtraction:sub_100_no_regroup#lesson L-TOPSTART CL-4b: 0 -> 6`
  - `- subtraction:sub_1k_no_regroup#lesson L-TOPSTART CL-4b: 0 -> 4`
  - `- subtraction:sub_10k_no_regroup#lesson L-TOPSTART CL-4b: 0 -> 4`
  - `- subtraction:sub_100k_no_regroup#lesson L-TOPSTART CL-4b: 0 -> 2`
  - `- subtraction:sub_1m_no_regroup#lesson L-TOPSTART CL-4b: 0 -> 2`
  - `- subtraction:sub_2d_1d#lesson L-TOPSTART CL-4b: 0 -> 6`
- **ws-print-lint --source kit --roles lesson --size S (the lane skills' own lesson pages: H13, WRAP-OP, ...)** (exit 1, `/tmp/claude-0/-home-user-MathQuest/777ba8d1-efd2-5fc4-929a-183f87207bfc/scratchpad/pc2/logs/print-lint-lesson-S.log`); rerun alone: `tests/scripts/mq-browser-run.sh node tests/scripts/ws-print-lint.cjs --source kit --roles lesson --size S --skills subtraction:sub_50_no_regroup,subtraction:sub_100_no_regroup,subtraction:sub_1k_no_regroup,subtraction:sub_10k_no_regroup,subtraction:sub_100k_no_regroup,subtraction:sub_1m_no_regroup,subtraction:sub_2d_1d --baseline design/audit/baselines/print-lint.S.json`
  - `pin (STATUS note required): node tests/scripts/ws-print-lint.cjs --source kit --size S --roles lesson --skills <skills> --report-only --json <out>, then merge its documents into the pin`
  - `- subtraction:sub_50_no_regroup#lesson L-TOPSTART CL-4b: 0 -> 6`
  - `- subtraction:sub_100_no_regroup#lesson L-TOPSTART CL-4b: 0 -> 6`
  - `- subtraction:sub_1k_no_regroup#lesson L-TOPSTART CL-4b: 0 -> 6`
  - `- subtraction:sub_10k_no_regroup#lesson L-TOPSTART CL-4b: 0 -> 4`
  - `- subtraction:sub_100k_no_regroup#lesson L-TOPSTART CL-4b: 0 -> 4`
  - `- subtraction:sub_1m_no_regroup#lesson L-TOPSTART CL-4b: 0 -> 2`
  - `- subtraction:sub_2d_1d#lesson L-TOPSTART CL-4b: 0 -> 6`
- **ws-sibling-compare (rule 0b: every printed row with findings vs the paired approved siblings)** (exit 1, `/tmp/claude-0/-home-user-MathQuest/777ba8d1-efd2-5fc4-929a-183f87207bfc/scratchpad/pc2/logs/sibling-compare.log`); rerun alone: `node tests/scripts/ws-sibling-compare.cjs --run /tmp/claude-0/-home-user-MathQuest/777ba8d1-efd2-5fc4-929a-183f87207bfc/scratchpad/pc2/logs/coverage-matrix.json --skills subtraction:sub_50_no_regroup,subtraction:sub_100_no_regroup,subtraction:sub_1k_no_regroup,subtraction:sub_10k_no_regroup,subtraction:sub_100k_no_regroup,subtraction:sub_1m_no_regroup,subtraction:sub_2d_1d --run-siblings --json /tmp/claude-0/-home-user-MathQuest/777ba8d1-efd2-5fc4-929a-183f87207bfc/scratchpad/pc2/logs/sibling-compare.json`
  - `ABOVE      subtraction:sub_100_no_regroup|sections/ex-each S L-DENSITY PG-23: ours 2, siblings max 0 (sub_100_regroup 0)`
  - `ABOVE      subtraction:sub_100_no_regroup|sections/ex-each M L-DENSITY PG-23: ours 2, siblings max 0 (sub_100_regroup 0)`
  - `ABOVE      subtraction:sub_100_no_regroup|sections/ex-group S L-DENSITY PAGEFILL: ours 2, siblings max 1 (sub_100_regroup 1)`
  - `ABOVE      subtraction:sub_100_no_regroup|sections/ex-group S L-DENSITY PG-23: ours 2, siblings max 0 (sub_100_regroup 0)`
  - `ABOVE      subtraction:sub_100_no_regroup|sections/ex-group M L-DENSITY PG-23: ours 2, siblings max 0 (sub_100_regroup 0)`
  - `ABOVE      subtraction:sub_100_no_regroup|sections/ex-group L L-DENSITY H13: ours 4, siblings max 0 (sub_100_regroup 0)`
  - `ABOVE      subtraction:sub_100_no_regroup|single/more-cols2+nline+afterpage M L-DENSITY H13: ours 16, siblings max 12 (sub_100_regroup 12)`
  - `ABOVE      subtraction:sub_100_no_regroup|single/more-cols2+nline+short M L-DENSITY H13: ours 8, siblings max 6 (sub_100_regroup 6)`
  - `ABOVE      subtraction:sub_100_no_regroup|single/more-cols2+short+afterpage M L-DENSITY H13: ours 8, siblings max 6 (sub_100_regroup 6)`
  - `ABOVE      subtraction:sub_100k_no_regroup|sections/ex-each M L-DENSITY PAGEFILL: ours 1, siblings max 0 (sub_100k_regroup 0)`
- **ws-slot-clip (SLOT L-ANSAREA + CLIP L-OVERFLOW on every matrix row + test / more-practice / supports-on pages, box width, head overlap)** (exit SIGTERM, `/tmp/claude-0/-home-user-MathQuest/777ba8d1-efd2-5fc4-929a-183f87207bfc/scratchpad/pc2/logs/slot-clip.log`); rerun alone: `node tests/scripts/ws-slot-clip.cjs --run /tmp/claude-0/-home-user-MathQuest/777ba8d1-efd2-5fc4-929a-183f87207bfc/scratchpad/pc2/logs/coverage-matrix.json --skills subtraction:sub_50_no_regroup,subtraction:sub_100_no_regroup,subtraction:sub_1k_no_regroup,subtraction:sub_10k_no_regroup,subtraction:sub_100k_no_regroup,subtraction:sub_1m_no_regroup,subtraction:sub_2d_1d --run-siblings --slots 2 --json /tmp/claude-0/-home-user-MathQuest/777ba8d1-efd2-5fc4-929a-183f87207bfc/scratchpad/pc2/logs/slot-clip.json`
  - `ws-slot-clip: batch 33/39: 9 document(s) in 92.6 s`
  - `ws-slot-clip: batch 36/39: 9 document(s) in 56.5 s`
  - `ws-slot-clip: batch 35/39: 9 document(s) in 64.5 s`
  - `ws-slot-clip: batch 38/39: 9 document(s) in 68.5 s`
  - `ws-slot-clip: batch 37/39: 9 document(s) in 74.2 s`
  - `ws-slot-clip: batch 39/39: 6 document(s) in 36.7 s`
- **ws-card-rulings --check offered (panel offers nothing the card bans)** (exit 1, `/tmp/claude-0/-home-user-MathQuest/777ba8d1-efd2-5fc4-929a-183f87207bfc/scratchpad/pc2/logs/card-not-offered.log`); rerun alone: `node tests/scripts/ws-card-rulings.mjs --skill subtraction:sub_50_no_regroup --skill subtraction:sub_100_no_regroup --skill subtraction:sub_1k_no_regroup --skill subtraction:sub_10k_no_regroup --skill subtraction:sub_100k_no_regroup --skill subtraction:sub_1m_no_regroup --skill subtraction:sub_2d_1d --check offered`
  - `FAIL subtraction:sub_100_no_regroup       N-D-nlOn           (§7a (decision, PROPOSED: §7 (support ladder))) offers "nlOn" (Show the number line), which the card lists as not offered`
  - `FAIL subtraction:sub_1k_no_regroup        N-D-nlOn           (§7a (decision, PROPOSED: §7 (support ladder))) offers "nlOn" (Show the number line), which the card lists as not offered`
  - `FAIL subtraction:sub_2d_1d                N-D-nlOn           (§7a (decision, PROPOSED: §7 (support ladder))) offers "nlOn" (Show the number line), which the card lists as not offered`
  - `FAIL subtraction:sub_50_no_regroup        N-D-nlOn           (§7a (decision, PROPOSED: §7 (support ladder))) offers "nlOn" (Show the number line), which the card lists as not offered`
  - `FAIL subtraction:sub_100_no_regroup       N-D-nlFrom         (§7a (decision, PROPOSED: §7 (support ladder))) offers "nlFrom" (Starts at), which the card lists as not offered`
  - `FAIL subtraction:sub_1k_no_regroup        N-D-nlFrom         (§7a (decision, PROPOSED: §7 (support ladder))) offers "nlFrom" (Starts at), which the card lists as not offered`
  - `FAIL subtraction:sub_2d_1d                N-D-nlFrom         (§7a (decision, PROPOSED: §7 (support ladder))) offers "nlFrom" (Starts at), which the card lists as not offered`
  - `FAIL subtraction:sub_50_no_regroup        N-D-nlFrom         (§7a (decision, PROPOSED: §7 (support ladder))) offers "nlFrom" (Starts at), which the card lists as not offered`
  - `FAIL subtraction:sub_100_no_regroup       N-D-nlTo           (§7a (decision, PROPOSED: §7 (support ladder))) offers "nlTo" (Ends at), which the card lists as not offered`
  - `FAIL subtraction:sub_1k_no_regroup        N-D-nlTo           (§7a (decision, PROPOSED: §7 (support ladder))) offers "nlTo" (Ends at), which the card lists as not offered`

ws-precritic: FAIL: 7 FAIL, 16 PASS, 1 N/A, 0 SKIPPED-NOT-BUILT, 1 SKIPPED / INCOMPLETE (no or partial rulings) of 25 (FAIL: content-audit, coverage-matrix, print-lint-lesson-L, print-lint-lesson-S, sibling-compare, slot-clip, card-not-offered; N/A (ran, nothing to check): providers; SKIPPED / INCOMPLETE (no or partial rulings: not all checked, not passed): spec-card-signed)
