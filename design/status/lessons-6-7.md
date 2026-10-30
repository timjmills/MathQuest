Lane: lessons-6-7
Title: Detailed lessons 6 (g4-nbt1-ten-times-value) and 7 (g3-oa8-two-step-wp), work order item 2
Session: session_013pHDnLgZ4iWmoXfjQ2jNTN
Branch: claude/sweet-newton-c8wrv1-lessons-6-7
Owner of files: js/modules/lessons/detailed/g4-nbt1-ten-times-value.js, g3-oa8-two-step-wp.js; cells/pv-times.js; word-work frames/choose layouts; design/lesson-planner/lessons/{g4-nbt1-ten-times-value,g3-oa8-two-step-wp}/
State: paused
Updated: 2026-10-30
Builder profile: mq-opus-medium (lesson 6 fix r4), mq-opus-low (lesson 7 build r2, msChoose)
Critic rounds: lesson 6: 3, r3 PASS (min 8/8/8/8); lesson 7: 1, r1 FAIL (min 8/7/7/7)

## Now
- PAUSED by the owner 2026-10-30 after this critic round (no fix round). Lesson 6 PASSED and is ready to go live from this branch.
- Lesson 7 waits for one fix round (D1-D3 below), then its critic r2. Lessons 8-10 are at the end of the plan.
- Not deployed. Hand-over below.

## Owner go

## Open questions
- The owner's 2026-10-17 "Skill coverage rule" pointer (commit c922be81) is not in today's CLAUDE.md (kept today's version per the
  work order); the rule itself is in design/lesson-planner/DETAILED_MAKER.md "Skill coverage rule". Lead: re-add the pointer to CLAUDE.md?
- Lesson 7 build-r2 questions 2-3 (design/lesson-planner/lessons/g3-oa8-two-step-wp/build-r2.md): msCheck estimates + / - stories only
  (enough for the 3.OA.D.8 reasonableness clause?); P0 dropped its x-facts band to fit (facts on P0 would cost a story band).
- The algebra:multi_step_word(_plain) skill has never had its own 8/10 redesign: its skill precritic fails 6 rows (no prereqs.js
  lesson data -> "No lesson data", phone-card first-box focus, no approved sibling, wpBank page 54 mm empty strip). Needs a family lane.
- Lesson-7 presets have no SKILL_WRM tag (no WRM small step teaches 3.OA.D.8; site lesson linked `direct`). Critic n-item; accept or tag wrmNear?

## Times
Times: critic lesson-6 r3 + lesson-7 r1, start 2026-10-30T20:12Z, end 2026-10-30T20:28Z, profile mq-opus-medium
Times: builder lesson-7 msChoose + pre-critic gates, start 2026-10-30T19:10Z, end 2026-10-30T20:10Z, profile mq-opus-low
Times: builder lesson-6 fix-r4, start 2026-10-30T17:45Z, end 2026-10-30T19:23Z, profile mq-opus-medium
Times: builder lesson-7 build-r2, start 2026-10-30T17:45Z, end 2026-10-30T18:50Z, profile mq-opus-low

## Hand-over (2026-10-30)

### Done
| Item | Commits | Verdict |
|---|---|---|
| Lesson 6 code from wip-detailed-lessons-2 (c2a6d8b4 f0990693 88f7d2d0 + critics 712592e2 e825ec7b, audit 2905f912, research 9051b4f8 1f5ec74a) | bebb7212..447beaff | — |
| Lesson 7 from the paused helper's patches (round 1 git am, round 2 partial patch) | 2dd1bc54, 0fc1f13b | — |
| Lesson 7 build r2: gate green, P0/P3/P6 fits, script quotes 1./2., 5 presets ZA-ZE | 0cb61ef2 | — |
| Lesson 6 fix r4: r2 D2 `tenChoice` (4J), E41 relation check + backtest `e41-relation`, n2/n3/n9, presets Y7-Y9, gate drift fix (E11 top cells, E29 number tabs, T6 glance 1/2/3) | 2b2904a2 | — |
| Lesson 7 Check Question A-D online: `msChoose` (4T) | 92cd31f3 | — |
| Critic: lesson 6 r3, lesson 7 r1 | e2994615 | **L6 PASS 8/8/8/8 · L7 FAIL 8/7/7/7** |
| Lesson 6 record passed, screenshots for the lead | 42b2f363 | — |

