# lf-checks · 8/10 pass chip, PART 1 (Skills screen) · narrow critic round 2

Critic: independent narrow critic (Opus 5.5, medium). Graded: `claude/sweet-newton-c8wrv1-lf-tools-passchip` @ c6b1c4ec3
(fix 8e918994e, diffed against r1 head 04ec06c32). r1: `critic-r1.md` (FAIL, C2 6).

## Verdict: PASS (C1 8, C2 9, C3 8, C4 9)

| Criterion | Score | Evidence |
|---|---|---|
| C1 fidelity (owner + A33) | 8 | The chip filters every skill view: area, search, White Rose and Standard. MAP has the disabled chip plus a plain note, one of the two options the lead allowed. The count is "8/10 · 33 skills" and the info link sits beside the chip (`r2/1366/pressed-wrm-top.png`, `r2/1024/pressed-map-top.png`). The one gap is D7 below: My sets has no note. |
| C2 correctness | 9 | D1: White Rose steps are built from passed skills only. Steps with none drop out, "Add all" carries only passed keys, and the band reads "N steps with 8/10 skills". D2: Standard filters before the 4-item cut (`skillsOf`), hides rows with no passed skill, and its "Show all" and "Add all" counts are filtered. In `perGrade`, grades with no card are dropped. D4: the empty note is suppressed on map/sets, and other "No …" notes are removed before the 8/10 note goes in, so there is never a double note. D5: chip and summary share one nowrap `.ts-passgrp`. The `only` action does nothing in MAP. |
| C3 usability 1366/1280/1024/820 | 8 | The chip and the info link are on one row, both 48 px. The gate asserts this at all four widths and passed. The pressed state is clear. Minor: in MAP a chip that was pressed keeps its pressed green look at 55 % opacity, which reads as "on but greyed". The note under it explains, so this is not a defect. Also, the MAP note shows when the chip is unpressed too; this is harmless. |
| C4 check quality | 9 | `ws-teacher-library.cjs` passed on the first run, so there was no "library: thumbnails" flake and no rerun. Scratch break: I removed `passOk` from Standard's `skillsOf`, and PASS-CHIP-FILTER went red with 381 lines ("empty grid under …"); I restored it and did not commit it. The check now covers every view at four widths: empty grids, unpassed keys in Add all, count mismatch, ids changed after unpressing, double notes, and the info link wrapping. |

CSS: two rules appended (teacher-library.css:577-579), additive only.

## r1 defects
D1 fixed. D2 fixed. D3 fixed (chip disabled with a note in MAP). D4 fixed. D5 fixed. D6 fixed (the unpressed id set is compared).

## Ruling on the builder's open note: My sets with saved sets
A saved set is a teacher's own bundle, not an item that passes or fails. Filtering its chips would misreport what the set holds, so
showing the set whole is right. The defect is that the filter does nothing in My sets and nothing says so. That is the same class as r1
D3, which MAP now handles with a note.

**D7 (minor, not blocking).** `js/modules/teacher-library.js` `setsHTML` (~1136) and the `G.browse !== 'sets'` branch at ~1020: in
My sets, show "8/10 filter: not available in My sets" and disable the chip, as in MAP. Alternatively, mark each set's chips with
the 8/10 tick.
*Check:* PASS-CHIP-FILTER with one saved set holding an unpassed skill. Pressed, in My sets, require either the "not available" note
with the chip aria-disabled, or no unpassed skill chip.
