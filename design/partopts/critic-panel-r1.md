# Critic round 1 — option-panel sample fix (lf-algebra F8/G11)

Independent critic, 2026-11-13. Tree: `claude/sweet-newton-c8wrv1-lf-partopts-panel` at f1449757. Graded: the teacher
option panel (teacher mode → Sets → a skill's Options → `#skillOptionsPopover`) at 1280×1000 and 390×844, against
`design/audit/RUBRIC.md`. Evidence: `design/partopts/critic-panel-r1/` (screenshots, `probe.jsonl`, `scan-summary.txt`).

## Verdict: FAIL (round 1)

The defect this lane was asked to fix is fixed: no sample is blank anymore. That holds for all 725 skills at both widths,
and for the two patterns skills on d20c8a003 plus the fix. The new frame growth has not reached the legibility it is
meant to reach. 166 of 724 samples at 1280 (164 at 390) are still drawn below scale 0.30. The 12 transformation skills
and the long algebra word problems are drawn at 0.21–0.25, where the question text is about 3–5 px. The gate passes
every one of them because it has no scale floor. On 11 skills at 1280 the panel's footer also sits below the window.
This is not caused by the growth (it happens the same way on the unfixed tree), but it is a defect of the graded panel.

| Host | C1 Ease of use | C2 Educational value | C3 Spacing and layout | C4 Standard fidelity |
|---|---|---|---|---|
| Option panel, 1280×1000 | **7** | 8 | **7** | 8 |
| Option panel, 390×844 | **7** | 8 | **7** | 8 |

- **C1 = 7 (both).** The sample is whole and never blank, so a teacher can see the shape of the task. On the grown,
  tall samples the words and digits cannot be read, though: `01`, `02`, `03` (geo_translate at 0.23 / 0.21 / 0.17 at
  1280×720) and `04` (multi_step_word, 0.26). At 1280 the Done button is clipped on 11 skills, by 24 px on
  pattern_features and add_5_pictures (`05`). One real defect a teacher would notice gives a 7.
- **C2 = 8.** The sample is the real item at the chosen options. It redraws on every option change, with no blank or
  stale frame between 50 ms and 1.8 s after the change on any of the 15 skills probed (`probe.jsonl` traces; `12`,
  `13`). On d20c8a003 without the fix, growing_shape_patterns flashed ink at 700 ms and then went blank again.
- **C3 = 7 (both).** The grown frame is mostly empty. Its height is spent on a narrow column in the middle third:
  geo_translate's drawing fills 20 % of a 398×260 frame and 21 % of a 348×236 frame, and multi_step_word fills 24 %
  (`01`, `04`). The frame grows, but the drawing still does not reach 0.30. At 390 the frame takes 236 of the sheet's
  717 px, so the option list has 282 px left (`02`). That is usable, with no sideways scroll.
- **C4 = 8.** Inside the frame the sample is black and white, in Andika, with the panel chrome outside it. This is
  unchanged by the fix.

## The gate

`node tests/scripts/ws-options-shots.cjs` (full run, 3 workers, 844 s):
`ws-options-shots: OK (725 skills × 2 widths)`. all_mixed:custom_mixed is reported as unavailable, as designed.

**Backtest (my own run).** I checked out d20c8a003 in a scratch worktree and ran the HEAD gate with `MQ_ROOT`, using
`--skill patterns:pattern_features --skill patterns:growing_shape_patterns`: `ws-options-shots: FAIL (4)`. At both
widths the stage sat at (-193,-205) / (-183,-358), with `is-cropped` and 0.00 % ink. The same tree with the two-file
fix patched in: `ws-options-shots: OK (2 skills × 2 widths)` (`backtest-plus-fix.log`). The gate does catch the blank
F8/G11 sample.

**What it catches and what it lets through:**

| Failure | Caught? |
|---|---|
| Blank: the stage is off the frame, or the frame is empty | **Yes.** Both rules fire: off-frame, and ink 0.00 %. |
| Clipped: part of the drawing is outside the frame | **Partly.** A stage that covers at least 90 % of the frame passes even when its edges are cut off, because of the "inside OR covers ≥ 90 %" escape (`ws-options-shots.cjs:101`). Today `_tidySample` always fits, so nothing is clipped. A scale-1 oversize regression would still pass. |
| Illegible: drawn too small to read | **No.** There is no scale or text-size test. A dense drawing at k = 0.17 passes on ink alone: growing_shape_patterns at 0.17 had 0.48 % ink and failed only by 0.02 points. Every geo_* sample at 0.21–0.23 passes with about 4 % ink. |
| The panel's controls pushed off-screen | **No.** The footer and panel bounds are not measured. 11 skills at 1280 fail this today. |
| A broken sample after an option change | **No.** Only the default options are opened. |
| A page error while the panel draws | **No.** Page errors are printed (`ws-options-shots.cjs:159`), not failed. |

**Other gates:** `ws-boot-smoke: OK` ·
`ws-code-snapshot: OK (732 codes, 35 categories, +160 appended since the pinned baseline of 572, no frozen code or position moved, no frozen skill deleted, insertion + retirement stable, 3203 option round trips)`.

## Findings

**F1 — The grown frame stops at its cap with the sample still below a legible scale (C1, C3).**
`js/modules/skill-options-ui.js:522-529`: the frame grows to at most 260 px at 1280×1000, 236 px at 390×844 and 202 px
at 1280×720. The sample is then scaled to whatever fits, with no floor. Results:
- 12 coordinates transformation skills at k 0.2267 (1280), 0.2056 (390) and 0.1733 (1280×720);
- two_step_add_then_div at 0.246, and at 390 also algebra_all, multi_step_word, multi_step_word_plain and
  two_step_add_then_mult at 0.22–0.25.

In these samples the question line and the grid labels are 3–5 px (`01`, `02`, `03`, `04`; the full list is in
`scan-summary.txt`). The stage is tall and narrow, and the frame is wide, so most of the frame stays empty. The
growth spends height without making the drawing legible.
*Check:* ws-options-shots fails a sample whose final `scale(k)` is below 0.30, or whose smallest rendered text
(computed font-size × k) is below about 8 px. Skills already marked tall-by-design can be listed with their k as a
report, not as a pass.

**F2 — The panel's footer is below the window on 11 skills at 1280×1000 (C1). This is not caused by the growth.**
`skill-options-ui.js:831` measures `el.offsetHeight` when the panel is placed. Later the panel grows another 7–25 px,
and the bottom is not re-clamped. On pattern_features and add_5_pictures the Reset and Done buttons are cut off by 24 px
(`05`). On 9 more skills, and on coord_distance_q1 (whose frame grew), the cut is 7 px (`scan-summary.txt`).
pattern_features is identical on the unfixed d20c8a003 (panel top 136, height 889), so the bug was already there. The
frame growth makes it more likely, though, because the +950 ms tidy can grow the frame after the panel is placed.
*Check:* ws-options-shots measures `#skillOptionsPopover` and `.tv-sko-foot` after both tidies. It fails when the
footer's bottom is greater than `innerHeight` or the Done button is not fully inside the window.

**F3 — Off-by-border: a grown frame lands just under 0.30 and can shrink by 1 px (nit).**
`skill-options-ui.js:525-526`: `want` is computed from `clientHeight`, which excludes the 2 px border, but it is
written to a border-box `height`. Every grown frame therefore ends at k 0.296–0.299, not 0.30. For pattern_features
the "grown" height is 139 px, which is smaller than the CSS 140 px. That contradicts the comment that the frame
"never shrinks", and k falls from 0.2979 to 0.2955.
*Check:* a unit assertion that, after `_tidySample`, a grown frame has k ≥ 0.30 and `offsetHeight` ≥ its CSS height.

**F4 — The gate cannot see option changes, clipping or page errors (gate gap).** See the table above.
*Check:* in ws-options-shots,
- add an option-change pass: change the first select or checkbox, then re-measure at 50 ms and 1.5 s;
- drop the "covers ≥ 90 %" escape and require the scaled stage to sit inside the frame;
- fail on page errors.

## What was confirmed good

- **Blank sample fixed.** The fix ends the blank (F8/G11) at both widths for the two patterns skills, on d20c8a003
  plus the fix (`06`, `07`; before: `17`). It also holds for all 725 skills on this branch: 0 off-frame, 0 blank.
- **No sideways scroll.** None at 390 for any of the 724 skills. At 390 the sheet's footer is always on-screen.
- **Option changes redraw cleanly.** On every probed skill (word problem, coordinates, number bond, long division,
  fact, fraction, chart, factor links, the two patterns skills, and others) the sample redraws with no blank flash. A
  frame that grew for the first sample shrinks back when the new sample is short (fraction_of_set: 192 → 140 px).
- **Teacher previews outside the panel are unchanged.** The Sets › Thumbnails grid crops exactly as on base 389a69c:
  48 frames, 5 `is-cropped` at `scale(0.45)`, none off-frame, on both trees (`16`). The `fit()` change only adds
  `.tv-sko-sample` to the `closest()` exclusion.

## Speed reflection (for the lane)

- **Two critic rounds and this one.** The defect lived for two rounds because nothing measured the sample as a teacher
  sees it. The gate now closes the blank case.
- **The next round will lose time on legibility.** The fix has a threshold in mind (0.30) that the gate does not hold
  it to. Rule: a fix that names a threshold puts that same threshold in its gate in the same change.
- **Gate output should print each skill's final k.** Then the critic and the builder see the near-misses (0.17 failing
  by 0.02 ink points) instead of a bare OK.