Screenshots: design/status/lessons-6-7/lesson6/page-01..23.png, design/status/lessons-6-7/lesson6-teacher-print-screen.png.
Side effect worth keeping: lessons 1, 3a, 4, 5 are green again on `ws-detailed-lesson --check` (the 10-23 kit rulings had turned them red).

### What remains — lesson 7 (one fix round, builder mq-opus-medium: it failed a round), then critic r2
Full list: design/lesson-planner/lessons/g3-oa8-two-step-wp/critic-r1.md.
- **D1** anchor charts P2 / P2b drawn at zoom 0.77 / 0.7 by `chartPage`'s silent fallback (roles/lesson.js): stories 12-13 pt, digits
  under the step titles, room left over. Fix the sizing; make the role return `sizing.mode` and have ws-detailed-lesson FAIL on the fallback.
- **D2** fact-family / story-frame repeats (chart 20 ÷ 4 marbles vs P4-2 20 ÷ 5 marbles, retrieval 4 × 5; 6 × 4 = 24 vs 24 ÷ 6 vs the
  exit's "24 buttons shared"; Zara on 5 items). E24 keys `20÷4` and `20÷5` apart: key × / ÷ items by the unordered family {a, b, a·b}
  plus a frame key; add backtest row `e24-family` from this pack.
- **D3** T5 §9 says "No step boxes this time" over a P5 that prints Step 1 / Step 2 boxes.
- 12 minors (T1 "Flow: Standard" though chunked; P2b second example 18 ÷ 2 dealt but printed nowhere; singular "marble" in a plural
  bank; P5 Say names the Step 2 operation; P1 is G1-2 place value; `two_step_estimate_check` ~0.8 % answer = a story number).
- Lesson 6 minors to sweep with it (critic-r3.md): n1 near-look 92,163 / 92,715 back on P4-2; n2 T3 "4000" without comma; P3
  Independent is a T / O pair; T6 names a mistake T2 does not list.

### What remains — lessons 8-10 (end of the plan; wait for the vocabulary redesign)
| # | Lesson | Research | Waits on |
|---|---|---|---|
| 8 | g4-nbt5-mult-div-tens (4.NBT.B.5/6: × and ÷ multiples of 10 from basic facts) | lessons/g4-nbt5-mult-div-tens/RESEARCH.md | vocabulary redesign |
| 9 | g5-nbt1-digit-value-tenths (5.NBT.A.1: 10 × and 1/10 of a digit, decimals) | lessons/g5-nbt1-digit-value-tenths/RESEARCH.md | vocabulary redesign; reuse lesson 6's `pv-times` + ten* options |
| 10 | g5-nbt3-decimal-word-expanded (5.NBT.A.3a: decimals in words and expanded form) | lessons/g5-nbt3-decimal-word-expanded/RESEARCH.md | vocabulary redesign |
Dependency: design/IMPROVEMENT_PLAN.md "Vocabulary redesign and the graphic library" — every lesson sheet prints a Vocabulary band and
draws pictures, so 8-10 (and the lessons engine, work order 5) build once the vocabulary cards and the representation-choice rule
(design/specs/visual-redesign-2026-10-30.md, design/GRAPHIC_LIBRARY.md — neither had landed on 2026-10-30) exist. The owner's 10-17
change "Vocabulary band = words labelled A B C, a letter box under each picture" is still only a partial patch:
design/lesson-planner/wip-2026-10-17/vocab-letters.uncommitted.patch.
Process per lesson: research is done → build to the gate (builder mq-opus-medium for the first lesson on a new drawing, else low) →
`ws-detailed-lesson --check` + `--repeats` + precritic → one critic → screenshots to the lead on pass.

### What remains — lesson work in general
- **Skill coverage of lessons 1-5** (owner rule 2026-10-17): design/lesson-planner/lessons/SKILL-COVERAGE-AUDIT-1-5.md, "none passes yet".
  Partial patches: design/lesson-planner/wip-2026-10-17/laneA-coverage-lessons-1-3.uncommitted.patch (the shared `which-right` Check
  Question response + lessons 1-3 gaps) and laneB-coverage-lessons-4-5.uncommitted.patch. Lessons 6 (`tenChoice`) and 7 (`msChoose`)
  built per-skill Check Question choices; a shared `which-right` response would replace both — decide before lessons 8-10.
- **Lesson 2** fails ws-detailed-lesson E9 on main (P6 exit slip +5 mm, the 10-25 word-work tab spacing).
- **precritic --role lesson** red on main: `placevalue:more_less_10#lesson L-OVERLAP CL40-INK 0 -> 2` (L and S). Blocks "clean before
  critic" for every lesson lane until fixed or pinned.
- **Gate drift guard** (speed-audit): add the passed lessons' `ws-detailed-lesson --check` to ws-deploy-gates so a kit ruling cannot
  silently break them again; proposed checks from both critics (Check Question choice count = board A-D count; chart fallback FAIL;
  family-keyed E24; "no X" script vs page; bare 4+ digit numbers on teacher pages; same-page near-looks).
- **Kit**: layout.js `headerHeightMm` still budgets 3 mm for the removed header tab box (left alone, kit-wide).

### Cost
Session cost_usd $51.97 at 20:40Z (≈ 1.9 % of the weekly limit at $28 ≈ 1 %), lane budget ~$150. Subagent runs: lesson 6 builder
(~0.41M tokens, 98 min), lesson 7 builder (~0.31M, 64 min), msChoose builder (~0.19M, 61 min), critic (~0.31M, 16 min).

## Log
- 2026-10-30 20:45Z: critic r3 lesson 6 PASS, r1 lesson 7 FAIL (e2994615). Lesson 6 recorded passed, screenshots, lead told. Lane paused by the owner; hand-over above.
- 2026-10-30: Lane started. Cherry-picked from wip-detailed-lessons-2: research 9051b4f8 1f5ec74a; lesson 6 c2a6d8b4, critic r1 712592e2,
  coverage audit 2905f912, fix r2 f0990693, critic r2 e825ec7b, fix r3 88f7d2d0 (c922be81 = CLAUDE.md only, kept today's). Brought the
  paused helper's patches (design/lesson-planner/wip-2026-10-17/), applied lesson7-round1-b533d103.patch (git am, 3 conflicts:
  DETAILED_MAKER notes and codec keys 4H/4I vs 4P/4Q, both kept) and lesson7-round2.uncommitted.patch (partial; _dbg7.cjs dropped).
  Visual redesign spec / graphic library not on claude/sweet-newton-c8wrv1 yet: built to today's standards.
  Gate state at start: lesson 6 E9b, E11, E29 FAIL; lesson 7 E9, E9b, E20, E29 FAIL; repeats OK for both; precritic --role lesson:
  placevalue:more_less_10 L-OVERLAP CL40-INK 0 -> 2, Size S row timed out at the 580 s wall.

### pre-critic gates 2026-10-30 (merged)

Lesson 7 Check Question A-D now dealt online: algebra:multi_step_word(_plain) option msChoose (4T).

| Gate | Result |
|---|---|
| ws-detailed-lesson --lesson g4-nbt1-ten-times-value --check --copy | OK |
| ws-detailed-lesson --lesson g4-nbt1-ten-times-value --repeats | OK (35 places, 0 findings) |
| ws-detailed-lesson --lesson g3-oa8-two-step-wp --check --copy | OK |
| ws-detailed-lesson --lesson g3-oa8-two-step-wp --repeats | OK (29 places, 0 findings) |
| ws-precritic --role lesson --strict | FAIL, only row: placevalue:more_less_10#lesson L-OVERLAP CL40-INK 0 -> 2 (L and S), the same row as on main fbeaa332 |
| ws-boot-smoke | OK |
| ws-code-snapshot | OK (731 codes, +159 appended, nothing moved, 3200 option round trips) |
| ws-content-audit --category algebra | OK (0 failing) |
| ws-content-audit --category placevalue | OK (0 failing) |
| ws-standards | OK |
| ws-search-terms | OK (715 skills, 239/239) |
| ws-presets-unit | OK (123 presets) |
| ws-wrm-page-unit | OK (1067 lessons) |
| ws-backtest | OK (40 PASS, 0 FAIL) |
| ws-redesign-passed | OK (7 skills) |
| ws-screen-answer multi_step_word(_plain) msChoose (mult / div / multdiv) | OK card / worksheet / quiz |
| node --input-type=module --check, touched JS | OK |
