# g3-oa8-two-step-wp — build round 2 (2026-10-30)

Builder: Opus, lesson-7 lane on `claude/sweet-newton-c8wrv1-lessons-6-7`. Starting point: `2dd1bc54` (round 1) +
`0fc1f13b` (round 2 applied from the paused helper's partial patch, never tested). Goal: clean before critic r1.

## What changed and why

### Gate failures (ws-detailed-lesson --check)

| Failure | Cause | Fix |
|---|---|---|
| E9 / E9b / E20 / E29 P0: item 7 spilled to P0-2 (29 % / 70 % empty) | Four bands (× facts 52.6 mm, × story 54.6, ÷ story 54.6, two-step story 74.6 mm) = 236.4 mm on a 232 mm body; the role never shrinks | `g3-oa8-two-step-wp.js:143-149` the × fact band is dropped from P0 (atom 1, × facts, is checked in Spaced retrieval §3 and inside every Check story's Step 1; T2 note says so). P0 = 1 × story, 2 ÷ stories (sharing and grouping), 1 two-step + / − story: 4 items, one page, 4 % empty |
| E29 P6 has no item a / b; T6 routing names 7 | Items are number tabs since CL-11a; the scripts quoted letters | `:322` T5 §10 note `1. … · 2. …`; mistakes / wrong answers say Exit 1 / 2; routing renumbered by the P0 change |
| E9 P6 +8 mm (both halves and key) | Two four-line stories with two frame rows each + the tab spacer above each story | `sheet/cells/word-work.js:1116-1118` + `css/sheet-kit.css` (appended, additive): a frames cell sets its story in a gutter beside the item tab (`padding-left: tab + 1 mm`), so it takes no tab spacer; the measuring cell matches. Type size unchanged |
| E9 P3 / P3b +3 mm | Two-step stories printed at line-height 1.4 (the WDS says 1.3, TY-13 / AX-3) | `sheet/cells/word-work.js:832-834`: a two-step story prints at 1.3; one-step stories untouched |
| T2 spilled to T2-2 (21 %) after the P0 change | Longer atom note; duplicate "Story number in Step 2" mistake row | Atom 1 note shortened; the exit-2 row merged into the Check Question B row (`caught: 'Exit 2'`) |

### Self-review (critic's eye), fixed

- **Retrieval 33 ÷ 3 = 11** (beyond 10 × 10): `:190` `minNum: 2, maxNum: 10` on the quotient.
- **P3b both stories shared 30** (30 ÷ 6, 30 ÷ 5): `sheet/roles/lesson.js:608-611` Guided picks (`guidedWants`) never share a
  Step 1 number, a Step 1 answer or a turned pair with each other or the chart example (`msTwin`; two-step items only).
- **Materials**: 40 counters cannot show 5 × 9 = 45; now 60 (`:200`; the largest groups story is 6 × 9 = 54).
- **T4 §6a row 4** stated a literal (`+` / `−`) instead of the dealt cell's sign: now `Expected: [[{we.1.op2}]]` (`:282`).
- **P5 Say** had no blank: now "My Step 1 answer is __. Then I take away." keyed `{wp.s1}` (`:170-172`; P5 key shows 35).
- **T6 Answers at a glance**: printed an empty "P3b Independent" row and quoted the exit as `a. b.`:
  `print-sheet.js:4402` (no row for a chunk with no Independent cells, as P3 already did) and `:4420` (`1. 2.`, CL-11a).
  Both are shared: lessons 1-6 glance rows now say `1.` / `2.` too (correct by CL-11a; no gate reads it).
- **Round 2 code reviewed**: msOps addmult / adddiv guards (no story number as answer, Step 1 answer not a story number),
  msLetter brackets when + or − first, msCheck only on + / − stories, the frames screen twin. No defect found.

### Owner rules: presets (a distinct option is also a findable skill)

| Option value | Decision | Why |
|---|---|---|
| msOps `multdiv` | PRESET `algebra:two_step_mult_div_first` (ZA) | This lesson: a × or ÷ step then + or −; a teacher titles it as its own lesson, the school site names it (G3 two-step four ops) |
| msOps `mult`, `div` | option only | The two chunks of the same lesson (one new thing per chunk), not separate lessons |
| msOps `addmult` | PRESET `algebra:two_step_add_then_mult` (ZB) | A follow-on lesson: brackets, (5 + 3) × 4 |
| msOps `adddiv` | PRESET `algebra:two_step_add_then_div` (ZC) | A follow-on lesson: (12 + 18) ÷ 5; a different situation from addmult (share a sum) |
| msLetter | PRESET `algebra:two_step_letter_equation` (ZD, with msOps multdiv) | A clause of 3.OA.D.8 taught as its own lesson; a new task (one equation with n) |
| msCheck | PRESET `algebra:two_step_estimate_check` (ZE) | A clause of 3.OA.D.8 (reasonableness, rounding), its own lesson; a new task |
| wpFrames | option only | A scaffold fade (column boxes off, one number sentence a step) |

Each preset: label + grade 3 (`data.js`, appended), `skill-presets.js`, code pinned in `skill-codes-frozen.js` (ZA-ZE:
VH is the dropped draft, and Y7-Y9 are left to the parallel lesson-6 lane so the branches cannot collide),
`SKILL_STANDARDS` 3.OA.D.8 + 4.OA.A.3 / M.EE.3.OA.7 + M.EE.4.OA.3, `SKILL_TERMS` (6-8 each). No `SKILL_WRM`: no WRM small
step teaches a × / ÷ two-step story at this level (Y4.B10.S5 money, Y6.B7.S8 equations are neighbours, linked instead).
Links (`data/curriculum/links/`): Y4 school lesson G3 two-step four ops now `direct` with all five (verdict direct);
related / pre added at Y2.B4.S10, Y3.B2.S20, Y4.B2.S9, Y4.B10.S5, Y6.B7.S8 (pre), Y6.B7.S10.
`standards-audit.js:123` 3.OA.D.8 stays FULL (it was flipped in round 2); its skill list now names the presets. Truly
dealt: two-step four ops (msOps), letter equation (msLetter), rounding check (msCheck, + / − stories only — see Q2).
`data/curriculum/detailed-lessons.json`: lesson 7 recorded (`skills.used` every role; `skills.coverage` full or
`elsewhere: <preset>` rows, no partial).

### Skill coverage (screen)

`ws-screen-answer --skills algebra:multi_step_word_plain --opts …` card / worksheet / quiz all OK for
`{msOps: mult}`, `{msOps: div}`, `{msOps: multdiv, wpFrames: true}`, `{msOps: multdiv, msLetter: true}`,
`{msOps: addsub, band: 100, msCheck: true}`, `{msOps: addmult}`, `{msOps: adddiv, msLetter: true}`,
`{forms: [0], band: 30, wpFrames: true}` (P0 4).

## Gates (on the branch, seed 4242)

| Gate | Result |
|---|---|
| ws-detailed-lesson --lesson g3-oa8-two-step-wp --check (--copy) | OK (E1-E40 all PASS) |
| ws-detailed-lesson --repeats | OK (29 places, 0 findings) |
| ws-precritic --skill algebra:multi_step_word_plain --strict | FAIL, 6 gates; all because the skill has never been through the 8/10 redesign: no prereqs.js lesson data (the lesson role prints "No lesson data", plus L-INK / L-OVERFLOW / DN-2), phone-card first-box focus, sibling-compare NO-SIBLING, wpBank=true PAGEFILL (Q5) |
| ws-precritic --skill algebra:multi_step_word --strict | not run (same host code as _plain; the same 6 expected) |
| ws-precritic --role lesson --strict | FAIL only on the known placevalue:more_less_10 L-OVERLAP CL40-INK 0 -> 2 (lesson-6 lane) |
| ws-boot-smoke | OK |
| ws-code-snapshot | OK (728 codes, +156 appended, nothing moved) |
| ws-presets-unit | OK (120 presets) |
| ws-content-audit --category algebra | OK |
| ws-standards | OK (exit 0) |
| ws-search-terms | OK (712 skills, 239/239 queries) |
| ws-wrm-page-unit | OK (1067 lessons) |
| ws-wrm --report-only | runs (gaps listed, by design) |
| node --input-type=module --check, every touched JS | OK |

## Open questions for the lead

1. **Check Question A-D online.** The Check Question is a board item (multi_step_word_plain msOps mult, the same story
   the skill deals). Online the skill is production (the step boxes), never a choice among the three two-step errors.
   Lessons 1-5 passed with the same board pattern; if the critic reads rule 1 strictly, an `msChoose` response option is
   the build.
2. **msCheck covers + / − stories only** (rounding × / ÷ stories to tens is not a Grade 3 estimate). 3.OA.D.8's
   reasonableness clause is FULL on that reading; say if the owner wants a × / ÷ estimate too.
3. **Shared changes** (kept small): the frames-cell tab gutter (CSS appended + word-work.js), the two-step story line
   height 1.3, `msTwin` in pickWeDo, the glance `1.` / `2.` and empty-chunk row. Lessons 1-5 E11 P0 failures on main
   are not from these (they predate this lane); I did not touch P0 role code.
4. P0 dropped the × fact band: four bands do not fit one page unless content shrinks. If the owner wants the facts on
   P0, one of the three story bands has to go instead.
5. **Precritic --skill multi_step_word(_plain) is not clean, and a lesson builder cannot clean it.** The skill's own
   standard pages fail: there is no `lessons/prereqs.js` entry, the phone card's first box takes no focus, the
   wpBank=true page leaves a 54 mm strip, and no approved sibling has been measured. That is the work of a whole skill
   redesign lane (the 8/10 bar for `multi_step_word*`), not of a detailed lesson. Brief it as a separate lane before
   critic r1, or have the critic grade the lesson pack while the skill redesign stays open.
