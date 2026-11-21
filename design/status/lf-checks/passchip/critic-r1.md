# lf-checks · 8/10 pass chip, PART 1 (Skills screen) · narrow critic round 1

Critic: independent narrow critic (Opus 5.5, medium). Graded: branch `claude/sweet-newton-c8wrv1-lf-tools-passchip` @ 00e3b4486
(code 3ad1a57ef on base 5a51918eb). Owner request: "the 8/10 chip on the lesson bar should filter to these lessons not just give
information on what it means". Scope: lead ruling A33.

## Verdict: FAIL (C2 = 6, C1 / C3 / C4 = 7)

| Criterion | Score | Evidence |
|---|---|---|
| C1 fidelity (owner + A33) | 7 | Toggle, aria-pressed, count "8/10 · 33 skills" (= REDESIGN_PASSED.size, 33), plain empty note, info link, 48 px: all present. But the filter is only half applied in the White Rose and Standard views (D1, D2), is not applied in the MAP view (D3), and the "What does 8/10 mean?" link is NOT beside the chip at 1280 or 820: it wraps to its own row under "Big" (D5; `critic/1280-pressed.png`). |
| C2 correctness | 6 | Maths area + search: correct (pressed 10 cards at Grade 2, all passed; unpressed back to 50). White Rose view pressed (Grade 2, 1280): 36 step headers, 33 EMPTY grids, 4 cards; **19 "+ Add all N" buttons add skills that did not pass**. Standard view: 12 empty grids, **10 "+ Add all N" buttons with unpassed skills**, and the slice-before-filter hides passed skills (D2). Unpressing restores everything; whole grade/area add respects the filter; planned skills are hidden while pressed (correct: a planned skill has not passed). Explanation popup still has all three marks (tick, 8/10, orange planned). |
| C3 usability 1366/1280/1024/820 | 7 | Chip 152x48 and summary 210x48 at 1280 and 820; no horizontal scroll (scrollWidth = viewport at both); pressed state clear (green fill, 2 px border, inset bar) and distinct from unpressed. Loses marks for D5 (link on its own line, away from the chip) and for the wall of empty step headers in the WRM / Standard views while pressed (D1). |
| C4 check quality | 7 | `ws-backtest --row pass-chip-filter-skills`: PASS (FAIL 3.9 s on 5a51918eb, OK 15.0 s on 3ad1a57ef). Scratch break (`passOk` always true) turned PASS-CHIP-FILTER red on 6 lines, restored. But the rule only asserts "no WRONG card" in wrm/std/sets: it misses empty grids, "Add all" buttons carrying unpassed keys, missing passed skills behind "Show all" (D2), the MAP view (never visited), and "unpressed restores" is only `after > shown` rather than equal to the pre-press set. |

Gates run: `ws-teacher-library.cjs` OK, `ws-boot-smoke.cjs` OK (runner), backtest row PASS, critic screenshots
`design/status/lf-checks/passchip/critic/{1280,820}-{pressed,unpressed}.png` and `1280-pressed-{wrm,std,map,sets}.png`. No console errors.
CSS (css/teacher-library.css:565-576): additive only (new rules appended; the `.ts-marks > summary` min-height is a new rule, not an edit).

## Defects

**D1 (C2, C1) White Rose view keeps unpassed structure while pressed.** `js/modules/teacher-library.js:1037-1038`: `steps`/`withSkills`
are built from all skills; only `gCard` (line ~843) drops the card. Pressed, every step header, its "+ Add all N" (keys of ALL skills,
including unpassed) and empty grids still render. Fix: filter `skills` with `passOk` before `withSkills`, so steps and blocks with no
passed skill drop out and "Add all" carries only passed keys.
*Check:* in PASS-CHIP-FILTER, for every view pressed: no `.ts-grid` without a card, and every `[data-act="addkeys"]` `data-arg` key is
in REDESIGN_PASSED.

**D2 (C2) Standard view: unpassed "Add all", empty grids, and slice-before-filter.** `js/modules/teacher-library.js:1088`:
`skills.slice(0, slim).map(gCard)` filters AFTER the 4-item slice, so a standard whose passed skill is 5th+ shows an empty grid and
"Show all N skills" (N unfiltered); the "+ Add all N" button (same row, ~1087) adds unpassed skills. Fix: `skills = skills.filter(passOk)`
before the slice/count/add-all; hide standards with none while pressed.
*Check:* pressed std view at Grade ALL with every "Show all" opened: the set of cards equals REDESIGN_PASSED ∩ tagged skills
(no missing), same addkeys rule as D1.

**D3 (C1) MAP view ignores the filter silently.** `js/modules/teacher-library.js:1107` (`mapHTML`): pressed, 42 tasks shown unchanged
and, because `.ts-task` counts as content at line 1017, no note says the filter does not apply. Fix: filter tasks to those whose skills
include a passed one (or all passed), or show "8/10 filter: MAP tasks are not filtered" plainly.
*Check:* PASS-CHIP-FILTER visits `map`; pressed, every `.ts-task`'s skills intersect REDESIGN_PASSED, or the explicit note is present.

**D4 (minor, C2) My sets view, pressed, with no sets: two notes.** line 1131 "No sets yet…" plus line 1017's "No skill here has passed
8/10 yet" both render; the second is wrong for a sets view. Fix: skip the 8/10 empty note on `browse === 'sets'` (or filter set chips).
*Check:* no view shows two `.ts-note` empty messages at once.

**D5 (C1, C3) "What does 8/10 mean?" is not beside the chip.** `js/modules/teacher-library.js:809-810`: the chip and the `<details>` are
separate flex items, so at 1280 and 820 the summary wraps to the next row at x=289 while the chip sits at x=897 (same at 1024 per the
lane's own shot). Fix: wrap chip + summary in one `inline-flex` nowrap group.
*Check:* PASS-CHIP-FILTER at 1366/1280/1024/820: summary top equals chip top (±2 px) and summary left ≥ chip right.

**D6 (minor, C4) "Unpressed restores" is too weak.** `tests/scripts/ws-teacher-library.cjs:77`: `after > shown.length`. Fix: record the
unpressed card set before pressing and assert equality after unpressing (and that aria-pressed is restored after a reload, since it
persists).

## Not a defect
- The count is the global passed total (33), not per view: matches A33's example "8/10 · 33 skills".
- Pressed "Add whole grade" adds only passed skills; acceptable, though the note could say "(8/10 only)".
