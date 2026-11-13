# Critic r1: lf-tools (A no phone width + B copy-light / batch), 91182e61..f3ae7acca, graded at f3ae7acca (frozen)

Independent critic, Opus medium, 2026-11-13. Worktree /tmp/claude-0/wt-tc (+ wt-tc-base at 91182e61), removed at the end.
Browser runs through /tmp/mq-browser-run.sh, at most two at a time. No tracked file edited except this report.

**VERDICT: FAIL (both changes).** A: C1 8 · C2 7 · C3 8 · C4 8. B: C1 6 · C2 7 · C3 7 · C4 7.

Criteria (as critic-r2-narrow): C1 verdicts correct · C2 no false alarms / holes · C3 tests, self-tests, plan green · C4 notes, briefs, runtime clear.

## Evidence (node)
| Run | Result |
|---|---|
| self-tests: ws-copy-light (24), ws-no-phone-width (20), ws-screen-ink-size, ws-screen-slots, ws-empty-band, ws-precritic (incl. copy-light), ws-precritic-plan (48) | all OK |
| ws-no-phone-width at f3ae7acca / 91182e61 | OK (17 files) / FAIL (21) |
| ws-precritic-plan; --checks-from-critics | OK (158 rows); 70 pass / 25 exempt / 15 fail, none lf-tools |
| ws-copy-light add_sub_10s / time_5min | ELIGIBLE (fact, anchor add_facts) / NOT (clock never passed) - as claimed |
| --batch compare, more_less_10, more_less_100 | BATCH OK on pv; two runs byte-identical (cmp) |
| --batch compare, add_sub_10s, more_less_10 | BATCH FAIL (mixed templates), exit 1 |
| probe: kit template x payload kind over every live skill (8 items each) | pv has 20 kinds, only 6 drawn by a passed skill; word-work layout=frames and the no-layout word-work never passed |
| ws-copy-light placevalue:compare | **ELIGIBLE** although it draws pv kind=compare, which no passed skill draws (D1) |
| ws-phone-card div_facts, unit_form (defaults 820x1180, 1024x768) | OK 12/12 + A14 siblings, 86 s; the 1024 card renders the real landscape card (looked at the PNG) |
| ws-grade-render --gate div_facts, unit_form independent M | OK; card-1280/1366x768/820/1024 + worksheet/quiz shot; card-1024 full-page shot is the real card (no hole) |
| meta.json probe | unit_form **worksheet-1280 answer inputs 50 x 46 px** (no gate measures a worksheet / quiz on a tablet) |
| ws-screen-slots --screen-digit, f3ae vs 91182e61 | both FAIL: div_facts worksheet 40 px and **unit_form worksheet 29 px** (= the standard's own worksheet size, SP table) now at 4 widths (was 2 + 390) |
| ws-boot-smoke | OK |
| ws-backtest --row vq-r2-render-gate | PASS |
| ws-backtest vocab-v23-v25-screen-feedback, vocab-v23-painted (moved to 820) | pass state FAIL (V23 print-hash pin misses); base check running |
| same vocab-v23 row run from 91182e61 (390 tool) | also not PASS: the row was already red; the move to 820 is therefore unproven on the 3 ws-vocab-unit rows |
| ws-backtest --row (12 rows, 1169 s) | 7 PASS: vq-r2-render-gate (explicit 390), vocab-r9-nb6, r9-nb7, r10-nb8, r12-nb9 (moved to 820), no-phone-width-default, copy-light-eligibility. 5 FAIL, all with pass state red: vocab-o1-next-box-blue, r11-nb9-blur, v23-v25, v23-painted, r8-v25plus (later NB / V checks and print-hash pins). r11 and v23 rows run from 91182e61 (390 tool): same red. Every moved row's FAIL state still FAILs: nothing weakened, but 5 of 9 moves are unproven |

## Verified
- No screen-host gate on the guard's list defaults to 390. An explicit `--widths 390` / `--sizes 390x...` still runs (vq-r2-render-gate PASS, the phone-card-pilot sizes kept).
- The floors 56 px (1280 / 1366) and 48 px (1024 / 820) are the SP table's brackets (40 / 48 / 56 at 375 / 768 / 1440). They are sensible, and 1024 takes the lower bracket, which is conservative.
- The tablet card check is meaningful at 1024 x 768: CLIP / FOCUS / INVIEW / TOUCH read the real landscape card. The full-page shot when `#gameView` has no box is not a hole.
- On div_facts and unit_form at the new defaults there are no new false alarms in phone-card, grade-render --gate or empty-band. The only reds are the pre-existing worksheet digits (below).
- Copy-light: add_sub_10s is eligible, time_5min is not. The mixed batch FAILs and the pv batch passes. The sample is byte-identical over two runs and covers every role, host and option value of one skill.
- RUBRIC routes 3-4 match the owner rule (first skill full; any layout defect escalates).

## Defects
- **B1 (B C1, major): eligibility is per template id, not per drawing.** `pv` has 20 payload kinds, but only 6 are drawn by a passed skill. **placevalue:compare (kind=compare, never passed) reads ELIGIBLE**, and so does the builder's own pv batch. Once cards are signed, the round / sort / estimate / order kinds would follow (word-work `layout=frames` likewise). This breaks "the first skill of each new drawing gets the full critic". **Check:** key the template as `template/kind` (payload kind / task / layout), so an anchor must draw the same kind. Add a self-test case (pv/compare vs pv/expand: NOT ELIGIBLE) and a backtest row on placevalue:compare.
- **B2 (B C2): the sample never shows 1366 or 1024.** In a batch every screen page is 1280: `wi` resets per skill, so no batch skill is seen on a tablet. **Check:** a sample self-test that every screen width in SCREEN_WIDTHS appears at least once in single and batch mode.
- **B3 (B C4): the samples cannot be rendered as written.** ws-grade-render reads neither `{skills:[{skill,pages}]}` nor a per-page seed or width, so the "deterministic" seeds are decorative and the critic has to hand-build 20-38 renders. **Check:** `ws-grade-render --sample <copy-light json>` honouring role / size / seed / host / width / opts, plus a backtest row rendering one sample.
- **B4 (B C4): critic-copy-light.md misnames all four criteria.** It says C1 "correct maths", C2 "one thing at a time", C3 "design contract", C4 "works for the pupil". RUBRIC has C1 Ease of use, C2 Educational value, C3 Spacing and layout, C4 Standard fidelity. As written, the "C3/C4 inherited" line points at the wrong criteria. **Check:** a lint that brief criterion names equal the RUBRIC `### C1..C4` headings.
- **B5 (B C3): the copy-light backtest row's FAIL state is only "no --copy-light flag" (usage).** It proves no wrong eligibility is refused. **Check:** a fail state on B1 (compare ELIGIBLE at f3ae7acca, NOT after the fix).
- **B6 (minor): option values scan 2 items each, so a template drawn rarely by an option can be missed** (round_sort_100 pv-support is 2/26). Also, no-card skills are refused with "roles not on anchor's card" when the real fix is "sign a card". **Check:** scan until each option value's template set is stable (or 8 items); add a reason line "no signed card".
- **A1 (A C2): the 48 px tablet touch target is gated only on the practice card.** The online worksheet and quiz are rendered only at 1280 for touch, and unit_form's worksheet answer inputs measure 50 x 46 px. A pupil on a tablet uses them too (owner: "answer boxes keep 48 px touch targets for tablets"). **Check:** ws-grade-render / ws-phone-card TOUCH on worksheet and quiz at 820 / 1024.
- **A2 (A C2): ws-no-phone-width reads a hand-kept FILES list.** A new screen gate with a 390 default passes it, and the deploy gates ws-teacher-wrm / ws-student-explorer still render 390 (the builder routed them; fine, but the guard cannot see them). **Check:** scan every tests/scripts file that ws-precritic or ws-deploy-gates.sh calls, with an explicit allow list for teacher-UI phone tests.
- **A3 (A C2/C4, pre-existing, now at 4 widths): SCREEN-DIGIT judges the online worksheet against card floors.** unit_form worksheet 29 px (exactly SP's worksheet size) FAILs at 1280 / 1366 / 820 / 1024. The status names only div_facts. **Check:** the worksheet host takes SP's 29 px floor, with a self-test case.
- **A4 (A C4): the status says 9 rows "moved to 820" without saying 5 are red at both commits.** **Check:** ws-backtest on moved rows reported in the status, so a red row is named as unproven.

## Scores
- **A C1 8:** the verdicts read right and the floors are sound. **C2 7:** the tablet touch hole (A1), the hand list (A2) and the worksheet false alarm (A3). **C3 8:** the self-tests and plan are green and no row is weakened. **C4 8:** clear notes, with one omission (A4).
- **B C1 6:** a never-passed drawing is eligible (B1). **C2 7:** B2, B6. **C3 7:** the self-tests are green but the backtest is vacuous (B5). **C4 7:** B3, B4.
